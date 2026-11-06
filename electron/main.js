// Folio – desktopová aplikace (Windows, macOS, Linux).
// Startuje na celou obrazovku jako opravdová aplikace; F11 přepíná.
// Obsah běží z vlastního protokolu folio://app/, takže data (IndexedDB)
// zůstávají v uživatelské složce i po aktualizaci.
const { app, BrowserWindow, protocol, net, shell, Menu, nativeTheme, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const APP_DIR = path.join(__dirname, '..', 'app');
const SCHEME = 'folio';

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } },
]);

if (!app.requestSingleInstanceLock()) app.quit();

const stateFile = () => path.join(app.getPath('userData'), 'window-state.json');
function loadState() { try { return { fullscreen: true, ...JSON.parse(fs.readFileSync(stateFile(), 'utf8')) }; } catch { return { fullscreen: true, maximized: true }; } }
function saveState(win) {
  try { fs.writeFileSync(stateFile(), JSON.stringify({ maximized: win.isMaximized(), fullscreen: win.isFullScreen(), bounds: win.getNormalBounds() })); } catch { /* ignore */ }
}

let win;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.bounds?.width || 1440,
    height: st.bounds?.height || 920,
    x: st.bounds?.x, y: st.bounds?.y,
    minWidth: 760, minHeight: 560,
    title: 'Folio',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : '#f2f2f7',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    fullscreen: st.fullscreen !== false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  Menu.setApplicationMenu(null);
  if (st.maximized && st.fullscreen === false) win.maximize();
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.webContents.setVisualZoomLevelLimits(1, 1); // pinch-zoom is handled inside the app
  win.loadURL(`${SCHEME}://app/index.html`);

  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(`${SCHEME}://`)) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
    if (input.control && input.key.toLowerCase() === 'r') { win.webContents.reload(); e.preventDefault(); }
    if (input.control && input.key.toLowerCase() === 'q') { app.quit(); e.preventDefault(); }
  });
  win.on('close', () => saveState(win));
}

ipcMain.on('fullscreen:get', e => { e.returnValue = !!win?.isFullScreen(); });
ipcMain.handle('fullscreen:toggle', () => { win.setFullScreen(!win.isFullScreen()); return win.isFullScreen(); });
ipcMain.handle('app:quit', () => app.quit());

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  protocol.handle(SCHEME, req => {
    const { pathname } = new URL(req.url);
    let rel = decodeURIComponent(pathname);
    if (rel === '/' || rel === '') rel = '/index.html';
    const file = path.normalize(path.join(APP_DIR, rel));
    if (!file.startsWith(APP_DIR)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

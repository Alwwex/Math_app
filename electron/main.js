// Folio – desktopová aplikace pro Windows (Electron).
// Aplikace běží z vlastního protokolu folio://app/, takže data (IndexedDB) zůstávají
// uložená v %APPDATA%\Folio i po aktualizaci.
const { app, BrowserWindow, protocol, net, shell, Menu, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const APP_DIR = path.join(__dirname, '..', 'app');
const SCHEME = 'folio';

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } },
]);

if (!app.requestSingleInstanceLock()) { app.quit(); }

const stateFile = () => path.join(app.getPath('userData'), 'window-state.json');
function loadState() { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return { maximized: true }; } }
function saveState(win) {
  try {
    const st = { maximized: win.isMaximized(), bounds: win.getNormalBounds() };
    fs.writeFileSync(stateFile(), JSON.stringify(st));
  } catch { /* ignore */ }
}

let win;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.bounds?.width || 1400,
    height: st.bounds?.height || 900,
    x: st.bounds?.x, y: st.bounds?.y,
    minWidth: 760, minHeight: 560,
    title: 'Folio',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#14161b' : '#f3eee4',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  Menu.setApplicationMenu(null);
  if (st.maximized) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.webContents.setVisualZoomLevelLimits(1, 1); // pinch-zoom is handled inside the app
  win.loadURL(`${SCHEME}://app/index.html`);

  // external links → default browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(`${SCHEME}://`)) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  // F11 full screen, F12 dev tools, Ctrl+R reload
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
    if (input.control && input.key.toLowerCase() === 'r') { win.webContents.reload(); e.preventDefault(); }
  });
  win.on('close', () => saveState(win));
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  protocol.handle(SCHEME, (req) => {
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

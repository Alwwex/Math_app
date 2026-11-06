// Bezpečný most mezi aplikací a oknem (ovládání okna, celá obrazovka, ukončení).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('folio', {
  desktop: true,
  frameless: true,
  platform: process.platform,
  isFullscreen: () => ipcRenderer.sendSync('fullscreen:get'),
  toggleFullscreen: () => ipcRenderer.invoke('fullscreen:toggle'),
  onFullscreen: cb => ipcRenderer.on('fullscreen:changed', (_e, v) => cb(v)),
  minimize: () => ipcRenderer.invoke('win:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('win:maximize'),
  close: () => ipcRenderer.invoke('app:quit'),
  quit: () => ipcRenderer.invoke('app:quit'),
});

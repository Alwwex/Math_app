// Bezpečný most mezi aplikací a oknem (celá obrazovka, ukončení).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('folio', {
  desktop: true,
  platform: process.platform,
  isFullscreen: () => ipcRenderer.sendSync('fullscreen:get'),
  toggleFullscreen: () => ipcRenderer.invoke('fullscreen:toggle'),
  quit: () => ipcRenderer.invoke('app:quit'),
});

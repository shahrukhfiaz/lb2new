const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sessionCapture', {
  detectSessions: () => ipcRenderer.invoke('detect-sessions'),
  captureSession: (sessionId) => ipcRenderer.invoke('capture-session', sessionId),
  cancelCapture: () => ipcRenderer.invoke('cancel-capture'),
  close: () => ipcRenderer.invoke('close-window'),
  onProgress: (callback) => {
    ipcRenderer.on('progress-update', (event, data) => callback(data));
  }
});

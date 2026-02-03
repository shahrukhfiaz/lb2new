const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dslb', {
  login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
  launchSession: (sessionId, datUrl) => ipcRenderer.invoke('session:launch', { sessionId, datUrl }),
  logout: (reason) => ipcRenderer.invoke('auth:logout', { reason }),
  testIP: () => ipcRenderer.invoke('test:ip'),
  validateSession: () => ipcRenderer.invoke('session:validate'),
// Manual session save removed - using standalone script instead
// saveSessionManual: () => ipcRenderer.invoke('session:save-manual'),
  onStatus: (callback) => ipcRenderer.on('status:update', (_event, payload) => callback(payload)),
});

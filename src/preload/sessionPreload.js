const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dslbSession', {
  logout: () => ipcRenderer.invoke('auth:logout'),
  newWindow: () => ipcRenderer.invoke('dat:new-window'),
  switchTab: (tabId) => ipcRenderer.invoke('tab:switch', tabId),
  closeTab: (tabId) => ipcRenderer.invoke('tab:close', tabId),
  updateTabTitle: (tabId, newTitle) => ipcRenderer.invoke('tab:update-title', tabId, newTitle),
  getAllTabs: () => ipcRenderer.invoke('tab:get-all'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
// Manual session save removed - using standalone script instead
// saveSession: () => ipcRenderer.invoke('session:save-manual'),
});

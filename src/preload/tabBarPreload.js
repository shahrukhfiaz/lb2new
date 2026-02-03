const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the tab bar to communicate with the main process
contextBridge.exposeInMainWorld('dslbSession', {
  switchTab: (tabId) => ipcRenderer.invoke('tab:switch', tabId),
  closeTab: (tabId) => ipcRenderer.invoke('tab:close', tabId),
  updateTabTitle: (tabId, newTitle) => ipcRenderer.invoke('tab:update-title', tabId, newTitle),
  getAllTabs: () => ipcRenderer.invoke('tab:get-all'),
  newWindow: () => ipcRenderer.invoke('dat:new-window'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // Listen for tab updates from main process
  onTabsUpdate: (callback) => {
    ipcRenderer.on('tab:update', (_event, tabsData) => {
      callback(tabsData);
    });
  },
  
  // Remove listener
  removeTabsUpdateListener: () => {
    ipcRenderer.removeAllListeners('tab:update');
  },
});


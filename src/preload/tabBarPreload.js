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
  getWindowState: () => ipcRenderer.invoke('window:get-state'),
  onWindowStateChanged: (callback) => {
    ipcRenderer.on('window:state-changed', (_event, state) => {
      callback(state);
    });
  },
  
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
  
  // Get billing status for current user
  getBillingStatus: () => ipcRenderer.invoke('billing:get-my-status'),
  
  // Reload a specific tab
  reloadTab: (tabId) => ipcRenderer.invoke('tab:reload', tabId),
  
  // Get current user ID
  getCurrentUserId: () => ipcRenderer.invoke('user:get-current-id'),
  
  // Set auto-reload for a tab
  setAutoReload: (tabId, enabled, intervalSeconds) => ipcRenderer.invoke('tab:set-auto-reload', tabId, enabled, intervalSeconds),
  
  // Update tab bar height
  updateTabBarHeight: (height) => ipcRenderer.invoke('tab:update-bar-height', height),
});


// Tab Manager for Chrome-like tab system
const { BrowserView } = require('electron');
const path = require('path');

// Simple logger (silent in production unless DEBUG is set)
const isDev = process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true';
const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  error: console.error.bind(console), // Always log errors
  debug: isDev ? console.log.bind(console) : () => {}
};

class TabManager {
  constructor(window, getUserRole = null, getAccessDeniedPath = null) {
    this.window = window;
    this.tabs = new Map(); // Map<tabId, BrowserView>
    this.activeTabId = null;
    this.tabCounter = 0;
    this.tabBarHeight = 36; // Height of custom tab bar (matches Chrome)
    this.getUserRole = getUserRole; // Function to get current user role (for security checks)
    this.getAccessDeniedPath = getAccessDeniedPath; // Function to get access denied page path
    this.autoReloadIntervals = new Map(); // Map<tabId, intervalId> for auto-reload intervals
    
    // Increase max listeners to avoid warning
    if (window && window.setMaxListeners) {
      window.setMaxListeners(20);
    }
  }

  createTab(sessionInfo, datUrl, isLoading = false) {
    const tabId = `tab-${++this.tabCounter}`;
    const partitionName = sessionInfo?.partition || 'persist:dslb-session';
    const targetUrl = datUrl || 'https://one.dat.com/search-loads';

    // Create BrowserView for this tab
    const tabView = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, '../preload/sessionPreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        partition: partitionName,
        backgroundThrottling: false,
        offscreen: false,
        webSecurity: true,
        allowDisplayingInsecureContent: false,
        enableWebSQL: true,
        disableBlinkFeatures: 'AutomationControlled,TranslateUI',
      },
    });

    // Set User-Agent
    tabView.webContents.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Store tab info with loading state
    // Note: New tabs start as loading internally, but title always stays "DAT One" unless user edits it
    const tabInfo = {
      id: tabId,
      view: tabView,
      title: 'DAT One', // Always start with "DAT One" - never changes unless user manually edited
      url: targetUrl,
      sessionInfo,
      partitionName,
      isLoading: true, // Start as loading
      isReady: false,
      titleManuallyEdited: false, // Track if user has manually edited the title
      titleGuardInterval: null, // Interval to ensure title stays "DAT One"
    };

    this.tabs.set(tabId, tabInfo);
    
    // Check if initial URL is DAT login page and block for non-super-admin users
    if (targetUrl) {
      const isLoginPage = targetUrl.includes('login.dat.com/u/login') || 
                         targetUrl.includes('login.dat.com') ||
                         (targetUrl.includes('dat.com') && targetUrl.includes('/login'));
      
      if (isLoginPage) {
        const userRole = this.getUserRole ? this.getUserRole() : null;
        logger.log(`🔍 Checking initial URL: ${targetUrl.substring(0, 80)}... User role: ${userRole}`);
        
        if (userRole !== 'SUPER_ADMIN') {
          logger.error('❌ SECURITY: Non-super-admin user attempted to load DAT login page');
          logger.error(`   Blocked URL: ${targetUrl}`);
          // Don't load the URL, redirect to access denied instead
          if (this.getAccessDeniedPath) {
            const accessDeniedPath = this.getAccessDeniedPath();
            if (accessDeniedPath) {
              tabView.webContents.loadURL(`file://${accessDeniedPath}`).catch(err => {
                logger.error('Failed to load access denied page:', err);
              });
            }
          }
          // Continue with tab creation even though URL is blocked
        }
      }
    }

    // Set up a guard to ensure title always stays "DAT One" (unless manually edited)
    tabInfo.titleGuardInterval = setInterval(() => {
      if (!tabInfo.titleManuallyEdited) {
        // Only allow "DAT One" - never show "Loading..." or "Failed to load"
        if (tabInfo.title !== 'DAT One') {
          // Force it back to "DAT One" if it somehow got changed
          tabInfo.title = 'DAT One';
          this.updateTabBar();
        }
      }
    }, 100); // Check every 100ms

    // Set initial bounds immediately so tab appears
    this.updateTabBounds(tabId);

    // Make this the active tab immediately (before loading)
    this.switchToTab(tabId);
    
    // Update tab bar immediately to show the new tab (even before loading)
    this.updateTabBar();

    // Load URL asynchronously (non-blocking) - but only if not blocked by security check
    if (targetUrl) {
      const isLoginPage = targetUrl.includes('login.dat.com/u/login') || 
                         targetUrl.includes('login.dat.com') ||
                         (targetUrl.includes('dat.com') && targetUrl.includes('/login'));
      
      const userRole = this.getUserRole ? this.getUserRole() : null;
      const shouldLoad = !isLoginPage || userRole === 'SUPER_ADMIN';
      
      if (shouldLoad) {
        tabView.webContents.loadURL(targetUrl).catch(err => {
          console.error(`Failed to load URL for tab ${tabId}:`, err);
          // Keep title as "DAT One" even on error - never show "Failed to load"
          if (!tabInfo.titleManuallyEdited) {
            tabInfo.title = 'DAT One';
          }
          tabInfo.isLoading = false;
          this.updateTabBar();
        });
      }
    }

    // Handle Ctrl+Scroll for zoom in/out
    tabView.webContents.on('dom-ready', () => {
      // Inject JavaScript to handle Ctrl+Scroll zoom
      tabView.webContents.executeJavaScript(`
        (function() {
          // Handle mouse wheel with Ctrl
          document.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              e.stopPropagation();
              // Send zoom request to main process via IPC
              if (window.dslbSession && window.dslbSession.zoom) {
                const delta = e.deltaY > 0 ? -0.5 : 0.5;
                window.dslbSession.zoom(delta);
              }
            }
          }, { passive: false });
        })();
      `).catch(err => {
        logger.log(`Failed to inject zoom handler for tab ${tabId}:`, err.message);
      });
    });
    
    // Update title when page title changes (but keep default as "DAT One" unless user edits)
    tabView.webContents.on('page-title-updated', (event, title) => {
      // IGNORE the page title parameter completely - NEVER use it
      // NEVER update tab title from page title - always keep as "DAT One" unless user manually edited
      if (!tabInfo.titleManuallyEdited) {
        // Force it back to "DAT One" - ignore any page title completely
        tabInfo.title = 'DAT One';
      }
      // If user has manually edited, preserve their custom title (don't touch it)
      tabInfo.isLoading = false;
      tabInfo.isReady = true;
      this.updateTabBar();
    });

    // Handle navigation start - check URL and block if needed
    tabView.webContents.on('did-start-loading', () => {
      // Check if loading DAT login page and block for non-super-admin users
      const currentUrl = tabView.webContents.getURL();
      
      if (currentUrl) {
        const isLoginPage = currentUrl.includes('login.dat.com/u/login') || 
                           currentUrl.includes('login.dat.com') ||
                           (currentUrl.includes('dat.com') && currentUrl.includes('/login'));
        
        if (isLoginPage) {
          const userRole = this.getUserRole ? this.getUserRole() : null;
          logger.log(`🔍 Checking loading URL: ${currentUrl.substring(0, 80)}... User role: ${userRole}`);
          
          if (userRole !== 'SUPER_ADMIN') {
            logger.error('❌ SECURITY: Non-super-admin user attempted to load DAT login page');
            logger.error(`   Blocked URL: ${currentUrl}`);
            
            // Stop loading and redirect to access denied page
            tabView.webContents.stop();
            
            // Redirect to access denied page
            if (this.getAccessDeniedPath) {
              const accessDeniedPath = this.getAccessDeniedPath();
              if (accessDeniedPath) {
                setTimeout(() => {
                  tabView.webContents.loadURL(`file://${accessDeniedPath}`).catch(err => {
                    logger.error('Failed to load access denied page:', err);
                  });
                }, 100);
              }
            }
            return; // Don't continue with normal loading logic
          }
        }
      }
      
      // Only set loading state for this specific tab (for internal tracking, not shown in UI)
      tabInfo.isLoading = true;
      // NEVER change title - always keep as "DAT One" unless user manually edited
      this.updateTabBar();
    });

    // Handle navigation complete
    tabView.webContents.on('did-finish-load', () => {
      // Check if page loaded is DAT login page and block for non-super-admin users
      const currentUrl = tabView.webContents.getURL();
      
      if (currentUrl) {
        const isLoginPage = currentUrl.includes('login.dat.com/u/login') || 
                           currentUrl.includes('login.dat.com') ||
                           (currentUrl.includes('dat.com') && currentUrl.includes('/login'));
        
        if (isLoginPage) {
          const userRole = this.getUserRole ? this.getUserRole() : null;
          logger.log(`🔍 Checking finished load URL: ${currentUrl.substring(0, 80)}... User role: ${userRole}`);
          
          if (userRole !== 'SUPER_ADMIN') {
            logger.error('❌ SECURITY: Non-super-admin user loaded DAT login page - redirecting');
            logger.error(`   Blocked URL: ${currentUrl}`);
            
            // Redirect to access denied page
            if (this.getAccessDeniedPath) {
              const accessDeniedPath = this.getAccessDeniedPath();
              if (accessDeniedPath) {
                tabView.webContents.loadURL(`file://${accessDeniedPath}`).catch(err => {
                  logger.error('Failed to load access denied page:', err);
                });
              }
            }
            return; // Don't continue with normal loading logic
          }
        }
      }
      
      tabInfo.isLoading = false;
      tabInfo.isReady = true;
      // ALWAYS force back to "DAT One" - NEVER use page title
      if (!tabInfo.titleManuallyEdited) {
        // Force it to "DAT One" regardless of what it was
        tabInfo.title = 'DAT One';
      }
      this.updateTabBar();
    });

    // Handle navigation errors
    tabView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      tabInfo.isLoading = false;
      tabInfo.isReady = false;
      // Keep title as "DAT One" even on error - never show "Failed to load"
      if (!tabInfo.titleManuallyEdited) {
        tabInfo.title = 'DAT One';
      }
      this.updateTabBar();
    });
    
    // Handle navigation blocking for non-HTTPS URLs and DAT login page
    tabView.webContents.on('will-navigate', (event, url) => {
      // Block non-HTTPS URLs
      if (!url.startsWith('https://')) {
        event.preventDefault();
        const { dialog } = require('electron');
        dialog.showErrorBox('Navigation blocked', 'Blocked navigation to unsafe URL: ' + url);
        return;
      }
      
      // Block DAT login page for non-super-admin users (check multiple URL patterns)
      const isLoginPage = url.includes('login.dat.com/u/login') || 
                         url.includes('login.dat.com') ||
                         (url.includes('dat.com') && url.includes('/login'));
      
      if (isLoginPage) {
        const userRole = this.getUserRole ? this.getUserRole() : null;
        logger.log(`🔍 Checking URL access: ${url.substring(0, 80)}... User role: ${userRole}`);
        
        if (userRole !== 'SUPER_ADMIN') {
          event.preventDefault();
          logger.error('❌ SECURITY: Non-super-admin user attempted to access DAT login page');
          logger.error(`   Blocked URL: ${url}`);
          
          // Redirect to access denied page
          if (this.getAccessDeniedPath) {
            const accessDeniedPath = this.getAccessDeniedPath();
            if (accessDeniedPath) {
              tabView.webContents.loadURL(`file://${accessDeniedPath}`).catch(err => {
                logger.error('Failed to load access denied page:', err);
              });
            }
          }
        }
      }
    });
    
    // Also block navigation in did-start-navigation (catches programmatic navigation)
    tabView.webContents.on('did-start-navigation', (event, url, isMainFrame) => {
      if (!isMainFrame) return; // Only block main frame navigation
      
      // Block DAT login page for non-super-admin users
      const isLoginPage = url.includes('login.dat.com/u/login') || 
                         url.includes('login.dat.com') ||
                         (url.includes('dat.com') && url.includes('/login'));
      
      if (isLoginPage) {
        const userRole = this.getUserRole ? this.getUserRole() : null;
        logger.log(`🔍 Checking navigation: ${url.substring(0, 80)}... User role: ${userRole}`);
        
        if (userRole !== 'SUPER_ADMIN') {
          logger.error('❌ SECURITY: Blocking navigation to DAT login page');
          logger.error(`   Blocked URL: ${url}`);
          
          // Stop navigation and redirect
          if (this.getAccessDeniedPath) {
            const accessDeniedPath = this.getAccessDeniedPath();
            if (accessDeniedPath) {
              // Use stop() to prevent navigation, then redirect
              tabView.webContents.stop();
              setTimeout(() => {
                tabView.webContents.loadURL(`file://${accessDeniedPath}`).catch(err => {
                  logger.error('Failed to load access denied page:', err);
                });
              }, 100);
            }
          }
        }
      }
    });
    

    return tabId;
  }

  switchToTab(tabId) {
    if (!this.tabs.has(tabId)) return;
    
    // Check if window is still valid
    if (!this.window || this.window.isDestroyed()) {
      logger.warn('Cannot switch tabs: window is destroyed');
      return;
    }

    try {
      // Hide all tabs
      this.tabs.forEach((tabInfo) => {
        try {
          if (this.window && !this.window.isDestroyed() && tabInfo.view) {
            this.window.removeBrowserView(tabInfo.view);
          }
          // Reset loading state for inactive tabs (they shouldn't show loading indicator)
          // Only the active tab should show loading state
          if (tabInfo.id !== tabId) {
            // If tab was loading but is now inactive, keep isLoading state but don't show "Loading..." in title
            // The loading indicator will be hidden by the UI because only active tab's loading is meaningful
          }
        } catch (err) {
          // BrowserView might already be removed, ignore
          logger.log(`BrowserView already removed during switch: ${err.message}`);
        }
      });

      // Show active tab
      const activeTab = this.tabs.get(tabId);
      if (activeTab && activeTab.view && this.window && !this.window.isDestroyed()) {
        this.window.setBrowserView(activeTab.view);
        this.activeTabId = tabId;

        // Title stays as "DAT One" (or user-edited value) - never show "Loading..."

        // Update bounds
        this.updateTabBounds(tabId);

        // Update tab bar
        this.updateTabBar();
      }
    } catch (err) {
      logger.error(`Error switching to tab ${tabId}:`, err);
    }
  }

  closeTab(tabId) {
    if (!this.tabs.has(tabId)) return false;

    const tabInfo = this.tabs.get(tabId);
    
    // Clear auto-reload interval if it exists
    this.clearAutoReload(tabId);
    
    // Clear title guard interval
    if (tabInfo.titleGuardInterval) {
      clearInterval(tabInfo.titleGuardInterval);
      tabInfo.titleGuardInterval = null;
    }
    
    // Clear navigation hiding timeout if it exists
    if (tabInfo.navigationHidingTimeout) {
      clearTimeout(tabInfo.navigationHidingTimeout);
      tabInfo.navigationHidingTimeout = null;
    }
    
    try {
      // Remove BrowserView if window still exists
      if (this.window && !this.window.isDestroyed()) {
        try {
          this.window.removeBrowserView(tabInfo.view);
        } catch (removeErr) {
          // BrowserView might already be removed, ignore
          logger.log(`BrowserView already removed during closeTab: ${removeErr.message}`);
        }
      }
      
      // Destroy webContents if it exists and is not destroyed
      if (tabInfo.view && tabInfo.view.webContents && !tabInfo.view.webContents.isDestroyed()) {
        try {
          tabInfo.view.webContents.destroy();
        } catch (destroyErr) {
          // WebContents might already be destroyed, ignore
          logger.log(`WebContents already destroyed during closeTab: ${destroyErr.message}`);
        }
      }
    } catch (err) {
      logger.error(`Error closing tab ${tabId}:`, err);
    }
    
    // Remove from map
    this.tabs.delete(tabId);

    // If this was the active tab, switch to another
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys());
      if (remainingTabs.length > 0) {
        this.switchToTab(remainingTabs[remainingTabs.length - 1]);
      } else {
        this.activeTabId = null;
      }
    }

    this.updateTabBar();
    return true;
  }

  updateTabTitle(tabId, newTitle) {
    if (!this.tabs.has(tabId)) return;
    const tabInfo = this.tabs.get(tabId);
    tabInfo.title = newTitle || 'DAT One';
    // Mark as manually edited if user provided a custom title
    if (newTitle && newTitle.trim() !== 'DAT One' && newTitle.trim() !== 'Loading...') {
      tabInfo.titleManuallyEdited = true;
    }
    this.updateTabBar();
  }

  updateTabBounds(tabId) {
    if (!this.tabs.has(tabId)) return;

    const tabInfo = this.tabs.get(tabId);
    const bounds = this.window.getBounds();
    
    // Position BrowserView below tab bar (no offset needed since window is frameless)
    tabInfo.view.setBounds({
      x: 0,
      y: this.tabBarHeight,
      width: bounds.width,
      height: bounds.height - this.tabBarHeight,
    });
  }

  updateTabBar() {
    // Send tab data to main window's tab bar (hardcoded in window frame)
    // Loading state is tracked internally but not shown in UI - title always stays "DAT Loadboard"
    const tabsData = Array.from(this.tabs.entries()).map(([id, tabInfo]) => ({
      id,
      title: tabInfo.title,
      url: tabInfo.url,
      active: id === this.activeTabId,
      // Loading state tracked but not displayed in UI
      isLoading: tabInfo.isLoading || false,
      isReady: tabInfo.isReady || false,
    }));

    // Send update to main window's tab bar (not injected into tabs)
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('tab:update', tabsData);
    }
  }

  getAllTabs() {
    return Array.from(this.tabs.entries()).map(([id, tabInfo]) => ({
      id,
      title: tabInfo.title,
      url: tabInfo.url,
      active: id === this.activeTabId,
      isLoading: tabInfo.isLoading || false,
      isReady: tabInfo.isReady || false,
    }));
  }

  getActiveTabId() {
    return this.activeTabId;
  }

  reloadTab(tabId) {
    if (!this.tabs.has(tabId)) {
      logger.warn(`Cannot reload tab ${tabId}: tab not found`);
      return;
    }
    
    const tabInfo = this.tabs.get(tabId);
    if (!tabInfo.view || !tabInfo.view.webContents || tabInfo.view.webContents.isDestroyed()) {
      logger.warn(`Cannot reload tab ${tabId}: webContents is destroyed`);
      return;
    }
    
    try {
      tabInfo.view.webContents.reload();
      logger.log(`Reloaded tab ${tabId}`);
    } catch (error) {
      logger.error(`Error reloading tab ${tabId}:`, error);
    }
  }
  
  setAutoReload(tabId, enabled, intervalSeconds) {
    // Clear existing interval if any
    this.clearAutoReload(tabId);
    
    if (enabled && intervalSeconds > 0) {
      const intervalId = setInterval(() => {
        this.reloadTab(tabId);
      }, intervalSeconds * 1000);
      
      this.autoReloadIntervals.set(tabId, intervalId);
      logger.log(`Auto-reload enabled for tab ${tabId} with interval ${intervalSeconds}s`);
    } else {
      logger.log(`Auto-reload disabled for tab ${tabId}`);
    }
  }
  
  clearAutoReload(tabId) {
    const intervalId = this.autoReloadIntervals.get(tabId);
    if (intervalId) {
      clearInterval(intervalId);
      this.autoReloadIntervals.delete(tabId);
      logger.log(`Cleared auto-reload for tab ${tabId}`);
    }
  }

  destroy() {
    // Clear all auto-reload intervals
    this.autoReloadIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.autoReloadIntervals.clear();
    
    // Clean up all BrowserViews
    this.tabs.forEach((tabInfo) => {
      // Clear title guard interval
      if (tabInfo.titleGuardInterval) {
        clearInterval(tabInfo.titleGuardInterval);
        tabInfo.titleGuardInterval = null;
      }
      
      // Clear navigation hiding timeout
      if (tabInfo.navigationHidingTimeout) {
        clearTimeout(tabInfo.navigationHidingTimeout);
        tabInfo.navigationHidingTimeout = null;
      }
      
      try {
        // Check if window still exists and is not destroyed
        if (this.window && !this.window.isDestroyed()) {
          try {
            this.window.removeBrowserView(tabInfo.view);
          } catch (removeErr) {
            // BrowserView might already be removed, ignore
            logger.log(`BrowserView already removed: ${removeErr.message}`);
          }
        }
        
        // Destroy webContents if it exists and is not destroyed
        if (tabInfo.view && tabInfo.view.webContents && !tabInfo.view.webContents.isDestroyed()) {
          try {
            tabInfo.view.webContents.destroy();
          } catch (destroyErr) {
            // WebContents might already be destroyed, ignore
            logger.log(`WebContents already destroyed: ${destroyErr.message}`);
          }
        }
      } catch (err) {
        // Ignore errors during cleanup
        logger.log(`Error cleaning up tab ${tabInfo.id}: ${err.message}`);
      }
    });
    this.tabs.clear();
    this.activeTabId = null;
  }

  // Handle window resize
  handleResize() {
    if (this.activeTabId) {
      this.updateTabBounds(this.activeTabId);
    }
  }
}

module.exports = { TabManager };


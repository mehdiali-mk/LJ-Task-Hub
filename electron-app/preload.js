const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process via context bridge
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window-maximized', (event, isMaximized) => {
      callback(isMaximized);
    });
  },
  removeMaximizeListener: () => {
    ipcRenderer.removeAllListeners('window-maximized');
  }
});

// Inject title bar background matching navbar glass effect
window.addEventListener('DOMContentLoaded', () => {
  injectTitleBarBackground();
});

function injectTitleBarBackground() {
  // Create a glass background element for the title bar area
  const titleBarBg = document.createElement('div');
  titleBarBg.id = 'electron-titlebar-bg';
  
  // Inject styles matching the navbar's glass effect
  const style = document.createElement('style');
  style.textContent = `
    /* Glass background for title bar area - matching navbar */
    #electron-titlebar-bg {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 36px;
      z-index: 99998;
      pointer-events: none;
      
      /* Match navbar glass effect */
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(24px) saturate(150%);
      -webkit-backdrop-filter: blur(24px) saturate(150%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      /* Subtle shadow for depth */
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Add padding to body to account for title bar */
    body {
      padding-top: 36px !important;
      margin-top: 0 !important;
    }

    /* Push down any fixed headers */
    header[class*="fixed"],
    nav[class*="fixed"],
    [style*="position: fixed"],
    [style*="position:fixed"] {
      top: 36px !important;
    }

    /* Make sure the title bar area isn't draggable by default */
    html {
      -webkit-app-region: no-drag;
    }
  `;

  document.head.appendChild(style);
  document.body.insertBefore(titleBarBg, document.body.firstChild);
}

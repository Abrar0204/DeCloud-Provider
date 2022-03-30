const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["account-number"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  listen: (channel, handler) => {
    let validChannels = ["file-stored-successfully"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, handler);
    }
  },
});

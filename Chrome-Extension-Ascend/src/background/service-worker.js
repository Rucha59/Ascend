// Ascend Chrome Extension — Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("Ascend Chrome Extension installed.");

  // Configure toolbar action to toggle the side panel directly
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// Ensure panel behavior persists across browser sessions
chrome.runtime.onStartup.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior on startup:", error));
  }
});

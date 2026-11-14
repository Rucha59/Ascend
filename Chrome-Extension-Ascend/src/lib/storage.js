// Storage helper with seamless chrome.storage.local and localStorage fallback for development

const isExtension = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

export const storage = {
  async get(key) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] !== undefined ? result[key] : null);
        });
      });
    }
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item;
    }
  },

  async set(key, value) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    }
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  },

  async remove(key) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], resolve);
      });
    }
    localStorage.removeItem(key);
  },

  async clear() {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
      });
    }
    localStorage.clear();
  },
};

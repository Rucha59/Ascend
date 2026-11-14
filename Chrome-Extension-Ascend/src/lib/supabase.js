import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes("placeholder")
  );
};

export const chromeStorageAdapter = {
  getItem: async (key) => {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        const res = await chrome.storage.local.get(key);
        return res[key] ?? null;
      }
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        await chrome.storage.local.set({ [key]: value });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn("Storage setItem error:", err);
    }
  },
  removeItem: async (key) => {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        await chrome.storage.local.remove(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn("Storage removeItem error:", err);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: chromeStorageAdapter,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

# Ascend Chrome Extension — Setup & Execution Guide

This document details how to run the Ascend backend and how to build, develop, and load the Ascend Chrome Extension into Google Chrome.

---

## 1. Prerequisites

- **Java JDK:** 17+ (`java -version`)
- **Node.js:** 18+ (`node -v`)
- **PostgreSQL:** 14+ running locally with database `sprout`
- **Google Chrome:** Version 116+ (supports Chrome Side Panel API)

---

## 2. Running the Existing Ascend Backend

Open a terminal and navigate to the backend directory:

```bash
cd sprout/backend

# Start the Spring Boot application (or use ./mvnw if wrapper is generated)
mvn spring-boot:run
```

The REST API will be available at: **`http://localhost:8080/api`**.

---

## 3. Developing & Building the Chrome Extension

Navigate to the extension project folder:

```bash
cd Chrome-Extension-Ascend
```

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Live Development Preview (Browser Mode)
```bash
npm run dev
```
Opens a local Vite server at `http://localhost:5173` (or next free port) where you can test the UI in real time with Hot Module Reloading.

### 3.3 Production Extension Build
```bash
npm run build
```
This builds the complete, Manifest V3 compliant extension into `Chrome-Extension-Ascend/dist/`.

---

## 4. Loading the Extension into Google Chrome

1. Open Google Chrome and navigate to: `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left toolbar.
4. Select the build directory:
   ```
   C:\Users\rucha\sprout-phase3\Chrome-Extension-Ascend\dist
   ```
5. The extension **Ascend — Habit & Productivity Companion** will appear in your extensions list.
6. Click Chrome's puzzle icon (Extensions) in the top-right toolbar and pin **Ascend**.
7. Click the Ascend toolbar icon: the **Ascend Side Panel** will open beside your current browsing tab!

### 4.1 Whitelist Extension Redirect URL in Supabase

Because the extension uses `chrome.identity.launchWebAuthFlow`, Supabase requires your extension's redirect URL to be allowlisted:

1. Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Under **Redirect URLs**, click **Add URL**.
3. Add the wildcard:
   ```text
   https://*.chromiumapp.org/**
   ```
   *(Or your specific extension URL from the login screen: `https://<your-extension-id>.chromiumapp.org/`)*
4. Click **Save**.

If this URL is not added, Supabase will fall back to redirecting to your web app's Site URL, causing the Chrome Extension auth window to hang.

---

## 5. Verifying Cross-Platform Data Synchronization

1. **Sign In:** Click **Continue with Google** (or use the developer token input with an active JWT).
2. **Habit Sync:**
   - Click any habit pill in the extension to cycle its status (e.g., mark as `DONE`).
   - Refresh or check the Ascend web application (`http://localhost:5173/dashboard`): the habit status and progress percentage will reflect the update.
3. **Task Sync:**
   - Type a new task in the inline input on the extension dashboard and press **Enter**.
   - Check the web application: the task appears under today's to-dos.
   - Complete the task in either the web app or extension: the checkmark updates on both.
4. **Project Milestone Sync:**
   - Click an active project card in the extension to view its milestones and checklist items.
   - Check off a checklist item: the milestone progress and overall project progress update in real time.
5. **Theme Switching:**
   - Click the theme toggle icon in the header to switch between **Deep Seafoam** (Light), **Forest Green** (Dark), and **System Default**.

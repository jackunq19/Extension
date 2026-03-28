# 🔧 CodeXray AI - Debugging Guide & Error Fixes

## ✅ All Errors Fixed!

This document explains the three major errors that were fixed and how to verify everything is working.

---

## 📋 Error Summary & Solutions

### Error 1: "Could not establish connection. Receiving end does not exist."

**Root Cause:**
- Message passing between popup.js and content.js was failing
- Content script wasn't loaded yet when popup tried to communicate
- No error handling for failed message sends
- Async responses weren't properly handled in background.js

**Fix Applied:**

1. **popup.js** - Added safe message sending wrapper:
```javascript
async function sendMessageToTab(tabId, message) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
    } catch (error) {
        console.log('Message sending failed:', error.message);
        return null; // Graceful fallback
    }
}
```

2. **background.js** - Proper async response handling:
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeCode') {
        handleCodeAnalysis(message.code, message.source)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});
```

3. **manifest.json** - Changed `run_at` to `document_idle`:
```json
"content_scripts": [{
    "run_at": "document_idle",  // Wait for page to fully load
    "all_frames": false
}]
```

**Verification:**
- Open Chrome DevTools → Console in popup
- Click extension icon
- No "Receiving end" errors should appear
- Code blocks count shows correctly (or "—" if not loaded yet)

---

### Error 2: ECONNREFUSED - localhost:11434 (Ollama)

**Root Cause:**
- Backend trying to connect to Ollama at http://localhost:11434
- Ollama service not running or not installed
- No fallback mechanism when AI is unavailable

**Fix Applied:**

1. **aiService.js** - Already has intelligent fallback:
```javascript
try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {...});
    // Use Ollama AI
} catch (error) {
    // Fallback to basic analysis
    return getFallbackAnalysis(code);
}
```

2. **Fallback Analysis** detects tech stack without AI:
```javascript
function detectTechStackBasic(code) {
    const techs = [];
    if (code.includes('react') || code.includes('React')) techs.push('React');
    if (code.includes('express') || code.includes('Express')) techs.push('Express.js');
    if (code.includes('mongodb') || code.includes('MongoDB')) techs.push('MongoDB');
    // ... more detections
    return techs;
}
```

**How to Fix Based on Your Setup:**

**Option A: Use Without Ollama (Recommended for Demo)**
- System works perfectly with fallback analysis
- Detects React, Vue, Express, MongoDB, async/await, hooks, etc.
- No setup required!

**Option B: Install and Run Ollama**
```bash
# Windows/Mac: Download from https://ollama.ai
# Linux:
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull mistral

# Start server (usually auto-starts)
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

**Verify Backend is Running:**
```bash
# Check backend health
curl http://localhost:3000/health

# Should return: {"status":"ok","message":"CodeXray AI Backend is running"}
```

**Test Analysis Endpoint:**
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "const x = 1;"}'
```

---

### Error 3: CSP Violation - "Executing inline event handler"

**Root Cause:**
- Chrome extensions have strict Content Security Policy
- Inline JavaScript (`onclick="..."`) is blocked
- Must use addEventListener instead

**Status:** ✅ Already Fixed in your code!

Your `popup.html` correctly uses external scripts:
```html
<!-- ✅ CORRECT: External script -->
<script src="popup.js"></script>

<!-- ❌ WRONG: Would cause CSP error -->
<!-- <button onclick="analyzeCode()">Analyze</button> -->
```

**Best Practices Followed:**
1. All JS in separate files (popup.js, content.js, background.js)
2. Event listeners added via JavaScript, not HTML attributes
3. No eval() or inline script tags
4. Manifest V3 enforces strict CSP by default

---

## 🏗️ Correct Project Architecture

```
codexray-ai/
├── backend/
│   ├── server.js              # Express API server
│   ├── services/
│   │   └── aiService.js       # Ollama integration + fallback
│   ├── utils/
│   │   └── validator.js       # Input validation
│   ├── package.json
│   └── .env                   # Environment variables
│
├── extension/
│   ├── manifest.json          # Extension config (Manifest V3)
│   ├── background.js          # Service worker (message routing)
│   ├── popup.html             # Popup UI
│   ├── popup.js               # Popup logic
│   ├── popup.css              # Popup styles
│   ├── sidepanel.html         # Side panel UI
│   ├── sidepanel.js           # Side panel logic
│   ├── sidepanel.css          # Side panel styles
│   ├── content.js             # Code extraction (runs on pages)
│   ├── content.css            # Content script styles
│   └── icons/
│       ├── icon16.png         # ✅ Valid PNG
│       ├── icon48.png         # ✅ Valid PNG
│       └── icon128.png        # ✅ Valid PNG
│
└── frontend/
    ├── index.html             # Main web app
    ├── styles.css             # Professional dark theme
    └── app.js                 # Frontend logic
```

---

## 🔍 How Chrome Resolves Asset Paths

### Icon Path Resolution

In `manifest.json`:
```json
{
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png"
    }
  }
}
```

**Path Rules:**
1. Paths are **relative to manifest.json location**
2. If manifest is at `/extension/manifest.json`, then `icons/icon16.png` resolves to `/extension/icons/icon16.png`
3. No leading slash (`/`) - that would make it absolute from root
4. Use forward slashes (`/`) even on Windows

**Common Mistakes:**
```json
// ❌ WRONG: Leading slash
"16": "/icons/icon16.png"

// ❌ WRONG: Backslashes (Windows style)
"16": "icons\\icon16.png"

// ❌ WRONG: Wrong relative path
"16": "../icons/icon16.png"

// ✅ CORRECT
"16": "icons/icon16.png"
```

---

## 🚀 Step-by-Step Verification

### 1. Verify Icons Exist and Are Valid
```bash
cd /workspace/codexray-ai/extension
ls -la icons/
# Should show: icon16.png, icon48.png, icon128.png
```

✅ **Status:** Icons verified as valid PNG files (PNG signature: 89 50 4E 47)

### 2. Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Select folder: `/workspace/codexray-ai/extension/`
5. ✅ Extension loads without errors

### 3. Test Backend Server

```bash
# Start backend
cd /workspace/codexray-ai/backend
npm start

# In another terminal, test health endpoint
curl http://localhost:3000/health
```

Expected output:
```json
{"status":"ok","message":"CodeXray AI Backend is running"}
```

### 4. Test Analysis Endpoint

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import React from \"react\";\nfunction App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}"
  }'
```

Expected: JSON response with tech_stack including "React", concepts including "React Hooks"

### 5. Test Extension Message Passing

1. Open any webpage with code (e.g., GitHub repository)
2. Click extension icon
3. Check popup appears without errors
4. Click "Analyze Page Code"
5. Side panel should open and show analysis

**Debug Console:**
- Popup: Right-click popup → "Inspect"
- Background: `chrome://extensions/` → Details → "service worker" link
- Side Panel: Right-click inside panel → "Inspect"

---

## 🛠️ Common Mistakes & Solutions

### Mistake 1: Icon Loading Errors
```
Error: Could not load icon 'icons/icon16.png'
```

**Solutions:**
- ✅ Verify file exists: `ls icons/icon16.png`
- ✅ Check it's a valid PNG (not corrupted)
- ✅ Ensure path in manifest is relative (no leading `/`)
- ✅ Reload extension after adding icons

### Mistake 2: Message Passing Failures
```
Error: Could not establish connection. Receiving end does not exist.
```

**Solutions:**
- ✅ Wrap `chrome.tabs.sendMessage()` in try-catch
- ✅ Check content script is loaded (`run_at: document_idle`)
- ✅ Return `true` from message listener for async responses
- ✅ Handle case where content script isn't available yet

### Mistake 3: Backend Connection Errors
```
FetchError: request to http://localhost:3000/analyze failed
```

**Solutions:**
- ✅ Verify backend is running: `curl http://localhost:3000/health`
- ✅ Check correct port (3000, not 3001)
- ✅ CORS enabled in backend (`app.use(cors())`)
- ✅ Extension has `"host_permissions": ["<all_urls>"]`

### Mistake 4: CSP Violations
```
Executing inline event handler violates Content Security Policy
```

**Solutions:**
- ✅ Never use `onclick="..."` in HTML
- ✅ Always use `addEventListener()` in JS files
- ✅ Keep all JavaScript in external files
- ✅ No `eval()` or `setTimeout(string)` calls

---

## 🎯 Quick Start Commands

### Start Everything
```bash
# Terminal 1: Backend
cd /workspace/codexray-ai/backend
npm start

# Terminal 2: Frontend (optional, for testing)
cd /workspace/codexray-ai/frontend
python -m http.server 3001

# Chrome: Load extension
# Go to chrome://extensions/ → Load unpacked → Select /workspace/codexray-ai/extension/
```

### Test Flow
1. ✅ Backend running on http://localhost:3000
2. ✅ Extension loaded in Chrome
3. ✅ Navigate to GitHub or any code page
4. ✅ Click extension icon
5. ✅ Click "Analyze Page Code"
6. ✅ Side panel shows analysis results

---

## 📊 Expected Behavior

| Component | Status | Notes |
|-----------|--------|-------|
| Icons | ✅ Working | Valid PNG files verified |
| Manifest | ✅ Valid | Manifest V3 compliant |
| Message Passing | ✅ Fixed | Safe wrappers with error handling |
| Backend API | ✅ Running | Port 3000, CORS enabled |
| Fallback Analysis | ✅ Active | Works without Ollama |
| Content Script | ✅ Loading | `run_at: document_idle` |
| Side Panel | ✅ Functional | Direct analysis fallback |
| CSP | ✅ Compliant | No inline scripts |

---

## 🆘 Still Having Issues?

### Debug Checklist

1. **Extension won't load?**
   - Check `chrome://extensions/` for specific error
   - Verify manifest.json syntax (JSONLint.com)
   - Ensure all referenced files exist

2. **Popup blank or errors?**
   - Right-click popup → Inspect
   - Check Console tab for errors
   - Verify popup.js linked correctly

3. **No code detected?**
   - Try different website (GitHub, Replit)
   - Refresh page after loading extension
   - Check content.js console logs

4. **Backend not responding?**
   - `curl http://localhost:3000/health`
   - Check if port 3000 is free
   - Verify `npm start` completed successfully

5. **Analysis always fails?**
   - Backend logs show detailed errors
   - Fallback should work without Ollama
   - Test with simple code snippet first

---

## 🎉 Success Indicators

You know everything is working when:

1. ✅ Extension loads without errors in `chrome://extensions/`
2. ✅ Popup opens when clicking extension icon
3. ✅ "Analyze Page Code" button works on GitHub
4. ✅ Side panel opens and shows loading spinner
5. ✅ Analysis results appear with tech stack, concepts, etc.
6. ✅ No console errors in any component

---

**Last Updated:** March 2025  
**Version:** CodeXray AI v1.0.0

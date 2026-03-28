# 🚀 CodeXray AI — Learn While You Vibe Code

An AI-powered developer tool that helps users understand AI-generated code while using vibe coding platforms like Replit, GitHub, Lovable, etc.

## 📁 Project Structure

```
codexray-ai/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server with 3 endpoints
│   ├── services/
│   │   └── aiService.js    # Ollama AI integration + fallback
│   ├── utils/
│   │   └── validator.js    # Input validation
│   ├── package.json
│   └── .env
├── frontend/                # Professional Web UI
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Dark glassmorphism theme
│   ├── app.js              # Frontend logic
│   └── test-api.html       # API testing page
└── extension/               # Chrome Extension (Manifest V3)
    ├── manifest.json       # Extension config (FIXED)
    ├── popup.html/css/js   # Popup UI
    ├── sidepanel.html/css/js # Side panel UI
    ├── content.js/css      # Code extraction script
    ├── background.js       # Service worker
    └── icons/              # Extension icons (GENERATED)
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

## 🔧 Quick Start Guide

### Step 1: Fix Extension Icons (ALREADY DONE)

The icon error has been fixed! Icons are now generated automatically.

If you need to regenerate them:
```bash
cd codexray-ai/extension/icons
python create_icons.py
```

### Step 2: Start Backend Server

```bash
cd codexray-ai/backend
npm install
npm start
```

Server will run on `http://localhost:3000`

**Note:** The backend works WITHOUT Ollama! It includes a smart fallback analysis system.

### Step 3: Open Frontend

**Option A - Direct File:**
```bash
# Just open in browser
open codexray-ai/frontend/index.html
# or
start codexray-ai/frontend/index.html  # Windows
```

**Option B - Test API First:**
```bash
open codexray-ai/frontend/test-api.html
```

Click "Test Health" and "Test Analyze" to verify backend is working!

**Option C - Python Server:**
```bash
cd codexray-ai/frontend
python -m http.server 3001
# Visit http://localhost:3001
```

### Step 4: Install Chrome Extension

1. Open Chrome → Go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the folder: `codexray-ai/extension/`
5. ✅ Extension installed!

## 🎯 How to Use

### Web App
1. Open `frontend/index.html` in your browser
2. Paste any code into the textarea
3. Click "Analyze Code" or press `Ctrl/Cmd + Enter`
4. View results: Tech Stack, Concepts, Explanation, Architecture, Learning Roadmap, Skill Gaps

### Chrome Extension
1. Navigate to any code page (GitHub, Replit, etc.)
2. Click the CodeXray AI extension icon
3. Click "Analyze Page Code"
4. Side panel opens with full analysis!

**Code X-Ray Feature:**
1. Select any code on a webpage
2. Click extension icon
3. Your selection appears - click "Analyze Selection"

## 🛠️ Troubleshooting

### Extension Icon Error (FIXED)
**Error:** `Failed to load extension. Could not load icon 'icons/icon16.png'`

**Solution:** Already fixed! Icons were regenerated. If needed again:
```bash
cd extension/icons
python create_icons.py
```

### Backend Not Responding
1. Check if server is running: `curl http://localhost:3000/health`
2. Check port 3000 is not in use
3. Restart: `npm start` in backend folder

### Frontend Not Connecting
1. Ensure backend is running on port 3000
2. Check browser console for CORS errors
3. Verify API_URL in `app.js` is `http://localhost:3000`

### No AI Analysis (Ollama not installed)
No problem! The fallback system provides:
- Basic tech stack detection
- Concept identification
- Generic learning roadmap

To enable AI analysis:
```bash
# Install Ollama
brew install ollama  # Mac
# or download from https://ollama.ai

# Pull model
ollama pull mistral

# Start Ollama
ollama serve
```

## 🎨 Features

### Backend API
- ✅ POST `/analyze` - Full code analysis
- ✅ POST `/xray` - Specific code section analysis  
- ✅ POST `/improve-prompt` - Prompt optimization
- ✅ GET `/health` - Health check
- ✅ Smart fallback when AI unavailable

### Frontend UI
- ✅ Dark glassmorphism theme
- ✅ Animated gradient backgrounds
- ✅ Loading states & animations
- ✅ Copy results functionality
- ✅ Example code loader
- ✅ Keyboard shortcuts

### Chrome Extension
- ✅ Manifest V3 compliant
- ✅ Smart code extraction
- ✅ GitHub & Replit support
- ✅ Code X-Ray (selection analysis)
- ✅ Side panel display
- ✅ Popup quick actions

## 📝 API Response Format

```json
{
  "success": true,
  "data": {
    "tech_stack": ["React", "Node.js", "MongoDB"],
    "concepts": ["Hooks", "Async/Await", "API Calls"],
    "explanation": "This code creates a React component...",
    "architecture": "User → React Frontend → Express API → MongoDB",
    "learning_roadmap": ["Learn React basics", ...],
    "skill_gaps": ["State management", ...]
  }
}
```

## 🚀 Hackathon Demo Flow

1. **Show Web App**: Open `index.html`, paste code, analyze
2. **Show Results**: Beautiful cards with animations
3. **Install Extension**: Load unpacked extension
4. **Go to GitHub**: Navigate to any repo with code
5. **Click Extension**: "Analyze Page Code"
6. **Show Side Panel**: Full analysis in professional UI
7. **Code X-Ray**: Select specific function, analyze it!

## 💡 Pro Tips

- Works without Ollama (fallback mode)
- Extension works on ANY website with code
- Keyboard shortcut: `Ctrl/Cmd + Enter` to analyze
- Copy all results with one click
- Try the example code button for demo

## 🎯 Common Mistakes Fixed

1. ❌ **Missing icons** → ✅ Auto-generated PNG icons
2. ❌ **Wrong icon paths** → ✅ Corrected manifest paths
3. ❌ **No module type** → ✅ Added `"type": "module"` to background
4. ❌ **Content script timing** → ✅ Added `run_at: document_end`
5. ❌ **Missing web_accessible_resources** → ✅ Added for CSS/icons

## 📞 Support

For issues:
1. Check backend logs
2. Open browser DevTools console
3. Verify all files exist in correct locations
4. Test API at `test-api.html` first

---

**Built with ❤️ by CodeXray AI Team**

*"Your AI mentor for understanding code"*

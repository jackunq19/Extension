# CodeXray AI — Learn While You Vibe Code

An AI-powered developer tool that helps users understand AI-generated code while using vibe coding platforms like Replit, GitHub, Lovable, etc.

## 🚀 Features

### Core Features
- **Code Analysis Engine**: Accepts code input and detects tech stack, identifies programming concepts, and explains code in simple terms
- **Code X-Ray**: Select any part of code and get AI-powered explanations
- **Smart Code Extraction**: Extract code from websites like GitHub, Replit automatically
- **Architecture Generator**: Generates system flow diagrams
- **Learning Roadmap**: Step-by-step beginner-friendly learning plan
- **Skill Gap Detection**: Identifies missing knowledge areas
- **Prompt Improvement**: Suggests better prompts for AI tools

## 📦 Project Structure

```
codexray-ai/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── services/
│   │   └── aiService.js    # Ollama AI integration
│   ├── utils/
│   │   └── validator.js    # Input validation
│   ├── package.json
│   └── .env
├── frontend/               # Web UI
│   ├── index.html         # Main HTML
│   ├── styles.css         # Professional dark theme
│   └── app.js             # Frontend logic
└── extension/             # Chrome Extension
    ├── manifest.json      # Extension config
    ├── popup.html         # Popup UI
    ├── popup.js           # Popup logic
    ├── sidepanel.html     # Side panel UI
    ├── sidepanel.js       # Side panel logic
    ├── content.js         # Content script
    ├── background.js      # Service worker
    └── icons/             # Extension icons
```

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **AI**: Ollama (Local models: mistral, llama3)
- **Extension**: Chrome Extension Manifest V3

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed locally
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Pull a model
   ollama pull mistral
   ```

### 1. Setup Backend

```bash
cd backend
npm install
npm start
```

The backend will start on `http://localhost:3000`

### 2. Open Frontend

Open `frontend/index.html` in your browser or serve it:

```bash
# Using Python
cd frontend
python -m http.server 3001

# Or using Node.js
npx serve frontend
```

Visit `http://localhost:3001`

### 3. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` folder
5. The CodeXray AI extension icon should appear

## 📖 Usage

### Web App
1. Open the frontend in your browser
2. Paste any code into the textarea
3. Click "Analyze Code"
4. View results: Tech Stack, Concepts, Explanation, Architecture, Learning Roadmap, Skill Gaps

### Chrome Extension
1. Navigate to any page with code (GitHub, Replit, etc.)
2. Click the CodeXray AI extension icon
3. Click "Analyze Page Code" or select code first
4. View results in the side panel

## 🔌 API Endpoints

### POST /analyze
Analyze code and get structured results

```json
{
  "code": "your code here"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "tech_stack": ["React", "Node.js"],
    "concepts": ["Hooks", "Async/Await"],
    "explanation": "...",
    "architecture": "User → Frontend → API → Database",
    "learning_roadmap": ["Step 1", "Step 2"],
    "skill_gaps": ["Gap 1"]
  }
}
```

### POST /xray
Analyze specific code section

### POST /improve-prompt
Improve AI prompts

## 🎨 Design Features

- **Dark Glassmorphism Theme**: Modern, professional UI
- **Animated Background**: Gradient orbs with smooth animations
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Smooth loading animations
- **Error Handling**: Clean error alerts

## 🔥 Advanced Features

1. **Multi-platform Code Extraction**: GitHub, Replit, generic code blocks
2. **Selection-based Analysis**: Code X-Ray for specific sections
3. **Fallback Analysis**: Works even without AI (basic detection)
4. **Copy Results**: One-click copy all analysis
5. **Keyboard Shortcuts**: Ctrl/Cmd + Enter to analyze

## 📝 Example Code to Test

```javascript
import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  
  useEffect(() => {
    fetchTodos();
  }, []);
  
  const fetchTodos = async () => {
    const response = await fetch('/api/todos');
    const data = await response.json();
    setTodos(data);
  };
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

## 🎯 Hackathon Demo Flow

1. **Show Web App**: Open frontend, paste code, analyze
2. **Show Extension**: Go to GitHub repo, click extension
3. **Code X-Ray**: Select specific function, get explanation
4. **Side Panel**: Show beautiful results in side panel
5. **Learning Path**: Highlight roadmap and skill gaps

## ⚠️ Important Notes

- Make sure Ollama is running before starting the backend
- Default model is `mistral`, can be changed in `.env`
- Extension requires Chrome/Edge with Manifest V3 support

## 🚀 Future Enhancements

- [ ] Support for more AI models
- [ ] Code comparison feature
- [ ] Export analysis as PDF
- [ ] Team collaboration features
- [ ] Browser sync for extension

## 📄 License

MIT License

---

Built with ❤️ by CodeXray AI Team

// CodeXray AI - Frontend Application Logic

const API_URL = 'http://localhost:3000';

// DOM Elements
const codeInput = document.getElementById('codeInput');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');

// Character counter
codeInput.addEventListener('input', () => {
    charCount.textContent = codeInput.value.length;
});

/**
 * Analyze code from input
 */
async function analyzeCode() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showError('Please paste some code to analyze');
        return;
    }

    // Show loading state
    setLoading(true);
    hideResults();
    hideError();

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Analysis failed');
        }

        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }

        displayResults(result.data);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'Failed to analyze code. Please try again.');
    } finally {
        setLoading(false);
    }
}

/**
 * Display analysis results
 */
function displayResults(data) {
    // Tech Stack
    const techStackEl = document.getElementById('techStack');
    techStackEl.innerHTML = data.tech_stack.length > 0 
        ? data.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
        : '<span style="color: var(--text-muted)">No technologies detected</span>';

    // Concepts
    const conceptsEl = document.getElementById('concepts');
    conceptsEl.innerHTML = data.concepts.length > 0
        ? data.concepts.map(concept => `<li>${concept}</li>`).join('')
        : '<span style="color: var(--text-muted)">No concepts detected</span>';

    // Explanation
    const explanationEl = document.getElementById('explanation');
    explanationEl.textContent = data.explanation || 'No explanation available';

    // Architecture
    const architectureEl = document.getElementById('architecture');
    architectureEl.textContent = data.architecture || 'Architecture analysis unavailable';

    // Learning Roadmap
    const roadmapEl = document.getElementById('learningRoadmap');
    roadmapEl.innerHTML = data.learning_roadmap.length > 0
        ? data.learning_roadmap.map(step => `<li>${step}</li>`).join('')
        : '<span style="color: var(--text-muted)">No roadmap available</span>';

    // Skill Gaps
    const skillGapsEl = document.getElementById('skillGaps');
    skillGapsEl.innerHTML = data.skill_gaps.length > 0
        ? data.skill_gaps.map(gap => `<span class="skill-gap">${gap}</span>`).join('')
        : '<span style="color: var(--text-muted)">No skill gaps identified</span>';

    // Show results section with animation
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    const btnIcon = analyzeBtn.querySelector('.btn-icon');

    if (isLoading) {
        btnText.style.display = 'none';
        btnIcon.style.display = 'none';
        btnLoader.style.display = 'flex';
        analyzeBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnIcon.style.display = 'inline';
        btnLoader.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

/**
 * Show/hide results
 */
function hideResults() {
    resultsSection.style.display = 'none';
}

/**
 * Show error alert
 */
function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Hide error alert
 */
function hideError() {
    errorAlert.style.display = 'none';
}

/**
 * Close error alert
 */
function closeAlert() {
    hideError();
}

/**
 * Clear code input
 */
function clearCode() {
    codeInput.value = '';
    charCount.textContent = '0';
    hideResults();
    codeInput.focus();
}

/**
 * Load example code
 */
function loadExample() {
    const exampleCode = `// React Todo App Example
import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Fetch todos from API
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setInput('');

    // Save to backend
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    });
  };

  const toggleTodo = async (id) => {
    const updated = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updated);
    
    await fetch(\`/api/todos/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.find(t => t.id === id))
    });
  };

  return (
    <div className="todo-app">
      <h1>My Todo List</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={todo.completed ? 'completed' : ''}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`;

    codeInput.value = exampleCode;
    charCount.textContent = exampleCode.length;
    hideResults();
    hideError();
}

/**
 * Copy all results to clipboard
 */
async function copyResults() {
    const techStack = document.getElementById('techStack').innerText;
    const concepts = document.getElementById('concepts').innerText;
    const explanation = document.getElementById('explanation').innerText;
    const architecture = document.getElementById('architecture').innerText;
    const roadmap = document.getElementById('learningRoadmap').innerText;
    const skillGaps = document.getElementById('skillGaps').innerText;

    const textToCopy = `
CodeXray AI Analysis Results
============================

Tech Stack: ${techStack}

Key Concepts: ${concepts}

Explanation:
${explanation}

Architecture:
${architecture}

Learning Roadmap:
${roadmap}

Skill Gaps: ${skillGaps}
    `.trim();

    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Results copied to clipboard!');
    } catch (error) {
        showError('Failed to copy results');
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'alert';
    toast.style.background = 'rgba(102, 126, 234, 0.9)';
    toast.innerHTML = \`
        <span class="alert-icon">✅</span>
        <span class="alert-message">\${message}</span>
    \`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Keyboard shortcut for analysis (Ctrl/Cmd + Enter)
codeInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeCode();
    }
});

// Initialize
console.log('CodeXray AI initialized 🚀');

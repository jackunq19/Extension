// CodeXray AI - Side Panel Script

const API_URL = 'http://localhost:3000';
let currentCode = '';
let currentSource = '';

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const resultsContainer = document.getElementById('resultsContainer');
const errorMessage = document.getElementById('errorMessage');
const sourceBadge = document.getElementById('sourceBadge');

// Initialize
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeCode') {
        currentCode = message.code;
        currentSource = message.source || 'page';
        performAnalysis(message.code);
    }
    
    if (message.action === 'analysisComplete') {
        displayResults(message.data);
    }
    
    if (message.action === 'analysisError') {
        showError(message.error);
    }
    
    return true;
});

// Perform analysis
async function performAnalysis(code) {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Analysis failed');
        }

        displayResults(result.data);
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    }
}

// Display results
function displayResults(data) {
    // Set source badge
    sourceBadge.textContent = currentSource === 'selection' ? 'Code X-Ray' : 'Page Analysis';
    
    // Tech Stack
    const techStackEl = document.getElementById('techStack');
    techStackEl.innerHTML = data.tech_stack.length > 0 
        ? data.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
        : '<span style="color: #6b6b7b; font-size: 0.85rem;">No technologies detected</span>';

    // Concepts
    const conceptsEl = document.getElementById('concepts');
    conceptsEl.innerHTML = data.concepts.length > 0
        ? data.concepts.map(concept => `<li>${concept}</li>`).join('')
        : '<span style="color: #6b6b7b; font-size: 0.85rem;">No concepts detected</span>';

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
        : '<span style="color: #6b6b7b; font-size: 0.85rem;">No roadmap available</span>';

    // Skill Gaps
    const skillGapsEl = document.getElementById('skillGaps');
    skillGapsEl.innerHTML = data.skill_gaps.length > 0
        ? data.skill_gaps.map(gap => `<span class="skill-gap">${gap}</span>`).join('')
        : '<span style="color: #6b6b7b; font-size: 0.85rem;">No skill gaps identified</span>';

    // Show results
    hideLoading();
    hideError();
    resultsContainer.style.display = 'block';
}

// Show loading state
function showLoading() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    resultsContainer.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingState.style.display = 'none';
}

// Show error
function showError(message) {
    errorMessage.textContent = message || 'Something went wrong';
    loadingState.style.display = 'none';
    errorState.style.display = 'flex';
    resultsContainer.style.display = 'none';
}

// Hide error
function hideError() {
    errorState.style.display = 'none';
}

// Retry analysis
function retryAnalysis() {
    if (currentCode) {
        performAnalysis(currentCode);
    }
}

// Close panel
function closePanel() {
    window.close();
}

// Copy results
async function copyResults() {
    const techStack = document.getElementById('techStack').innerText;
    const concepts = document.getElementById('concepts').innerText;
    const explanation = document.getElementById('explanation').innerText;
    const architecture = document.getElementById('architecture').innerText;
    const roadmap = document.getElementById('learningRoadmap').innerText;
    const skillGaps = document.getElementById('skillGaps').innerText;

    const textToCopy = `
CodeXray AI Analysis
====================

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
        showToast('Results copied!');
    } catch (error) {
        showError('Failed to copy results');
    }
}

// Open full app
function openFullApp() {
    chrome.tabs.create({ url: 'http://localhost:3001' });
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Add slide up animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

console.log('CodeXray AI Side Panel initialized 🚀');

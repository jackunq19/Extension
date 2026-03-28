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

// Initialize side panel
document.addEventListener('DOMContentLoaded', () => {
    console.log('Side panel loaded, checking for pending analysis...');
    
    // Check if there's a pending analysis from background
    chrome.runtime.sendMessage({ action: 'getPendingAnalysis' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('Background not ready yet');
        } else if (response && response.data) {
            console.log('Found pending analysis, displaying...');
            displayResults(response.data);
        }
    });
});

// Listen for messages from background or popup
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
    
    // Handle direct analysis (fallback when background isn't ready)
    if (message.action === 'directAnalysis') {
        currentCode = message.code;
        currentSource = message.source || 'page';
        performAnalysis(message.code);
    }
    
    return true;
});

// Perform analysis with improved error handling
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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server returned ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }

        displayResults(result.data);
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Try fallback analysis if backend is unavailable
        if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
            showError('Backend server not running. Please start the backend on localhost:3000');
        } else {
            showError(error.message);
        }
    }
}

// Display results with proper null checks
function displayResults(data) {
    if (!data) {
        showError('No analysis data received');
        return;
    }
    
    // Set source badge
    sourceBadge.textContent = currentSource === 'selection' ? 'Code X-Ray' : 'Page Analysis';
    
    // Tech Stack
    const techStackEl = document.getElementById('techStack');
    if (techStackEl) {
        techStackEl.innerHTML = data.tech_stack && data.tech_stack.length > 0 
            ? data.tech_stack.map(tech => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')
            : '<span class="no-data">No technologies detected</span>';
    }

    // Concepts
    const conceptsEl = document.getElementById('concepts');
    if (conceptsEl) {
        conceptsEl.innerHTML = data.concepts && data.concepts.length > 0
            ? data.concepts.map(concept => `<li>${escapeHtml(concept)}</li>`).join('')
            : '<span class="no-data">No concepts detected</span>';
    }

    // Explanation
    const explanationEl = document.getElementById('explanation');
    if (explanationEl) {
        explanationEl.textContent = data.explanation || 'No explanation available';
    }

    // Architecture
    const architectureEl = document.getElementById('architecture');
    if (architectureEl) {
        architectureEl.textContent = data.architecture || 'Architecture analysis unavailable';
    }

    // Learning Roadmap
    const roadmapEl = document.getElementById('learningRoadmap');
    if (roadmapEl) {
        roadmapEl.innerHTML = data.learning_roadmap && data.learning_roadmap.length > 0
            ? data.learning_roadmap.map((step, index) => `<li><strong>Step ${index + 1}:</strong> ${escapeHtml(step)}</li>`).join('')
            : '<span class="no-data">No roadmap available</span>';
    }

    // Skill Gaps
    const skillGapsEl = document.getElementById('skillGaps');
    if (skillGapsEl) {
        skillGapsEl.innerHTML = data.skill_gaps && data.skill_gaps.length > 0
            ? data.skill_gaps.map(gap => `<span class="skill-gap">${escapeHtml(gap)}</span>`).join('')
            : '<span class="no-data">No skill gaps identified</span>';
    }

    // Show results
    hideLoading();
    hideError();
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show loading state
function showLoading() {
    if (loadingState) loadingState.style.display = 'flex';
    if (errorState) errorState.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
}

// Show error
function showError(message) {
    if (errorMessage) errorMessage.textContent = message || 'Something went wrong';
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.style.display = 'flex';
    if (resultsContainer) resultsContainer.style.display = 'none';
}

// Hide error
function hideError() {
    if (errorState) errorState.style.display = 'none';
}

// Retry analysis
function retryAnalysis() {
    if (currentCode) {
        performAnalysis(currentCode);
    }
}

// Close panel
function closePanel() {
    if (window.close) window.close();
}

// Copy results
async function copyResults() {
    const techStack = document.getElementById('techStack')?.innerText || '';
    const concepts = document.getElementById('concepts')?.innerText || '';
    const explanation = document.getElementById('explanation')?.innerText || '';
    const architecture = document.getElementById('architecture')?.innerText || '';
    const roadmap = document.getElementById('learningRoadmap')?.innerText || '';
    const skillGaps = document.getElementById('skillGaps')?.innerText || '';

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
        console.error('Copy failed:', error);
        showToast('Failed to copy results');
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

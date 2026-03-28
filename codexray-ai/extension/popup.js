// CodeXray AI - Popup Script

const API_URL = 'http://localhost:3000';

// DOM Elements
const analyzePageBtn = document.getElementById('analyzePageBtn');
const openSidePanelBtn = document.getElementById('openSidePanelBtn');
const selectionSection = document.getElementById('selectionSection');
const codePreview = document.getElementById('codePreview');
const analyzeSelectionBtn = document.getElementById('analyzeSelectionBtn');
const codeBlocksCount = document.getElementById('codeBlocksCount');
const lastAnalysis = document.getElementById('lastAnalysis');

let selectedCode = '';

// Safe message sending with error handling
async function sendMessageToTab(tabId, message) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
    } catch (error) {
        console.log('Message sending failed:', error.message);
        // Content script may not be loaded yet
        return null;
    }
}

// Initialize popup
async function init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        // Request code blocks count from content script
        const response = await sendMessageToTab(tab.id, { action: 'getCodeInfo' });
        if (response && response.codeBlocks !== undefined) {
            codeBlocksCount.textContent = response.codeBlocks;
        } else {
            codeBlocksCount.textContent = '—';
        }
        
        // Load last analysis time
        const storage = await chrome.storage.local.get(['lastAnalysis']);
        if (storage.lastAnalysis) {
            lastAnalysis.textContent = formatTime(storage.lastAnalysis);
        }
    }
}

// Analyze page code
analyzePageBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) return;
    
    // Show loading state
    analyzePageBtn.innerHTML = '<span class="spinner"></span> Extracting...';
    analyzePageBtn.disabled = true;
    
    try {
        // Send message to content script to extract code
        const response = await sendMessageToTab(tab.id, { 
            action: 'extractCode' 
        });
        
        if (response && response.code) {
            // Open side panel with results
            await chrome.sidePanel.open({ windowId: tab.windowId });
            
            // Send code to side panel via background
            setTimeout(() => {
                chrome.runtime.sendMessage({ 
                    action: 'analyzeCode', 
                    code: response.code,
                    source: 'page'
                }).catch(err => {
                    console.error('Failed to send to background:', err);
                    // Fallback: send directly to sidepanel
                    chrome.runtime.sendMessage({ 
                        action: 'directAnalysis',
                        code: response.code,
                        source: 'page'
                    });
                });
            }, 500);
            
            // Save last analysis time
            await chrome.storage.local.set({ lastAnalysis: Date.now() });
            lastAnalysis.textContent = 'Just now';
        } else {
            alert('No code found on this page. Try selecting some code first.');
        }
    } catch (error) {
        console.error('Error extracting code:', error);
        alert('Failed to extract code. Please refresh the page and try again.');
    } finally {
        analyzePageBtn.innerHTML = '<span>📄</span> Analyze Page Code';
        analyzePageBtn.disabled = false;
    }
});

// Open side panel
openSidePanelBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        try {
            await chrome.sidePanel.open({ windowId: tab.windowId });
        } catch (error) {
            console.error('Failed to open side panel:', error);
            alert('Side panel not available. Please use the popup.');
        }
    }
});

// Analyze selected code
analyzeSelectionBtn.addEventListener('click', async () => {
    if (!selectedCode) return;
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) return;
    
    analyzeSelectionBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
    analyzeSelectionBtn.disabled = true;
    
    try {
        // Open side panel
        await chrome.sidePanel.open({ windowId: tab.windowId });
        
        // Send selected code to side panel
        setTimeout(() => {
            chrome.runtime.sendMessage({ 
                action: 'analyzeCode', 
                code: selectedCode,
                source: 'selection'
            }).catch(err => {
                console.error('Failed to send to background:', err);
            });
        }, 500);
        
        // Save last analysis time
        await chrome.storage.local.set({ lastAnalysis: Date.now() });
        lastAnalysis.textContent = 'Just now';
    } catch (error) {
        console.error('Error analyzing selection:', error);
        alert('Failed to analyze code. Please try again.');
    } finally {
        analyzeSelectionBtn.innerHTML = '<span>🔍</span> Analyze Selection';
        analyzeSelectionBtn.disabled = false;
    }
});

// Listen for selection updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'selectionUpdated') {
        selectedCode = message.code;
        
        if (selectedCode) {
            selectionSection.style.display = 'block';
            codePreview.textContent = selectedCode.substring(0, 200) + (selectedCode.length > 200 ? '...' : '');
        } else {
            selectionSection.style.display = 'none';
        }
    }
    return true;
});

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString();
}

// Initialize on load
init();

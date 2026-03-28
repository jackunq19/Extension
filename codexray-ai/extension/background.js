// CodeXray AI - Background Service Worker

const API_URL = 'http://localhost:3000';

// Store pending analysis requests
let pendingAnalysis = null;

// Listen for messages from popup, content scripts, or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeCode') {
        // Handle async response properly
        handleCodeAnalysis(message.code, message.source)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
    
    // Direct analysis fallback (when background isn't ready)
    if (message.action === 'directAnalysis') {
        console.log('Direct analysis requested');
        // Side panel will handle this directly
        return true;
    }
    
    // Get pending analysis
    if (message.action === 'getPendingAnalysis') {
        if (pendingAnalysis) {
            sendResponse({ data: pendingAnalysis });
            pendingAnalysis = null; // Clear after sending
        } else {
            sendResponse({ data: null });
        }
        return true;
    }
    
    return true;
});

// Handle code analysis with proper error handling
async function handleCodeAnalysis(code, source) {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Send results to all open side panels and popups
            const recipients = await chrome.runtime.sendMessage({
                action: 'analysisComplete',
                data: result.data,
                source: source
            }).catch(() => {
                // If no one is listening, store for later
                pendingAnalysis = result.data;
                console.log('Stored analysis for later retrieval');
            });
            
            console.log('Analysis complete and sent to UI');
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Try to send error to UI
        chrome.runtime.sendMessage({
            action: 'analysisError',
            error: error.message
        }).catch(() => {
            console.log('Could not send error to UI');
        });
        
        throw error;
    }
}

// Install event - set up side panel
chrome.runtime.onInstalled.addListener(() => {
    console.log('CodeXray AI installed!');
    
    // Set up side panel behavior
    if (chrome.sidePanel) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
            .catch(error => console.error('Error setting panel behavior:', error));
    }
});

// Tab update event - notify content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Notify content script that page is loaded
        chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch(() => {
            // Content script may not be loaded yet - this is normal
        });
    }
});

// Handle extension icon click to show side panel
if (chrome.action) {
    chrome.action.onClicked.addListener(async (tab) => {
        try {
            await chrome.sidePanel.open({ windowId: tab.windowId });
        } catch (error) {
            console.error('Failed to open side panel:', error);
        }
    });
}

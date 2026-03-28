// CodeXray AI - Background Service Worker

const API_URL = 'http://localhost:3000';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeCode') {
        handleCodeAnalysis(message.code, message.source);
    }
    
    return true; // Keep message channel open for async response
});

// Handle code analysis
async function handleCodeAnalysis(code, source) {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (result.success) {
            // Send results to side panel
            chrome.runtime.sendMessage({
                action: 'analysisComplete',
                data: result.data,
                source: source
            });
        } else {
            chrome.runtime.sendMessage({
                action: 'analysisError',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Analysis error:', error);
        chrome.runtime.sendMessage({
            action: 'analysisError',
            error: error.message
        });
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
            // Content script may not be loaded yet
        });
    }
});

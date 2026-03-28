// CodeXray AI - Content Script

let codeBlocks = [];
let selectedCode = '';

// Extract code from page
function extractCode() {
    codeBlocks = [];
    
    // Strategy 1: Find <pre> and <code> tags
    const preTags = document.querySelectorAll('pre');
    const codeTags = document.querySelectorAll('code');
    
    preTags.forEach(pre => {
        const text = pre.textContent.trim();
        if (text.length > 50) { // Minimum code length
            codeBlocks.push({
                type: 'pre',
                content: text,
                element: pre
            });
        }
    });
    
    codeTags.forEach(code => {
        const text = code.textContent.trim();
        if (text.length > 50 && !codeBlocks.some(b => b.content === text)) {
            codeBlocks.push({
                type: 'code',
                content: text,
                element: code
            });
        }
    });
    
    // Strategy 2: GitHub-specific selectors
    const githubSelectors = [
        '.BlobContent',
        '.src-code',
        '[class*="code-view"]',
        '[class*="source-code"]'
    ];
    
    githubSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.textContent.trim();
            if (text.length > 50 && !codeBlocks.some(b => b.content === text)) {
                codeBlocks.push({
                    type: 'github',
                    content: text,
                    element: el
                });
            }
        });
    });
    
    // Strategy 3: Replit-specific selectors
    const replitSelectors = [
        '[class*="editor-content"]',
        '[data-testid="editor"]',
        '.cm-content'
    ];
    
    replitSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.textContent.trim();
            if (text.length > 50 && !codeBlocks.some(b => b.content === text)) {
                codeBlocks.push({
                    type: 'replit',
                    content: text,
                    element: el
                });
            }
        });
    });
    
    // Strategy 4: Fallback - look for code-like patterns in text
    if (codeBlocks.length === 0) {
        const allText = document.body.innerText;
        const codePatterns = [
            /function\s+\w+\s*\([^)]*\)/g,
            /const\s+\w+\s*=\s*/g,
            /import\s+.*\s+from/g,
            /class\s+\w+/g,
            /def\s+\w+\s*\(/g
        ];
        
        let hasCodePattern = false;
        codePatterns.forEach(pattern => {
            if (pattern.test(allText)) {
                hasCodePattern = true;
            }
        });
        
        if (hasCodePattern) {
            codeBlocks.push({
                type: 'fallback',
                content: allText.substring(0, 5000), // Limit size
                element: document.body
            });
        }
    }
    
    return codeBlocks;
}

// Get combined code from all blocks
function getCombinedCode() {
    if (codeBlocks.length === 0) {
        extractCode();
    }
    
    return codeBlocks.map(block => block.content).join('\n\n');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractCode') {
        const blocks = extractCode();
        const code = getCombinedCode();
        
        sendResponse({
            code: code,
            blocks: blocks.length,
            success: code.length > 0
        });
    }
    
    if (message.action === 'getCodeInfo') {
        const blocks = extractCode();
        sendResponse({
            codeBlocks: blocks.length
        });
    }
    
    if (message.action === 'pageLoaded') {
        // Re-extract code on page load
        extractCode();
    }
    
    return true;
});

// Track text selection for Code X-Ray feature
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Check if selected text looks like code
    if (selectedText.length > 10 && selectedText.length < 2000) {
        const codeIndicators = [
            '{', '}', '(', ')', 'function', 'const', 'let', 'var',
            '=>', 'import', 'export', 'class', 'def ', 'if ', 'for ',
            'return', 'async', 'await'
        ];
        
        const isCode = codeIndicators.some(indicator => 
            selectedText.includes(indicator)
        );
        
        if (isCode) {
            selectedCode = selectedText;
            
            // Notify popup
            chrome.runtime.sendMessage({
                action: 'selectionUpdated',
                code: selectedCode
            });
        }
    }
});

// Add visual indicator for code blocks (optional enhancement)
function highlightCodeBlocks() {
    codeBlocks.forEach(block => {
        if (block.element && !block.element.classList.contains('codexray-highlighted')) {
            block.element.classList.add('codexray-highlighted');
            block.element.style.position = 'relative';
            
            // Add hover effect
            block.element.addEventListener('mouseenter', () => {
                block.element.style.outline = '2px solid #667eea';
                block.element.style.outlineOffset = '2px';
            });
            
            block.element.addEventListener('mouseleave', () => {
                block.element.style.outline = 'none';
            });
        }
    });
}

// Initialize on load
setTimeout(() => {
    extractCode();
    console.log(`CodeXray AI: Found ${codeBlocks.length} code blocks`);
}, 1000);

// Export functions for debugging
window.CodeXrayAI = {
    extractCode,
    getCombinedCode,
    getCodeBlocksCount: () => codeBlocks.length
};

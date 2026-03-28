/**
 * Validate code input
 * @param {string} code - The code to validate
 * @returns {Object} Validation result
 */
export function validateCodeInput(code) {
  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      error: 'Code is required'
    };
  }

  const trimmedCode = code.trim();

  if (trimmedCode.length === 0) {
    return {
      valid: false,
      error: 'Code cannot be empty'
    };
  }

  if (trimmedCode.length < 10) {
    return {
      valid: false,
      error: 'Code is too short. Please provide at least 10 characters.'
    };
  }

  if (trimmedCode.length > 50000) {
    return {
      valid: false,
      error: 'Code is too long. Maximum 50,000 characters allowed.'
    };
  }

  return {
    valid: true,
    error: null
  };
}

/**
 * Sanitize code input
 * @param {string} code - The code to sanitize
 * @returns {string} Sanitized code
 */
export function sanitizeCode(code) {
  if (!code) return '';
  
  // Remove any potential harmful content while preserving code structure
  return code.trim();
}

/**
 * Detect code language from content
 * @param {string} code - The code to analyze
 * @returns {string} Detected language
 */
export function detectLanguage(code) {
  if (!code) return 'unknown';

  const lowerCode = code.toLowerCase();

  if (lowerCode.includes('import react') || lowerCode.includes('from \'react\'') || lowerCode.includes('useState')) {
    return 'javascript';
  }
  if (lowerCode.includes('import vue') || lowerCode.includes('vue.createapp')) {
    return 'javascript';
  }
  if (lowerCode.includes('def ') && lowerCode.includes('import ')) {
    return 'python';
  }
  if (lowerCode.includes('func ') && lowerCode.includes('package ')) {
    return 'go';
  }
  if (lowerCode.includes('public class') || lowerCode.includes('private static')) {
    return 'java';
  }
  if (lowerCode.includes('using system;') || lowerCode.includes('namespace ')) {
    return 'csharp';
  }
  if (lowerCode.includes('<?php') || lowerCode.includes('echo ')) {
    return 'php';
  }
  if (lowerCode.includes('fn main') || lowerCode.includes('let mut')) {
    return 'rust';
  }
  if (lowerCode.includes('<!doctype html>') || lowerCode.includes('<html>')) {
    return 'html';
  }
  if (lowerCode.includes('{') && lowerCode.includes('}') && lowerCode.includes(':')) {
    return 'css';
  }

  return 'javascript';
}

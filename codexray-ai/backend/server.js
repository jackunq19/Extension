import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeCode } from './services/aiService.js';
import { validateCodeInput } from './utils/validator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeXray AI Backend is running' });
});

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { code } = req.body;

    // Validate input
    const validation = validateCodeInput(code);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    console.log('Analyzing code...');
    
    // Call AI service
    const result = await analyzeCode(code);

    console.log('Analysis complete!');

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze code'
    });
  }
});

// Code X-Ray endpoint for specific sections
app.post('/xray', async (req, res) => {
  try {
    const { code, selection } = req.body;

    if (!code || !selection) {
      return res.status(400).json({
        success: false,
        error: 'Both code and selection are required'
      });
    }

    const prompt = `Explain this specific code section in simple terms:\n\n${selection}\n\nContext:\n${code}`;
    
    const result = await analyzeCode(code, prompt);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('X-Ray error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze code section'
    });
  }
});

// Prompt improvement endpoint
app.post('/improve-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const improvementPrompt = `Improve this prompt for better AI code generation. Make it specific, clear, and actionable:\n\nOriginal: ${prompt}\n\nImproved:`;
    
    const result = await analyzeCode('', improvementPrompt);

    res.json({
      success: true,
      data: {
        original: prompt,
        improved: result.explanation
      }
    });

  } catch (error) {
    console.error('Prompt improvement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to improve prompt'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodeXray AI Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analyze endpoint: POST http://localhost:${PORT}/analyze`);
});

import fetch from 'node-fetch';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

/**
 * Analyze code using Ollama AI
 * @param {string} code - The code to analyze
 * @param {string} customPrompt - Optional custom prompt for specific analysis
 * @returns {Promise<Object>} Structured analysis result
 */
export async function analyzeCode(code, customPrompt = null) {
  const systemPrompt = `You are CodeXray AI, an expert code analyst and mentor. Your job is to analyze code and explain it in simple, beginner-friendly terms.

You MUST return a valid JSON object with this exact structure:
{
  "tech_stack": ["technology1", "technology2"],
  "concepts": ["concept1", "concept2"],
  "explanation": "Clear explanation of what the code does",
  "architecture": "User → Frontend → API → Database format",
  "learning_roadmap": ["step1", "step2", "step3"],
  "skill_gaps": ["gap1", "gap2"]
}

Rules:
1. Always return valid JSON only - no markdown, no extra text
2. Keep explanations simple and beginner-friendly
3. Identify all technologies used (frontend, backend, database, libraries)
4. List key programming concepts demonstrated
5. Provide a clear 5-step learning roadmap for beginners
6. Identify skill gaps the user might have
7. Describe the architecture flow clearly

Analyze this code:`;

  const prompt = customPrompt || `${systemPrompt}\n\n${code}`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.response;

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Parse and validate JSON
    const result = parseJSONResponse(content);
    
    return result;

  } catch (error) {
    console.error('AI Analysis failed:', error);
    
    // Fallback response if AI fails
    return getFallbackAnalysis(code);
  }
}

/**
 * Parse JSON response with error handling
 */
function parseJSONResponse(content) {
  try {
    const parsed = JSON.parse(content);
    
    // Ensure all required fields exist
    return {
      tech_stack: Array.isArray(parsed.tech_stack) ? parsed.tech_stack : [],
      concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
      explanation: parsed.explanation || 'Unable to generate explanation',
      architecture: parsed.architecture || 'Architecture analysis unavailable',
      learning_roadmap: Array.isArray(parsed.learning_roadmap) ? parsed.learning_roadmap : [],
      skill_gaps: Array.isArray(parsed.skill_gaps) ? parsed.skill_gaps : []
    };
  } catch (e) {
    console.error('JSON parsing failed:', e);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Fallback analysis when AI is unavailable
 */
function getFallbackAnalysis(code) {
  const techStack = detectTechStackBasic(code);
  const concepts = detectConceptsBasic(code);
  
  return {
    tech_stack: techStack,
    concepts: concepts,
    explanation: 'AI service temporarily unavailable. Basic analysis shows this code uses: ' + techStack.join(', '),
    architecture: 'Frontend → Backend → Database (detailed analysis requires AI)',
    learning_roadmap: [
      'Learn the basics of ' + (techStack[0] || 'programming'),
      'Understand core concepts',
      'Build small projects',
      'Study best practices',
      'Create advanced applications'
    ],
    skill_gaps: ['Deep dive into ' + (techStack[0] || 'fundamentals')]
  };
}

/**
 * Basic tech stack detection without AI
 */
function detectTechStackBasic(code) {
  const techs = [];
  
  if (code.includes('react') || code.includes('React') || code.includes('<div')) {
    techs.push('React');
  }
  if (code.includes('vue') || code.includes('Vue')) {
    techs.push('Vue.js');
  }
  if (code.includes('angular') || code.includes('Angular')) {
    techs.push('Angular');
  }
  if (code.includes('express') || code.includes('Express')) {
    techs.push('Express.js');
  }
  if (code.includes('django') || code.includes('Django')) {
    techs.push('Django');
  }
  if (code.includes('flask') || code.includes('Flask')) {
    techs.push('Flask');
  }
  if (code.includes('mongodb') || code.includes('MongoDB') || code.includes('mongoose')) {
    techs.push('MongoDB');
  }
  if (code.includes('postgres') || code.includes('PostgreSQL')) {
    techs.push('PostgreSQL');
  }
  if (code.includes('mysql') || code.includes('MySQL')) {
    techs.push('MySQL');
  }
  if (code.includes('async') || code.includes('await')) {
    techs.push('Async/Await');
  }
  if (code.includes('import') || code.includes('export')) {
    techs.push('ES6 Modules');
  }
  
  return techs.length > 0 ? techs : ['JavaScript/TypeScript'];
}

/**
 * Basic concept detection without AI
 */
function detectConceptsBasic(code) {
  const concepts = [];
  
  if (code.includes('async') || code.includes('await')) {
    concepts.push('Asynchronous Programming');
  }
  if (code.includes('=>') || code.includes('function')) {
    concepts.push('Functions');
  }
  if (code.includes('class') || code.includes('constructor')) {
    concepts.push('Object-Oriented Programming');
  }
  if (code.includes('useState') || code.includes('useEffect')) {
    concepts.push('React Hooks');
  }
  if (code.includes('fetch') || code.includes('axios')) {
    concepts.push('API Calls');
  }
  if (code.includes('try') || code.includes('catch')) {
    concepts.push('Error Handling');
  }
  if (code.includes('map') || code.includes('filter') || code.includes('reduce')) {
    concepts.push('Array Methods');
  }
  
  return concepts.length > 0 ? concepts : ['Basic Programming'];
}

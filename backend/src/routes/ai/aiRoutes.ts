import { Router, Response } from 'express';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// Helper function to call Gemini API if key is present, otherwise return simulation
const callAIModel = async (systemInstruction: string, promptContent: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Elegant simulated response if API Key is not set yet
    return simulateAIResponse(systemInstruction, promptContent);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Input/Code:\n${promptContent}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from the model.';
  } catch (error: any) {
    console.error('AI Service Error:', error);
    return `[AI Fallback Mode] Service was unable to reach Gemini API (${error.message}). Here is a simulated response:\n\n${simulateAIResponse(systemInstruction, promptContent)}`;
  }
};

// Heuristic simulation for hackathon demo resilience
const simulateAIResponse = (systemInstruction: string, content: string): string => {
  if (systemInstruction.includes('explain')) {
    return `### Code Explanation\n\nThis code block appears to be a functional module in the codebase. Here is a breakdown of what it does:\n\n1. **Core Logic**: It initializes scope variables and handles asynchronous database updates.\n2. **Security**: It ensures that user credentials and sessions are properly isolated.\n3. **Event Emitting**: It integrates with the real-time websocket server to notify peers of updates.\n\n**Suggestions for improvement**:\n- Consider adding query isolation limits.\n- Implement caching layer (Redis) for high-frequency resource reads.`;
  }
  
  if (systemInstruction.includes('debug')) {
    return `### Debugging Report\n\nI reviewed the code block and identified a few potential issues:\n\n1. **Potential Race Condition**: If multiple async operations try to mutate state concurrently, database locks might trigger a crash.\n2. **Type Safety Warning**: Ensure that payload variables match the Prisma schema specifications.\n\n**Suggested Fix**:\n\`\`\`javascript\n// Wrap database calls in a transaction to prevent partial states\nconst result = await prisma.$transaction(async (tx) => {\n  // your operations here\n});\n\`\`\``;
  }

  if (systemInstruction.includes('generate')) {
    return `### Generated Code\n\nHere is a clean implementation based on your prompt:\n\n\`\`\`javascript\n// Auto-generated helper function\nexport async function handleWorkspaceSync(workspaceId, data) {\n  try {\n    console.log("Syncing workspace:", workspaceId, data);\n    // Implement sync socket broadcasts or state saves\n    return { success: true, timestamp: new Date() };\n  } catch (err) {\n    console.error("Workspace sync failed:", err);\n    return { success: false, error: err.message };\n  }\n}\n\`\`\``;
  }

  return `### AI Assistance Response\n\nYou asked: "${content}"\n\nThis is a simulated assistant response. Set \`GEMINI_API_KEY\` in your environment variables to enable live, production-grade Gemini responses in this workspace.`;
};

// @route   POST /api/ai/chat
// @desc    Chat with AI about specific code
router.post('/chat', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt, code } = req.body;

  if (!prompt) {
     res.status(400).json({ message: 'Prompt is required' });
     return;
  }

  const systemPrompt = "You are Antigravity, a professional senior developer AI assistant. Answer the developer's question. Be concise and write standard production-ready code.";
  const userContent = code ? `Developer Question: ${prompt}\n\nCode context:\n\`\`\`\n${code}\n\`\`\`` : prompt;

  try {
    const result = await callAIModel(systemPrompt, userContent);
    res.json({ response: result });
  } catch (error: any) {
    res.status(500).json({ message: 'AI Processing Error', error: error.message });
  }
});

// @route   POST /api/ai/explain
// @desc    Explain code snippet
router.post('/explain', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body;

  if (!code) {
     res.status(400).json({ message: 'Code is required to explain' });
     return;
  }

  const systemPrompt = "You are an expert software architect. Explain the following code clearly and concisely. Highlight potential design patterns and issues.";

  try {
    const result = await callAIModel(systemPrompt, code);
    res.json({ response: result });
  } catch (error: any) {
    res.status(500).json({ message: 'AI Processing Error', error: error.message });
  }
});

// @route   POST /api/ai/debug
// @desc    Debug code and provide fixes
router.post('/debug', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { code, error } = req.body;

  if (!code) {
     res.status(400).json({ message: 'Code is required to debug' });
     return;
  }

  const systemPrompt = "You are a skilled runtime debugger. Identify any logical bugs, syntax errors, or memory performance hazards in the code block and provide a fixed code suggestion.";
  const inputContent = error ? `Error logs: ${error}\n\nCode snippet:\n${code}` : code;

  try {
    const result = await callAIModel(systemPrompt, inputContent);
    res.json({ response: result });
  } catch (error: any) {
    res.status(500).json({ message: 'AI Processing Error', error: error.message });
  }
});

// @route   POST /api/ai/generate
// @desc    Generate code matching prompt
router.post('/generate', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
     res.status(400).json({ message: 'Prompt is required' });
     return;
  }

  const systemPrompt = "You are a high-speed code generator. Output ONLY clean, well-documented, syntax-compliant programming code snippets based on the user request. Refrain from long preambles, get straight to the code.";

  try {
    const result = await callAIModel(systemPrompt, prompt);
    res.json({ response: result });
  } catch (error: any) {
    res.status(500).json({ message: 'AI Processing Error', error: error.message });
  }
});

export default router;

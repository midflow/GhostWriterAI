import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize LLM clients
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const QWEN_API_KEY = process.env.QWEN_API_KEY;

interface LLMResult {
  suggestions: string[];
  provider: string;
  tokensUsed: number;
}

/**
 * Build prompt for generating reply suggestions
 */
function buildPrompt(message: string, tone: string, recentMessages: string[]): string {
  const context = recentMessages.slice(-3).join('\n');
  const toneDescription = getToneDescription(tone);

  return `You are an expert at helping people write messages that match their communication style.

Original message to reply to:
"${message}"

Desired tone: ${tone}
${toneDescription}

${context ? `Recent messages for context:\n${context}` : ''}

Generate exactly 3 different reply suggestions. Each should be:
- 1-2 sentences
- Natural and conversational
- Matching the specified tone
- Appropriate for the context

Format each suggestion on a new line starting with "Suggestion X:"

Suggestion 1: [reply]
Suggestion 2: [reply]
Suggestion 3: [reply]`;
}

/**
 * Get tone description for better LLM understanding
 */
function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    friendly: 'Warm, approachable, uses casual language and emojis if appropriate',
    professional: 'Formal, business-appropriate, clear and concise',
    assertive: 'Confident, direct, takes a strong stance',
    apologetic: 'Sorry, regretful, takes responsibility',
    casual: 'Relaxed, informal, uses slang and abbreviations',
  };
  return descriptions[tone] || descriptions.friendly;
}

/**
 * Parse LLM response to extract suggestions
 */
function parseSuggestions(text: string): string[] {
  const suggestions = text
    .split('\n')
    .filter(line => line.includes('Suggestion'))
    .map(line => {
      // Remove "Suggestion X:" prefix
      const match = line.match(/Suggestion \d+:\s*(.+)/);
      return match ? match[1].trim() : '';
    })
    .filter(s => s.length > 0);

  return suggestions.length === 3 ? suggestions : [];
}

/**
 * Generate reply suggestions using Google Gemini
 */
async function generateWithGemini(
  message: string,
  tone: string,
  recentMessages: string[]
): Promise<LLMResult> {
  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = buildPrompt(message, tone, recentMessages);

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const suggestions = parseSuggestions(text);

    if (suggestions.length === 0) {
      throw new Error('Failed to parse suggestions from Gemini response');
    }

    return {
      suggestions,
      provider: 'gemini',
      tokensUsed: 300, // Approximate
    };
  } catch (error) {
    console.error('Gemini error:', error);
    throw error;
  }
}

/**
 * Generate reply suggestions using OpenRouter
 */
async function generateWithOpenRouter(
  message: string,
  tone: string,
  recentMessages: string[]
): Promise<LLMResult> {
  try {
    const prompt = buildPrompt(message, tone, recentMessages);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ghostwriter-app.com',
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const suggestions = parseSuggestions(text);

    if (suggestions.length === 0) {
      throw new Error('Failed to parse suggestions from OpenRouter response');
    }

    return {
      suggestions,
      provider: 'openrouter',
      tokensUsed: response.data.usage?.total_tokens || 300,
    };
  } catch (error) {
    console.error('OpenRouter error:', error);
    throw error;
  }
}

/**
 * Generate reply suggestions using Groq
 */
async function generateWithGroq(
  message: string,
  tone: string,
  recentMessages: string[]
): Promise<LLMResult> {
  try {
    const prompt = buildPrompt(message, tone, recentMessages);

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    const suggestions = parseSuggestions(text);

    if (suggestions.length === 0) {
      throw new Error('Failed to parse suggestions from Groq response');
    }

    return {
      suggestions,
      provider: 'groq',
      tokensUsed: chatCompletion.usage?.total_tokens || 300,
    };
  } catch (error) {
    console.error('Groq error:', error);
    throw error;
  }
}

/**
 * Generate reply suggestions using Qwen (Alibaba)
 */
async function generateWithQwen(
  message: string,
  tone: string,
  recentMessages: string[]
): Promise<LLMResult> {
  try {
    const prompt = buildPrompt(message, tone, recentMessages);

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${QWEN_API_KEY}`,
        },
      }
    );

    const text = response.data.output.text;
    const suggestions = parseSuggestions(text);

    if (suggestions.length === 0) {
      throw new Error('Failed to parse suggestions from Qwen response');
    }

    return {
      suggestions,
      provider: 'qwen',
      tokensUsed: response.data.usage?.total_tokens || 300,
    };
  } catch (error) {
    console.error('Qwen error:', error);
    throw error;
  }
}

/**
 * Hybrid strategy: Try multiple providers in order
 */
export async function generateReplySuggestions(
  message: string,
  tone: string,
  recentMessages: string[] = []
): Promise<LLMResult> {
  const providers = [
    { name: 'gemini', fn: generateWithGemini },
    { name: 'groq', fn: generateWithGroq },
    { name: 'openrouter', fn: generateWithOpenRouter },
    { name: 'qwen', fn: generateWithQwen },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const result = await provider.fn(message, tone, recentMessages);
      console.log(`Success with ${provider.name}`);
      return result;
    } catch (error) {
      console.warn(`${provider.name} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all providers fail, throw error
  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}

/**
 * Generate reply with fallback suggestions
 */
export function getFallbackSuggestions(tone: string): string[] {
  const fallbacks: Record<string, string[]> = {
    friendly: [
      "Hey! Thanks for reaching out! 😊",
      "Absolutely! I'd love to help with that!",
      "Sure thing! Let's make this happen! 🎉"
    ],
    professional: [
      "Thank you for your message. I'll get back to you shortly.",
      "Understood. I'll look into this and follow up accordingly.",
      "Noted. Let me review and respond with more details."
    ],
    casual: [
      "Yeah, sounds good!",
      "Cool, let's go with that.",
      "Alright, I'm down!"
    ],
    assertive: [
      "Let's make this happen.",
      "I'm confident we can do this.",
      "This is the right move."
    ],
    apologetic: [
      "I'm sorry for the confusion. Let me clarify.",
      "My apologies. I'll make this right.",
      "I understand your concern. Let me help."
    ],
  };

  return fallbacks[tone] || fallbacks.friendly;
}

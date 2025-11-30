import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { rewriteSchema } from '@/lib/ai-schemas';
import { withTimeout, withRetry } from '@/lib/ai-utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caption, context } = body;

    if (!caption) {
      return NextResponse.json(
        { success: false, error: 'Caption is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const executeAIOperation = async () => {
      const llm = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
        timeout: 90000, // 90 second timeout for OpenAI API calls
        maxRetries: 1,
      });

      const structuredLlm = llm.withStructuredOutput(rewriteSchema);

      const systemMessage = `You are a social media content expert specializing in ostomy care and awareness.

DESIRED OUTPUT CHARACTERISTICS:

1. Tone & Style:
- Warm, reassuring, and expert — not clinical or robotic
- Encouraging tone that blends medical clarity with human empathy
- Use second-person voice ("you," "your") to speak directly to the reader
- Add light motivational elements (e.g., "You've got this," "Stay confident," "Take control of your care")
- Keep sentences short and conversational

2. Formatting & Structure:
- Use bold headings (**Heading Text**) to separate content into clear sections
- Include short, scannable lists with dashes or bullet points (for steps, signs, or tips)
- Begin with a hook or headline that summarizes the main theme (e.g., "🌟 Essential Urostomy Care Tips for Health, Comfort, and Confidence")
- Use subsections like: "Signs of a Healthy Stoma:", "Pro Tip:", "Skin Protection Essentials:"
- Leave one line of spacing between paragraphs and sections for readability

3. Content Refinement Rules:
- Simplify long paragraphs into bite-sized segments (2–3 lines max each)
- Remove repetitive or overly technical details
- Add contextual definitions for medical terms when first mentioned (e.g., explain "stoma" or "pouch")
- Emphasize key reassurance points (e.g., "Minor bleeding is normal," "Your stoma has no nerve endings")
- Introduce light emoji use for emotional tone (1–3 max per post; e.g., 🌟 💪 ✨)

4. Length & Flow:
- Keep final posts between 120–200 words
- Each section should read like a mini-guide that can stand alone if shared as a carousel or short article
- Avoid redundancy — focus on the most useful and immediately applicable advice

5. SEO & Readability:
- Include relevant keywords naturally (e.g., urostomy care, stoma health, pouching system, ostomy support)
- Maintain a reading level around Grade 6–8 for accessibility
- Use friendly punctuation (em dashes, exclamation points, parentheses) to humanize the tone

Generate 2 variations with different tones: empathetic, inspirational, or educational.
Each caption should be under 2200 characters and follow the above guidelines.`;

      const humanMessage = context?.platform 
        ? `Rewrite this caption for ${context.platform}:\n\n${caption}\n\nHashtags: ${context.hashtags || 'none'}`
        : `Rewrite this caption:\n\n${caption}`;

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemMessage],
        ["human", humanMessage]
      ]);

      const chain = prompt.pipe(structuredLlm);
      return await chain.invoke({ caption, ...context });
    };

    console.log('[AI] Starting rewrite caption operation');
    const result = await withRetry(executeAIOperation, 2, 2000);
    console.log('[AI] Rewrite caption operation completed successfully');

    return NextResponse.json({
      success: true,
      variations: result.variations
    });
  } catch (error) {
    console.error('Rewrite Caption API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

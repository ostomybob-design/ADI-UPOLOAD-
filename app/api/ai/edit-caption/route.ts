import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { editSchema } from '@/lib/ai-schemas';
import { withTimeout, withRetry } from '@/lib/ai-utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { instruction, caption, context } = body;

    if (!instruction) {
      return NextResponse.json(
        { success: false, error: 'Instruction is required' },
        { status: 400 }
      );
    }

    if (instruction.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Instruction exceeds maximum length of 500 characters' },
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
        timeout: 90000,
        maxRetries: 1,
      });

      const structuredLlm = llm.withStructuredOutput(editSchema);

      const systemMessage = caption
        ? `You are a social media editor specializing in ostomy care and awareness. 
Edit the provided caption based on the user's instruction while maintaining an empathetic, informative tone.
Keep the caption under 2200 characters and ensure it's engaging and appropriate for social media.`
        : `You are a social media content creator specializing in ostomy care and awareness. 
Create content based on the user's instruction with an empathetic, informative tone.
Keep the caption under 2200 characters and ensure it's engaging and appropriate for social media.`;

      const humanMessage = caption
        ? `Instruction: ${instruction}\n\nCurrent caption: ${caption}${context?.hashtags ? `\n\nHashtags: ${context.hashtags}` : ''}`
        : `Instruction: ${instruction}${context?.hashtags ? `\n\nHashtags: ${context.hashtags}` : ''}`;

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemMessage],
        ["human", humanMessage]
      ]);

      const chain = prompt.pipe(structuredLlm);
      return await chain.invoke({ instruction, caption, ...context });
    };

    console.log('[AI] Starting edit caption operation');
    const result = await withRetry(executeAIOperation, 2, 2000);
    console.log('[AI] Edit caption operation completed successfully');

    return NextResponse.json({
      success: true,
      editedCaption: result.caption,
      explanation: result.explanation
    });
  } catch (error) {
    console.error('Edit Caption API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

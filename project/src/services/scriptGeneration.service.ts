import { VideoAnalysisResult } from './openaiService';

const CHAT_API_BASE = import.meta.env.VITE_CHAT_API_BASE || 'http://localhost:8080/api';

export async function generateScript(analysisResult: VideoAnalysisResult): Promise<string> {
  try {
    // Build prompt from suggested edits and original transcript
    const suggestedEditsText = analysisResult.suggestedEdits
      ?.map(edit => `- ${edit.title}: ${edit.description}`)
      .join('\n') || 'No specific edits suggested.';

    const originalScript = analysisResult.transcript || analysisResult.summary;

    const prompt = `You are a professional script editor. Rewrite the following video script based on the suggested edits, but maintain the original speaker's tone and style exactly.

Original Script:
${originalScript}

Suggested Edits:
${suggestedEditsText}

Please rewrite the script incorporating the suggested edits while preserving the original tone, style, and voice of the speaker. Return only the revised script text, no explanations.`;

    // Call OpenAI via backend
    const baseUrl = import.meta.env.VITE_CHAT_API_BASE || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional script editor. Rewrite scripts based on suggestions while maintaining the original tone and style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
  model: import.meta.env.VITE_MODEL_NAME || 'gpt-4o-mini',
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Script generation failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    // Handle both streaming and non-streaming responses
    if (data.content) {
      return data.content;
    } else if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (typeof data === 'string') {
      return data;
    } else {
      throw new Error('Unexpected response format from script generation API');
    }

  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}


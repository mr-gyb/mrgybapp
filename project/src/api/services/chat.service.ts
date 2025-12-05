import OpenAI from 'openai';
import { OpenAIMessage } from '../../types/chat';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ChatCompletionContentPart  } from "openai/resources/chat/completions";
import { MessageContentPartParam } from "openai/resources/beta/threads/messages";
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from "../../lib/firebase";
import { dreamTeamAgent } from '../../agents/dreamTeamAgent';



const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Record<string, string> is the type where both key and values are strings.
const getAssistantId = (aiAgent: string): string => {
  // For now, we'll use a fallback approach since the hardcoded assistant IDs don't exist
  // In the future, you can create new assistants and update these IDs
  const assistantIds: Record<string, string> = {
    'Mr.GYB AI': 'fallback',
    'Chris': 'fallback',
    'Sherry': 'fallback',
    'Charlotte': 'fallback',
    'Jake': 'fallback',
    'Rachel': 'fallback'
  };

  return assistantIds[aiAgent] || 'fallback'; 
};


export const uploadImageAndGetUrl = async (file: File): Promise<string> =>{
  const storage = getStorage();
  const storageRef = ref(storage, `uploads/${file.name}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  console.log("downloadURL is going to be ", downloadUrl);
  return downloadUrl;
}

// Helper function to get the display name for AI agents
const getAgentDisplayName = (aiAgent: string): string => {
  const agentNames: Record<string, string> = {
    'Mr.GYB AI': 'Mr.GYB AI',
    'CHRIS': 'Chris',
    'Chris': 'Chris',
    'Sherry': 'Sherry',
    'Charlotte': 'Charlotte',
    'Jake': 'Jake',
    'Rachel': 'Rachel'
  };
  
  return agentNames[aiAgent] || aiAgent;
};

let clientEnvValidated = false;
let inferredBaseUrl: string | null = null;
let inferredModelName: string | null = null;

const ensureClientEnv = () => {
  if (clientEnvValidated) {
    return;
  }

  const missing: string[] = [];
  const base = import.meta.env.VITE_CHAT_API_BASE?.trim();
  const model = import.meta.env.VITE_MODEL_NAME?.trim();

  if (!base) {
    missing.push('VITE_CHAT_API_BASE');
  }
  if (!model) {
    missing.push('VITE_MODEL_NAME');
  }

  if (missing.length > 0) {
    const hints: Record<string, string> = {};

    if (!base && typeof window !== 'undefined') {
      const { protocol, hostname } = window.location;
      const devPort =
        import.meta.env.VITE_CHAT_API_DEV_PORT ||
        (hostname === 'localhost' || hostname === '127.0.0.1' ? '8080' : window.location.port);

      inferredBaseUrl =
        hostname === 'localhost' || hostname === '127.0.0.1'
          ? `${protocol}//${hostname}:${devPort}`
          : window.location.origin.replace(/\/$/, '');

      hints['VITE_CHAT_API_BASE'] = inferredBaseUrl;
    }

    if (!model) {
      inferredModelName = 'o3-mini';
      hints['VITE_MODEL_NAME'] = inferredModelName;
    }

    console.warn(
      `[chat] Missing environment variables: ${missing.join(
        ', '
      )}. Using inferred defaults for development.`,
      hints
    );
  } else {
    inferredBaseUrl = base!;
    inferredModelName = model!;
  }

  clientEnvValidated = true;
};

const getChatBaseUrl = (): string => {
  ensureClientEnv();
  return (import.meta.env.VITE_CHAT_API_BASE?.trim() || inferredBaseUrl || '').replace(/\/$/, '');
};

const getChatEndpoint = (): string => {
  const base = getChatBaseUrl();
  if (!base) {
    throw new ChatApiError(
      '[chat] Unable to determine chat API base URL. Set VITE_CHAT_API_BASE in your .env file.',
      undefined,
      {},
      'env_missing'
    );
  }
  return `${base}/api/chat`;
};

const getClientModelName = (): string => {
  ensureClientEnv();
  return import.meta.env.VITE_MODEL_NAME?.trim() || inferredModelName || 'o3-mini';
};

const generateRequestId = (): string => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const SHOW_DIAGNOSTIC_ERRORS = import.meta.env.VITE_SHOW_DIAGNOSTIC_ERRORS === 'true';
const CHAT_REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_CHAT_REQUEST_TIMEOUT_MS || 30000);

const defaultGreetingForAgent = (aiAgent: string): string =>
  `Hello! I'm ${getAgentDisplayName(aiAgent)}. How can I help you today?`;

export interface ChatDiagnostics {
  code: string;
  status?: number;
  source: 'proxy' | 'openai' | 'network' | 'client' | 'env';
  detail?: string;
  requestId?: string;
  attempt?: number;
  meta?: Record<string, unknown>;
}

export interface ChatLLMResult {
  content: string;
  diagnostics?: ChatDiagnostics;
  isFallback: boolean;
  errorStatus?: number;
  errorMessage?: string;
  requestId?: string;
}

type ChatHistoryPayloadMessage = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

const extractTextFromParts = (parts: MessageContentPartParam[]): string =>
  parts
    .map(part => {
      if (part.type === 'text' && 'text' in part) {
        return (part as { text?: string }).text ?? '';
      }
      return '';
    })
    .join(' ')
    .trim();

const sanitizeChatHistory = (messages: OpenAIMessage[]): ChatHistoryPayloadMessage[] =>
  messages
    .map(message => {
      let content = '';

      if (typeof message.content === 'string') {
        content = message.content;
      } else if (Array.isArray(message.content)) {
        content = extractTextFromParts(message.content as MessageContentPartParam[]);
      }

      return {
        role: ['system', 'assistant', 'user'].includes(message.role) ? (message.role as ChatHistoryPayloadMessage['role']) : 'user',
        content: content.trim(),
      };
    })
    .filter(entry => entry.content.length > 0)
    .slice(-12);

class ChatApiError extends Error {
  status?: number;
  payload?: Record<string, unknown>;
  code?: string;

  constructor(message: string, status?: number, payload?: Record<string, unknown>, code?: string) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
    this.payload = payload;
    this.code = code;
  }
}

interface ChatBackendResponse {
  content: string;
  status: number;
  requestId?: string;
}

interface StreamOptions {
  onToken?: (token: string) => void;
}

const callChatBackend = async (
  payload: Record<string, unknown>,
  options?: StreamOptions
): Promise<ChatBackendResponse> => {
  const endpoint = getChatEndpoint();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);
  const startTime = performance.now();

  console.info('[chat] start', {
    endpoint,
    model: payload.model,
    chatId: payload.chatId,
    userId: payload.userId,
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', // Backend has credentials: false, so we should omit
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const requestId = response.headers.get('x-request-id') || undefined;
    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }
      
      // Check for quota error
      const isQuotaError = 
        response.status === 429 ||
        errorBody?.errorType === 'quota' ||
        errorBody?.code === 'insufficient_quota' ||
        (errorBody?.error?.type === 'insufficient_quota') ||
        (errorBody?.error?.code === 'insufficient_quota');
      
      // Extract the exact error message from the backend response
      const message =
        errorBody?.message ||
        errorBody?.error?.message ||
        errorBody?.detail ||
        `Chat service returned ${response.status}`;

      if (isQuotaError) {
        // Log quota errors with exact message (but don't show as critical error in console)
        console.warn('[chat] quota error - exact message:', message, {
          status: response.status,
          latencyMs,
          requestId,
          retryAfter: errorBody?.retryAfter,
          errorType: errorBody?.errorType,
        });
        
        throw new ChatApiError(
          message, // Use the exact error message from backend
          response.status,
          { 
            requestId, 
            body: errorBody,
            errorType: 'quota',
            retryAfter: errorBody?.retryAfter,
          },
          'insufficient_quota'
        );
      }

      // Log other errors with exact message
      console.error('[chat] error - exact message:', message, {
        status: response.status,
        latencyMs,
        requestId,
      });

      throw new ChatApiError(
        message, // Use the exact error message from backend
        response.status,
        { requestId, body: errorBody },
        errorBody?.code || 'proxy_error'
      );
    }

    if (!response.body) {
      throw new ChatApiError('Chat service returned an empty response body.', response.status, {
        requestId,
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let isStreamComplete = false;

    const processBuffer = () => {
      let eventBoundary = buffer.indexOf('\n\n');
      while (eventBoundary !== -1) {
        const rawEvent = buffer.slice(0, eventBoundary);
        buffer = buffer.slice(eventBoundary + 2);

        const lines = rawEvent.split('\n').map(line => line.trim()).filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith('data:')) {
            continue;
          }
          const data = line.replace(/^data:\s*/, '');
          if (!data) {
            continue;
          }
          if (data === '[DONE]') {
            isStreamComplete = true;
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              fullContent += delta;
              options?.onToken?.(delta);
              console.debug('[chat] stream token', delta);
            }
          } catch (parseError) {
            console.warn('[chat] Failed to parse stream chunk', parseError, { data });
          }
        }

        eventBoundary = buffer.indexOf('\n\n');
      }
    };

    while (!isStreamComplete) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      processBuffer();
      if (isStreamComplete) {
        break;
      }
    }

    buffer += decoder.decode();
    processBuffer();

    console.info('[chat] response', {
      status: response.status,
      latencyMs,
      requestId,
    });

    return {
      content: fullContent.trim(),
      status: response.status,
      requestId,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (error instanceof ChatApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      console.error('[chat] error timeout', { latencyMs });
      throw new ChatApiError('Chat request timed out.', 504, { latencyMs }, 'timeout');
    }

    if (error instanceof TypeError) {
      console.error('[chat] error network', { latencyMs, message: error.message });
      throw new ChatApiError(
        'Network error while calling chat service.',
        undefined,
        { message: error.message, latencyMs },
        'network_error'
      );
    }

    console.error('[chat] unexpected error', { latencyMs, message: error?.message });
    throw new ChatApiError(
      error?.message || 'Unexpected error while calling chat service.',
      undefined,
      { latencyMs },
      'client_failure'
    );
  }
};

const buildFallbackMessage = (aiAgent: string, status?: number, reason?: string): string => {
  const friendlyReason = reason?.trim() || 'service unavailable';
  const statusSegment = status ? `status ${status}` : 'an unexpected error';
  const base = `I'm having trouble reaching our AI service (${statusSegment}${reason ? `: ${friendlyReason}` : ''}).`;
  const guidance = 'Use Retry to try again, or contact support if this keeps happening.';

  if (SHOW_DIAGNOSTIC_ERRORS && reason) {
    return `${base} ${guidance} (diagnostic: ${reason})`;
  }

  return `${base} ${guidance}`;
};

const normalizeReason = (details: unknown, fallback: string): string => {
  if (!details) {
    return fallback;
  }
  if (typeof details === 'string') {
    return details;
  }
  try {
    const serialized = JSON.stringify(details);
    return serialized.length > 200 ? `${serialized.slice(0, 197)}...` : serialized;
  } catch {
    return fallback;
  }
};

export interface GenerateAIResponseOptions {
  onToken?: (token: string) => void;
  metadata?: {
    chatId?: string;
    userId?: string;
  };
}

export const generateAIResponse = async (
  messages: OpenAIMessage[],
  aiAgent: string,
  options?: GenerateAIResponseOptions
): Promise<ChatLLMResult> => {
  try {
    const lastMessage = messages[messages.length - 1];
    
    // Use local Dream Team agent instead of external API to avoid quota issues
    // This is a temporary solution until real training data/model is connected
    if (typeof lastMessage.content === 'string') {
      const userMessage = lastMessage.content.trim();
      
      // Get response from local agent
      const agentResponse = await dreamTeamAgent(userMessage, aiAgent, messages);
      
      // Simulate streaming if onToken callback is provided
      if (options?.onToken && agentResponse.content) {
        // Split content into tokens and call onToken for each word
        const words = agentResponse.content.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
          const token = i === 0 ? words[i] : ' ' + words[i];
          options.onToken(token);
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
      
      return {
        content: agentResponse.content,
        isFallback: false,
        diagnostics: {
          code: 'ok',
          status: 200,
          source: 'local_agent',
          detail: 'Local Dream Team agent response',
          requestId: undefined,
          meta: {
            agent: aiAgent,
            localAgent: true,
          },
        },
      };
    }

    // For non-string content (images, files), fall back to original behavior
    // TODO: Add local agent support for image/file handling
    const assistantId = getAssistantId(aiAgent);

    // Handle messages with file content
    if (typeof lastMessage.content === 'object' && Array.isArray(lastMessage.content)) {
      // For image files, use GPT-4 Vision
      if (lastMessage.content.some(item => item.type === 'image_url')) {
        console.log("image file?"); 
        const completion = await openai.chat.completions.create({
          model: 'o3-mini', // Using o3-mini instead of gpt-4-vision-preview
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(aiAgent),
            },
            {
              role: 'user',
              content: lastMessage.content
            }
          ],
          max_tokens: 500,
        });
        return {
          content: completion.choices[0]?.message?.content || '',
          isFallback: false,
        };
      } 
      // For other file types, use Assistants API with file search
      else if (lastMessage.fileType && lastMessage.fileName && lastMessage.file) {
        console.log("not image file");
        const fileUpload = await openai.files.create({
          file: lastMessage.file as File,
          purpose: 'assistants',
        });

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: lastMessage.content[lastMessage.content.length - 1].text,
          file_ids: [fileUpload.id],
        });

        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId,
        });

        // Poll for completion
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status !== 'completed') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        const threadMessages = await openai.beta.threads.messages.list(thread.id);
        return {
          content: threadMessages.data[0]?.content[0]?.text?.value || 'No analysis available',
          isFallback: false,
        };
      }
    }

    const modelName = getClientModelName();
    const sanitizedHistory = sanitizeChatHistory(messages);
    if (sanitizedHistory.length === 0) {
      return {
        content: defaultGreetingForAgent(aiAgent),
        isFallback: false,
      };
    }

    const response = await callChatBackend(
      {
          messages: sanitizedHistory,
          agent: aiAgent,
          temperature: 0.7,
        model: modelName,
        stream: true,
        chatId: options?.metadata?.chatId,
        userId: options?.metadata?.userId,
      },
      { onToken: options?.onToken }
    );

    const trimmedContent = response.content.trim();
    const diagnostics: ChatDiagnostics = {
              code: 'ok',
      status: response.status,
              source: 'proxy',
      detail: 'LLM response streamed successfully',
              requestId: response.requestId,
              meta: {
        model: modelName,
              },
    };

        if (!trimmedContent) {
          return {
            content: defaultGreetingForAgent(aiAgent),
            diagnostics,
            isFallback: true,
        requestId: response.requestId,
          };
        }

        return {
          content: trimmedContent,
          diagnostics,
          isFallback: false,
      requestId: response.requestId,
    };
  } catch (error) {
    // Extract error message for logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isQuotaError = error instanceof ChatApiError && 
      (error.code === 'insufficient_quota' || 
       error.payload?.errorType === 'quota' ||
       error.status === 429);

    // Log quota errors as warnings (they're expected and handled in UI)
    if (isQuotaError) {
      console.warn('[chat] quota error - exact message:', errorMessage);
    } else {
      console.error('[chat] error - exact message:', errorMessage, error);
    }

    let status: number | undefined;
    let requestId: string | undefined;
    let source: ChatDiagnostics['source'] = 'client';
    let code = 'client_failure';
    let detail = errorMessage;

    if (error instanceof ChatApiError) {
      status = error.status;
      code = error.code || code;
      requestId = (error.payload?.requestId as string) || requestId;

      // Check if this is a quota error
      const isQuota = 
        code === 'insufficient_quota' ||
        error.payload?.errorType === 'quota' ||
        status === 429;

      const body = error.payload?.body as Record<string, unknown> | undefined;
      const candidate =
        (body?.error as Record<string, unknown>)?.message ||
        body?.message ||
        error.payload?.message ||
        error.payload?.details;
      detail = normalizeReason(candidate, error.message);

      if (isQuota) {
        source = 'openai';
        code = 'insufficient_quota';
        // Use the exact error message from OpenAI/backend
        detail = error.message || detail || 'OpenAI quota temporarily exceeded. Please wait or try again later.';
      } else if (code === 'env_missing') {
        source = 'env';
      } else if (!status && (code === 'network_error' || code === 'timeout')) {
        source = 'network';
      } else if (status && status >= 500) {
        source = 'openai';
      } else if (status) {
        source = 'proxy';
      }
    }

    return {
      content: buildFallbackMessage(aiAgent, status, detail),
      diagnostics: {
        code,
        status,
        source,
        detail,
        requestId,
      },
      isFallback: true,
      errorStatus: status,
      errorMessage: detail,
      requestId,
    };
  }
};

export const runChatConnectivityTest = async () => {
  try {
    const endpoint = `${getChatBaseUrl()}/health`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'omit', // Backend has credentials: false, so we should omit
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        status: response.status,
        message: text || `Health check failed with status ${response.status}`,
      };
    }

    const body = await response.json().catch(() => ({}));
    return {
      ok: true,
      status: response.status,
      message: body?.status || 'healthy',
      body,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: error?.name === 'AbortError' ? 504 : 0,
      message: error?.message || 'Health check failed',
    };
  }
};

export const processFileForAI = async (file: File): Promise<ChatCompletionContentPart[]> => {
  try {
    console.log("file looks like: ", file);
    console.log("file type is: " ,file.type);

    //if (file.type.startsWith('image/')) {
      const imageUrl = await uploadImageAndGetUrl(file);
      return [
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ];
    //} 
     /*else {
      return {
        content: [
          {
            type: 'text',
            text: `Analyzing file: ${file.name}`
          }
        ],
        fileType: getFileType(file),
        fileName: file.name,
        file: file,
      };
    }*/
  } catch (error) {
    console.error('Error processing file for AI:', error);
    throw error;
  }
};




const getSystemPrompt = (aiAgent: string): string => {
  const prompts: Record<string, string> = {
    'Mr.GYB AI':
      'You are Mr.GYB AI, an all-in-one business growth assistant. You specialize in digital marketing, content creation, and business strategy. Be professional, strategic, and focused on growth. When asked about your name, respond naturally and politely.',
    CHRIS: 'You are Chris, the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance. When asked about your name, respond naturally and politely.',
    Chris: 'You are Chris, the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance. When asked about your name, respond naturally and politely.',
    Sherry: 'You are Sherry, the COO AI, specializing in operations management and process optimization. Focus on efficiency, systems, and operational excellence. When asked about your name, respond naturally and politely.',
    Charlotte: 'You are Charlotte, the CHRO AI, expert in human resources and organizational development. Focus on talent management, culture, and employee experience. When asked about your name, respond naturally and politely.',
    Jake: 'You are Jake, the CTO AI, specializing in technology strategy and innovation. Provide guidance on technical decisions and digital transformation. When asked about your name, respond naturally and politely.',
    Rachel: 'You are Rachel, the CMO AI, expert in marketing strategy and brand development. Focus on marketing campaigns, brand building, and customer engagement. When asked about your name, respond naturally and politely.',
  };

  return (
    prompts[aiAgent] ||
    'You are a helpful AI assistant. Be professional and concise in your responses. When asked about your name, respond naturally and politely.'
  );
};

export const generateAIResponse2 = async (
  content: ChatCompletionContentPart[],
  aiAgent: string
): Promise<string> => {
  try {
    // Check if user is asking about the AI's name in image content
    const textContent = content.find(item => item.type === 'text');
    if (textContent && 'text' in textContent) {
      const userMessage = textContent.text.toLowerCase().trim();
      const nameQuestions = [
        "what's your name",
        "what is your name",
        "who are you",
        "tell me your name",
        "do you have a name",
        "what should i call you",
        "what can i call you",
        "your name",
        "name"
      ];
      
      const isNameQuestion = nameQuestions.some(question => 
        userMessage.includes(question) || userMessage === question
      );
      
      if (isNameQuestion) {
        // Return the agent's name directly
        const agentName = getAgentDisplayName(aiAgent);
        return `My name is ${agentName}.`;
      }
    }

    /* Tradition completion API
    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages:[
        {
          role: 'system',
          content: getSystemPrompt(aiAgent),
        },
        {
          role:'user',
          content: content,
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'leejaewoo';
    */
  /* Assistant API thread creation 
  *  Stores the message data sequentially based on the thread 
  *  Also memorize the history automatically.
  */ 
  const content2 = convertToMessageParts(content);
  const assistantId = getAssistantId(aiAgent);

  // Use fallback for non-existent assistants
  if (assistantId === 'fallback') {
    // Use regular chat completions as fallback
    const completion = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(aiAgent),
        },
          {
            role: 'user',
            content: content2,
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = completion.choices[0]?.message?.content;
      if (!content || !content.trim()) {
        return `Hello! I'm ${getAgentDisplayName(aiAgent)}. How can I help you today?`;
      }
      return content;
  } else {
    // Use Assistants API for valid assistant IDs
    // Thread create
    const thread = await openai.beta.threads.create();

    // adding the user message
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: content2, // image + text combination
    });

    // 3.Run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId, 
      instructions: `You are ${aiAgent}, a helpful assistant.`,
    });

    // Polling until finish running
    let runStatus = run.status;
    while (runStatus !== 'completed' && runStatus !== 'failed') {
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      runStatus = updatedRun.status;
      if (runStatus !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      }
    }

    // Retrieve the message
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastAssistantMessage = messages.data.find(
      msg => msg.role === 'assistant'
    );

    const content = lastAssistantMessage?.content
      ?.map((c: { type: string; text?: { value: string } }) => c.text?.value)
      .join('\n');

    if (!content || !content.trim()) {
      return `Hello! I'm ${getAgentDisplayName(aiAgent)}. How can I help you today?`;
    }
    return content;
  }

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

function convertToMessageParts(content: ChatCompletionContentPart[]): MessageContentPartParam[] {
  return content.map(part => {
    if (part.type === 'text') {
      return {
        type: 'text',
        text: part.text,
      };
    }

    if (part.type === 'image_url') {
      return {
        type: 'image_url',
        image_url: {
          url: part.image_url.url,
        },
      };
    }

    throw new Error(`Unsupported content type: ${part.type}`);
  });
}

interface UploadContent {
  files: File[];
  [key: string]: unknown;
}

export const uploadContent = async (newContent: UploadContent, selectedPlatforms: string[], selectedFormats: string[]) => {
  try {
    const imageUrls = await Promise.all(newContent.files.map(async (file: File) => await uploadImageAndGetUrl(file)));
    const contentData = {
      ...newContent,
      platforms: selectedPlatforms,
      formats: selectedFormats,
      imageUrls: imageUrls,
    };

    await setDoc(doc(collection(db, 'content'), newContent.id), contentData);

    return contentData;
  } catch (error) {
    console.error('Error uploading content:', error);
    throw error;
  }
};
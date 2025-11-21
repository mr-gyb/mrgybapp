import OpenAI from 'openai';
import { OpenAIMessage } from '../../types/chat';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ChatCompletionContentPart  } from "openai/resources/chat/completions";
import { MessageContentPartParam } from "openai/resources/beta/threads/messages";
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from "../../lib/firebase";



const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const getAssistantId = (aiAgent: string): string => {
  const assistantIds: Record<string, string> = {
    'Mr.GYB AI': 'asst_5FUXkLddYzdcjHPCsmfV9x3F',
    'CHRIS': 'asst_3vtN1pMnvJ89RUgUTgYIQCf0',
    'Sherry': 'asst_OIVmkEpenHuPVlJT8u7DCfY7',
    'Charlotte' : 'asst_VkklftyKNwCBNz0ZGKCVthwN',
    'Jake' : 'asst_DtKsptuonX5DEOPEmHL5f1XC',
    'Rachel' : 'asst_U5JvdzL03Gii91NPzg74XSgi'
  };

  return assistantIds[aiAgent] || 'asst_defaultFallbackID'; // fallback ID 설정
};


export const uploadImageAndGetUrl = async (file: File): Promise<string> =>{
  const storage = getStorage();
  const storageRef = ref(storage, `uploads/${file.name}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  console.log("downloadURL is going to be ", downloadUrl);
  return downloadUrl;
}

export const generateAIResponse = async (
  messages: OpenAIMessage[],
  aiAgent: string
) => {
  try {
    const lastMessage = messages[messages.length - 1];
    const assistantId = getAssistantId(aiAgent);
    console.log(aiAgent);

    // Handle messages with file content
    if (typeof lastMessage.content === 'object' && Array.isArray(lastMessage.content)) {
      // For image files, use GPT-4 Vision
      if (lastMessage.content.some(item => item.type === 'image_url')) {
        console.log("image file?"); 
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
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
        return completion.choices[0]?.message?.content || '';
      } 
      // For other file types, use Assistants API with file search
      else if (lastMessage.fileType && lastMessage.fileName) {
        console.log("not image file");
        const fileUpload = await openai.files.create({
          file: lastMessage.file as any,
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
        return threadMessages.data[0]?.content[0]?.text?.value || 'No analysis available';
      }
    }

    // Handle regular text messages using the Assistants API
    const thread = await openai.beta.threads.create();

    // recent 5 messages
    const recentMessages = messages.slice(-5);
    // Add all previous messages to the thread
    for (const msg of recentMessages) {
      // Skip system messages for Assistants API as they're not supported
      // if (msg.role === 'system') continue;
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      });
    }

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
    return threadMessages.data[0]?.content[0]?.text?.value || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};



const getSystemPrompt = (aiAgent: string): string => {
  const prompts: Record<string, string> = {
    'Mr.GYB AI':
      'You are Mr.GYB AI, an all-in-one business growth assistant. You specialize in digital marketing, content creation, and business strategy. Be professional, strategic, and focused on growth.',
    CHRIS: 'You are the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance.',
    Sherry: 'You are the COO AI, specializing in operations management and process optimization. Focus on efficiency, systems, and operational excellence.',
    Charlotte: 'You are the CHRO AI, expert in human resources and organizational development. Focus on talent management, culture, and employee experience.',
    Jake: 'You are the CTO AI, specializing in technology strategy and innovation. Provide guidance on technical decisions and digital transformation.',
    Rachel: 'You are the CMO AI, expert in marketing strategy and brand development. Focus on marketing campaigns, brand building, and customer engagement.',
  };

  return (
    prompts[aiAgent] ||
    'You are a helpful AI assistant. Be professional and concise in your responses.'
  );
};

export const generateAIResponse2 = async (
  content: ChatCompletionContentPart[],
  aiAgent: string
): Promise<string> => {
  try {
    /* Tradition completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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

return (
  lastAssistantMessage?.content
    ?.map((c: any) => c.text?.value)
    .join('\n') || 'No response.'
);

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

export const uploadContent = async (newContent: any, selectedPlatforms: string[], selectedFormats: string[]) => {
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
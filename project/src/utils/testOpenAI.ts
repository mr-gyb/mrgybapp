/**
 * Test OpenAI API connection
 */
export const testOpenAIConnection = async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenAI API key not found in environment variables');
    console.error('Please add VITE_OPENAI_API_KEY to your .env file');
    return false;
  }

  console.log('🔑 API Key found, testing connection...');
  console.log('🔑 API Key format:', apiKey.startsWith('sk-') ? 'Valid format (sk-...)' : 'Invalid format');

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 API Response status:', response.status);

    if (response.ok) {
      console.log('✅ OpenAI API connection successful');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API connection failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - check your API key');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded - try again later');
      } else if (response.status === 403) {
        console.error('❌ Access forbidden - check your API key permissions');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API connection error:', error);
    console.error('❌ This might be a network issue or CORS problem');
    return false;
  }
};

/**
 * Test OpenAI Video API connection
 */
export const testOpenAIVideoConnection = async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_OPENAI_VIDEO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenAI Video API key not found in environment variables');
    console.error('Please add VITE_OPENAI_VIDEO_API_KEY to your .env file');
    return false;
  }

  console.log('🔑 Video API Key found, testing connection...');
  console.log('🔑 API Key format:', apiKey.startsWith('sk-') ? 'Valid format (sk-...)' : 'Invalid format');

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 API Response status:', response.status);

    if (response.ok) {
      console.log('✅ OpenAI Video API connection successful');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI Video API connection failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - check your video API key');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded - try again later');
      } else if (response.status === 403) {
        console.error('❌ Access forbidden - check your video API key permissions');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI Video API connection error:', error);
    console.error('❌ This might be a network issue or CORS problem');
    return false;
  }
};

/**
 * Test OpenAI API with a simple completion
 */
export const testOpenAICompletion = async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not found in environment variables');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Say "OpenAI API is working correctly" and nothing else.'
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API completion test successful:', data.choices[0].message.content);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ OpenAI API completion test failed:', response.status, response.statusText, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API completion test error:', error);
    return false;
  }
};

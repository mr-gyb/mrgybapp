# OpenAI Video API Key Setup

## Quick Fix

The video analysis feature uses OpenAI's API for transcription (Whisper) and analysis (GPT-4). You only need **one** API key for both.

### Option 1: Use Your Existing OpenAI API Key (Recommended)

If you already have `VITE_OPENAI_API_KEY` set in your `.env` file, the video feature will automatically use it. No additional setup needed!

### Option 2: Set a Separate Video API Key (Optional)

If you want to use a different API key specifically for video analysis:

1. Add to your `.env` file:
```env
VITE_OPENAI_VIDEO_API_KEY=sk-your-video-api-key-here
```

2. Restart your development server:
```bash
npm run dev
```

## Getting an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to **API Keys** section: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Add it to your `.env` file:
   ```env
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```
7. Restart your dev server

## Verification

After setting up, the video upload flow will:
- ✅ Check for API key on upload
- ✅ Show clear error if missing
- ✅ Use the key for video transcription and analysis

## Troubleshooting

**Error: "OpenAI API key not configured"**

1. Check your `.env` file exists in the `project/` directory
2. Verify the key is set: `VITE_OPENAI_API_KEY=sk-...`
3. Make sure the key starts with `sk-`
4. Restart your development server after adding the key
5. Check browser console for detailed error messages

**Note**: The same API key works for both chat and video features. You don't need separate keys unless you want different billing/usage tracking.


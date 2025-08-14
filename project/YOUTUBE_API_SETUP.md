# YouTube API Setup Guide

## 🚀 **Get Real YouTube View Counts**

To display actual YouTube video view counts in your GYB Studio, you need to set up the YouTube Data API v3.

### 📋 **Prerequisites:**
- Google Cloud Platform account
- YouTube Data API v3 enabled
- API key with proper permissions

### 🔑 **Step-by-Step Setup:**

#### 1. **Enable YouTube Data API v3**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Data API v3"
5. Click **Enable**

#### 2. **Create API Credentials**
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API key**
3. Copy your new API key
4. (Optional) Restrict the API key to YouTube Data API v3 only

#### 3. **Configure Environment Variable**
Create a `.env` file in your project root:

```bash
# .env
VITE_YOUTUBE_API_KEY=your_actual_api_key_here
```

**⚠️ Important:** Never commit your `.env` file to version control!

#### 4. **Restart Development Server**
After adding the environment variable:
```bash
npm run dev
# or
yarn dev
```

### 🎯 **What You'll Get:**

- **Real View Counts**: Actual YouTube video statistics
- **Live Updates**: View counts update in real-time
- **Accurate Analytics**: Proper data for content performance tracking
- **Professional Insights**: Real engagement metrics for business decisions

### 🔧 **API Quotas & Limits:**

- **Free Tier**: 10,000 units per day
- **Cost**: $5 per 1,000 additional units
- **Rate Limit**: 1,000 requests per 100 seconds per user

**📊 Quota Usage Breakdown:**
- **Video Statistics**: 1 unit per request
- **Channel Statistics**: 1 unit per request
- **Search**: 100 units per request
- **Video Details**: 1 unit per request

**💡 Quota Management Tips:**
- Monitor usage in Google Cloud Console
- Implement caching to reduce API calls
- Use batch requests when possible
- Consider upgrading to paid tier for higher limits

### 🚨 **Troubleshooting:**

#### **"API key not found" Error:**
- Check `.env` file exists in project root
- Verify environment variable name: `VITE_YOUTUBE_API_KEY`
- Restart development server after changes

#### **"403 Forbidden" Error:**
- Ensure YouTube Data API v3 is enabled
- Check API key permissions
- Verify API key is not restricted to wrong services

#### **"Quota exceeded" Error:**
- Monitor usage in Google Cloud Console
- Consider upgrading to paid tier
- Implement caching for frequently accessed data

#### **"403 Forbidden - Quota Exceeded" Error:**
- **Immediate Action**: Your daily quota limit has been reached
- **Solution**: Wait until tomorrow (quota resets daily at midnight PST)
- **Alternative**: Upgrade to paid tier for higher limits
- **Current Status**: App will use calculated view counts as fallback
- **Check Quota**: Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 📊 **Expected Results:**

Once configured, you'll see:
- ✅ Real YouTube view counts in charts
- ✅ Live updates when videos gain views
- ✅ Accurate content performance metrics
- ✅ Professional analytics dashboard

### 🔒 **Security Best Practices:**

1. **Restrict API Key**: Limit to YouTube Data API v3 only
2. **Environment Variables**: Never hardcode API keys
3. **Rate Limiting**: Implement proper request throttling
4. **Error Handling**: Graceful fallbacks when API fails

### 📱 **Testing Your Setup:**

1. Upload a YouTube video to your Content Hub
2. Check browser console for API success messages
3. Verify view counts appear in Content Type Distribution chart
4. Monitor real-time updates

### 🆘 **Need Help?**

- Check browser console for error messages
- Verify API key in Google Cloud Console
- Ensure `.env` file is properly configured
- Restart development server after changes

---

**🎉 Congratulations!** Once setup is complete, you'll have real YouTube analytics powering your content insights!

### 🚨 **What Happens When Quota is Exceeded:**

When your YouTube API quota is exceeded:

1. **🔄 Automatic Fallback**: App switches to calculated view counts from your content
2. **⚠️ Visual Indicator**: Yellow warning banner appears above charts
3. **📊 Data Continuity**: Charts continue to display data using fallback calculations
4. **🔄 Retry Option**: Reset button allows you to clear quota status
5. **📅 Daily Reset**: Quota automatically resets at midnight PST

**💡 Benefits of Fallback System:**
- No interruption to your analytics dashboard
- Data continues to be displayed and updated
- Seamless user experience even during quota issues
- Automatic recovery when quota resets

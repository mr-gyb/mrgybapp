export const getAuthUrl = (provider: string): string => {
  const redirectUri = `${window.location.origin}/settings/integrations/callback`;
  
  const authUrls: Record<string, string> = {
    'salesforce': `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${import.meta.env.VITE_SALESFORCE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=api`,
    'google': `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=profile email`,
    'facebook': `https://www.facebook.com/v12.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=email,pages_show_list`,
    'instagram': `https://api.instagram.com/oauth/authorize?client_id=${import.meta.env.VITE_INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=basic&response_type=code`,
    'linkedin': `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${import.meta.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress`,
    'twitter': `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${import.meta.env.VITE_TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`,
    'tiktok': `https://www.tiktok.com/auth/authorize?client_key=${import.meta.env.VITE_TIKTOK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user.info.basic&response_type=code`,
    'make': `https://www.make.com/oauth/authorize?client_id=${import.meta.env.VITE_MAKE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`,
    'zapier': `https://zapier.com/oauth/authorize?client_id=${import.meta.env.VITE_ZAPIER_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`,
  };

  return authUrls[provider.toLowerCase()] || '';
};

export const handleAuthCallback = async (code: string, provider: string) => {
  try {
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, provider }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};
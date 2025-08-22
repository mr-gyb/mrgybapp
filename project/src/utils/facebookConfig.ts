export const checkFacebookConfig = () => {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const appSecret = import.meta.env.VITE_FACEBOOK_APP_SECRET;

  if (!appId) {
    console.error('Facebook App ID is not configured. Please add VITE_FACEBOOK_APP_ID to your .env file');
    return {
      isValid: false,
      error: 'Facebook App ID is not configured. Please check your environment variables.',
      missing: 'VITE_FACEBOOK_APP_ID'
    };
  }

  if (!appSecret) {
    console.error('Facebook App Secret is not configured. Please add VITE_FACEBOOK_APP_SECRET to your .env file');
    return {
      isValid: false,
      error: 'Facebook App Secret is not configured. Please check your environment variables.',
      missing: 'VITE_FACEBOOK_APP_SECRET'
    };
  }

  return {
    isValid: true,
    appId,
    appSecret
  };
};

export const getFacebookConfig = () => {
  const config = checkFacebookConfig();
  if (!config.isValid) {
    throw new Error(config.error);
  }
  return {
    appId: config.appId,
    appSecret: config.appSecret
  };
};

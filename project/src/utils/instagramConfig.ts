export const checkInstagramConfig = () => {
  // Instagram integration uses the same Facebook app credentials
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const appSecret = import.meta.env.VITE_FACEBOOK_APP_SECRET;

  if (!appId) {
    console.error('Facebook App ID is not configured. Instagram integration requires Facebook app credentials.');
    return {
      isValid: false,
      error: 'Facebook App ID is not configured. Instagram integration uses the same app credentials as Facebook.',
      missing: 'VITE_FACEBOOK_APP_ID'
    };
  }

  if (!appSecret) {
    console.error('Facebook App Secret is not configured. Instagram integration requires Facebook app credentials.');
    return {
      isValid: false,
      error: 'Facebook App Secret is not configured. Instagram integration uses the same app credentials as Facebook.',
      missing: 'VITE_FACEBOOK_APP_SECRET'
    };
  }

  return {
    isValid: true,
    appId,
    appSecret
  };
};

export const getInstagramConfig = () => {
  const config = checkInstagramConfig();
  if (!config.isValid) {
    throw new Error(config.error);
  }
  return {
    appId: config.appId,
    appSecret: config.appSecret
  };
};

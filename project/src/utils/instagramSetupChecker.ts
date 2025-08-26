export const checkInstagramSetup = () => {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Instagram integration uses the same Facebook app credentials
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const appSecret = import.meta.env.VITE_FACEBOOK_APP_SECRET;
  
  if (!appId) {
    issues.push('VITE_FACEBOOK_APP_ID is missing from environment variables (required for Instagram integration)');
  } else if (appId === 'your_facebook_app_id_here') {
    issues.push('VITE_FACEBOOK_APP_ID still has placeholder value');
  } else if (appId.length < 10) {
    warnings.push('VITE_FACEBOOK_APP_ID seems too short for a valid Facebook App ID');
  }
  
  if (!appSecret) {
    issues.push('VITE_FACEBOOK_APP_SECRET is missing from environment variables (required for Instagram integration)');
  } else if (appSecret === 'your_facebook_app_secret_here') {
    issues.push('VITE_FACEBOOK_APP_SECRET still has placeholder value');
  } else if (appSecret.length < 20) {
    warnings.push('VITE_FACEBOOK_APP_SECRET seems too short for a valid Facebook App Secret');
  }
  
  // Check if .env file exists (this is a best guess)
  if (issues.length > 0) {
    issues.push('Make sure you have a .env file in your project root');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    appId: appId || 'Not set',
    appSecret: appSecret ? 'Set (hidden)' : 'Not set'
  };
};

export const getInstagramSetupInstructions = () => {
  return {
    title: 'Instagram Integration Setup',
    steps: [
      {
        step: 1,
        title: 'Create Facebook App',
        description: 'Go to Facebook Developers and create a new app (or use existing)',
        url: 'https://developers.facebook.com/',
        action: 'Create App'
      },
      {
        step: 2,
        title: 'Add Instagram Product',
        description: 'Add Instagram Basic Display product to your Facebook app',
        action: 'Add Product'
      },
      {
        step: 3,
        title: 'Get App Credentials',
        description: 'Copy App ID and App Secret from your Facebook app',
        action: 'Copy Credentials'
      },
      {
        step: 4,
        title: 'Create Environment File',
        description: 'Create .env file in your project root',
        action: 'Create .env'
      },
      {
        step: 5,
        title: 'Add Facebook Variables',
        description: 'Add VITE_FACEBOOK_APP_ID and VITE_FACEBOOK_APP_SECRET',
        action: 'Add Variables'
      },
      {
        step: 6,
        title: 'Restart Server',
        description: 'Restart your development server',
        action: 'Restart'
      }
    ]
  };
};

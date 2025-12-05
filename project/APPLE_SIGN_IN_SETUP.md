# Apple Sign In Setup Guide

## 🔍 Error: `auth/operation-not-allowed`

This error means **Apple Sign In is not enabled** in your Firebase Console. Follow these steps to enable it.

## 📋 Prerequisites

1. **Apple Developer Account** (paid membership required - $99/year)
2. **Firebase Project** configured
3. **Apple App ID** and **Service ID** created

## 🚀 Step-by-Step Setup

### Step 1: Enable Apple Sign In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Apple** in the list of providers
5. Click on **Apple** to open settings
6. Toggle **Enable** to ON
7. Click **Save**

### Step 2: Configure Apple Developer Account

#### 2.1 Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (plus button)
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description**: Your app name (e.g., "GYB Studio")
   - **Bundle ID**: Use reverse domain notation (e.g., `com.yourcompany.gybstudio`)
7. Under **Capabilities**, check **Sign In with Apple**
8. Click **Continue** → **Register**

#### 2.2 Create a Service ID

1. In Apple Developer Portal, go to **Identifiers**
2. Click **+** → Select **Services IDs** → **Continue**
3. Fill in:
   - **Description**: Your service name (e.g., "GYB Studio Web")
   - **Identifier**: Use reverse domain notation (e.g., `com.yourcompany.gybstudio.web`)
4. Check **Sign In with Apple**
5. Click **Configure** next to "Sign In with Apple"
6. Select your **Primary App ID** (created in step 2.1)
7. Add **Website URLs**:
   - **Domains**: `yourdomain.com` (or `localhost` for development)
   - **Return URLs**: 
     - `https://yourdomain.com/__/auth/handler` (production)
     - `http://localhost:3002/__/auth/handler` (development)
8. Click **Save** → **Continue** → **Register**

#### 2.3 Create a Key

1. In Apple Developer Portal, go to **Keys**
2. Click **+** (plus button)
3. Fill in:
   - **Key Name**: "Sign In with Apple Key"
   - Check **Sign In with Apple**
4. Click **Configure** → Select your **Primary App ID**
5. Click **Save** → **Continue** → **Register**
6. **Download the key file** (`.p8` file) - **You can only download this once!**
7. Note the **Key ID** (shown after creation)

### Step 3: Configure Firebase with Apple Credentials

1. Go back to Firebase Console → **Authentication** → **Sign-in method** → **Apple**
2. Fill in the following:

   **OAuth code flow configuration:**
   - **Services ID**: The Service ID you created (e.g., `com.yourcompany.gybstudio.web`)
   - **Apple Team ID**: Found in Apple Developer Portal → Membership
   - **Key ID**: The Key ID from step 2.3
   - **Private Key**: Open the `.p8` file you downloaded and copy its contents

3. Click **Save**

### Step 4: Add Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `yourdomain.com` (for production)
   - Any other domains you use

### Step 5: Test Apple Sign In

1. Restart your development server
2. Try signing in with Apple
3. You should see the Apple Sign In popup

## 🔧 Troubleshooting

### Error: "Invalid client"
- Check that your Service ID matches exactly in Firebase
- Verify the Service ID is configured with Sign In with Apple enabled

### Error: "Invalid redirect URI"
- Make sure the return URLs in Apple Developer Portal match your Firebase authorized domains
- Format: `https://yourdomain.com/__/auth/handler`

### Error: "Invalid key"
- Verify the private key (`.p8` file) is correctly copied (include the full key including headers)
- Check that the Key ID matches

### Error: "Team ID not found"
- Verify your Apple Team ID in Apple Developer Portal → Membership
- Make sure you're using the correct Team ID (not your personal Apple ID)

## 📝 Important Notes

1. **Apple Developer Account Required**: You need a paid Apple Developer membership ($99/year) to use Sign In with Apple
2. **Key File Security**: The `.p8` key file can only be downloaded once. Store it securely.
3. **Testing**: Apple Sign In works best on Safari browser. Chrome/Firefox may have limitations.
4. **Development**: For local development, you can use `localhost` as the domain
5. **Production**: Make sure your production domain is verified in both Apple Developer Portal and Firebase

## 🔗 Useful Links

- [Firebase Apple Sign In Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer Portal](https://developer.apple.com/account/)

## ✅ Quick Checklist

- [ ] Apple Developer Account active
- [ ] App ID created with Sign In with Apple capability
- [ ] Service ID created and configured
- [ ] Key created and downloaded (`.p8` file)
- [ ] Apple Sign In enabled in Firebase Console
- [ ] Service ID, Team ID, Key ID, and Private Key added to Firebase
- [ ] Authorized domains added in Firebase
- [ ] Return URLs configured in Apple Developer Portal
- [ ] Tested sign in flow

## 🆘 Still Having Issues?

If you're still getting errors after following these steps:

1. **Check Firebase Console logs** for more detailed error messages
2. **Verify all credentials** are correct (no extra spaces, correct format)
3. **Clear browser cache** and try again
4. **Check browser console** for additional error details
5. **Ensure you're using HTTPS** in production (required by Apple)


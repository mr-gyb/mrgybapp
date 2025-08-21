# Facebook HTTPS Simple Fix

## 🚨 **Problem Fixed!**

The issue was with the Vite HTTPS configuration. I've now properly configured HTTPS in the `vite.config.ts` file.

## ✅ **What I Fixed**

1. **Added proper HTTPS config** to `vite.config.ts`
2. **Updated package.json scripts** to work correctly
3. **Server should now start properly** with HTTPS enabled

## 🚀 **How to Use**

### **Option 1: HTTPS Development (Recommended for Facebook)**
```bash
npm run dev
```
This will automatically start with HTTPS enabled.

### **Option 2: HTTP Development (If you need HTTP)**
```bash
npm run dev:http
```
This will start on port 3001 with HTTP.

### **Option 3: Explicit HTTPS**
```bash
npm run dev:https
```
Same as `npm run dev` - HTTPS enabled.

## 🔧 **What Happened**

- **Before**: Command-line `--https` flag was not supported in your Vite version
- **After**: HTTPS is properly configured in `vite.config.ts`
- **Result**: Server starts properly with HTTPS enabled

## 🧪 **Test the Fix**

1. **Stop any running dev server** (Ctrl+C)
2. **Run the fixed dev server**:
   ```bash
   npm run dev
   ```
3. **Server should start successfully** on `https://localhost:3000`
4. **Accept the security warning** (self-signed certificate)
5. **Facebook integration should work** without HTTPS errors

## 📱 **Facebook App Settings**

Make sure your Facebook app has these OAuth redirect URIs:
- `https://localhost:3000/facebook-callback`
- `https://localhost:3000/settings/integrations/callback`

## 🎯 **Summary**

The fix is simple:
1. **Run `npm run dev`** (HTTPS is now enabled automatically)
2. **Access via `https://localhost:3000`**
3. **Facebook integration will work!**

Your server should now start properly with HTTPS enabled! 🎉

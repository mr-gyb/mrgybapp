# Facebook HTTPS Solution for Windows

## 🚨 **Problem Solved!**

I've created multiple solutions for Windows users to enable HTTPS for Facebook integration without requiring external OpenSSL.

## ✅ **Available Solutions**

### **Option 1: Simple HTTPS Server (Recommended)**
```bash
npm run dev
```
This starts a simple HTTPS proxy server with built-in certificates.

### **Option 2: Windows Batch File**
```bash
npm run dev:windows
```
This opens two command windows - one for Vite, one for HTTPS proxy.

### **Option 3: Manual Start**
```bash
# Terminal 1: Start Vite dev server
npm run dev:http

# Terminal 2: Start HTTPS proxy
npm run dev:https
```

## 🚀 **Quick Start (Recommended)**

1. **Run the simple solution**:
   ```bash
   npm run dev
   ```

2. **This will**:
   - Start Vite dev server on port 3001
   - Start HTTPS proxy on port 3000
   - Create SSL certificates automatically

3. **Access your app** at `https://localhost:3000`

4. **Accept the security warning** (self-signed certificate)

## 🔧 **How It Works**

1. **Vite Dev Server** runs on `http://localhost:3001`
2. **HTTPS Proxy Server** runs on `https://localhost:3000`
3. **Proxy forwards** all HTTPS requests to Vite
4. **Facebook sees HTTPS** and works properly

## 🧪 **Testing the Solution**

1. **Start HTTPS development**:
   ```bash
   npm run dev
   ```

2. **Wait for both servers** to start

3. **Open browser** to `https://localhost:3000`

4. **Test Facebook integration** - should work without HTTPS errors!

## 📱 **Facebook App Settings**

Make sure your Facebook app has these OAuth redirect URIs:
- `https://localhost:3000/facebook-callback`
- `https://localhost:3000/settings/integrations/callback`

## 🚨 **If You Have Issues**

### **Port Conflicts**
- Make sure ports 3000 and 3001 are free
- Check if other services are using these ports

### **Node.js Errors**
- Ensure you have Node.js installed
- Try running `npm install` to update dependencies

### **Certificate Errors**
- The script creates certificates automatically
- If you see certificate errors, try `npm run dev` again

## 🎯 **Benefits**

- ✅ **No OpenSSL Required** - Works on Windows without external tools
- ✅ **Automatic Setup** - Creates certificates and starts servers
- ✅ **Facebook Compatible** - Meets HTTPS requirements
- ✅ **Easy to Use** - Single command: `npm run dev`
- ✅ **Development Friendly** - Hot reload still works

## 🔍 **Troubleshooting**

### **"Port already in use" Error**
1. Close any running dev servers
2. Check Task Manager for processes using ports 3000/3001
3. Restart your terminal

### **"Cannot find module" Error**
1. Run `npm install` to install dependencies
2. Make sure you're in the project directory

### **Browser Security Warning**
- This is normal for self-signed certificates
- Click "Advanced" → "Proceed to localhost (unsafe)"

## 🎉 **Summary**

The solution is simple:
1. **Run `npm run dev`** (starts both servers automatically)
2. **Access via `https://localhost:3000`**
3. **Facebook integration will work!**

Your Facebook integration should now work properly with reliable HTTPS on Windows! 🚀

## 📋 **Alternative Commands**

- `npm run dev` - Start both servers (recommended)
- `npm run dev:windows` - Windows batch file approach
- `npm run dev:http` - HTTP only (port 3001)
- `npm run dev:https` - HTTPS proxy only

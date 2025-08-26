# Facebook Permissions Quick Reference Card

## 🎯 **Essential Permissions for GYB App**

### ✅ **Basic Permissions (No Review Required)**
| Permission | Purpose | Required |
|------------|---------|----------|
| `email` | Get user's email address | ✅ Yes |
| `public_profile` | Basic profile information | ✅ Yes |

### 🔒 **Page Management Permissions (Requires App Review)**
| Permission | Purpose | Required | Review Time |
|------------|---------|----------|-------------|
| `pages_manage_posts` | Post content to user's pages | ✅ Yes | 1-3 days |
| `pages_read_engagement` | Read page insights & metrics | ✅ Yes | 1-3 days |
| `pages_show_list` | List pages user manages | ✅ Yes | 1-3 days |

### 📝 **How to Add These Permissions**

1. **Go to Facebook Developers Console**
   - Visit: https://developers.facebook.com/
   - Select your app

2. **Navigate to App Review**
   - Click **"App Review"** in left sidebar
   - Click **"Permissions and Features"**

3. **Add Each Permission**
   - Find each permission in the list
   - Click **"Request"** button
   - Fill out the form explaining your use case

### 🚀 **Quick Setup Steps**

1. **Create Facebook App** (if not done)
2. **Add Facebook Login product**
3. **Configure OAuth redirect URIs**
4. **Request these 5 permissions**
5. **Wait for App Review approval**
6. **Test with your app**

### ⚠️ **Important Notes**

- **Development Mode**: You can test with these permissions while in development
- **App Review**: Required for production use and public access
- **Test Users**: Add test users to test permissions before going live
- **Domain Verification**: Ensure your domain is added to App Domains

### 🔗 **Useful Links**

- [Facebook Developers Console](https://developers.facebook.com/)
- [Permissions Documentation](https://developers.facebook.com/docs/facebook-login/permissions/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)

---

**Total Permissions Needed: 5**
**Review Required: 3**
**Setup Time: 15-30 minutes**
**Review Time: 1-3 business days**

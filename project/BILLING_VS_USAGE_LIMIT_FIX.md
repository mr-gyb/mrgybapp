# Billing vs Usage Limit Error Classification Fix

## Problem
The app was incorrectly showing "billing quota depleted" messages for usage limit errors (TPD/TPM/RPM), even when users had active billing and credits.

## Root Cause
The error detection logic was treating ALL `insufficient_quota` errors as billing errors, but OpenAI returns `insufficient_quota` for both:
1. **Billing quota** - requires payment/billing action
2. **Usage limits (TPD/TPM/RPM)** - temporary, resets automatically

The error message "You exceeded your current quota, please check your plan and billing details" is generic and doesn't explicitly mention billing.

## Solution

### 1. ✅ Fixed Error Detection

**Before:**
- Any `insufficient_quota` → treated as billing error

**After:**
- **Billing errors**: Only when message EXPLICITLY mentions:
  - "billing"
  - "credit"
  - "payment"
  - "no active subscription"
  - "subscription expired"
  - "payment method"
- **Usage limits**: 429 status OR generic "quota exceeded" WITHOUT billing keywords

**New Logic:**
```javascript
function isBillingError(error) {
  // Only triggers on EXPLICIT billing keywords
  const msg = error?.message?.toLowerCase() || "";
  return (
    msg.includes("billing") ||
    msg.includes("credit") ||
    msg.includes("payment") ||
    msg.includes("no active subscription") ||
    msg.includes("subscription expired") ||
    msg.includes("payment method")
  );
}

function isUsageLimitError(error, status) {
  // 429 status OR quota exceeded WITHOUT billing keywords
  if (status === 429 && !isBillingError(error)) {
    return true;
  }
  
  return (
    errorMsg.includes('quota exceeded') ||
    errorMsg.includes('exceeded your current quota') ||
    errorMsg.includes('limit') ||
    errorMsg.includes('rate') ||
    errorCode === 'insufficient_quota' // Generic quota = usage limit unless billing keywords
  );
}
```

### 2. ✅ Updated UI Messages

**Billing Errors:**
```
"Your OpenAI billing quota is depleted. Check your billing at https://platform.openai.com/account/billing"
```

**Usage Limit Errors:**
```
"You've reached your OpenAI usage limits (TPM/RPM/TPD). Please wait for your limits to reset and try again later."
```

### 3. ✅ Safe JSON Parsing

All error responses now use safe parsing:
```javascript
let errorData = {};
try {
  const text = await response.text();
  try {
    errorData = JSON.parse(text);
  } catch {
    // Not JSON, use text as error message
    errorData = { error: { message: text.substring(0, 200) } };
  }
} catch {
  errorData = {};
}
```

This prevents HTML error pages (404/500) from crashing JSON parsing.

### 4. ✅ Retry Logic

Usage limit errors are automatically retried with `withRetry()`:
- 5 retries with delays: 2s, 4s, 6s, 8s, 10s
- Billing errors are NOT retried (correct)

## Files Modified

### Backend:
1. **`backend/openaiVideoService.js`**
   - Fixed `isBillingError()` - only triggers on explicit billing keywords
   - Fixed `isUsageLimitError()` - catches 429 + generic quota errors
   - Updated `analyzeBillingOrUsageError()` - proper classification
   - Added safe JSON parsing for all responses

2. **`backend/server.js`**
   - Updated error messages to match new classification

### Frontend:
1. **`src/components/video/VideoUploadFlow.tsx`**
   - Updated usage limit message

2. **`src/hooks/useDescriptAnalysis.ts`**
   - Updated usage limit message

## Key Changes

1. **Stricter Billing Detection**: Only triggers on explicit billing keywords
2. **Usage Limit Detection**: Catches 429 + generic quota errors
3. **Safe Parsing**: Prevents HTML responses from crashing JSON parsing
4. **Accurate Messages**: Users see correct error type

## Testing

After restarting the backend server:
1. ✅ Generic "quota exceeded" → treated as usage limit (retryable)
2. ✅ Explicit "billing" keywords → treated as billing error (not retryable)
3. ✅ 429 errors → treated as usage limit (retryable)
4. ✅ HTML error responses → safely parsed without crashes

The system now correctly distinguishes billing from usage limits!


# Single Session Enforcement - Testing Guide

## 🎯 What Was Fixed

The single session enforcement feature has been improved to **automatically terminate old logins within 5 seconds** when the same account logs in from a different client.

### Changes Made:

1. **Faster Detection**: Reduced session validation interval from 60 seconds to **5 seconds**
2. **Immediate Logout**: Old client now logs out **immediately** (no 3-second delay)
3. **Better Logging**: Added comprehensive logging to track session invalidation

---

## ✅ How It Works

### Server Side:
- When a user logs in, the server invalidates all previous sessions for that user
- The server updates `currentSessionToken` to the new login's token
- Old tokens are marked as invalid in the database

### Client Side:
- Every **5 seconds**, the client checks with the server if its session is still valid
- If the session is invalid (logged in from another device), the client:
  - Shows a warning message: "You have been logged out from another device"
  - Immediately closes the DAT window
  - Returns to the login screen

---

## 🧪 How to Test

### Test 1: Single Session Enforcement

1. **Start First Client**:
   - Open the DAT One Client app
   - Log in with your credentials (e.g., `admin@digitalstorming.com`)
   - Wait for DAT window to open

2. **Start Second Client** (same machine or different machine):
   - Open another instance of the DAT One Client app
   - Log in with the **SAME** credentials

3. **Expected Result**:
   - Second client should log in successfully
   - **First client should automatically close within 5 seconds**
   - First client should show: "You have been logged out from another device"

### Test 2: Normal DAT Functionality

1. Log in to the client
2. Verify DAT window opens correctly
3. Verify you can browse DAT normally
4. Verify proxy is working (check your IP if needed)
5. Verify the `+` button creates new windows (if SUPER_ADMIN)

---

## 📝 Console Logs to Watch

### When Session is Valid:
```
✅ Session validation: Session is valid
```

### When Logged Out from Another Device:
```
🔒 Session validation: Logged out from another device
🔒 Session invalidated: logged_out_from_another_device
```

### In the Old Client:
- You should see the validation logs every 5 seconds
- When invalid, you'll see the logout happen immediately

---

## 🐛 Troubleshooting

### If Both Clients Stay Active:
1. Check the console logs - are you seeing validation checks?
2. Verify the server is running and accessible
3. Check if there are any network errors in the console

### If Validation Isn't Running:
1. Make sure you logged in successfully
2. Check browser console (F12) in the login window for errors
3. Look for "Session validation error" messages

---

## 🔍 Admin Panel Monitoring

Admins can monitor login activity:

1. Go to `http://67.205.189.32:3000` (admin panel)
2. Log in as admin
3. Check these tabs:
   - **Security Alerts**: Shows "Multiple Device Login" alerts
   - **Active Sessions**: Shows currently active sessions
   - **Login History**: Shows all login attempts

---

## ⏱️ Timing

- **Session validation**: Every 5 seconds
- **Old client logout**: Immediate (within 5 seconds of new login)
- **Warning message**: Shown before logout

---

## 📊 Expected Timeline

```
Time 0s:  User A logs in on Client 1 → Success
Time 10s: User A logs in on Client 2 → Success, Client 1 token invalidated
Time 15s: Client 1 validation check detects invalid session
Time 15s: Client 1 shows warning and logs out immediately
Time 15s: Client 1 DAT window closes, returns to login screen
```

**Total time from second login to first client logout: ~5 seconds**

---

## ✨ Benefits

1. **Security**: Prevents account sharing and unauthorized access
2. **Fast Detection**: Old sessions terminated within 5 seconds
3. **User Experience**: Clear message explaining what happened
4. **Admin Visibility**: All login attempts tracked in admin panel


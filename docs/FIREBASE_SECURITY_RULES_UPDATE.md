# Firebase Security Rules Update - URGENT

## The Issue
Admin login was failing with "Missing or insufficient permissions" when trying to read the `user_roles` collection.

## The Fix
Updated Firestore Security Rules to include:
1. ✅ Explicit `user_roles` collection rules
2. ✅ `isAdmin()` helper function to check admin status
3. ✅ Authenticated user read access to `user_roles`
4. ✅ Support for timeline, messages, and deliverables collections

## What You Need to Do NOW

### Step 1: Go to Firebase Console
https://console.firebase.google.com

### Step 2: Select Your BuildWave Project
Click on your project name

### Step 3: Navigate to Firestore Rules
1. Click **Firestore Database** in the left menu
2. Click the **Rules** tab at the top
3. Delete ALL existing rules
4. Copy the entire rules code from `FIRESTORE_SECURITY_RULES.md` (the code block)
5. Paste it into the Firebase console editor
6. Click **Publish**

### Step 4: Verify the Update
Wait for the "✓ Rules published successfully" message

### Step 5: Clear Browser Cache & Try Login Again
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Try admin login again

## Expected Result
Admin login should now work without permission errors.

## What Changed
```firestore
// FIXED: isAdmin() helper function - now takes no parameters
// Uses request.auth.uid directly to check current user's role
function isAdmin() {
  return exists(/databases/$(database)/documents/user_roles/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
}

// Usage: isAdmin() - no parameters needed
match /user_roles/{userId} {
  allow read: if isAuth();
  allow write: if isAdmin();  // Checks current user's role
}
```

## Error Fix
If you got: "Error saving rules – Line 65: Unexpected 'isAdmin'."

**Cause:** Function was called before being fully defined
**Solution:** Reordered functions - all helpers defined before use

The new rules have ALL functions defined at the top, before any `match` statements.

## Full Documentation
See `FIRESTORE_SECURITY_RULES.md` for complete rules and explanations.

## Need Help?
If admin login still fails after this:
1. ✅ Verify admin user exists in `user_roles` collection with `role: "admin"`
2. ✅ Check Firebase Console > Authentication tab - your admin email should be there
3. ✅ Verify the rules published successfully (no error messages)
4. ✅ Hard refresh browser (Ctrl+Shift+R)

# 🔧 Firebase Console Setup - Quick Fix

## Problem
Error: "Missing or insufficient permissions" when trying to fetch user and project data.

## Root Cause
Firestore security rules are too restrictive or not set up correctly.

## Solution - Update Security Rules in Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your **BuildWave** project
3. Click **Firestore Database** from the left menu

### Step 2: Open Rules Editor
1. Click the **Rules** tab at the top
2. You should see a code editor with the current rules

### Step 3: Replace with New Rules

Clear all existing rules and paste this complete ruleset:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuth() {
      return request.auth.uid != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection - Allow authenticated users to read all
    match /users/{userId} {
      allow read: if isAuth();
      allow write: if isOwner(userId);
    }
    
    // Projects collection - Allow authenticated users to read all
    match /projects/{projectId} {
      allow read: if isAuth();
      allow create: if isAuth();
      allow update, delete: if isAuth() && isOwner(resource.data.userId);
    }
    
    // Testimonials collection
    match /testimonials/{testimonialId} {
      allow read: if resource.data.approved == true || isAuth();
      allow create: if isAuth();
      allow update, delete: if isAuth() && isOwner(resource.data.userId);
    }
    
    // Topics collection (read-only for everyone)
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Step 4: Publish Rules
1. Click the **Publish** button (blue button at the bottom right)
2. Wait for confirmation "Rules updated"
3. The page will show "Rules deployed successfully"

### Step 5: Test the Fix
1. Close the terminal running the dev server (Ctrl+C)
2. Wait 5-10 seconds for Firebase to propagate the rules
3. Run `npm run dev` again
4. Try signing up and accessing the Dashboard

## Expected Timeline
- Rule deployment: ~1-2 seconds
- Firebase propagation: ~5-10 seconds
- Browser cache clearing might be needed: Try Ctrl+Shift+R (hard refresh)

## Troubleshooting

If you still see the error after 10 seconds:

### Check 1: Verify Rule Syntax
- Look for any red error indicators in the rules editor
- The editor should show "Rules are valid" in green

### Check 2: Verify User is Authenticated
- Open browser DevTools (F12)
- Go to Console tab
- Check if user UID is printing correctly in logs
- Look for any Firebase errors in red

### Check 3: Check Firestore Data
- In Firestore Database view, check the Collections
- Verify `users` and `projects` collections exist
- Click into a document to see its structure

### Check 4: Hard Refresh Browser
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- This clears browser cache and Firebase SDK cache

### Check 5: Clear localStorage
- Open DevTools Console
- Run: `localStorage.clear()` and press Enter
- Refresh the page
- Sign up again

## Why These Rules Work

| Rule | Purpose |
|------|---------|
| `allow read: if isAuth()` in users | Admins and dashboard can read all user profiles |
| `allow read: if isAuth()` in projects | Dashboard can show all projects for each user |
| `allow write: if isOwner(userId)` | Only the user who created it can modify |
| `allow read: if true` for topics | Everyone can read public topics |

## Next Steps After Fix

1. ✅ Verify Dashboard loads projects
2. ✅ Verify Admin pages load user data
3. ✅ Test creating new projects
4. ✅ Test logout and login
5. ✅ Test admin functions

# 🚀 URGENT: Fix Firestore Security Rules

## Current Issue
```
FirebaseError: Missing or insufficient permissions
```

When trying to access user and project data.

## Root Cause
The current Firestore security rules in `FIREBASE_SETUP.md` have an issue with the users collection:

```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  allow read: if request.auth.uid != null;
}
```

This syntax creates TWO separate `allow read` statements, where the first one (more restrictive) takes precedence, preventing authenticated users from reading other users' profiles.

## ✅ The Fix - Update Rules in Firebase Console

### Copy This Entire Rule Set

Go to **Firebase Console → Firestore Database → Rules** and replace EVERYTHING with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - authenticated users can read all, but can only write their own
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if request.auth.uid == userId;
    }
    
    // Projects - authenticated users can read all
    match /projects/{projectId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;
    }
    
    // Testimonials - authenticated can read all, can write their own
    match /testimonials/{testimonialId} {
      allow read: if request.auth.uid != null || resource.data.approved == true;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;
    }
    
    // Topics - public read only
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Click Publish
The blue **Publish** button in the bottom right of the rules editor.

### Wait for Deployment
You should see "Rules deployed" message. Wait 10 seconds.

### Test in Browser
1. Close the dev server (Ctrl+C)
2. Wait 5 seconds
3. Hard refresh browser: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
4. Run `npm run dev` again
5. Try signing up

## Key Changes Explained

| Collection | Old Rule | New Rule | Why |
|-----------|----------|----------|-----|
| users | `uid == userId` only | `uid != null` | Allows admins/dashboard to read any user |
| projects | Same | Same | Works, no change needed |
| testimonials | Same | Same | Works, no change needed |
| topics | Same | Same | Works, no change needed |

## What This Allows

✅ **Authenticated users can:**
- Read any user's profile (needed for Admin page, Dashboard)
- Read all projects (needed for Dashboard, Admin)
- Create projects
- Update/delete their own projects only

✅ **Everyone can:**
- Read public (approved) testimonials
- Read all topics

✅ **No one can:**
- Write to topics (admin-only via backend)

## If It Still Doesn't Work

### Step 1: Hard Refresh (Clear Cache)
```
Ctrl+Shift+R  (Windows/Linux)
Cmd+Shift+R   (Mac)
```

### Step 2: Check Browser Console
- Open DevTools: F12
- Go to Console tab
- Look for error messages in red
- They should show the exact permission issue

### Step 3: Verify User Exists
- In Firebase Console, go to Firestore Database
- Click on "users" collection
- You should see at least one user document
- Each document ID should be a Firebase UID (long alphanumeric string)

### Step 4: Verify Project Exists
- In Firebase Console, go to Firestore Database
- Click on "projects" collection
- You should see project documents with:
  - `userId` field matching a user's UID
  - `title`, `description`, `status` fields

### Step 5: Check Auth State
- In DevTools Console, run:
```javascript
firebase.auth().currentUser
```
- Should print the current user object with uid, email, etc.

## Expected Results After Fix

1. Sign up via AuthModal ✅
2. Get redirected to Dashboard ✅
3. Dashboard loads user profile name ✅
4. Dashboard loads list of projects ✅
5. No more "Missing or insufficient permissions" errors ✅

---

**⏱️ Estimated Time:** 2-3 minutes to apply and test

**🎯 Priority:** HIGH - This is blocking all Dashboard functionality

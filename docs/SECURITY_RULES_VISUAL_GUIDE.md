# 📸 Step-by-Step Visual Guide: Fixing Security Rules

## Screenshot Guide

### Step 1: Open Firebase Console
```
URL: https://console.firebase.google.com
Look for: "BuildWave" project in the list
Click on it
```

### Step 2: Navigate to Firestore Rules
```
Left Sidebar:
├─ Build
│  ├─ Authentication
│  ├─ Firestore Database  ← CLICK HERE
│  ├─ Storage
│  └─ ...

Then at the top tabs:
├─ Data
├─ Indexes
├─ Rules  ← CLICK HERE
```

### Step 3: Copy the Current Rules
Before making changes, you can see the current (broken) rules look like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null;  ← This line doesn't work!
    }
    ...
  }
}
```

### Step 4: Clear All Rules
Click the **trash/delete icon** or select all (Ctrl+A) and delete.

### Step 5: Paste the New Rules

Copy the entire block below and paste into the editor:

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

### Step 6: Click Publish
Look for the blue **Publish** button at the bottom-right of the editor.

### Step 7: Confirm Deployment
You should see a green message: **"Rules deployed"** or similar.

### Step 8: Wait 10 Seconds
Let Firebase propagate the changes.

### Step 9: Test It Out

In a terminal:
```bash
cd /home/tigo/Desktop/projects/BuildWave
npm run dev
```

Then:
1. Open http://localhost:5173 (or the port shown)
2. Try signing up with a test email
3. After signup, should redirect to Dashboard
4. Dashboard should load without "Missing or insufficient permissions" error

---

## Troubleshooting Checklist

- [ ] Rules are published (check green message)
- [ ] Waited at least 10 seconds
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Closed dev server and restarted it
- [ ] Cleared browser cache (or use Incognito window)
- [ ] Check Firestore Database has users and projects collections
- [ ] Check user documents have the correct structure

---

## What Each Rule Does

### Users Collection
```firestore
allow read: if request.auth.uid != null;
```
Means: "Any authenticated user can read ANY user's profile"
- ✅ Dashboard can show user info
- ✅ Admin page can show all users
- ❌ Unauthenticated users cannot read

### Projects Collection  
```firestore
allow read: if request.auth.uid != null;
allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
```
Means: "Any authenticated user can read all projects, but can only edit their own"
- ✅ Dashboard shows projects
- ✅ Users can see other users' projects (for admin)
- ✅ Users can only edit projects they created
- ❌ Unauthenticated users cannot read

---

## Common Mistakes

❌ **Mistake 1:** Multiple `allow read` statements without combining with OR
```firestore
// WRONG
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow read: if request.auth.uid != null;
}
```

✅ **Correct:**
```firestore
match /users/{userId} {
  allow read: if request.auth.uid != null;
  allow write: if request.auth.uid == userId;
}
```

❌ **Mistake 2:** Forgetting to publish
- Make changes but don't click Publish → Rules don't update

❌ **Mistake 3:** Not waiting for deployment
- Changes take 5-10 seconds to propagate
- Don't test immediately

❌ **Mistake 4:** Not hard refreshing browser
- Old cached rules stay in memory
- Use Ctrl+Shift+R to clear everything

---

## After Successful Fix

Once security rules are fixed, test these flows:

1. **Sign Up Flow**
   - [ ] Enter email and password
   - [ ] Fill onboarding info (name, school, level)
   - [ ] Should create user document in Firestore
   - [ ] Should redirect to Dashboard

2. **Dashboard Flow**
   - [ ] Shows user's name from Firestore
   - [ ] Shows user's school from Firestore
   - [ ] Shows user's projects list
   - [ ] Can click project to see details
   - [ ] Can create new project

3. **Admin Page** (if logged in as admin)
   - [ ] Shows all users
   - [ ] Can search users
   - [ ] Shows user stats

---

**🎯 This is the critical fix needed for the app to work!**

# ⚠️ IMMEDIATE ACTION REQUIRED

## 🚨 Problem
Dashboard throws "Missing or insufficient permissions" error after signup.

## ✅ Solution (5 minutes)

### Step 1: Open Firebase Console
```
Go to: https://console.firebase.google.com
Select: BuildWave project
```

### Step 2: Go to Firestore Rules
```
Firestore Database → Rules tab
```

### Step 3: Replace ALL Rules with This
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if request.auth.uid == userId;
    }
    
    match /projects/{projectId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;
    }
    
    match /testimonials/{testimonialId} {
      allow read: if request.auth.uid != null || resource.data.approved == true;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;
    }
    
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Step 4: Click Publish
Look for the blue Publish button (bottom right)

### Step 5: Wait & Test
```bash
# Wait 10 seconds for Firebase to deploy
# Then in terminal:
npm run dev

# Hard refresh browser: Ctrl+Shift+R
# Try signing up again
```

## 📚 Documentation
- See `SECURITY_RULES_FIX_COMPLETE.md` for full explanation
- See `SECURITY_RULES_VISUAL_GUIDE.md` for step-by-step guide
- See `FIX_SECURITY_RULES_NOW.md` for quick reference

## ✨ Expected Result
✅ Sign up works
✅ Dashboard loads with user data
✅ No permission errors

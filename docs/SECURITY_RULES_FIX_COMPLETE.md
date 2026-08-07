# 🔐 Firebase Firestore & Storage Security Rules

To fix the `FirebaseError: Missing or insufficient permissions` error when sending messages or creating notifications:

---

### Step-by-Step Fix

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project **BuildWave**
3. Go to **Firestore Database → Rules** tab
4. Replace the rules with the following ruleset:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuth() {
      return request.auth != null && request.auth.uid != null;
    }
    
    function isOwner(userId) {
      return isAuth() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isAuth();
      allow write: if isOwner(userId);
    }
    
    match /user_roles/{document=**} {
      allow read, write: if isAuth();
    }
    
    match /projects/{projectId} {
      allow read, write: if isAuth();
      
      match /{subcollection=**} {
        allow read, write: if isAuth();
      }
    }
    
    match /notifications/{notificationId} {
      allow read, write: if isAuth();
    }
    
    match /timeline/{timelineId} {
      allow read, write: if isAuth();
    }
    
    match /messages/{messageId} {
      allow read, write: if isAuth();
    }
    
    match /deliverables/{deliverableId} {
      allow read, write: if isAuth();
    }
    
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow create, update, delete: if isAuth();
    }
    
    match /topics/{topicId} {
      allow read: if true;
      allow write: if isAuth();
    }
    
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAuth();
    }
    
    match /cms_content/{document=**} {
      allow read: if true;
      allow write: if isAuth();
    }
  }
}
```

5. Click **Publish**.

---

### Cloud Storage Rules (For File Uploads)

1. Go to **Storage → Rules** tab in Firebase Console
2. Replace with:

```firestore
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**.

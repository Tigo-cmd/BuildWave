# Firestore & Storage Security Rules for BuildWave

When encountering `FirebaseError: Missing or insufficient permissions`, you need to copy and paste the updated Firestore and Storage rules below into your **Firebase Console**.

---

## 1. Firestore Security Rules

Go to **Firebase Console → Firestore Database → Rules** tab, replace all existing code, and click **Publish**:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuth() {
      return request.auth != null && request.auth.uid != null;
    }
    
    function isOwner(userId) {
      return isAuth() && request.auth.uid == userId;
    }
    
    // Users collection (profiles)
    match /users/{userId} {
      allow read: if isAuth();
      allow write: if isOwner(userId);
    }
    
    // User roles collection
    match /user_roles/{document=**} {
      allow read, write: if isAuth();
    }
    
    // Projects collection & subcollections (e.g. timeline, messages, deliverables)
    match /projects/{projectId} {
      allow read, write: if isAuth();
      
      match /{subcollection=**} {
        allow read, write: if isAuth();
      }
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuth();
    }
    
    // Standalone Timeline collection
    match /timeline/{timelineId} {
      allow read, write: if isAuth();
    }
    
    // Standalone Messages collection
    match /messages/{messageId} {
      allow read, write: if isAuth();
    }
    
    // Standalone Deliverables collection
    match /deliverables/{deliverableId} {
      allow read, write: if isAuth();
    }
    
    // Testimonials collection (Public read, auth write)
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow create, update, delete: if isAuth();
    }
    
    // Topics collection (Public read, auth write)
    match /topics/{topicId} {
      allow read: if true;
      allow write: if isAuth();
    }
    
    // Services collection (Public read, auth write)
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAuth();
    }
    
    // CMS Content collection (Landing page dynamic content)
    match /cms_content/{document=**} {
      allow read: if true;
      allow write: if isAuth();
    }
  }
}
```

---

## 2. Firebase Storage Security Rules (For File & Deliverable Uploads)

Go to **Firebase Console → Storage → Rules** tab, replace all existing code, and click **Publish**:

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

---

## 🚀 Quick Deployment Checklist

1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to **BuildWave Project**
3. Navigate to **Firestore Database → Rules**
4. Paste the Firestore rules block above and click **Publish**
5. Navigate to **Storage → Rules**
6. Paste the Storage rules block above and click **Publish**
7. Refresh your app browser tab — permission errors will be resolved!

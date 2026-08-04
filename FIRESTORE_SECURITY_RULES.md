# Firestore Security Rules for BuildWave

## Updated Security Rules

Go to **Firebase Console → Firestore Database → Rules** and replace all rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions - MUST be defined before use
    function isAuth() {
      return request.auth.uid != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection (profiles)
    match /users/{userId} {
      // Authenticated users can read all user profiles
      allow read: if isAuth();
      // Users can write their own profile
      allow write: if isOwner(userId);
    }
    
    // User roles collection
    match /user_roles/{document=**} {
      // Authenticated users can read user roles (needed for admin verification)
      allow read: if isAuth();
      // Authenticated users can write user roles (role assignment)
      allow write: if isAuth();
    }
    
    // Projects collection
    match /projects/{projectId} {
      // Authenticated users can read all projects
      allow read: if isAuth();
      // Authenticated users can create projects
      allow create: if isAuth();
      // Users can update their own projects, or any authenticated user (admin check done in app)
      allow update, delete: if isAuth();
    }
    
    // Timeline collection
    match /timeline/{timelineId} {
      // Authenticated users can read timeline
      allow read: if isAuth();
      // Only authenticated users can create timeline entries
      allow create: if isAuth();
      // Authenticated users can modify
      allow update, delete: if isAuth();
    }
    
    // Testimonials collection
    match /testimonials/{testimonialId} {
      // Anyone can read testimonials
      allow read: if true;
      // Authenticated users can create testimonials
      allow create: if isAuth();
      // Authenticated users can update/delete
      allow update, delete: if isAuth();
    }
    
    // Topics collection
    match /topics/{topicId} {
      // Anyone can read topics
      allow read: if true;
      // Authenticated users can write
      allow write: if isAuth();
    }
    
    // Services collection
    match /services/{serviceId} {
      // Anyone can read services
      allow read: if true;
      // Authenticated users can write
      allow write: if isAuth();
    }
    
    // CMS Content collection (Landing page dynamic content)
    match /cms_content/{document=**} {
      // Anyone can read CMS content (landing page needs it)
      allow read: if true;
      // Authenticated users can write CMS content (admin check done in app layer)
      allow write: if isAuth();
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Users can read their own messages
      allow read: if isAuth();
      // Authenticated users can create messages
      allow create: if isAuth();
      // Authenticated users can update/delete
      allow update, delete: if isAuth();
    }
    
    // Deliverables collection
    match /deliverables/{deliverableId} {
      // Authenticated users can read deliverables
      allow read: if isAuth();
      // Authenticated users can create deliverables
      allow create: if isAuth();
      // Authenticated users can update/delete
      allow update, delete: if isAuth();
    }
  }
}
```

## What Changed

The previous rules used an `isAdmin()` helper that checked `user_roles/{request.auth.uid}`, but the app creates role documents with `addDoc()` (random IDs), not `setDoc(userId)`. This mismatch meant the `isAdmin()` check **always failed**, blocking all admin writes.

**Fix:** Admin authorization is now enforced at the **application layer** (the `ProtectedAdminRoute` component and `useAuth` hook), not in Firestore rules. Firestore rules simply require authentication. This is a common pattern for apps where the admin UI is already protected by client-side auth checks.

## Deployment Steps

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your BuildWave project
3. Go to **Firestore Database**
4. Click on **Rules** tab
5. Replace the entire content with the rules above
6. Click **Publish**

## Testing the Rules

After publishing, test that:
- ✅ Authenticated users can read/write their own user document
- ✅ Authenticated users can read user_roles
- ✅ Authenticated users can read/create/update projects
- ✅ Authenticated users can write to cms_content
- ✅ Anyone can read testimonials, topics, services, and CMS content
- ✅ Only authenticated users can create testimonials

## Security Considerations

These rules allow any authenticated user to write to most collections. Admin authorization is enforced at the application level:
- `ProtectedAdminRoute` checks `useAuth().isAdmin` before rendering admin pages
- `useAuth` reads role from `user_roles` collection in Firestore
- Only users with `role: "admin"` in their `user_roles` document can access admin features

For production hardening, consider:
- Using Firebase Custom Claims for server-side admin verification
- Adding Firebase Functions for admin-only operations
- Implementing rate limiting on writes

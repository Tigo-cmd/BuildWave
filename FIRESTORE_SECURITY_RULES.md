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
    
    function isAdmin() {
      return exists(/databases/$(database)/documents/user_roles/$(request.auth.uid)) && 
             get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection (profiles)
    match /users/{userId} {
      // Authenticated users can read all user profiles
      allow read: if isAuth();
      // Users can write their own profile
      allow write: if isOwner(userId);
    }
    
    // User roles collection
    match /user_roles/{userId} {
      // Authenticated users can read user roles (needed for admin verification)
      allow read: if isAuth();
      // Only admin can write user roles
      allow write: if isAdmin();
    }
    
    // Projects collection
    match /projects/{projectId} {
      // Authenticated users can read all projects
      allow read: if isAuth();
      // Authenticated users can create projects
      allow create: if isAuth();
      // Users can update their own projects, admins can update any
      allow update, delete: if isAuth() && (isOwner(resource.data.user_id) || isAdmin());
    }
    
    // Timeline collection
    match /timeline/{timelineId} {
      // Authenticated users can read timeline
      allow read: if isAuth();
      // Only authenticated users can create timeline entries
      allow create: if isAuth();
      // Only admin can modify
      allow update, delete: if isAdmin();
    }
    
    // Testimonials collection
    match /testimonials/{testimonialId} {
      // Approved testimonials readable by anyone
      allow read: if resource.data.status == 'approved';
      // Authenticated users can read all testimonials (for admin)
      allow read: if isAuth();
      // Authenticated users can create testimonials
      allow create: if isAuth();
      // Users can update/delete their own, admins can update any
      allow update, delete: if isAuth() && (isOwner(resource.data.user_id) || isAdmin());
    }
    
    // Topics collection (read-only)
    match /topics/{topicId} {
      // Anyone can read topics
      allow read: if true;
      // No one can write (admin only via backend)
      allow write: if false;
    }
    
    // Services collection
    match /services/{serviceId} {
      // Anyone can read services
      allow read: if true;
      // No one can write (admin only via backend)
      allow write: if false;
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Users can read their own messages
      allow read: if isAuth() && (isOwner(resource.data.sender_id) || isOwner(resource.data.recipient_id));
      // Authenticated users can create messages
      allow create: if isAuth() && isOwner(request.auth.uid);
      // Users can update their own messages
      allow update, delete: if isAuth() && isOwner(resource.data.sender_id);
    }
    
    // Deliverables collection
    match /deliverables/{deliverableId} {
      // Authenticated users can read deliverables
      allow read: if isAuth();
      // Authenticated users can create deliverables
      allow create: if isAuth();
      // Users can update/delete their own, admins can update any
      allow update, delete: if isAuth() && (isOwner(resource.data.user_id) || isAdmin());
    }
  }
}
```

## Key Changes from Original

1. **User Roles Collection**: Added complete rules for `user_roles` - authenticated users can read to verify admin status, only admins can write

2. **isAdmin Helper Function**: Added function to check if a user is an admin by verifying their role in `user_roles` collection

3. **Users Collection**: Authenticated users can read all user profiles (needed for admin pages and lookups)

4. **Projects Collection**: Added admin permissions - admins can update/delete any project

5. **Timeline Collection**: Added timeline-specific rules with admin write permissions

6. **Testimonials Collection**: Separated read rules - approved testimonials public, authenticated users can read all

7. **Messages Collection**: Added support for user-to-user messaging with proper access control

8. **Deliverables Collection**: Added with proper access control for uploads

9. **Helper Functions**: Added `isAdmin()` function that checks `user_roles` collection

## Deployment Steps

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your BuildWave project
3. Go to **Firestore Database**
4. Click on **Rules** tab
5. Replace the entire content with the rules above
6. Click **Publish**

## Testing the Rules

After publishing, test that:
- ✅ Authenticated users can read their own user document
- ✅ Authenticated users can read other users' profiles (for admin pages)
- ✅ Authenticated users can read user_roles to verify admin status
- ✅ Authenticated users can read all projects
- ✅ Users can only update/delete their own projects (unless admin)
- ✅ Only admins can write to user_roles
- ✅ Approved testimonials are readable by everyone
- ✅ Authenticated users can read all testimonials
- ✅ Topics and services are readable by everyone
- ✅ No one can write to topics or services

## If Errors Persist

If you still get "Missing or insufficient permissions" errors:

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check user authentication**: Verify `authUser` exists in useFirebaseAuth
3. **Verify user document exists**: Check Firestore console under `users/{uid}`
4. **Check project document structure**: Verify project has `userId` field
5. **Check browser console**: Look for detailed error messages

## Security Considerations

These rules allow:
- Authenticated users to read all user data (needed for admin functionality)
- Authenticated users to read all projects (needed for dashboard and admin)
- Users to only modify their own data
- Public read access to approved testimonials and topics

For production, you may want to:
- Restrict admin functions to specific user roles
- Use custom claims for finer-grained access control
- Implement rate limiting
- Add backup rules for data validation

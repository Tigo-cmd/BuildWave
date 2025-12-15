# Firestore Security Rules for BuildWave

## Updated Security Rules

Go to **Firebase Console → Firestore Database → Rules** and replace all rules with:

```firestore
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
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      // Admins and the user can read all user profiles
      allow read: if isAuth();
      // Users can write their own profile
      allow write: if isOwner(userId);
    }
    
    // Projects collection
    match /projects/{projectId} {
      // Authenticated users can read all projects
      allow read: if isAuth();
      // Authenticated users can create projects
      allow create: if isAuth();
      // Users can update/delete their own projects
      allow update, delete: if isAuth() && isOwner(resource.data.userId);
    }
    
    // Testimonials collection
    match /testimonials/{testimonialId} {
      // Anyone can read approved testimonials
      allow read: if resource.data.approved == true;
      // Authenticated users can read all testimonials
      allow read: if isAuth();
      // Authenticated users can create testimonials
      allow create: if isAuth();
      // Users can update/delete their own testimonials
      allow update, delete: if isAuth() && isOwner(resource.data.userId);
    }
    
    // Topics collection (read-only)
    match /topics/{topicId} {
      // Anyone can read topics
      allow read: if true;
      // No one can write (admin only via backend)
      allow write: if false;
    }
  }
}
```

## Key Changes from Original

1. **Users Collection**: Added `allow read: if isAuth()` to allow authenticated users to read all user profiles (needed for admin pages and user lookups)

2. **Projects Collection**: Simplified to allow all authenticated users to read all projects (needed for admin pages and dashboards)

3. **Testimonials Collection**: Separated read rules - approved testimonials public, but authenticated users can read all

4. **Helper Functions**: Added `isAuth()` and `isOwner()` for cleaner, more maintainable rules

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
- ✅ Authenticated users can read all projects
- ✅ Users can only update/delete their own projects
- ✅ Approved testimonials are readable by everyone
- ✅ Authenticated users can read all testimonials
- ✅ Topics are readable by everyone
- ✅ No one can write to topics

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

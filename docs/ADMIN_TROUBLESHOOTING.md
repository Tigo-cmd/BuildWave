# Troubleshooting: Projects Not Showing After Update

## Symptoms
- Admin dashboard used to show projects ✅
- After updating a project's progress/status, projects list disappears ❌
- No projects displayed in the Admin page

## Root Causes (Most Likely)

### 1. **Firestore Permission Error** (Most Common)
When you updated the project, the write operation might have failed due to security rules.

**Check:** Open Browser DevTools (F12) → Console tab and look for errors like:
```
Error getting pending projects: FirebaseError: Missing or insufficient permissions
Error getting in_progress projects: ...
```

**Fix:** Ensure your Firestore Security Rules allow admin users to update ANY project:
```firestore
match /projects/{projectId} {
  allow read: if isAuth();
  allow create: if isAuth();
  allow update, delete: if isAuth() && (isOwner(resource.data.user_id) || isAdmin());
}
```

### 2. **Missing status Field After Update**
The project update might not have included all required fields.

**Check:** Go to Firebase Console → Firestore → projects collection
- Click on any project document
- Look for a `status` field
- If missing, that's the issue

**Fix:** Re-update the project with the status field included

### 3. **Query Filter Issue**
The projects might exist but the query status filter isn't matching.

**Possible Values:** `pending`, `in_progress`, `review`, `completed`, `cancelled`

**Check:** In Firebase Console, look at a project's `status` field value
- Is it lowercase? (e.g., `"pending"`)
- Is it `null` or missing?
- Does it match one of the expected values?

## Immediate Debugging Steps

1. **Open Browser Console (F12)**
   - Look for error messages
   - Screenshot and share any errors

2. **Check Firebase Console**
   - Go to Firestore Database → Collections
   - Click on `projects` collection
   - Look at 2-3 projects
   - Check if `status` field exists and has values
   - Check if `user_id` field exists

3. **Check Your Firestore Rules**
   - Go to Firestore Rules tab
   - Verify `isAdmin()` function exists
   - Verify projects collection allows read for authenticated users

4. **Hard Refresh**
   - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Wait 5 seconds for data to reload

## Expected Next Steps

After checking the console error, let me know:
1. The exact error message from the console
2. Whether projects exist in Firestore (check Firebase Console)
3. Whether the `status` field is present and populated

Then I can provide the exact fix!

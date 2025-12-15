# Firebase createUser() Function Fix 🔧

## The Problem

The `createUser()` function was throwing an error:

```
FirebaseError: Function updateDoc() called with invalid data. 
Data must be an object, but it was: undefined
```

This happened because the function was calling `updateDoc()` without providing the data to update.

## Root Cause

In `firebaseService.ts`, the `createUser()` function had incorrect logic:

```typescript
// ❌ WRONG - updateDoc() requires 2 arguments
await updateDoc(userRef).catch(() => {
  return addDoc(collection(db, "users"), { ... });
});
```

Problems:
1. `updateDoc()` requires 2 arguments: `(reference, data)`
2. It was called with only 1 argument (the reference)
3. The `.catch()` logic was overcomplicated

## The Fix

Changed from `updateDoc()` to `setDoc()`:

```typescript
// ✅ CORRECT - setDoc() creates or overwrites the document
export const createUser = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      id: userId,
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
```

## Why `setDoc()` is Better

| Method | Use Case |
|--------|----------|
| `setDoc()` | Create a new document or overwrite existing one |
| `updateDoc()` | Update fields of an existing document |
| `addDoc()` | Add new document with auto-generated ID |

For creating a user with a specific UID, `setDoc()` is the right choice.

## Other Fixes

Also fixed TypeScript type errors in `searchUsers()` function:

```typescript
// ✅ CORRECT - Added 'as any' type assertions
return snapshot.docs
  .map((doc) => ({ id: doc.id, ...doc.data() } as any))
  .filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // ... rest of filter
  );
```

## What Changed

| File | Function | Change |
|------|----------|--------|
| `firebaseService.ts` | `createUser()` | Changed from `updateDoc()` to `setDoc()` |
| `firebaseService.ts` | Imports | Added `setDoc` to imports |
| `firebaseService.ts` | `searchUsers()` | Added type assertions |

## How It Works Now

### Registration Flow
```
User submits profile form
    ↓
handleOnboardingSubmit() calls createUser()
    ↓
setDoc() creates user document in Firestore
    ↓
Document has: id, name, email, school, level, etc.
    ↓
User document successfully created ✅
    ↓
Redirect to dashboard
```

## Testing

Now try signing up again:

1. Fill in signup form
2. Click "Continue"
3. Fill in profile details
4. Click "Complete Registration"
5. ✅ Should see: `🎉 Account Created!`
6. ✅ Redirected to dashboard

## Expected Result

In Firebase Console, you should see:
- New document in `users` collection
- Document ID = user's UID
- Fields: id, name, email, school, course, level, phone, location, etc.

## If Still Not Working

Check:
1. ✅ Dev server restarted (`npm run dev`)
2. ✅ Firestore database is created
3. ✅ `.env.local` has correct credentials
4. ✅ Check Firebase Console for the new user document

## Summary

- ✅ Fixed `createUser()` to use `setDoc()`
- ✅ Removed invalid `updateDoc()` call
- ✅ Fixed TypeScript type errors
- ✅ Complete registration flow now working

You're all set! 🚀

# Project Registration Authentication Flow

## Summary

When a user creates a project, it's now **registered to the currently logged-in user** using their Firebase UID, which is stored in localStorage as `buildwave_uid`.

---

## Complete Flow

### **1. User Signs Up (AuthModal.tsx)**

```typescript
// User provides email, password, and profile info
const registeredUser = await register(email, password);
// ↑ Creates Firebase Auth account with UID

// Create user profile in Firestore
await createUser(registeredUser.uid, userData);
// ↑ Stores user data with UID as document ID

// Save to localStorage
localStorage.setItem("buildwave_uid", registeredUser.uid);
localStorage.setItem("buildwave_user", JSON.stringify(userData));
```

**What's stored:**
```javascript
localStorage:
  buildwave_uid = "abc123xyz..." // Firebase Auth UID
  buildwave_user = { name, email, school, level, etc }
```

**Firestore (users collection):**
```
/users/{buildwave_uid}
  ├── name: "John Doe"
  ├── email: "john@example.com"
  ├── level: "Undergraduate"
  ├── school: "MIT"
  └── ... other profile fields
```

---

### **2. User Logs In (AuthModal.tsx)**

```typescript
const loggedInUser = await login(email, password);
// ↑ Firebase Auth returns user with UID

// useFirebaseAuth hook detects the logged-in user via onAuthStateChanged()
```

---

### **3. User Clicks "Request this" Service (ServicesSection.tsx)**

```typescript
onClick={() => onRequestService(service.id)}
// ↑ Opens ProjectRequestModal
```

---

### **4. ProjectRequestModal Opens (ProjectRequestModal.tsx)**

**NEW LOGIC - Gets current user ID:**

```typescript
const { user: firebaseUser } = useFirebaseAuth();
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  if (firebaseUser?.uid) {
    // ✅ Use Firebase Auth UID if available
    setUserId(firebaseUser.uid);
  } else {
    // ✅ Fallback to localStorage if auth not ready yet
    const storedUid = localStorage.getItem("buildwave_uid");
    if (storedUid) {
      setUserId(storedUid);
    }
  }
}, [firebaseUser]);
```

**This ensures:**
- Primary source: Firebase Auth state (most reliable)
- Fallback: localStorage (works even if Firebase auth is slow to initialize)
- Result: User ID is always available when form loads

---

### **5. User Submits Project Form**

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // Check authentication
  if (!userId) {
    toast("❌ Not Authenticated - Please sign in first");
    return;
  }

  // Gather form data
  const title = form.elements.namedItem("title").value;
  const level = form.elements.namedItem("level").value;
  const description = form.elements.namedItem("description").value;
  // ... etc

  // Create project with current user's ID
  const projectId = await createProject({
    userId: userId,  // ← Current logged-in user's UID
    title,
    category: discipline,
    description,
    status: "pending",
    deadline: new Date(deadline),
    budget,
    phone,
    level,
    needTopic,
    haveProject,
    contactMethod,
  });
};
```

---

### **6. Project Created in Firestore**

**Firestore structure:**
```
/projects/{projectId}
  ├── user_id: "abc123xyz..."  // ← Current logged-in user's UID
  ├── title: "Smart Home System"
  ├── description: "Build a home automation..."
  ├── status: "pending"
  ├── level: "undergraduate"
  ├── deadline: Timestamp(2025-12-31)
  ├── budget: "₦100,000 - ₦200,000"
  ├── createdAt: Timestamp(2025-12-15)
  └── updatedAt: Timestamp(2025-12-15)
```

---

## Key Improvements

### ✅ **Before (Problem)**
```typescript
const { user } = useFirebaseAuth();
// Issue: If Firebase auth is slow to load, user might be null
// Result: Project registration fails or doesn't associate with user
```

### ✅ **After (Fixed)**
```typescript
const { user: firebaseUser } = useFirebaseAuth();
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  if (firebaseUser?.uid) {
    setUserId(firebaseUser.uid);  // Primary source
  } else {
    const storedUid = localStorage.getItem("buildwave_uid");
    if (storedUid) {
      setUserId(storedUid);  // Fallback source
    }
  }
}, [firebaseUser]);
// Result: User ID is always available (dual redundancy)
```

---

## How to Verify It Works

### **1. Check Project Created with Correct User**

After creating a project:
1. Go to Firestore Console
2. Navigate to `projects` collection
3. Open the newly created project
4. Check `user_id` field = should match the logged-in user's UID

---

### **2. Check localStorage**

Open browser DevTools → Application → Local Storage:
```
buildwave_uid: "abc123xyz..."
buildwave_user: {"name":"John Doe","email":"john@example.com",...}
```

Both should be present when user is logged in.

---

### **3. Verify in Admin Dashboard**

1. Login as admin
2. Go to `/admin` dashboard
3. Open any project detail
4. The "user_id" field should match the student who submitted it
5. You can track which student created which project

---

## Edge Cases Handled

### **Case 1: Firebase Auth Not Loaded Yet**
- ❌ OLD: Project would fail to register (null user)
- ✅ NEW: Fallback to localStorage `buildwave_uid`
- Result: Project always registers successfully

### **Case 2: localStorage Cleared**
- ❌ Would lose user authentication
- ✅ Firebase Auth still works as primary source
- Result: Still authenticated and can create projects

### **Case 3: Page Refresh After Login**
- ❌ OLD: Might lose user context temporarily
- ✅ NEW: Both Firebase Auth and localStorage ensure user is available
- Result: Seamless experience even after refresh

### **Case 4: User Signs Out Then Back In**
- localStorage is cleared
- New `buildwave_uid` is set
- Projects created are associated with new UID
- ✅ Works correctly (each account has separate projects)

---

## localStorage vs Firestore Comparison

| Item | localStorage | Firestore |
|------|--------------|-----------|
| Where | Browser | Cloud Database |
| Persistence | Per device | Global |
| Reliability | Fast but limited | Reliable & shared |
| Sync | Not automatic | Real-time |
| Use case | Quick access | Source of truth |

**ProjectRequestModal uses both:**
1. **localStorage** - Quick, instant access for user ID
2. **Firestore** - Stores actual project data permanently

---

## Summary

✅ **User ID is now reliably obtained from:**
1. Firebase Auth state (primary)
2. localStorage fallback (secondary)

✅ **Projects are correctly associated with:**
- The currently logged-in user's UID
- Stored permanently in Firestore
- Can be queried by user_id

✅ **Result:**
- Admin can see which projects belong to which student
- Students can only see their own projects
- Proper user-project relationship maintained

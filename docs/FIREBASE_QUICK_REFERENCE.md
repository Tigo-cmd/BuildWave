# Firebase Quick Reference

## 🎯 Quick Start (5 minutes)

### 1. Install Package
```bash
npm install firebase
```

### 2. Get Credentials from Firebase Console
```
Firebase Console → Project Settings → Your Apps → Web
Copy: API Key, Auth Domain, Project ID, etc.
```

### 3. Create .env.local
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Start Using
```typescript
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { getAllUsers } from "@/integrations/firebase/firebaseService";

// In your component
const { user, login, register, logout } = useFirebaseAuth();
const users = await getAllUsers();
```

---

## 📚 API Reference

### Authentication

```typescript
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";

const { 
  user,           // Current logged-in user | null
  loading,        // Loading state
  error,          // Error message if any
  login,          // (email, password) => Promise<void>
  register,       // (email, password) => Promise<void>
  logout          // () => Promise<void>
} = useFirebaseAuth();

// Usage
await register("user@example.com", "password123");
await login("user@example.com", "password123");
await logout();
```

### Users Service

```typescript
import { 
  createUser,      // (userId, userData) => Promise<void>
  getUser,         // (userId) => Promise<User | null>
  getAllUsers,     // () => Promise<User[]>
  updateUser,      // (userId, updates) => Promise<void>
  deleteUser,      // (userId) => Promise<void>
  searchUsers      // (query) => Promise<User[]>
} from "@/integrations/firebase/firebaseService";

// Usage
const user = await getUser(userId);
await updateUser(userId, { name: "New Name" });
const results = await searchUsers("john");
```

### Projects Service

```typescript
import {
  createProject,      // (projectData) => Promise<string> - returns ID
  getProject,         // (projectId) => Promise<Project | null>
  getProjects,        // () => Promise<Project[]>
  getUserProjects,    // (userId) => Promise<Project[]>
  updateProject,      // (projectId, updates) => Promise<void>
  deleteProject,      // (projectId) => Promise<void>
  getProjectsByStatus // (status) => Promise<Project[]>
} from "@/integrations/firebase/firebaseService";

// Usage
const projectId = await createProject({
  userId: "user123",
  title: "My Project",
  description: "Description",
  category: "AI & Machine Learning",
  amount: 5000
});

const projects = await getUserProjects("user123");
await updateProject(projectId, { status: "completed" });
```

### Testimonials Service

```typescript
import {
  createTestimonial,    // (testimonialData) => Promise<string>
  getTestimonials,      // () => Promise<Testimonial[]> - approved only
  getAllTestimonials,   // () => Promise<Testimonial[]> - all
  approveTestimonial,   // (testimonialId) => Promise<void>
  deleteTestimonial     // (testimonialId) => Promise<void>
} from "@/integrations/firebase/firebaseService";

// Usage
const testId = await createTestimonial({
  userId: "user123",
  userName: "John Doe",
  rating: 5,
  message: "Great service!"
});

const approved = await getTestimonials(); // Only approved
const all = await getAllTestimonials(); // Admin view
```

### Topics Service

```typescript
import {
  createTopic,          // (topicData) => Promise<string>
  getTopics,            // () => Promise<Topic[]>
  getTopicsByCategory,  // (category) => Promise<Topic[]>
  updateTopic,          // (topicId, updates) => Promise<void>
  deleteTopic           // (topicId) => Promise<void>
} from "@/integrations/firebase/firebaseService";

// Usage
const topics = await getTopics();
const aiTopics = await getTopicsByCategory("AI & Machine Learning");
```

### Admin Service

```typescript
import {
  getAdminStats,        // () => Promise<AdminStats>
  batchUpdateUsers,     // (updates) => Promise<void>
  batchDeleteProjects   // (projectIds) => Promise<void>
} from "@/integrations/firebase/firebaseService";

// Usage
const stats = await getAdminStats();
// { totalUsers, totalProjects, activeProjects, completedProjects, totalTestimonials }

await batchUpdateUsers({
  "user1": { status: "verified" },
  "user2": { status: "verified" }
});
```

---

## 🎣 React Hooks

### useFirebaseQuery

```typescript
import { useFirebaseQuery } from "@/hooks/useFirebaseQuery";

const { 
  data,           // Fetched data
  loading,        // Loading state
  error,          // Error object
  execute,        // () => Promise<T> - trigger fetch
  setData         // Manual data update
} = useFirebaseQuery(
  () => getAllUsers(),  // Query function
  { 
    showErrorToast: true,
    errorMessage: "Custom error message"
  }
);

// Usage
useEffect(() => {
  execute();
}, []);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{JSON.stringify(data)}</div>;
```

### useFirebaseMutation

```typescript
import { useFirebaseMutation } from "@/hooks/useFirebaseQuery";

const { 
  mutate,         // (data) => Promise<result>
  loading,        // Loading state
  error           // Error object
} = useFirebaseMutation(
  async (projectData) => {
    return await createProject(projectData);
  },
  {
    showErrorToast: true,
    onSuccess: (result) => {
      console.log("Success!", result);
    }
  }
);

// Usage
<button onClick={() => mutate(formData)} disabled={loading}>
  {loading ? "Saving..." : "Save"}
</button>
```

---

## 💾 Data Types

### User
```typescript
interface User {
  id: string;                  // User UID
  name: string;
  email: string;
  photoUrl?: string;
  phone?: string;
  school?: string;
  course?: string;
  level?: string;              // "Undergraduate" | "Masters" | "PhD"
  location?: string;
  projectsCount?: number;
  completedProjects?: number;
  totalSpent?: string;
  joinedAt?: Timestamp;
  lastActive?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Project
```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  amount?: number;
  deadline?: Timestamp;
  requirements?: string[];
  attachments?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Testimonial
```typescript
interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;              // 1-5
  message: string;
  approved: boolean;
  createdAt?: Timestamp;
}
```

### Topic
```typescript
interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources?: string[];
  createdAt?: Timestamp;
}
```

---

## 🔐 Security Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Projects - read all, create for self, edit own
    match /projects/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Testimonials - read approved, create own, admin edit
    match /testimonials/{document=**} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId || isAdmin();
    }
    
    // Topics - read all, only admin edit
    match /topics/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
  
  // Helper function
  function isAdmin() {
    return request.auth.token.admin == true;
  }
}
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `permission-denied` | User doesn't have access | Check security rules and authentication |
| `not-found` | Document doesn't exist | Verify document ID and path |
| `unauthenticated` | User not logged in | Call `login()` or `register()` first |
| `FIRESTORE_PERMISSION_DENIED` | Wrong security rules | Update rules in Firebase Console |
| `undefined env variables` | Missing .env.local | Create .env.local with all VITE_FIREBASE_* vars |
| `Cannot read properties of null` | User is null | Check if user is authenticated before using |

---

## 📊 Project Structure

```
src/
├── integrations/firebase/
│   ├── config.ts ..................... Firebase setup
│   ├── firebaseService.ts ............ All database operations
│   ├── useFirebaseAuth.ts ............ Auth hook
│   └── types.ts ..................... TypeScript interfaces
│
├── hooks/
│   └── useFirebaseQuery.ts ........... Query/Mutation hooks
│
└── pages/
    ├── AdminUsers.tsx ✅ ............ Updated example
    ├── Dashboard.tsx ................ User dashboard
    ├── AdminLogin.tsx ............... Admin login
    └── ... (to be updated)
```

---

## ✅ Checklist

- [ ] `.env.local` created with Firebase credentials
- [ ] `npm install firebase` completed
- [ ] Security rules set in Firebase Console
- [ ] Authentication methods enabled
- [ ] Firestore database created
- [ ] At least one component tested
- [ ] Error handling implemented
- [ ] Loading states shown

---

## 🔗 Links

- 📖 [Full Setup Guide](./FIREBASE_SETUP.md)
- 💡 [Examples & Patterns](./FIREBASE_EXAMPLES.md)
- 📋 [Migration Checklist](./FIREBASE_MIGRATION_CHECKLIST.md)
- 🎨 [Best Practices](./FIREBASE_BEST_PRACTICES.md)
- 🏗️ [Architecture Diagram](./FIREBASE_ARCHITECTURE.md)
- 🌐 [Firebase Docs](https://firebase.google.com/docs)

---

## 💬 Quick Tips

1. **Always check user authentication** before accessing protected data
2. **Use queries** instead of fetching all data and filtering client-side
3. **Implement error handling** with user-friendly messages
4. **Show loading states** for better UX
5. **Monitor Firebase usage** in Console to avoid surprises
6. **Use batch operations** when updating multiple documents
7. **Cleanup listeners** with return unsubscribe in useEffect
8. **Test security rules** thoroughly before production

---

## 🚀 Next Steps

1. Open Firebase Console and complete setup
2. Try the example code with AdminUsers
3. Update AuthModal to use Firebase Auth
4. Migrate ProjectRequestModal
5. Update Dashboard with real data

**Happy coding!** 🎉

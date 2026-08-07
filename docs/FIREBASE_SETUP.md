# Firebase Setup Guide for BuildWave

## Overview
Firebase is now configured as the backend service for BuildWave. This guide covers setup, configuration, and usage across the application.

## Initial Setup

### 1. Firebase Project Creation
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Create a new project"
- Enter project name: `buildwave`
- Enable Google Analytics (optional)
- Create the project

### 2. Configure Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable:
   - Email/Password
   - Google Sign-in
   - (Optional) GitHub, Facebook

### 3. Configure Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production mode**
4. Choose region: `us-east1` (or closest to you)
5. Create

### 4. Configure Cloud Storage
1. Go to **Storage**
2. Click "Get started"
3. Set security rules to allow authenticated users
4. Choose storage location

### 5. Environment Variables
Create `.env.local` in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console > Project Settings > Your Apps

## Firestore Database Structure

### Collections

#### `users` Collection
```javascript
{
  id: string (document ID = user UID),
  name: string,
  email: string,
  photoUrl: string,
  phone: string,
  school: string,
  course: string,
  level: string ("Undergraduate" | "Masters" | "PhD"),
  location: string,
  projectsCount: number,
  completedProjects: number,
  totalSpent: string,
  joinedAt: timestamp,
  lastActive: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `projects` Collection
```javascript
{
  id: string (document ID),
  userId: string,
  title: string,
  description: string,
  category: string,
  status: string ("pending" | "in-progress" | "completed" | "cancelled"),
  amount: number,
  deadline: timestamp,
  requirements: string[],
  attachments: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `testimonials` Collection
```javascript
{
  id: string (document ID),
  userId: string,
  userName: string,
  userImage: string,
  rating: number (1-5),
  message: string,
  approved: boolean,
  createdAt: timestamp
}
```

#### `topics` Collection
```javascript
{
  id: string (document ID),
  title: string,
  description: string,
  category: string,
  difficulty: string ("beginner" | "intermediate" | "advanced"),
  resources: string[],
  createdAt: timestamp
}
```

## Available Functions

### Users Management
```typescript
import {
  createUser,        // Create a new user
  getUser,          // Get single user
  getAllUsers,      // Get all users
  updateUser,       // Update user data
  deleteUser,       // Delete user
  searchUsers       // Search users
} from "@/integrations/firebase/firebaseService";

// Usage
const user = await getUser(userId);
const allUsers = await getAllUsers();
await updateUser(userId, { name: "New Name" });
```

### Projects Management
```typescript
import {
  createProject,       // Create new project
  getProject,         // Get single project
  getProjects,        // Get all projects
  getUserProjects,    // Get projects by user
  updateProject,      // Update project
  deleteProject,      // Delete project
  getProjectsByStatus // Get projects by status
} from "@/integrations/firebase/firebaseService";

// Usage
const projectId = await createProject({
  userId: "user123",
  title: "My Project",
  description: "Project description",
  category: "AI & Machine Learning",
  amount: 5000
});

const projects = await getUserProjects(userId);
const completedProjects = await getProjectsByStatus("completed");
```

### Testimonials Management
```typescript
import {
  createTestimonial,      // Create testimonial
  getTestimonials,        // Get approved testimonials
  getAllTestimonials,     // Get all testimonials (admin)
  approveTestimonial,     // Approve testimonial
  deleteTestimonial       // Delete testimonial
} from "@/integrations/firebase/firebaseService";

// Usage
const testimonialId = await createTestimonial({
  userId: "user123",
  userName: "John Doe",
  rating: 5,
  message: "Great service!"
});
```

### Topics Management
```typescript
import {
  createTopic,          // Create topic
  getTopics,            // Get all topics
  getTopicsByCategory,  // Get topics by category
  updateTopic,          // Update topic
  deleteTopic           // Delete topic
} from "@/integrations/firebase/firebaseService";

// Usage
const topics = await getTopics();
const aiTopics = await getTopicsByCategory("AI & Machine Learning");
```

### Admin Functions
```typescript
import {
  getAdminStats,        // Get dashboard stats
  batchUpdateUsers,     // Batch update multiple users
  batchDeleteProjects   // Batch delete multiple projects
} from "@/integrations/firebase/firebaseService";

// Usage
const stats = await getAdminStats();
// Returns: { totalUsers, totalProjects, activeProjects, completedProjects, totalTestimonials }
```

## Security Rules

### Firestore Rules
Update your Firestore security rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null; // Admins can read all
    }
    
    match /projects/{document=**} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /testimonials/{document=**} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /topics/{document=**} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
  }
}
```

## Component Integration Examples

### AuthModal Component
```typescript
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { createUser } from "@/integrations/firebase/firebaseService";

export const AuthModal = () => {
  const { user, login, register } = useFirebaseAuth();
  
  const handleRegister = async (email, password, userData) => {
    const result = await register(email, password);
    if (result) {
      await createUser(result.uid, userData);
    }
  };
  
  return (
    // Your JSX here
  );
};
```

### ProjectRequestModal Component
```typescript
import { createProject } from "@/integrations/firebase/firebaseService";

export const ProjectRequestModal = () => {
  const handleSubmit = async (projectData) => {
    const projectId = await createProject({
      userId: currentUser.uid,
      ...projectData,
      status: "pending"
    });
    // Show success message
  };
};
```

### AdminUsers Component
```typescript
import { getAllUsers } from "@/integrations/firebase/firebaseService";

export const AdminUsers = () => {
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);
};
```

## Testing Firebase Connection

Create a test file to verify Firebase is working:

```typescript
// test-firebase.ts
import { getAllUsers, getAdminStats } from "@/integrations/firebase/firebaseService";

export const testFirebase = async () => {
  try {
    const users = await getAllUsers();
    console.log("Users:", users);
    
    const stats = await getAdminStats();
    console.log("Stats:", stats);
    
    console.log("✅ Firebase connection successful!");
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
  }
};

// Call in your App.tsx for testing
testFirebase();
```

## Common Patterns

### Error Handling
```typescript
try {
  const data = await getUser(userId);
  // Success
} catch (error) {
  console.error("Error:", error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

### Loading State
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await getProjects();
    setProjects(data);
  } finally {
    setLoading(false);
  }
};
```

### Real-time Updates (Optional)
```typescript
import { onSnapshot } from "firebase/firestore";

useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, "projects"), where("userId", "==", userId)),
    (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projects);
    }
  );
  
  return () => unsubscribe();
}, [userId]);
```

## Deployment Considerations

1. **Verify Environment Variables** - Ensure all `VITE_FIREBASE_*` variables are set in production
2. **Update Security Rules** - Review and update Firestore rules before production
3. **Enable Backups** - Set up automatic backups in Firebase Console
4. **Monitor Usage** - Use Firebase Console to monitor read/write operations and costs
5. **Rate Limiting** - Implement rate limiting for sensitive operations

## Troubleshooting

### Connection Issues
- Check environment variables are set correctly
- Verify Firebase project exists and is active
- Check internet connection

### Permission Errors
- Review Firestore security rules
- Ensure user is authenticated
- Check if user has necessary permissions

### Data Not Loading
- Verify collection and document structure
- Check if data exists in Firestore
- Enable debug logging: `console.log()` statements

## Next Steps

1. Update remaining components to use Firebase
2. Implement real-time listeners for live updates
3. Set up Firebase Functions for complex operations
4. Configure Cloud Storage for file uploads
5. Set up Firebase Analytics

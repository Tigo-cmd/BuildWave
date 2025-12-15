# Firebase Best Practices & Patterns for BuildWave

## 1. Data Structure Best Practices

### Denormalization vs Normalization

**Denormalized (Recommended for Firestore)**
```typescript
// Store user info with projects for fast reads
{
  id: "proj1",
  userId: "user1",
  userName: "John Doe",        // Denormalized
  userEmail: "john@email.com", // Denormalized
  title: "My Project",
  // ...
}
```

**When to Normalize**
```typescript
// Only store references when data is frequently updated
{
  id: "proj1",
  userId: "user1", // Reference only
  title: "My Project",
  // ...
}

// Then fetch user separately when needed
const user = await getUser(project.userId);
```

### Collection Naming Conventions

✅ **Use plural names**
```
collections: users, projects, testimonials, topics
```

❌ **Avoid singular names**
```
collections: user, project (not recommended)
```

### Document Naming Conventions

```typescript
// Use user UID as document ID for users
const userRef = doc(db, "users", userUID);

// Generate IDs for other documents
const projectId = addDoc(collection(db, "projects"), data);
```

## 2. Query Optimization

### Efficient Queries

**Good - Specific fields**
```typescript
// Only fetch what you need
const snapshot = await getDocs(
  query(collection(db, "projects"), where("status", "==", "completed"))
);
```

**Bad - Fetch all then filter**
```typescript
// Inefficient - reads all documents
const allProjects = await getDocs(collection(db, "projects"));
const filtered = allProjects.filter(p => p.status === "completed");
```

### Pagination Implementation

```typescript
import { query, limit, startAfter, orderBy } from "firebase/firestore";

export const getPaginatedProjects = async (pageSize = 10, lastVisible = null) => {
  try {
    let q;
    
    if (lastVisible) {
      q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      projects,
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error("Error getting paginated projects:", error);
    throw error;
  }
};

// Usage in component
const [lastVisible, setLastVisible] = useState(null);
const [projects, setProjects] = useState([]);

const loadMore = async () => {
  const { projects: newProjects, lastVisible: newLastVisible } = 
    await getPaginatedProjects(10, lastVisible);
  
  setProjects([...projects, ...newProjects]);
  setLastVisible(newLastVisible);
};
```

### Composite Indexes

For complex queries, Firestore creates automatic indexes:

```typescript
// This query might need a composite index
const q = query(
  collection(db, "projects"),
  where("userId", "==", userId),
  where("status", "==", "completed"),
  orderBy("createdAt", "desc")
);
```

When you run such queries for the first time, Firebase will ask to create an index.

## 3. Real-time Updates

### Real-time Listener (for live updates)

```typescript
import { onSnapshot } from "firebase/firestore";

export const useRealtimeProjects = (userId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(updatedProjects);
        setLoading(false);
      },
      (error) => {
        console.error("Error setting up real-time listener:", error);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [userId]);

  return { projects, loading };
};

// Usage in component
const { projects, loading } = useRealtimeProjects(userId);
```

### Listener Best Practices

✅ **DO:**
- Unsubscribe when component unmounts
- Use specific queries to reduce data transfer
- Cache data locally
- Show loading state while listening

❌ **DON'T:**
- Leave listeners active unnecessarily (wastes credits)
- Use listeners for one-time fetches
- Have multiple listeners for same data
- Ignore errors

## 4. Authentication Patterns

### Protected Routes

```typescript
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

// Usage
<Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

### Admin Check

```typescript
export const useAdminCheck = () => {
  const { user } = useFirebaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      const token = await user.getIdTokenResult();
      setIsAdmin(token.claims.admin === true);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};

// Usage
const { isAdmin, loading } = useAdminCheck();

if (loading) return <div>Checking access...</div>;
if (!isAdmin) return <Navigate to="/unauthorized" />;
```

## 5. Error Handling Patterns

### Consistent Error Handling

```typescript
export const handleFirebaseError = (error: any): string => {
  if (error.code === "permission-denied") {
    return "You don't have permission to access this resource";
  }
  if (error.code === "not-found") {
    return "Resource not found";
  }
  if (error.code === "unauthenticated") {
    return "Please sign in first";
  }
  if (error.code === "unavailable") {
    return "Service temporarily unavailable. Please try again.";
  }
  return error.message || "An error occurred";
};

// Usage
try {
  await updateProject(projectId, updates);
} catch (error) {
  const message = handleFirebaseError(error);
  toast({
    title: "Error",
    description: message,
    variant: "destructive"
  });
}
```

## 6. Performance Optimization

### Batch Operations

For multiple updates, use batch to reduce API calls:

```typescript
import { writeBatch } from "firebase/firestore";

export const updateProjectsStatus = async (projectIds: string[], newStatus: string) => {
  try {
    const batch = writeBatch(db);

    projectIds.forEach(projectId => {
      const projectRef = doc(db, "projects", projectId);
      batch.update(projectRef, { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Batch update failed:", error);
    throw error;
  }
};
```

### Caching Strategy

```typescript
export const useFirebaseCache = (cacheKey: string, queryFn: () => Promise<any>, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(`${cacheKey}_time`);
    const now = Date.now();

    if (cached && cachedTime && (now - parseInt(cachedTime) < ttl)) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await queryFn();
        setData(result);
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        sessionStorage.setItem(`${cacheKey}_time`, now.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cacheKey, queryFn, ttl]);

  return { data, loading };
};
```

## 7. Transaction Pattern

For operations that depend on each other:

```typescript
import { runTransaction } from "firebase/firestore";

export const createProjectWithStats = async (projectData: any, userId: string) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Get current user
      const userRef = doc(db, "users", userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      // Create project
      const projectRef = doc(collection(db, "projects"));
      transaction.set(projectRef, {
        ...projectData,
        userId,
        createdAt: Timestamp.now()
      });

      // Update user stats
      const newProjectCount = (userDoc.data().projectsCount || 0) + 1;
      transaction.update(userRef, {
        projectsCount: newProjectCount,
        updatedAt: Timestamp.now()
      });

      return projectRef.id;
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
```

## 8. Search Implementation

### Basic Text Search (Client-side)

```typescript
export const searchProjects = (projects: any[], query: string) => {
  return projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );
};

// Usage
const [searchQuery, setSearchQuery] = useState("");
const filteredProjects = useMemo(
  () => searchProjects(projects, searchQuery),
  [projects, searchQuery]
);
```

### Full-text Search (Advanced)

For production, consider Algolia or Meilisearch:

```typescript
// Alternative: Use Firestore with multiple fields
const q = query(
  collection(db, "projects"),
  where("searchTerms", "array-contains", "machine-learning")
);

// When creating project, store lowercase search terms
const searchTerms = [
  ...title.toLowerCase().split(" "),
  ...category.toLowerCase().split(" ")
];

await createProject({
  ...projectData,
  searchTerms
});
```

## 9. Monitoring & Analytics

### Track User Actions

```typescript
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const logUserAction = async (action: string, metadata: any = {}) => {
  try {
    await addDoc(collection(db, "logs"), {
      action,
      userId: currentUser?.uid,
      timestamp: Timestamp.now(),
      ...metadata
    });
  } catch (error) {
    console.error("Error logging action:", error);
  }
};

// Usage
await logUserAction("project_created", { projectId, category });
await logUserAction("user_signed_up");
```

## 10. Cost Optimization

### Tips to reduce Firebase costs:

1. **Use pagination** instead of loading all documents
2. **Cache data** locally to avoid repeated reads
3. **Batch operations** to reduce write calls
4. **Use specific queries** with indexes
5. **Cleanup** old data regularly
6. **Monitor usage** in Firebase Console

### Cost Estimation

- Reads: ~$0.06 per 100K reads
- Writes: ~$0.18 per 100K writes
- Deletes: ~$0.02 per 100K deletes
- Storage: ~$0.18 per GB

---

**Pro Tip:** Enable billing alerts in Firebase Console to avoid surprises!

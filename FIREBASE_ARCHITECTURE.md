# Firebase Architecture for BuildWave

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Components                          │
│  (AuthModal, Dashboard, AdminUsers, ProjectRequestModal, etc.)   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    Custom React Hooks                            │
│  ┌─────────────────────┬──────────────────────────────────────┐ │
│  │  useFirebaseAuth()  │  useFirebaseQuery()               │ │
│  │  - login()          │  - execute queries                 │ │
│  │  - register()       │  - handle loading states           │ │
│  │  - logout()         │  - manage errors                   │ │
│  │                     │                                    │ │
│  │  useFirebaseMutation() (in useFirebaseQuery)            │ │
│  │  - mutate()                                              │ │
│  │  - loading states                                        │ │
│  └─────────────────────┴──────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│               Firebase Service Layer                             │
│  (firebaseService.ts - 400+ lines)                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │ User Ops     │ Project Ops  │ Testimonial  │ Topic Ops    │  │
│  │              │              │ Ops          │              │  │
│  │ createUser   │ createProject│ createTest.. │ createTopic  │  │
│  │ getUser      │ getProject   │ getTest..    │ getTopic..   │  │
│  │ updateUser   │ updateProj.. │ approveTes.. │ updateTopic  │  │
│  │ getAllUsers  │ getUserProj..│ deleteTest.. │ deleteTopic  │  │
│  │ searchUsers  │ getByStatus  │              │ getByCategory│  │
│  │              │              │              │              │  │
│  │              │ Admin Stats  │              │              │  │
│  │              │ getAdminStats│              │              │  │
│  │              │ batchOps..   │              │              │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                  Firebase SDKs                                   │
│  ┌─────────────────┬──────────────────┬──────────────────────┐  │
│  │ Authentication  │ Firestore DB     │ Cloud Storage        │  │
│  │                 │                  │                      │  │
│  │ - Firebase Auth │ - Real-time DB   │ - File uploads       │  │
│  │ - User sessions │ - Queries        │ - File retrieval     │  │
│  │ - Token mgmt    │ - Collections    │ - URL generation     │  │
│  └─────────────────┴──────────────────┴──────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│              Google Firebase Backend                             │
│  ┌─────────────────┬──────────────────┬──────────────────────┐  │
│  │ Firebase Auth   │ Firestore        │ Cloud Storage        │  │
│  │ Service         │ Service          │ Service              │  │
│  │                 │                  │                      │  │
│  │ ✓ Managed       │ ✓ Managed        │ ✓ Managed            │  │
│  │ ✓ Scalable      │ ✓ Scalable       │ ✓ Scalable           │  │
│  │ ✓ Secure        │ ✓ Secure         │ ✓ Secure             │  │
│  └─────────────────┴──────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Authentication Flow

```
┌─────────────┐
│  Sign Up    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ User enters email, password, name                │
└──────────────────────────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  useFirebaseAuth()   │
                    │   .register()        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Firebase Auth        │
                    │ Creates user         │
                    │ Returns UID          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ firebaseService      │
                    │ .createUser()        │
                    │ (stores profile)     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Firestore            │
                    │ New document in      │
                    │ "users" collection   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Success Toast        │
                    │ Redirect to Dashboard│
                    └──────────────────────┘
```

### Project Creation Flow

```
┌──────────────────────┐
│ User submits form    │
│ Title, Description   │
│ Category, Budget     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ useFirebaseMutation()                │
│ .mutate(projectData)                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ firebaseService                      │
│ .createProject({                     │
│   userId, title, description, ...    │
│ })                                   │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Firestore                            │
│ Adds new document to                 │
│ "projects" collection                │
│ Returns project ID                   │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ onSuccess callback                   │
│ Show confirmation toast              │
│ Clear form                           │
│ Close modal                          │
└──────────────────────────────────────┘
```

### Admin Dashboard Flow

```
┌──────────────────────┐
│ Admin Dashboard      │
│ Component Mounts     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ useFirebaseQuery()           │
│ execute() on mount           │
└──────────┬────────────────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐
│ firebaseService      │    │ firebaseService      │
│ .getAllUsers()       │    │ .getAdminStats()     │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Firestore            │    │ Firestore            │
│ Query "users"        │    │ Count docs in        │
│ collection           │    │ collections          │
│ Returns: [user1..]   │    │ Returns: stats       │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └─────────────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Update state         │
                  │ Re-render with data  │
                  │ Show users & stats   │
                  └──────────────────────┘
```

## Firestore Database Schema

```
buildwave (Firebase Project)
│
├── users/
│   ├── user_id_1
│   │   ├── name: "John Doe"
│   │   ├── email: "john@example.com"
│   │   ├── school: "Harvard"
│   │   ├── level: "Undergraduate"
│   │   ├── projectsCount: 3
│   │   ├── completedProjects: 1
│   │   ├── totalSpent: "₦15000"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── user_id_2
│       ├── name: "Jane Smith"
│       ├── email: "jane@example.com"
│       └── ...
│
├── projects/
│   ├── project_id_1
│   │   ├── userId: "user_id_1"
│   │   ├── title: "AI Chatbot"
│   │   ├── description: "Build an AI chatbot using NLP"
│   │   ├── category: "AI & Machine Learning"
│   │   ├── status: "in-progress"
│   │   ├── amount: 5000
│   │   ├── deadline: timestamp
│   │   ├── requirements: ["req1", "req2"]
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── project_id_2
│       ├── userId: "user_id_2"
│       ├── title: "Web App"
│       └── ...
│
├── testimonials/
│   ├── testimonial_id_1
│   │   ├── userId: "user_id_1"
│   │   ├── userName: "John Doe"
│   │   ├── rating: 5
│   │   ├── message: "Great service!"
│   │   ├── approved: true
│   │   └── createdAt: timestamp
│   │
│   └── testimonial_id_2
│       └── ...
│
└── topics/
    ├── topic_id_1
    │   ├── title: "REST API Design"
    │   ├── description: "Learn REST API best practices"
    │   ├── category: "Web Development"
    │   ├── difficulty: "intermediate"
    │   └── resources: ["resource1", "resource2"]
    │
    └── topic_id_2
        └── ...
```

## Component Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                     Landing Page                            │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Header       │  │ HeroSection      │  │ Services     │  │
│  │              │  │ (Get Started btn)│  │ Section      │  │
│  │ - Nav        │  │ (Track Project)  │  │              │  │
│  │ - WhatsApp   │  └──────────────────┘  └──────────────┘  │
│  │   Chat       │                                            │
│  └──────────────┘  ┌──────────────────┐  ┌──────────────┐  │
│                    │ Testimonials     │  │ Case Studies │  │
│                    │ Section          │  │ Section      │  │
│                    │ (Show reviews)   │  │              │  │
│                    └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ AuthModal         │
                    │ ├─ Sign Up        │
                    │ └─ Sign In        │
                    │ (useFirebaseAuth) │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────────────────┐    ┌────────────────────────┐
│      User Dashboard          │    │  Admin Dashboard       │
│  ┌─────────────────────────┐ │    │  ┌──────────────────┐  │
│  │ My Projects             │ │    │  │ AdminUsers       │  │
│  │ (getUserProjects)       │ │    │  │ (getAllUsers)    │  │
│  │ ┌───────────────────┐   │ │    │  │ ✅ Migrated      │  │
│  │ │ Create Project    │   │ │    │  └──────────────────┘  │
│  │ │ (createProject)   │   │ │    │  ┌──────────────────┐  │
│  │ └───────────────────┘   │ │    │  │ AdminProjects    │  │
│  │                         │ │    │  │ (getProjects)    │  │
│  │ Profile                 │ │    │  └──────────────────┘  │
│  │ (getUser, updateUser)   │ │    │  ┌──────────────────┐  │
│  └─────────────────────────┘ │    │  │ AdminTestimonials│  │
│                              │    │  │ (getAllTest..)   │  │
│ Track Project Modal          │    │  └──────────────────┘  │
│ ├─ Enter Project ID          │    │  ┌──────────────────┐  │
│ └─ (getProject)              │    │  │ AdminStats       │  │
│                              │    │  │ (getAdminStats)  │  │
└──────────────────────────────┘    │  └──────────────────┘  │
                                    └────────────────────────┘

Topics Page                    Admin Login
├─ Browse Topics              ├─ Verify Admin
│  (getTopics)               │
└─ By Category               └─ Admin Auth
   (getTopicsByCategory)
```

## Security & Authentication Flow

```
┌────────────────┐
│ Public Pages   │
│ ├─ Home        │  No auth required
│ ├─ Topics      │
│ └─ Track       │
└────────────────┘
        │
        ▼
┌────────────────────────┐
│ Protected Routes       │
│                        │  ✓ Auth required
│ ├─ Dashboard          │  useFirebaseAuth()
│ ├─ My Projects        │  Redirect if not logged in
│ └─ Profile            │
└────────────────────────┘
        │
        ▼
┌────────────────────────┐
│ Admin Routes           │
│                        │  ✓ Auth required
│ ├─ Admin Dashboard     │  ✓ Admin role required
│ ├─ User Management     │  useAdminCheck()
│ ├─ Project Management  │  Check claims.admin
│ └─ Testimonials        │
└────────────────────────┘
```

## Real-time vs One-time Reads

```
┌──────────────────────────┐
│  Initial Load            │
│  (One-time read)         │
│  Cost: 1 read per doc    │
└──────────┬───────────────┘
           │
           ▼
    ┌─────────────────┐
    │ getDocs()       │  Most components
    │ getDoc()        │  (Admin pages, etc.)
    └─────────────────┘
           │
           ▼
┌──────────────────────────┐
│  Real-time Updates       │
│  (Listener)              │
│  Cost: 1 read per change │
└──────────┬───────────────┘
           │
           ▼
    ┌─────────────────┐
    │ onSnapshot()    │  Dashboard (live updates)
    │ Subscribe       │  Chat/Notifications
    │ Unsubscribe     │  Live stats
    └─────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────┐
│  No Optimization                    │
│  Load all users                     │  ❌ Expensive
│  Load all projects                  │
│  Load all testimonials              │
└──────────────────────┬──────────────┘
                       │
                       ▼
    ┌──────────────────────────────┐
    │ Queries                      │
    │ Specific WHERE conditions    │  ✅ Better
    │ Limit() results              │
    │ Index by category            │
    └──────────────────┬───────────┘
                       │
                       ▼
    ┌──────────────────────────────┐
    │ Pagination                   │
    │ Load 10 per page             │  ✅✅ Best
    │ startAfter(), limit()         │
    │ Lazy load more               │
    └──────────────────────────────┘
```

This architecture ensures:
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Easy maintenance
- ✅ Real-time updates
- ✅ Cost efficiency

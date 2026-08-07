# 🔄 Firebase Schema & Project ID Implementation

## Overview
Updated Firebase service layer to align with the intended database schema from `types.ts` and implement BW-prefixed project IDs.

## Project ID Format

### Format: BW-YYYY-NNNN
Example: `BW-2025-0001`, `BW-2025-0002`, etc.

**Components:**
- **BW** - BuildWave prefix
- **YYYY** - Current year (2025)
- **NNNN** - Sequential number, zero-padded to 4 digits

**Generation Logic:**
1. Get current year
2. Count all projects created in current year
3. Increment count by 1 for next project
4. Format as `BW-YYYY-NNNN`

**Function:** `generateProjectId()`
```typescript
// Example usage in createProject:
const projectId = await generateProjectId();
// Returns: "BW-2025-0001" for first project in 2025
```

## Database Collections Schema

### 1. Users Collection (`users/`)

Maps to **Profiles** table in original schema.

**Document ID:** Firebase UID

**Fields:**
```typescript
{
  id: string;                    // Firebase UID
  full_name: string;             // User's name
  email: string;                 // User's email
  course_of_study: string | null;    // Major/discipline
  education_level: string;       // "undergraduate" | "masters" | "phd"
  school: string | null;         // School/university name
  phone: string | null;          // Phone number
  location: string | null;       // Location
  createdAt: Timestamp;          // Account creation time
  updatedAt: Timestamp;          // Last update time
}
```

**Mapping from Onboarding:**
- `userData.name` → `full_name`
- `userData.email` → `email`
- `userData.discipline` → `course_of_study`
- `userData.level` → `education_level`
- `userData.school` → `school`
- `userData.phone` → `phone`

**Example Document:**
```json
{
  "id": "abc123xyz",
  "full_name": "John Doe",
  "email": "john@example.com",
  "course_of_study": "Computer Science",
  "education_level": "undergraduate",
  "school": "MIT",
  "phone": "+234803123456",
  "location": "Lagos, Nigeria",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### 2. Projects Collection (`projects/`)

Maps to **Projects** table in original schema.

**Document ID:** BW-prefixed project ID (e.g., `BW-2025-0001`)

**Fields:**
```typescript
{
  id: string;                    // "BW-YYYY-NNNN" format
  title: string;                 // Project title
  description: string;           // Project description
  academic_level: string;        // "undergraduate" | "masters" | "phd"
  discipline: string;            // Course/discipline
  deadline: Date | null;         // Project deadline
  budget_estimate: number | null;    // Estimated budget
  progress: number;              // 0-100 percentage
  status: string;                // "pending" | "in_progress" | "review" | "completed" | "cancelled"
  user_id: string;               // Creator's user ID (Firebase UID)
  assigned_to: string | null;    // Assigned admin/user ID
  phone: string | null;          // Contact phone
  preferred_contact: string;     // "email" | "whatsapp"
  needs_topic: boolean;          // If user needs help with topic
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Additional fields (app-specific)
  category: string;              // Duplicate of discipline for compatibility
  haveProject: boolean;          // If user has existing project
  level: string;                 // Duplicate of academic_level
  contactMethod: string;         // Duplicate of preferred_contact
}
```

**Example Document:**
```json
{
  "id": "BW-2025-0001",
  "title": "Mobile Banking App",
  "description": "Build a secure mobile banking application",
  "academic_level": "undergraduate",
  "discipline": "Computer Science",
  "deadline": "2025-03-15",
  "budget_estimate": 150000,
  "progress": 25,
  "status": "in_progress",
  "user_id": "abc123xyz",
  "assigned_to": null,
  "phone": "+234803123456",
  "preferred_contact": "email",
  "needs_topic": false,
  "createdAt": "2025-01-15T11:00:00Z",
  "updatedAt": "2025-01-16T14:30:00Z",
  "category": "Computer Science",
  "haveProject": true,
  "level": "undergraduate",
  "contactMethod": "email"
}
```

### 3. Testimonials Collection (`testimonials/`)

Maps to **Testimonials** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  user_id: string | null;        // Author's user ID
  name: string;                  // Author's name
  review: string;                // Review text
  rating: number;                // 1-5 stars
  course: string;                // Course name
  school: string;                // School name
  photo_url: string | null;      // Profile photo URL
  is_featured: boolean;          // Featured on homepage
  status: string;                // "pending" | "approved" | "rejected"
  createdAt: Timestamp;
}
```

### 4. Services Collection (`services/`)

Maps to **Services** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  title: string;                 // Service name
  description: string;           // Service description
  discipline: string | null;     // Course discipline
  level: string | null;          // Education level
  from_price: number | null;     // Starting price
  turnaround_days: number | null;    // Typical turnaround
  tags: string[];                // Service tags
  is_active: boolean;            // Active/inactive
  createdAt: Timestamp;
}
```

### 5. Project Deliverables Collection (`deliverables/`)

Maps to **Project Deliverables** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  project_id: string;            // Parent project ID (BW-YYYY-NNNN)
  name: string;                  // File name
  file_url: string;              // Storage URL
  file_size: number | null;      // File size in bytes
  uploaded_by: string;           // Uploader's user ID
  createdAt: Timestamp;
}
```

### 6. Project Messages Collection (`messages/`)

Maps to **Project Messages** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  project_id: string;            // Parent project ID
  sender_id: string;             // Message sender's user ID
  message: string;               // Message content
  is_read: boolean;              // Read status
  createdAt: Timestamp;
}
```

### 7. Project Timeline Collection (`timeline/`)

Maps to **Project Timeline** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  project_id: string;            // Parent project ID
  activity_text: string;         // Activity description
  actor_id: string | null;       // User who performed action
  actor_type: string;            // "student" | "admin" | "system"
  createdAt: Timestamp;
}
```

### 8. User Roles Collection (`user_roles/`)

Maps to **User Roles** table.

**Document ID:** Auto-generated UUID

**Fields:**
```typescript
{
  id: string;
  user_id: string;               // User's Firebase UID
  role: string;                  // "admin" | "student"
  createdAt: Timestamp;
}
```

## Implementation Changes

### Updated Functions

#### 1. `generateProjectId()`
**New function** - Generates BW-prefixed project IDs

```typescript
const projectId = await generateProjectId();
// Returns: "BW-2025-0001"
```

#### 2. `createUser(userId, userData)`
**Updated** - Now maps fields to profiles schema

```typescript
await createUser(firebaseUser.uid, {
  name: "John Doe",
  email: "john@example.com",
  discipline: "Computer Science",
  level: "undergraduate",
  school: "MIT",
  phone: "+234803123456"
});
```

#### 3. `createProject(projectData)`
**Updated** - Now uses BW-prefixed IDs and maps fields to projects schema

```typescript
const projectId = await createProject({
  userId: user.uid,
  title: "Mobile App",
  description: "Build a mobile app...",
  category: "Computer Science",
  level: "undergraduate",
  discipline: "Computer Science",
  deadline: new Date("2025-03-15"),
  budget: "150000",
  phone: "+234803123456",
  contactMethod: "email",
  needTopic: false,
  haveProject: true
});
// Returns: "BW-2025-0001"
```

## Field Mapping Reference

### From App Data to Firestore

| App Field | User Collection | Project Collection |
|-----------|-----------------|-------------------|
| `name` | `full_name` | - |
| `email` | `email` | - |
| `discipline` | `course_of_study` | `discipline` |
| `level` | `education_level` | `academic_level` |
| `school` | `school` | - |
| `phone` | `phone` | `phone` |
| `category` | - | `discipline` (also stored as `category`) |
| `title` | - | `title` |
| `description` | - | `description` |
| `deadline` | - | `deadline` |
| `budget` | - | `budget_estimate` |
| `progress` | - | `progress` |
| `status` | - | `status` |
| `contactMethod` | - | `preferred_contact` |
| `needTopic` | - | `needs_topic` |
| `haveProject` | - | `haveProject` |

## Backward Compatibility

**Duplicate Fields:** Some fields are stored twice for backward compatibility:
- `discipline` = `category`
- `academic_level` = `level`
- `preferred_contact` = `contactMethod`

This allows existing code to work while transitioning to the proper schema names.

## Firestore Security Rules

**Project Collection Read Access:**
- Anyone authenticated can read all projects
- Users can only modify their own projects

**User Collection Read Access:**
- Authenticated users can read all user profiles
- Users can only modify their own profile

## Enums Used

```typescript
education_level: "undergraduate" | "masters" | "phd"
project_status: "pending" | "in_progress" | "review" | "completed" | "cancelled"
app_role: "admin" | "student"
contact_method: "email" | "whatsapp"
```

## Testing the Schema

### Create a Project
```typescript
const projectId = await createProject({
  userId: "user-123",
  title: "Web Design Project",
  description: "Design a responsive website",
  category: "Web Development",
  level: "masters",
  discipline: "Web Development",
  deadline: new Date("2025-04-01"),
  budget: "250000",
  phone: "+234803654321",
  contactMethod: "whatsapp",
  needTopic: false,
  haveProject: true,
  status: "pending"
});
// Expected: "BW-2025-0002"
```

### Create a User
```typescript
await createUser("abc123xyz", {
  name: "Jane Smith",
  email: "jane@example.com",
  discipline: "Data Science",
  level: "phd",
  school: "Stanford",
  phone: "+234809123456"
});
// Creates document at: users/abc123xyz
```

## Migration Notes

1. **Project IDs:** All new projects will use BW-YYYY-NNNN format
2. **User Fields:** New user documents follow profiles schema
3. **Compatibility:** Existing code should still work with new schema
4. **Backward Mapping:** Old field names are still available in project documents

## Next Steps

1. ✅ Update createProject() to use BW- IDs
2. ✅ Update createUser() to map to profiles schema
3. ✅ Add validation for enum values
4. ✅ Create user_roles collection for role management
5. ✅ Implement project timeline tracking
6. ⏳ Update existing projects with proper field names (optional migration)
7. ⏳ Apply Firestore security rules in Firebase Console
8. ⏳ Test all implementations end-to-end

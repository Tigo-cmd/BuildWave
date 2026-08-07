# 📚 Firebase Service - Complete Function Reference

Quick reference guide for all functions in `firebaseService.ts` with usage examples.

## Table of Contents
1. [Utility Functions](#utility-functions)
2. [Validation Functions](#validation-functions)
3. [User Functions](#user-functions)
4. [Project Functions](#project-functions)
5. [Testimonial Functions](#testimonial-functions)
6. [User Roles Functions](#user-roles-functions)
7. [Timeline Functions](#timeline-functions)
8. [Topic Functions](#topic-functions)
9. [Batch Operations](#batch-operations)
10. [Migration Functions](#migration-functions)

---

## Utility Functions

### generateProjectId()
Generates unique project IDs with BW- prefix.

```typescript
const projectId = await generateProjectId();
// Returns: "BW-2025-0001", "BW-2025-0002", etc.
```

**Returns:** Promise\<string\>  
**Throws:** Error if Firestore query fails

---

## Validation Functions

### validateEducationLevel()
```typescript
const isValid = validateEducationLevel("undergraduate");
// Returns: boolean
```

**Valid values:** `"undergraduate"` | `"masters"` | `"phd"`

### validateProjectStatus()
```typescript
const isValid = validateProjectStatus("in_progress");
// Returns: boolean
```

**Valid values:** `"pending"` | `"in_progress"` | `"review"` | `"completed"` | `"cancelled"`

### validateAppRole()
```typescript
const isValid = validateAppRole("admin");
// Returns: boolean
```

**Valid values:** `"admin"` | `"student"`

### validateContactMethod()
```typescript
const isValid = validateContactMethod("email");
// Returns: boolean
```

**Valid values:** `"email"` | `"whatsapp"`

### validateRating()
```typescript
const isValid = validateRating(4);
// Returns: boolean
```

**Valid range:** 1-5 (integers only)

---

## User Functions

### createUser()
Creates a new user document in the users collection.

```typescript
await createUser(firebaseUser.uid, {
  name: "John Doe",
  email: "john@example.com",
  discipline: "Computer Science",
  level: "undergraduate",
  school: "MIT",
  phone: "+234803123456",
  location: "Lagos, Nigeria"
});
```

**Parameters:**
- `userId: string` - Firebase UID
- `userData: any` - User data object

**Returns:** Promise\<void\>

### getUser()
Retrieves a single user by ID.

```typescript
const user = await getUser("user-123");
// Returns: { id: "user-123", full_name: "John", ... } | null
```

**Parameters:**
- `userId: string` - Firebase UID

**Returns:** Promise\<any | null\>

### getAllUsers()
Retrieves all users from the database.

```typescript
const users = await getAllUsers();
// Returns: array of user objects
```

**Returns:** Promise\<any[]\>

### updateUser()
Updates a user document.

```typescript
await updateUser("user-123", {
  full_name: "Jane Doe",
  phone: "+234809654321"
});
```

**Parameters:**
- `userId: string` - Firebase UID
- `updates: any` - Fields to update

**Returns:** Promise\<void\>

### deleteUser()
Deletes a user document.

```typescript
await deleteUser("user-123");
```

**Parameters:**
- `userId: string` - Firebase UID

**Returns:** Promise\<void\>

### searchUsers()
Searches users by name, email, or school.

```typescript
const results = await searchUsers("MIT");
// Returns: array of matching users
```

**Parameters:**
- `searchQuery: string` - Search term

**Returns:** Promise\<any[]\>

---

## Project Functions

### createProject()
Creates a new project with auto-generated BW- prefixed ID.

```typescript
const projectId = await createProject({
  userId: "user-123",
  title: "Mobile App Development",
  description: "Build an iOS and Android app",
  category: "Computer Science",
  level: "undergraduate",
  deadline: new Date("2025-04-01"),
  budget: "150000",
  phone: "+234803123456",
  contactMethod: "email",
  needTopic: false,
  haveProject: true
});
// Returns: "BW-2025-0001"
```

**Parameters:**
- `projectData: any` - Project information

**Returns:** Promise\<string\> (project ID)

### getProjects()
Retrieves all projects, sorted by creation date (newest first).

```typescript
const projects = await getProjects();
// Returns: array of project objects
```

**Returns:** Promise\<any[]\>

### getProject()
Retrieves a single project by ID.

```typescript
const project = await getProject("BW-2025-0001");
// Returns: project object | null
```

**Parameters:**
- `projectId: string` - Project ID (BW format)

**Returns:** Promise\<any | null\>

### getUserProjects()
Retrieves projects created by a specific user.

```typescript
const userProjects = await getUserProjects("user-123");
// Returns: array of user's projects
```

**Parameters:**
- `userId: string` - User ID

**Returns:** Promise\<any[]\>

### updateProject()
Updates a project document.

```typescript
await updateProject("BW-2025-0001", {
  status: "in_progress",
  progress: 50
});
```

**Parameters:**
- `projectId: string` - Project ID
- `updates: any` - Fields to update

**Returns:** Promise\<void\>

### deleteProject()
Deletes a project document.

```typescript
await deleteProject("BW-2025-0001");
```

**Parameters:**
- `projectId: string` - Project ID

**Returns:** Promise\<void\>

### getProjectsByStatus()
Retrieves projects filtered by status.

```typescript
const activeProjects = await getProjectsByStatus("in_progress");
// Returns: array of projects with matching status
```

**Parameters:**
- `status: string` - Project status

**Returns:** Promise\<any[]\>

---

## Testimonial Functions

### createTestimonial()
Creates a new testimonial with schema validation.

```typescript
const testimonialId = await createTestimonial({
  user_id: "user-123",
  name: "John Doe",
  review: "Excellent service!",
  rating: 5,
  course: "Computer Science",
  school: "MIT",
  photo_url: "https://example.com/photo.jpg",
  is_featured: false,
  status: "pending"
});
// Returns: testimonial ID
```

**Parameters:**
- `testimonialData: any` - Testimonial information

**Returns:** Promise\<string\> (testimonial ID)

**Throws:** Error if rating is invalid (must be 1-5 integer)

### getTestimonials()
Retrieves approved testimonials only.

```typescript
const testimonials = await getTestimonials();
// Returns: array of approved testimonials
```

**Returns:** Promise\<any[]\>

### getAllTestimonials()
Retrieves all testimonials regardless of status (admin).

```typescript
const allTestimonials = await getAllTestimonials();
// Returns: all testimonials
```

**Returns:** Promise\<any[]\>

### getFeaturedTestimonials()
Retrieves featured testimonials for homepage display.

```typescript
const featured = await getFeaturedTestimonials(5);
// Returns: 5 featured and approved testimonials
```

**Parameters:**
- `maxResults: number` - Maximum number of results (default: 10)

**Returns:** Promise\<any[]\>

### approveTestimonial()
Approves a testimonial (sets status to "approved").

```typescript
await approveTestimonial("testimonial-123");
```

**Parameters:**
- `testimonialId: string` - Testimonial ID

**Returns:** Promise\<void\>

### rejectTestimonial()
Rejects a testimonial (sets status to "rejected").

```typescript
await rejectTestimonial("testimonial-123");
```

**Parameters:**
- `testimonialId: string` - Testimonial ID

**Returns:** Promise\<void\>

### featureTestimonial()
Features or unfeatures a testimonial for homepage display.

```typescript
await featureTestimonial("testimonial-123", true);  // Feature
await featureTestimonial("testimonial-123", false); // Unfeature
```

**Parameters:**
- `testimonialId: string` - Testimonial ID
- `featured: boolean` - Feature status (default: true)

**Returns:** Promise\<void\>

### deleteTestimonial()
Deletes a testimonial.

```typescript
await deleteTestimonial("testimonial-123");
```

**Parameters:**
- `testimonialId: string` - Testimonial ID

**Returns:** Promise\<void\>

### getUserTestimonials()
Retrieves testimonials created by a specific user.

```typescript
const userTestimonials = await getUserTestimonials("user-123");
// Returns: array of user's testimonials
```

**Parameters:**
- `userId: string` - User ID

**Returns:** Promise\<any[]\>

---

## User Roles Functions

### createUserRole()
Creates or assigns a role to a user.

```typescript
const roleId = await createUserRole("user-123", "admin");
// Creates entry in user_roles collection
```

**Parameters:**
- `userId: string` - User ID
- `role: string` - Role ("admin" | "student")

**Returns:** Promise\<string\> (role record ID)

**Throws:** Error if role is invalid

### getUserRole()
Gets the user's current role.

```typescript
const userRole = await getUserRole("user-123");
// Returns: { id: "...", user_id: "user-123", role: "admin", ... } | null
```

**Parameters:**
- `userId: string` - User ID

**Returns:** Promise\<any | null\>

### updateUserRole()
Updates a user's role.

```typescript
await updateUserRole("user-123", "student");
// Creates role if doesn't exist, updates if it does
```

**Parameters:**
- `userId: string` - User ID
- `newRole: string` - New role

**Returns:** Promise\<string\> (role record ID)

**Throws:** Error if role is invalid

### getUsersByRole()
Gets all users with a specific role.

```typescript
const admins = await getUsersByRole("admin");
// Returns: array of admin users
```

**Parameters:**
- `role: string` - Role to filter by

**Returns:** Promise\<any[]\>

**Throws:** Error if role is invalid

### getAllUserRoles()
Gets all user role records (admin only).

```typescript
const allRoles = await getAllUserRoles();
// Returns: array of all user role records
```

**Returns:** Promise\<any[]\>

---

## Timeline Functions

### createTimeline()
Creates a timeline entry for a project.

```typescript
const entryId = await createTimeline(
  "BW-2025-0001",
  "Project assigned to lead developer",
  "user-123",
  "admin"
);
// Returns: timeline entry ID
```

**Parameters:**
- `projectId: string` - Project ID
- `activityText: string` - Activity description
- `actorId: string | null` - User who performed action
- `actorType: "student" | "admin" | "system"` - Type of actor

**Returns:** Promise\<string\> (timeline entry ID)

### getProjectTimeline()
Gets all timeline entries for a project.

```typescript
const timeline = await getProjectTimeline("BW-2025-0001");
// Returns: array of timeline entries, newest first
```

**Parameters:**
- `projectId: string` - Project ID

**Returns:** Promise\<any[]\>

### getRecentTimeline()
Gets recent timeline entries across all projects.

```typescript
const recent = await getRecentTimeline(20);
// Returns: 20 most recent timeline entries
```

**Parameters:**
- `maxResults: number` - Maximum results to return (default: 50)

**Returns:** Promise\<any[]\>

### deleteTimelineEntry()
Deletes a timeline entry.

```typescript
await deleteTimelineEntry("timeline-123");
```

**Parameters:**
- `timelineId: string` - Timeline entry ID

**Returns:** Promise\<void\>

---

## Topic Functions

### createTopic()
Creates a new topic.

```typescript
const topicId = await createTopic({
  title: "Advanced Algorithms",
  category: "Computer Science"
});
// Returns: topic ID
```

**Parameters:**
- `topicData: any` - Topic information

**Returns:** Promise\<string\> (topic ID)

### getTopics()
Retrieves all topics.

```typescript
const topics = await getTopics();
// Returns: array of topics
```

**Returns:** Promise\<any[]\>

### getTopicsByCategory()
Retrieves topics filtered by category.

```typescript
const csTopics = await getTopicsByCategory("Computer Science");
// Returns: array of topics in category
```

**Parameters:**
- `category: string` - Category name

**Returns:** Promise\<any[]\>

### updateTopic()
Updates a topic.

```typescript
await updateTopic("topic-123", {
  title: "Updated Title"
});
```

**Parameters:**
- `topicId: string` - Topic ID
- `updates: any` - Fields to update

**Returns:** Promise\<void\>

### deleteTopic()
Deletes a topic.

```typescript
await deleteTopic("topic-123");
```

**Parameters:**
- `topicId: string` - Topic ID

**Returns:** Promise\<void\>

---

## Batch Operations

### batchUpdateUsers()
Updates multiple users in a single batch operation.

```typescript
await batchUpdateUsers({
  "user-1": { full_name: "Jane Doe" },
  "user-2": { education_level: "masters" }
});
```

**Parameters:**
- `updates: { [userId: string]: any }` - Map of user IDs to updates

**Returns:** Promise\<void\>

### batchDeleteProjects()
Deletes multiple projects in a single batch operation.

```typescript
await batchDeleteProjects(["BW-2025-0001", "BW-2025-0002"]);
```

**Parameters:**
- `projectIds: string[]` - Array of project IDs to delete

**Returns:** Promise\<void\>

---

## Migration Functions

### getMigrationStatus()
Checks how many documents need schema migration.

```typescript
const status = await getMigrationStatus();
// Returns: {
//   totalProjects: 15,
//   projectsNeedingMigration: 3,
//   totalTestimonials: 20,
//   testimonialsNeedingMigration: 5,
//   needsMigration: true
// }
```

**Returns:** Promise\<any\>

### migrateProjectsToNewSchema()
Migrates projects to use new schema field names.

```typescript
const result = await migrateProjectsToNewSchema();
// Returns: {
//   migratedCount: 3,
//   errorCount: 0,
//   totalProcessed: 15
// }
```

**What it does:**
- Maps `category` → `discipline`
- Maps `level` → `academic_level`
- Maps `contactMethod` → `preferred_contact`
- Maps `needTopic` → `needs_topic`
- Normalizes status values

**Returns:** Promise\<{ migratedCount: number; errorCount: number; totalProcessed: number }\>

### migrateTestimonialsToNewSchema()
Migrates testimonials to use new schema field names.

```typescript
const result = await migrateTestimonialsToNewSchema();
// Returns: {
//   migratedCount: 5,
//   errorCount: 0,
//   totalProcessed: 20
// }
```

**What it does:**
- Maps `approved` (boolean) → `status` (enum)
- Validates and corrects ratings
- Adds updatedAt timestamp

**Returns:** Promise\<{ migratedCount: number; errorCount: number; totalProcessed: number }\>

---

## Admin Stats Function

### getAdminStats()
Gets dashboard statistics for admin panel.

```typescript
const stats = await getAdminStats();
// Returns: {
//   totalUsers: 50,
//   totalProjects: 120,
//   activeProjects: 35,
//   completedProjects: 80,
//   totalTestimonials: 45
// }
```

**Returns:** Promise\<{ totalUsers: number; totalProjects: number; activeProjects: number; completedProjects: number; totalTestimonials: number }\>

---

## Error Handling

All functions include try-catch blocks and throw descriptive errors:

```typescript
try {
  const project = await getProject("invalid-id");
} catch (error) {
  console.error("Error getting project:", error);
  // Handle error appropriately
}
```

---

## Import Examples

```typescript
// Import individual functions
import {
  generateProjectId,
  createProject,
  getProject,
  validateProjectStatus,
  createUserRole,
  createTimeline
} from '@/integrations/firebase/firebaseService';

// Use in component
const projectId = await createProject(projectData);
await createTimeline(projectId, "Project created", userId, "student");
```

---

## Performance Tips

1. **Batch operations** - Use `batchUpdateUsers()` and `batchDeleteProjects()` for multiple updates
2. **Limit results** - Use `limit` parameter in queries
3. **Pagination** - Implement pagination for large result sets
4. **Validation** - Use validation functions before database operations
5. **Caching** - Consider caching frequently accessed data (users, projects)
6. **Indexes** - Create Firestore indexes for common queries

---

## Migration Checklist

- [ ] Run `getMigrationStatus()` to check what needs migration
- [ ] Run `migrateProjectsToNewSchema()` if needed
- [ ] Run `migrateTestimonialsToNewSchema()` if needed
- [ ] Verify migration with `getMigrationStatus()`
- [ ] Test new project creation (BW- IDs)
- [ ] Test user role assignment
- [ ] Test timeline tracking
- [ ] Test testimonial approval workflow
- [ ] Update Firestore security rules
- [ ] Monitor application after migration

# 🔄 Firebase Schema Migration Guide

Complete guide for migrating to the new Firebase schema implementation.

## Overview

The BuildWave Firebase backend has been updated with a comprehensive schema aligned to the Supabase types.ts specification. This document explains the migration utilities and how to use them.

## What's New

### ✅ Implemented Features

1. **Enum Validation Helpers**
   - `validateEducationLevel()` - Validates education level enum
   - `validateProjectStatus()` - Validates project status enum
   - `validateAppRole()` - Validates app role enum
   - `validateContactMethod()` - Validates contact method enum
   - `validateRating()` - Validates testimonial rating (1-5)

2. **User Roles Collection Functions**
   - `createUserRole(userId, role)` - Create/assign role to user
   - `getUserRole(userId)` - Get user's current role
   - `updateUserRole(userId, newRole)` - Update user's role
   - `getUsersByRole(role)` - Get all users with specific role
   - `getAllUserRoles()` - Get all user roles (admin)

3. **Project Timeline Collection Functions**
   - `createTimeline(projectId, activityText, actorId, actorType)` - Add timeline entry
   - `getProjectTimeline(projectId)` - Get project's timeline entries
   - `getRecentTimeline(maxResults)` - Get recent timeline across all projects
   - `deleteTimelineEntry(timelineId)` - Delete timeline entry

4. **Enhanced Testimonials Functions**
   - `createTestimonial(testimonialData)` - Create with full schema validation
   - `getTestimonials()` - Get approved testimonials
   - `getAllTestimonials()` - Get all testimonials (admin)
   - `getFeaturedTestimonials(maxResults)` - Get featured testimonials for homepage
   - `approveTestimonial(testimonialId)` - Approve testimonial
   - `rejectTestimonial(testimonialId)` - Reject testimonial
   - `featureTestimonial(testimonialId, featured)` - Feature/unfeature testimonial
   - `getUserTestimonials(userId)` - Get testimonials by user

## Migration Utilities

### 1. Check Migration Status

Before running migrations, check what needs to be updated:

```typescript
import { getMigrationStatus } from '@/integrations/firebase/firebaseService';

// Get migration status
const status = await getMigrationStatus();
console.log(status);
// Output:
// {
//   totalProjects: 15,
//   projectsNeedingMigration: 3,
//   totalTestimonials: 20,
//   testimonialsNeedingMigration: 5,
//   needsMigration: true
// }
```

### 2. Migrate Projects to New Schema

Update existing projects to use proper field names:

```typescript
import { migrateProjectsToNewSchema } from '@/integrations/firebase/firebaseService';

// Run migration
const result = await migrateProjectsToNewSchema();
console.log(result);
// Output:
// {
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
- Normalizes status to lowercase with underscores
- Adds `updatedAt` timestamp

### 3. Migrate Testimonials to New Schema

Update existing testimonials to use proper field names:

```typescript
import { migrateTestimonialsToNewSchema } from '@/integrations/firebase/firebaseService';

// Run migration
const result = await migrateTestimonialsToNewSchema();
console.log(result);
// Output:
// {
//   migratedCount: 5,
//   errorCount: 0,
//   totalProcessed: 20
// }
```

**What it does:**
- Maps `approved` (boolean) → `status` (enum: "approved" | "pending")
- Validates and corrects ratings (1-5 range)
- Adds `updatedAt` timestamp

## Validation Helpers Usage

### Validate Education Level

```typescript
import { validateEducationLevel } from '@/integrations/firebase/firebaseService';

validateEducationLevel("undergraduate");  // true
validateEducationLevel("masters");        // true
validateEducationLevel("phd");            // true
validateEducationLevel("diploma");        // false
```

**Valid values:** `"undergraduate"`, `"masters"`, `"phd"`

### Validate Project Status

```typescript
import { validateProjectStatus } from '@/integrations/firebase/firebaseService';

validateProjectStatus("pending");       // true
validateProjectStatus("in_progress");   // true
validateProjectStatus("review");        // true
validateProjectStatus("completed");     // true
validateProjectStatus("cancelled");     // true
validateProjectStatus("active");        // false
```

**Valid values:** `"pending"`, `"in_progress"`, `"review"`, `"completed"`, `"cancelled"`

### Validate App Role

```typescript
import { validateAppRole } from '@/integrations/firebase/firebaseService';

validateAppRole("admin");    // true
validateAppRole("student");  // true
validateAppRole("teacher");  // false
```

**Valid values:** `"admin"`, `"student"`

### Validate Contact Method

```typescript
import { validateContactMethod } from '@/integrations/firebase/firebaseService';

validateContactMethod("email");     // true
validateContactMethod("whatsapp");  // true
validateContactMethod("phone");     // false
```

**Valid values:** `"email"`, `"whatsapp"`

### Validate Rating

```typescript
import { validateRating } from '@/integrations/firebase/firebaseService';

validateRating(5);    // true
validateRating(3.5);  // false (must be integer)
validateRating(1);    // true
validateRating(6);    // false (max is 5)
```

**Valid range:** 1-5 (integers only)

## User Roles Management

### Create User Role

```typescript
import { createUserRole } from '@/integrations/firebase/firebaseService';

const roleId = await createUserRole("user-123", "student");
// Creates entry in user_roles collection
```

### Get User's Current Role

```typescript
import { getUserRole } from '@/integrations/firebase/firebaseService';

const userRole = await getUserRole("user-123");
// Returns: { id: "...", user_id: "user-123", role: "student", createdAt: ... }
// Returns null if no role assigned
```

### Update User Role

```typescript
import { updateUserRole } from '@/integrations/firebase/firebaseService';

await updateUserRole("user-123", "admin");
// Updates role to "admin" or creates if doesn't exist
```

### Get All Admins

```typescript
import { getUsersByRole } from '@/integrations/firebase/firebaseService';

const admins = await getUsersByRole("admin");
// Returns array of all users with admin role
```

### Get All User Roles (Admin Only)

```typescript
import { getAllUserRoles } from '@/integrations/firebase/firebaseService';

const allRoles = await getAllUserRoles();
// Returns all user role records, sorted by creation date
```

## Project Timeline Management

### Add Timeline Entry

```typescript
import { createTimeline } from '@/integrations/firebase/firebaseService';

const entryId = await createTimeline(
  "BW-2025-0001",           // projectId
  "Project assigned to admin",  // activityText
  "admin-user-id",          // actorId
  "admin"                   // actorType: "student" | "admin" | "system"
);

// System entry (auto-generated):
const entryId = await createTimeline(
  "BW-2025-0001",
  "Project status changed to in_progress",
  null,
  "system"
);
```

### Get Project Timeline

```typescript
import { getProjectTimeline } from '@/integrations/firebase/firebaseService';

const timeline = await getProjectTimeline("BW-2025-0001");
// Returns array of timeline entries, newest first
```

### Get Recent Timeline (All Projects)

```typescript
import { getRecentTimeline } from '@/integrations/firebase/firebaseService';

const recent = await getRecentTimeline(20);
// Returns 20 most recent timeline entries across all projects
```

### Delete Timeline Entry

```typescript
import { deleteTimelineEntry } from '@/integrations/firebase/firebaseService';

await deleteTimelineEntry("timeline-entry-id");
```

## Testimonials Management

### Create Testimonial

```typescript
import { createTestimonial } from '@/integrations/firebase/firebaseService';

const testimonialId = await createTestimonial({
  user_id: "user-123",           // Optional
  name: "John Doe",              // Required
  review: "Great service!",      // Required
  rating: 5,                     // 1-5 (validated)
  course: "Computer Science",
  school: "MIT",
  photo_url: "https://...",
  is_featured: false,
  status: "pending"              // pending | approved | rejected
});
```

**Validation:**
- Rating must be 1-5 integer
- Throws error if invalid

### Get Approved Testimonials

```typescript
import { getTestimonials } from '@/integrations/firebase/firebaseService';

const testimonials = await getTestimonials();
// Returns only approved testimonials, newest first
```

### Get Featured Testimonials (Homepage)

```typescript
import { getFeaturedTestimonials } from '@/integrations/firebase/firebaseService';

const featured = await getFeaturedTestimonials(5);
// Returns 5 featured and approved testimonials for homepage
```

### Approve Testimonial

```typescript
import { approveTestimonial } from '@/integrations/firebase/firebaseService';

await approveTestimonial("testimonial-id");
// Sets status to "approved" and adds updatedAt timestamp
```

### Reject Testimonial

```typescript
import { rejectTestimonial } from '@/integrations/firebase/firebaseService';

await rejectTestimonial("testimonial-id");
// Sets status to "rejected" and adds updatedAt timestamp
```

### Feature Testimonial

```typescript
import { featureTestimonial } from '@/integrations/firebase/firebaseService';

await featureTestimonial("testimonial-id", true);
// Featured on homepage

await featureTestimonial("testimonial-id", false);
// Remove from homepage
```

### Get User's Testimonials

```typescript
import { getUserTestimonials } from '@/integrations/firebase/firebaseService';

const userTestimonials = await getUserTestimonials("user-123");
// Returns all testimonials created by this user
```

### Get All Testimonials (Admin)

```typescript
import { getAllTestimonials } from '@/integrations/firebase/firebaseService';

const allTestimonials = await getAllTestimonials();
// Returns all testimonials regardless of status
```

## Migration Checklist

- [ ] Review `getMigrationStatus()` to see what needs migration
- [ ] Run `migrateProjectsToNewSchema()` if projectsNeedingMigration > 0
- [ ] Run `migrateTestimonialsToNewSchema()` if testimonialsNeedingMigration > 0
- [ ] Verify migration completed successfully
- [ ] Test project creation with new project IDs (BW-YYYY-NNNN)
- [ ] Test user role assignment
- [ ] Test timeline creation and retrieval
- [ ] Test testimonial approval workflow
- [ ] Update Firestore security rules in Firebase Console
- [ ] Monitor application for any data consistency issues

## Field Mapping Reference

### Projects Migration

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `category` | `discipline` | Mapped automatically |
| `level` | `academic_level` | Mapped automatically |
| `contactMethod` | `preferred_contact` | Mapped automatically |
| `needTopic` | `needs_topic` | Mapped automatically |
| `status` | `status` | Normalized to lowercase with underscores |

### Testimonials Migration

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `approved` (boolean) | `status` (enum) | true → "approved", false → "pending" |
| `rating` | `rating` | Validated to 1-5 range |

## Backward Compatibility

The migration utilities maintain backward compatibility:
- Old field names are preserved (not deleted)
- New field names are added alongside old ones
- Components can use either field name
- Gradual transition possible without breaking changes

## Error Handling

All migration functions include try-catch blocks:

```typescript
try {
  const result = await migrateProjectsToNewSchema();
  console.log(`Migrated ${result.migratedCount} projects`);
} catch (error) {
  console.error("Migration failed:", error);
  // Handle error appropriately
}
```

## Rollback Plan

If needed, you can rollback:
1. Keep a backup of original data before migration
2. Migration adds fields but doesn't delete old ones
3. Revert components to use old field names if needed
4. This approach allows for zero-downtime rollback

## Performance Considerations

- Migrations use Firestore batches for efficiency
- Batch writes have 500 document limit
- Status checks use getDocs() - consider usage limits
- Large collections may take time to migrate
- Monitor Firestore usage metrics

## Support & Troubleshooting

### Migration stuck?
- Check Firestore quotas and limits
- Verify no other batch operations running
- Check browser console for errors

### Data not migrating?
- Verify validation functions are working
- Check field names exactly match expected values
- Ensure Firestore security rules allow updates

### Need to migrate specific documents?
- Use `getProject()` and `updateProject()` for individual updates
- Combine with validation helpers for safe updates

## Next Steps

1. ✅ Review new schema implementation
2. ✅ Check migration status
3. ⏳ Run migrations if needed
4. ⏳ Update Firestore security rules in Firebase Console
5. ⏳ Update admin dashboard to show migration status
6. ⏳ Consider adding migration status to admin panel
7. ⏳ Monitor application after migration
8. ⏳ Document any custom field mappings needed

## API Reference

### Validation Functions
- `validateEducationLevel(level: string): boolean`
- `validateProjectStatus(status: string): boolean`
- `validateAppRole(role: string): boolean`
- `validateContactMethod(method: string): boolean`
- `validateRating(rating: number): boolean`

### User Roles Functions
- `createUserRole(userId: string, role: string): Promise<string>`
- `getUserRole(userId: string): Promise<any>`
- `updateUserRole(userId: string, newRole: string): Promise<string>`
- `getUsersByRole(role: string): Promise<any[]>`
- `getAllUserRoles(): Promise<any[]>`

### Timeline Functions
- `createTimeline(projectId: string, activityText: string, actorId: string | null, actorType: "student" | "admin" | "system"): Promise<string>`
- `getProjectTimeline(projectId: string): Promise<any[]>`
- `getRecentTimeline(maxResults?: number): Promise<any[]>`
- `deleteTimelineEntry(timelineId: string): Promise<void>`

### Migration Functions
- `migrateProjectsToNewSchema(): Promise<{ migratedCount: number; errorCount: number; totalProcessed: number }>`
- `migrateTestimonialsToNewSchema(): Promise<{ migratedCount: number; errorCount: number; totalProcessed: number }>`
- `getMigrationStatus(): Promise<{ totalProjects: number; projectsNeedingMigration: number; totalTestimonials: number; testimonialsNeedingMigration: number; needsMigration: boolean }>`

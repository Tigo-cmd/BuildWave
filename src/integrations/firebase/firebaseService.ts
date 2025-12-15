import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

// ============= UTILITY FUNCTIONS =============

/**
 * Generate a project ID with BW- prefix
 * Format: BW-YYYY-NNNN (e.g., BW-2025-0001)
 */
export const generateProjectId = async (): Promise<string> => {
  try {
    const year = new Date().getFullYear();
    const projectsRef = collection(db, "projects");
    
    // Get all projects from current year to count them
    const q = query(
      projectsRef,
      where("createdAt", ">=", new Date(year, 0, 1)),
      where("createdAt", "<", new Date(year + 1, 0, 1))
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1; // Next project number
    
    // Format as BW-YYYY-NNNN
    const projectId = `BW-${year}-${String(count).padStart(4, "0")}`;
    return projectId;
  } catch (error) {
    console.error("Error generating project ID:", error);
    throw error;
  }
};

// ============= VALIDATION HELPERS =============

/**
 * Validate education level enum
 */
export const validateEducationLevel = (level: string): boolean => {
  const validLevels = ["undergraduate", "masters", "phd"];
  return validLevels.includes(level.toLowerCase());
};

/**
 * Validate project status enum
 */
export const validateProjectStatus = (status: string): boolean => {
  const validStatuses = ["pending", "in_progress", "review", "completed", "cancelled"];
  return validStatuses.includes(status.toLowerCase());
};

/**
 * Validate app role enum
 */
export const validateAppRole = (role: string): boolean => {
  const validRoles = ["admin", "student"];
  return validRoles.includes(role.toLowerCase());
};

/**
 * Validate contact method enum
 */
export const validateContactMethod = (method: string): boolean => {
  const validMethods = ["email", "whatsapp"];
  return validMethods.includes(method.toLowerCase());
};

/**
 * Validate rating (1-5 stars)
 */
export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

// ============= USERS =============

export const createUser = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      id: userId,
      full_name: userData.name || userData.full_name || "",
      email: userData.email || "",
      course_of_study: userData.discipline || userData.course_of_study || null,
      education_level: userData.level || userData.education_level || "undergraduate",
      school: userData.school || null,
      phone: userData.phone || null,
      location: userData.location || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Additional fields from onboarding
      ...userData,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const searchUsers = async (searchQuery: string) => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as any))
      .filter(
        (user: any) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.school?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// ============= PROJECTS =============

export const createProject = async (projectData: any) => {
  try {
    // Generate project ID with BW- prefix
    const projectId = await generateProjectId();
    
    // Create project document with schema matching the types.ts structure
    const projectRef = doc(db, "projects", projectId);
    await setDoc(projectRef, {
      id: projectId,
      title: projectData.title || "Untitled Project",
      description: projectData.description || "",
      academic_level: projectData.level || projectData.academic_level || "undergraduate",
      discipline: projectData.category || projectData.discipline || "",
      deadline: projectData.deadline || null,
      budget_estimate: projectData.budget ? parseFloat(projectData.budget.toString()) : null,
      progress: projectData.progress || 0,
      status: projectData.status || "pending",
      user_id: projectData.userId,
      assigned_to: projectData.assigned_to || null,
      phone: projectData.phone || null,
      preferred_contact: projectData.contactMethod || "email",
      needs_topic: projectData.needTopic || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Custom fields not in schema but used by app
      category: projectData.category,
      haveProject: projectData.haveProject || false,
      level: projectData.level,
      contactMethod: projectData.contactMethod,
    });
    
    return projectId;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const getProject = async (projectId: string) => {
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

export const getUserProjects = async (userId: string) => {
  try {
    const q = query(
      collection(db, "projects"),
      where("user_id", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw error;
  }
};

export const updateProject = async (projectId: string, updates: any) => {
  try {
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const getProjectsByStatus = async (status: string) => {
  try {
    const q = query(
      collection(db, "projects"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting projects by status:", error);
    throw error;
  }
};

// ============= TESTIMONIALS =============

/**
 * Create a testimonial with schema validation
 * Maps to testimonials collection schema
 */
export const createTestimonial = async (testimonialData: any) => {
  try {
    // Validate rating if provided
    if (testimonialData.rating && !validateRating(testimonialData.rating)) {
      throw new Error("Rating must be a number between 1 and 5");
    }

    const docRef = await addDoc(collection(db, "testimonials"), {
      user_id: testimonialData.user_id || null,
      name: testimonialData.name || "",
      review: testimonialData.review || "",
      rating: testimonialData.rating || 5,
      course: testimonialData.course || "",
      school: testimonialData.school || "",
      photo_url: testimonialData.photo_url || null,
      is_featured: testimonialData.is_featured || false,
      status: testimonialData.status || "pending", // "pending" | "approved" | "rejected"
      createdAt: Timestamp.now(),
      // Legacy field for backward compatibility
      approved: testimonialData.approved || false,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
};

/**
 * Get approved testimonials
 */
export const getTestimonials = async () => {
  try {
    const q = query(
      collection(db, "testimonials"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting testimonials:", error);
    throw error;
  }
};

/**
 * Get all testimonials (admin)
 */
export const getAllTestimonials = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "testimonials"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all testimonials:", error);
    throw error;
  }
};

/**
 * Get featured testimonials (for homepage)
 */
export const getFeaturedTestimonials = async (maxResults: number = 10) => {
  try {
    const q = query(
      collection(db, "testimonials"),
      where("is_featured", "==", true),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting featured testimonials:", error);
    throw error;
  }
};

/**
 * Approve a testimonial (update status to approved)
 */
export const approveTestimonial = async (testimonialId: string) => {
  try {
    const docRef = doc(db, "testimonials", testimonialId);
    await updateDoc(docRef, {
      status: "approved",
      approved: true, // Legacy field
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    throw error;
  }
};

/**
 * Reject a testimonial
 */
export const rejectTestimonial = async (testimonialId: string) => {
  try {
    const docRef = doc(db, "testimonials", testimonialId);
    await updateDoc(docRef, {
      status: "rejected",
      approved: false, // Legacy field
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error rejecting testimonial:", error);
    throw error;
  }
};

/**
 * Feature a testimonial (for homepage display)
 */
export const featureTestimonial = async (testimonialId: string, featured: boolean = true) => {
  try {
    const docRef = doc(db, "testimonials", testimonialId);
    await updateDoc(docRef, {
      is_featured: featured,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error featuring testimonial:", error);
    throw error;
  }
};

/**
 * Delete a testimonial
 */
export const deleteTestimonial = async (testimonialId: string) => {
  try {
    await deleteDoc(doc(db, "testimonials", testimonialId));
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw error;
  }
};

/**
 * Get testimonials by user
 */
export const getUserTestimonials = async (userId: string) => {
  try {
    const q = query(
      collection(db, "testimonials"),
      where("user_id", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user testimonials:", error);
    throw error;
  }
};

// ============= TOPICS =============

export const createTopic = async (topicData: any) => {
  try {
    const docRef = await addDoc(collection(db, "topics"), {
      ...topicData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
};

export const getTopics = async () => {
  try {
    const snapshot = await getDocs(collection(db, "topics"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting topics:", error);
    throw error;
  }
};

export const getTopicsByCategory = async (category: string) => {
  try {
    const q = query(
      collection(db, "topics"),
      where("category", "==", category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting topics by category:", error);
    throw error;
  }
};

export const updateTopic = async (topicId: string, updates: any) => {
  try {
    const docRef = doc(db, "topics", topicId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating topic:", error);
    throw error;
  }
};

export const deleteTopic = async (topicId: string) => {
  try {
    await deleteDoc(doc(db, "topics", topicId));
  } catch (error) {
    console.error("Error deleting topic:", error);
    throw error;
  }
};

// ============= USER ROLES =============

/**
 * Create or assign a role to a user
 * Maps to user_roles collection schema
 */
export const createUserRole = async (userId: string, role: string) => {
  try {
    if (!validateAppRole(role)) {
      throw new Error(`Invalid role: ${role}. Must be 'admin' or 'student'`);
    }

    const docRef = await addDoc(collection(db, "user_roles"), {
      id: doc(collection(db, "user_roles")).path,
      user_id: userId,
      role: role.toLowerCase(),
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating user role:", error);
    throw error;
  }
};

/**
 * Get user's current role
 */
export const getUserRole = async (userId: string) => {
  try {
    // Get the user_roles document directly by user ID
    const docRef = doc(db, "user_roles", userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
};

/**
 * Update user's role
 */
export const updateUserRole = async (userId: string, newRole: string) => {
  try {
    if (!validateAppRole(newRole)) {
      throw new Error(`Invalid role: ${newRole}. Must be 'admin' or 'student'`);
    }

    const q = query(
      collection(db, "user_roles"),
      where("user_id", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Create new role if doesn't exist
      return createUserRole(userId, newRole);
    }

    const roleDoc = snapshot.docs[0];
    await updateDoc(roleDoc.ref, {
      role: newRole.toLowerCase(),
      updatedAt: Timestamp.now(),
    });

    return roleDoc.id;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

/**
 * Get all users with a specific role
 */
export const getUsersByRole = async (role: string) => {
  try {
    if (!validateAppRole(role)) {
      throw new Error(`Invalid role: ${role}. Must be 'admin' or 'student'`);
    }

    const q = query(
      collection(db, "user_roles"),
      where("role", "==", role.toLowerCase()),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
};

/**
 * Get all user roles (admin function)
 */
export const getAllUserRoles = async () => {
  try {
    const q = query(
      collection(db, "user_roles"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all user roles:", error);
    throw error;
  }
};

// ============= PROJECT TIMELINE =============

/**
 * Create a timeline entry for a project
 * Maps to project_timeline collection schema
 */
export const createTimeline = async (
  projectId: string,
  activityText: string,
  actorId: string | null,
  actorType: "student" | "admin" | "system" = "system"
) => {
  try {
    const docRef = await addDoc(collection(db, "timeline"), {
      project_id: projectId,
      activity_text: activityText,
      actor_id: actorId || null,
      actor_type: actorType,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    throw error;
  }
};

/**
 * Get timeline entries for a specific project
 */
export const getProjectTimeline = async (projectId: string) => {
  try {
    const q = query(
      collection(db, "timeline"),
      where("project_id", "==", projectId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting project timeline:", error);
    throw error;
  }
};

/**
 * Get recent timeline entries across all projects (limit results)
 */
export const getRecentTimeline = async (maxResults: number = 50) => {
  try {
    const q = query(
      collection(db, "timeline"),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recent timeline:", error);
    throw error;
  }
};

/**
 * Delete a timeline entry
 */
export const deleteTimelineEntry = async (timelineId: string) => {
  try {
    await deleteDoc(doc(db, "timeline", timelineId));
  } catch (error) {
    console.error("Error deleting timeline entry:", error);
    throw error;
  }
};

// ============= ADMIN STATS =============

export const getAdminStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const testimonialsSnapshot = await getDocs(collection(db, "testimonials"));

    const projects = projectsSnapshot.docs.map((doc) => doc.data());
    const activeProjects = projects.filter(
      (p) => p.status === "in-progress"
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length;

    return {
      totalUsers: usersSnapshot.size,
      totalProjects: projectsSnapshot.size,
      activeProjects,
      completedProjects,
      totalTestimonials: testimonialsSnapshot.size,
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
};

// ============= BATCH OPERATIONS =============

export const batchUpdateUsers = async (updates: { [userId: string]: any }) => {
  try {
    const batch = writeBatch(db);
    Object.entries(updates).forEach(([userId, userData]) => {
      const userRef = doc(db, "users", userId);
      batch.update(userRef, userData);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error batch updating users:", error);
    throw error;
  }
};

export const batchDeleteProjects = async (projectIds: string[]) => {
  try {
    const batch = writeBatch(db);
    projectIds.forEach((projectId) => {
      const projectRef = doc(db, "projects", projectId);
      batch.delete(projectRef);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error batch deleting projects:", error);
    throw error;
  }
};

// ============= MIGRATION UTILITIES =============

/**
 * Migrate existing projects to use proper schema field names
 * This is optional and should be run once to standardize field names
 * Maps old field names to new schema field names
 */
export const migrateProjectsToNewSchema = async () => {
  try {
    console.log("Starting project schema migration...");

    const projectsRef = collection(db, "projects");
    const snapshot = await getDocs(projectsRef);
    const batch = writeBatch(db);

    let migratedCount = 0;
    let errorCount = 0;

    snapshot.docs.forEach((doc) => {
      try {
        const projectData = doc.data();

        // Only migrate if not already migrated
        if (!projectData.id || !projectData.id.startsWith("BW-")) {
          console.warn(`Skipping project ${doc.id} - does not have BW- prefix`);
          return;
        }

        const updates: any = {};

        // Migrate field names to match schema
        if (projectData.category && !projectData.discipline) {
          updates.discipline = projectData.category;
        }

        if (projectData.level && !projectData.academic_level) {
          updates.academic_level = projectData.level;
        }

        if (projectData.contactMethod && !projectData.preferred_contact) {
          updates.preferred_contact = projectData.contactMethod;
        }

        if (projectData.needTopic !== undefined && projectData.needs_topic === undefined) {
          updates.needs_topic = projectData.needTopic;
        }

        // Normalize status if needed
        if (projectData.status) {
          const normalizedStatus = projectData.status.toLowerCase().replace(/ /g, "_");
          if (validateProjectStatus(normalizedStatus)) {
            updates.status = normalizedStatus;
          }
        }

        // Add updatedAt timestamp
        updates.updatedAt = Timestamp.now();

        if (Object.keys(updates).length > 0) {
          batch.update(doc.ref, updates);
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error processing project ${doc.id}:`, error);
        errorCount++;
      }
    });

    await batch.commit();
    console.log(
      `Migration complete: ${migratedCount} projects migrated, ${errorCount} errors`
    );

    return {
      migratedCount,
      errorCount,
      totalProcessed: snapshot.size,
    };
  } catch (error) {
    console.error("Error during project schema migration:", error);
    throw error;
  }
};

/**
 * Migrate existing testimonials to use proper schema field names
 * Maps 'approved' field to 'status' field
 */
export const migrateTestimonialsToNewSchema = async () => {
  try {
    console.log("Starting testimonials schema migration...");

    const testimonialsRef = collection(db, "testimonials");
    const snapshot = await getDocs(testimonialsRef);
    const batch = writeBatch(db);

    let migratedCount = 0;
    let errorCount = 0;

    snapshot.docs.forEach((doc) => {
      try {
        const testimonialData = doc.data();

        const updates: any = {};

        // Migrate approved -> status
        if (testimonialData.approved !== undefined && !testimonialData.status) {
          updates.status = testimonialData.approved ? "approved" : "pending";
        }

        // Ensure rating is valid
        if (
          testimonialData.rating &&
          !validateRating(testimonialData.rating)
        ) {
          updates.rating = Math.min(5, Math.max(1, testimonialData.rating));
        }

        updates.updatedAt = Timestamp.now();

        if (Object.keys(updates).length > 0) {
          batch.update(doc.ref, updates);
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error processing testimonial ${doc.id}:`, error);
        errorCount++;
      }
    });

    await batch.commit();
    console.log(
      `Migration complete: ${migratedCount} testimonials migrated, ${errorCount} errors`
    );

    return {
      migratedCount,
      errorCount,
      totalProcessed: snapshot.size,
    };
  } catch (error) {
    console.error("Error during testimonials schema migration:", error);
    throw error;
  }
};

/**
 * Get migration status - check how many documents need migration
 */
export const getMigrationStatus = async () => {
  try {
    const projectsRef = collection(db, "projects");
    const testimonialsRef = collection(db, "testimonials");

    const projectsSnapshot = await getDocs(projectsRef);
    const testimonialsSnapshot = await getDocs(testimonialsRef);

    let projectsNeedingMigration = 0;
    let testimonialsNeedingMigration = 0;

    // Check projects
    projectsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.id || !data.id.startsWith("BW-")) {
        projectsNeedingMigration++;
      }
      if (data.category && !data.discipline) {
        projectsNeedingMigration++;
      }
    });

    // Check testimonials
    testimonialsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.approved !== undefined && !data.status) {
        testimonialsNeedingMigration++;
      }
    });

    return {
      totalProjects: projectsSnapshot.size,
      projectsNeedingMigration,
      totalTestimonials: testimonialsSnapshot.size,
      testimonialsNeedingMigration,
      needsMigration: projectsNeedingMigration > 0 || testimonialsNeedingMigration > 0,
    };
  } catch (error) {
    console.error("Error getting migration status:", error);
    throw error;
  }
};
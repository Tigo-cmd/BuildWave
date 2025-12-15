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

// ============= USERS =============

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
    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: projectData.status || "pending",
    });
    return docRef.id;
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
      where("userId", "==", userId),
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

export const createTestimonial = async (testimonialData: any) => {
  try {
    const docRef = await addDoc(collection(db, "testimonials"), {
      ...testimonialData,
      createdAt: Timestamp.now(),
      approved: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
};

export const getTestimonials = async () => {
  try {
    const q = query(
      collection(db, "testimonials"),
      where("approved", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting testimonials:", error);
    throw error;
  }
};

export const getAllTestimonials = async () => {
  try {
    const snapshot = await getDocs(collection(db, "testimonials"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all testimonials:", error);
    throw error;
  }
};

export const approveTestimonial = async (testimonialId: string) => {
  try {
    const docRef = doc(db, "testimonials", testimonialId);
    await updateDoc(docRef, { approved: true });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    throw error;
  }
};

export const deleteTestimonial = async (testimonialId: string) => {
  try {
    await deleteDoc(doc(db, "testimonials", testimonialId));
  } catch (error) {
    console.error("Error deleting testimonial:", error);
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
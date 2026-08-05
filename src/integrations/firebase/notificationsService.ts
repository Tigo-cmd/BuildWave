import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface AppNotification {
  id?: string;
  user_id: string;
  project_id?: string;
  title: string;
  message: string;
  type: "status_update" | "message" | "deliverable" | "system";
  read: boolean;
  createdAt?: any;
}

/**
 * Create a new notification for a student or admin
 */
export const createNotification = async (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Fetch unread and recent notifications for a user
 */
export const getUserNotifications = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("user_id", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AppNotification));
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

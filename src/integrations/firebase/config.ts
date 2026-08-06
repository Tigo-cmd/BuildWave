// import { createClient } from '@supabase/supabase-js';
// import type { Database } from './types';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAjLc83aVcR7I2FcMs-TsQpPUSj3wDbSZ4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "buildwavebytigosofts.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "buildwavebytigosofts",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "buildwavebytigosofts.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1019341137788",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1019341137788:web:73febcfe68fdfcf74d26f9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
//   auth: {
//     storage: localStorage,
//     persistSession: true,
//     autoRefreshToken: true,
//   }
// });

export default app;
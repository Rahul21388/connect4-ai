/**
 * ========================================
 * FIREBASE CONFIGURATION (SDK 54 Correct)
 * ========================================
 * Fixes:
 * ✅ db implicit any errors
 * ✅ Proper Firestore typing
 * ✅ Correct Firebase config detection
 * ========================================
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Your Firebase Config (REAL VALUES)
 */
const firebaseConfig = {
  apiKey: "AIzaSyCCBVKdTz_rIqAlm-DR6JslyxUiMMaOzjE",
  authDomain: "connect4-ai-game.firebaseapp.com",
  projectId: "connect4-ai-game",
  storageBucket: "connect4-ai-game.firebasestorage.app",
  messagingSenderId: "383008470138",
  appId: "1:383008470138:web:1d44a627fdb161c2ba37c3",
};

/**
 * Firebase Config Check
 * (Proper check instead of comparing placeholder strings)
 */
export const isFirebaseConfigured = (): boolean => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

/**
 * Typed Firebase App + Firestore DB
 */
let app: FirebaseApp;
let db: Firestore;

/**
 * Initialise Firebase safely
 */
try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase Connected Successfully");
  } else {
    console.warn("⚠ Firebase not configured, running in mock mode.");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

/**
 * Export typed instances
 */
export { app, db };
export default firebaseConfig;


import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMCt814SZBJZJMy9nJPoSNUvgWgfZlGqE",
  authDomain: "denvercoworks-9e980.firebaseapp.com",
  projectId: "denvercoworks-9e980",
  storageBucket: "denvercoworks-9e980.firebasestorage.app",
  messagingSenderId: "152616623118",
  appId: "1:152616623118:web:ca30932ef47c260f87b05f",
  measurementId: "G-YH964917MS"
};

// Simple check to ensure we aren't using placeholder keys
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let app = null;
let db = null;
let storage = null;

if (isConfigured) {
  try {
    // SINGLETON PATTERN:
    // Check if Firebase is already initialized (common in hot-reload environments)
    // If it is, use the existing instance. If not, create a new one.
    if (getApps().length > 0) {
      app = getApp();
      console.log("Reconnected to existing Firebase instance:", app.options.projectId);
    } else {
      app = initializeApp(firebaseConfig);
      console.log("Initialized new Firebase instance:", app.options.projectId);
    }
    
    // Initialize services
    db = getFirestore(app);
    storage = getStorage(app);

  } catch (error: any) {
    console.error("CRITICAL FIREBASE ERROR:", error);
    // Alert the user so they know why the app might be broken
    if (typeof window !== 'undefined') {
       alert(`Database Connection Failed: ${error.message}`);
    }
  }
}

export { db, storage, isConfigured };

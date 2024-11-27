import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set, remove, update } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAEbtDTtm93-Av_CeXmfqLh85wigBwFg8Q",
    authDomain: "elaundryproject.firebaseapp.com",
    databaseURL: "https://elaundryproject-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "elaundryproject",
    storageBucket: "elaundryproject.appspot.com",
    appId: "1:36308749406:android:52d528ec9cda581f9478cf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Log Firebase initialization for debugging (only after initialization)
console.log("Firebase initialized successfully:", app.name);

export const auth = getAuth(app);
export const database = getDatabase(app);

// Export database utility functions
export { ref, get, set, remove, update };

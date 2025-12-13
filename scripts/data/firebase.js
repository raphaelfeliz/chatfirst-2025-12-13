import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, onSnapshot, updateDoc, collection, addDoc, writeBatch, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { firebaseConfig } from "../config.js";
import { logger } from "../utils/logger.js";

// Initialize Firebase
let app, db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    logger.log('DATA', 'Firebase Initialized', { projectId: firebaseConfig.projectId });
} catch (error) {
    logger.log('DATA', 'Firebase Initialization Failed', error);
    console.error("Firebase Init Error:", error);
}

export {
    db,
    doc,
    onSnapshot,
    updateDoc,
    collection,
    addDoc,
    writeBatch,
    getDoc,
    setDoc
};

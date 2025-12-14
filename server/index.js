import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Firebase Initialization
let db;

try {
    const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        initializeApp({
            credential: cert(serviceAccount)
        });

        db = getFirestore();
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("WARNING: FIREBASE_CREDENTIALS not found or invalid path. Firestore features will be disabled.");
    }
} catch (error) {
    console.error("Failed to initialize Firebase:", error);
}

// Routes
app.get('/api/status', async (req, res) => {
    const status = {
        server: 'online',
        firestore: 'disconnected',
        timestamp: new Date().toISOString()
    };

    if (db) {
        try {
            await db.listCollections();
            status.firestore = 'connected';
        } catch (e) {
            status.firestore = 'error';
            status.error = e.message;
        }
    }

    res.json(status);
});

// START SESSION: Creates a new chat document
app.post('/api/session/start', async (req, res) => {
    if (!db) {
        return res.status(503).json({ error: 'Database not initialized' });
    }

    try {
        const initialData = {
            createdAt: new Date().toISOString(),
            "product-choice": {},
            "user-data": { talkToHuman: false },
            "system-info": {
                userAgent: req.headers['user-agent'] || 'unknown',
                origin: req.headers['origin'] || 'unknown'
            }
        };


        // Generate custom ID: YYYYMMDD_HHMM_[random]
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-T:]/g, '').slice(0, 12); // YYYYMMDDHHMM
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const customId = `${timestamp}_${randomSuffix}`;

        const docRef = db.collection('chatlist').doc(customId);
        await docRef.set(initialData);

        console.log(`[SESSION] Created new session: ${customId}`);
        // Return valid sessionId for usage, and debugId for logging
        res.json({
            sessionId: customId,
            debugId: 'debug_' + customId,
            debug: true
        });
    } catch (e) {
        console.error('[SESSION] Error creating session:', e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

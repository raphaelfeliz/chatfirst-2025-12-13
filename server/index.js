import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Initialization
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountPath) {
    console.error('Error: FIREBASE_CREDENTIALS not found in .env');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
console.log('Firebase initialized successfully.');

// --- API Endpoints ---

// 1. Status Check
app.get('/api/status', async (req, res) => {
    try {
        // Quick verify of DB connection
        await db.listCollections();
        res.json({ status: 'ok', firestore: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// 2. Start Session
app.post('/api/session/start', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12); // YYYYMMDDHHMM
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const customId = `${timestamp}_${randomSuffix}`;

        const initialData = {
            createdAt: new Date().toISOString(),
            status: 'active',
            platform: 'web',
            messages: [],
            // Initialize empty facet state logic if needed, or let client update it
        };

        // Use custom ID
        const docRef = db.collection('chatlist').doc(customId);
        await docRef.set(initialData);

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

// 3. Update Facet Selection (Checkpoint 3.1)
app.put('/api/session/:id/product-choice', async (req, res) => {
    const { id } = req.params;
    const { selection } = req.body;

    if (!id || !selection) {
        return res.status(400).json({ error: 'Missing session ID or selection data' });
    }

    try {
        const docRef = db.collection('chatlist').doc(id);

        await docRef.update({
            "product-choice": selection,
            "updatedAt": new Date().toISOString()
        });

        console.log(`[FACET] Updated session ${id} with selection:`, JSON.stringify(selection));
        res.json({ success: true });
    } catch (e) {
        console.error(`[FACET] Error updating session ${id}:`, e);

        if (e.code === 5) { // NOT_FOUND
            res.status(404).json({ error: 'Session not found' });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
});

// 4. Save User Data (Checkpoint 4.1)
app.put('/api/session/:id/user-data', async (req, res) => {
    const { id } = req.params;
    const { userData } = req.body;

    try {
        await db.collection('chatlist').doc(id).update({
            userData: userData,
            updatedAt: new Date().toISOString()
        });
        console.log(`[USER-DATA] Updated session ${id} with:`, userData);
        res.json({ success: true });
    } catch (e) {
        console.error(`[USER-DATA] Error updating session ${id}:`, e);
        res.status(500).json({ error: e.message });
    }
});

// 5. Save Message (Checkpoint 4.2)
app.post('/api/session/:id/messages', async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.text) {
        return res.status(400).json({ error: 'Invalid message format' });
    }

    try {
        const docRef = db.collection('chatlist').doc(id);

        await docRef.update({
            messages: FieldValue.arrayUnion(message),
            lastMessage: message.text,
            lastMessageAt: new Date().toISOString()
        });

        console.log(`[MSG] Saved message for ${id}: ${message.text.substring(0, 20)}...`);
        res.json({ success: true });
    } catch (e) {
        console.error(`[MSG] Error saving message for ${id}:`, e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


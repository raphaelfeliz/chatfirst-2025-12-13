import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountPath) {
    console.error('Error: FIREBASE_CREDENTIALS not found in .env');
    process.exit(1);
}

// Handle relative path if needed, though usually absolute
let finalPath = serviceAccountPath;
if (!path.isAbsolute(serviceAccountPath)) {
    finalPath = path.resolve(process.cwd(), serviceAccountPath);
}

console.log(`Loading credentials from: ${finalPath}`);

if (!fs.existsSync(finalPath)) {
    console.error(`Error: File not found at ${finalPath}`);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(finalPath, 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
console.log('Firebase initialized. Querying Firestore...');

async function checkIds() {
    try {
        const snapshot = await db.collection('chatlist')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No documents found in chatlist.');
            return;
        }

        console.log(`Found ${snapshot.size} recent documents:`);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            console.log(`\n--- Session ID: ${doc.id} ---`);
            console.log(`Created At: ${data.createdAt}`);
            console.log(`Status: ${data.status}`);
            console.log(`Product Choice:`, JSON.stringify(data['product-choice'] || {}));
            console.log(`User Data:`, JSON.stringify(data['user-data'] || {}));

            // Check messages
            const msgSnapshot = await db.collection('chatlist').doc(doc.id).collection('messages').orderBy('timestamp', 'asc').get();
            console.log(`Message Count: ${msgSnapshot.size}`);
            if (!msgSnapshot.empty) {
                msgSnapshot.forEach(msg => {
                    const mData = msg.data();
                    console.log(`  [${mData.role}] ${mData.timestamp}: ${mData.content.substring(0, 50)}...`);
                });
            }
        }

    } catch (error) {
        console.error('Error querying Firestore:', error);
    }
}

checkIds();

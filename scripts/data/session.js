import { db, doc, onSnapshot, collection, setDoc, getDoc } from "./firebase.js";
import { logger } from "../utils/logger.js";

class SessionController {
    constructor() {
        this.chatId = null;
        this.unsubscribe = null;
        this.state = null; // Local mirror of DB state for diffing
    }

    /**
     * Initializes the session.
     * 1. Checks URL for ?chatId=...
     * 2. If present, connects to that doc.
     * 3. If missing, generates a new ID, creates doc, and updates URL.
     * @param {Function} onUpdateCallback - Function to call when state changes
     */
    async init(onUpdateCallback) {
        logger.group('SESSION', 'Initialization');

        const params = new URLSearchParams(window.location.search);
        let id = params.get('chatId');
        let isNewSession = false;

        if (!id) {
            id = this._generateId();
            isNewSession = true;
            logger.log('SESSION', 'Generated New ID', id);
        } else {
            logger.log('SESSION', 'Found Existing ID', id);
        }

        this.chatId = id;
        this._updateUrl(id);

        const chatDocRef = doc(db, "chats", this.chatId);

        // Ensure document exists
        if (isNewSession) {
            try {
                // Initialize with empty state
                const initialState = {
                    createdAt: new Date().toISOString(),
                    "product-choice": {},
                    "user-data": { talkToHuman: false }
                };
                await setDoc(chatDocRef, initialState);
                logger.log('SESSION', 'Created New Document', initialState);
            } catch (e) {
                logger.log('SESSION', 'Creation Failed', e);
            }
        }

        // Subscribe to changes
        this.unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const newData = docSnap.data();
                const oldState = this.state ? this.state['product-choice'] : null;
                const newState = newData['product-choice'];

                logger.log('SESSION', 'Snapshot Update', { source: docSnap.metadata.hasPendingWrites ? 'Local' : 'Server' });

                if (oldState && JSON.stringify(oldState) !== JSON.stringify(newState)) {
                    logger.track('SESSION', 'product-choice', oldState, newState);
                }

                this.state = newData;
                if (onUpdateCallback) onUpdateCallback(newData);
            } else {
                logger.log('SESSION', 'Document Does Not Exist!');
            }
        });

        logger.groupEnd('SESSION');
    }

    /**
     * Updates the URL without reloading page
     */
    _updateUrl(id) {
        const url = new URL(window.location);
        url.searchParams.set('chatId', id);
        window.history.pushState({}, '', url);
    }

    _generateId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }
}

export const session = new SessionController();

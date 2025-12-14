import { db, doc, onSnapshot, collection, setDoc, getDoc } from "./firebase.js";
import { logger } from "../utils/logger.js";

class SessionController {
    constructor() {
        this.chatId = null;
        this.unsubscribe = null;
        this.state = null; // Local mirror of DB state for diffing
    }

    /**
     * @desc Initializes the session logic. \n     * 1. Checks URL for existing `chatId`. \n     * 2. If missing, requests a new session from the server (or uses fallback). \n     * 3. Establishes Firestore listener for state synchronization. \n     * 4. Updates URL state and notifies parent frame.
     * @param {Function} onUpdateCallback - Function to call when state changes
     */
    async init(onUpdateCallback) {
        logger.group('SESSION', 'Initialization');

        const params = new URLSearchParams(window.location.search);
        let id = params.get('chatId');
        let isNewSession = false;

        if (!id) {
            // New Session: Fetch from Server
            try {
                const response = await fetch('http://localhost:3000/api/session/start', { method: 'POST' });
                const data = await response.json();

                if (data.sessionId) {
                    id = data.sessionId;
                    isNewSession = true;
                    logger.log('SESSION', 'Created New Server Session', { id, debugId: data.debugId });

                    // BROADCAST TO HOST (Handshake)
                    window.parent.postMessage({ type: 'SESSION_STARTED', chatId: id }, '*');
                } else {
                    throw new Error('No sessionId returned from server');
                }
            } catch (e) {
                logger.error('SESSION', 'Failed to create server session. Falling back to offline mode.', e);
                id = this._generateId(); // Fallback
            }
        } else {
            logger.log('SESSION', 'Found Existing ID', id);
        }

        this.chatId = id;
        this._updateUrl(id);

        // Connect to 'chatlist' (Updated from 'chats')
        const chatDocRef = doc(db, "chatlist", this.chatId);

        // No need to create doc here; the server did it.
        // If we fell back to offline generation, we might want to let the first write create it, 
        // or re-implement local creation if strictly needed. For now, assuming server succeeds.

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

    /**
     * Persist facet selections to the server.
     * @param {Object} selection - The currentSelections object.
     */
    async updateSelection(selection) {
        if (!this.chatId) {
            logger.warn('SESSION', 'Cannot save selection: No Chat ID');
            return;
        }

        logger.log('SESSION', 'Attemping to Save Selection to Server...', { id: this.chatId, selection });

        try {
            await fetch(`http://localhost:3000/api/session/${this.chatId}/product-choice`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selection })
            });
            logger.log('SESSION', 'Selection Saved to Server', selection);
        } catch (e) {
            logger.error('SESSION', 'Failed to save selection', e);
        }
    }

    /**
     * Persist user contact data to the server.
     * @param {Object} userData - The { userName, userPhone, ... } object.
     */
    async saveUserData(userData) {
        if (!this.chatId) return;

        logger.log('SESSION', 'Saving User Data...', userData);
        try {
            await fetch(`http://localhost:3000/api/session/${this.chatId}/user-data`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userData })
            });
            logger.log('SESSION', 'User Data Saved');
        } catch (e) {
            logger.error('SESSION', 'Failed to save user data', e);
        }
    }

    /**
     * Log a message to the server transcript.
     * @param {string} role - 'user' or 'assistant'.
     * @param {string} content - The text message.
     */
    async logMessage(role, content) {
        if (!this.chatId) return;

        // Optimistic local log? Not needed, UI handles display. This is just for storage.
        try {
            await fetch(`http://localhost:3000/api/session/${this.chatId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: {
                        role,
                        content,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            // Quiet success - don't spam logs for every msg
        } catch (e) {
            logger.error('SESSION', 'Failed to log message', e);
        }
    }
}

// @desc Singleton object for managing user session and remote persistence.
export const session = new SessionController();

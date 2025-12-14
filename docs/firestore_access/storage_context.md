# Firestore Storage Context & Architecture

**Last Updated:** 2025-12-14
**Status:** Active & Wired (Hybrid Architecture)

This document supersedes `context.md` and `layman_context.md`. It reflects the current, active implementation of the Firestore integration for the Chat Application.

## 1. High-Level Architecture: Hybrid Model

We utilize a **Hybrid Architecture** to balance security and real-time responsiveness:

*   **Writes (Secure via Proxy):** All data *written* to the database (session creation, option selections, messages) is sent to our **Node.js intermediate server** (`server/index.js`). This server validates the request and writes to Firestore using the `firebase-admin` SDK, which bypasses client-side security rules.
*   **Reads (Real-time via Client):** The frontend (`scripts/data/session.js`) uses the standard Firebase Client SDK (`onSnapshot`) to *listen* to the session document. This allows the UI to react instantly to updates (whether from the user or eventually the external Gemini agent).

### Why this approach?
*   **Security:** We do not expose write permissions to public users. Malicious users cannot "overwrite" their chat history or inject garbage data because the Server acts as a gatekeeper.
*   **Real-time:** We retain the "magic" of instant updates by letting the client listen to changes directly. Note: This requires Firestore Security Rules to allow `read` access to the specific session ID.

## 2. Implementation Details

### The "Brain" (Backend Server)
*   **Location:** `server/index.js`
*   **Role:** Authenticated Admin.
*   **Credentials:** Uses specific Service Account credentials (stored safely via `FIREBASE_CREDENTIALS` env var).
*   **Endpoints:**
    1.  `POST /api/session/start`: Generates a secure Session ID and creates the initial document.
    2.  `PUT /api/session/:id/product-choice`: Updates the facet selections (e.g., "Sistema", "Cor").
    3.  `POST /api/session/:id/messages`: Appends a new message to the `messages` subcollection.
    4.  `PUT /api/session/:id/user-data`: Updates contact info (currently simulation-only).

### The "Client" (Frontend Scripts)
*   **State Manager:** `scripts/data/session.js`
    *   Initializes the session (calls API).
    *   Listens for updates (`onSnapshot`).
    *   Exposes methods (`updateSelection`, `logMessage`) to the rest of the app.
*   **Orchestrator:** `scripts/app.js`
    *   **Wired:** Automatically calls `session.updateSelection()` whenever the user changes a facet.
*   **UI:** `scripts/ui/chat.js`
    *   **Wired:** Automatically calls `session.logMessage()` whenever the user sends a message.

## 3. Data Flow & Schema

### Collection: `chatlist`
Each document represents one visitor session.

**Document ID:** `YYYYMMDDHHMM_RANDOM` (e.g., `202512141530_ABC123`)

**Fields:**
*   `createdAt`: ISO Timestamp
*   `status`: "active"
*   `product-choice`: Map of current selections (e.g., `{ sistema: "suprema", cor: "branco" }`)
*   `user-data`: Map of contact info (e.g., `{ userName: "...", talkToHuman: true }`)
*   `lastMessage`: String (Preview of last text)

**Subcollection: `messages`**
*   `role`: "user" | "assistant"
*   `content`: Message text
*   `timestamp`: ISO Timestamp

## 4. Status of Integration

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Session Creation** | ✅ **Done** | Auto-starts on load if `?chatId` is missing. |
| **Facet Saving** | ✅ **Done** | `app.js` automatically persists every click. |
| **Message Saving** | ✅ **Done** | `chat.js` logs user text. Bot text is simulated locally + logged. |
| **Contact Saving** | ⚠️ **Partial** | Backend ready. Frontend only has a `/sim-contact` debug command. No UI form yet. |
| **Security Rules** | ⚠️ **Pending** | Production Firestore Rules must be set to allow public `read` on `chatlist/{id}` for the client `onSnapshot` to work. |

## 5. Corrections to Previous Documentation
*   *Old Context:* Claimed persistence was "not yet wired" into the active UI.
*   *Correction:* **Persistence is now fully wired.** The codebase actively calls the server endpoints during normal usage.
*   *Old Context:* "The Ears are Blocked" (Layman Context).
*   *Correction:* This remains a configuration check. Ensure Firestore Rules allow `read` access, or the `onSnapshot` listener will fail (even though writes will succeed via the server).

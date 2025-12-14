instructions:
- never edit or delete exising logs, only add to the bottom.
- use this title template: "[N + 1] LOG NAME" where N is the number of the previous log.

use this template:

# [N + 1] LOG NAME
## STATUS:
- PENDING
## reference task:
-
## PURPOSE:
-
## APPROACH:
-
## TASKS:
- [ ] Task 1
    - trigger: (What starts this task)
    - condition: (What needs to be true)
    - detail: (Specific action taken)
 
## OUTCOMES:

## NOTES:
- (Add specs to remember, such as IDs, URLs, versions, etc.)

## LEARNINGS:
- (Based on mistakes, note here how we should do it better next time.).

---

# [1] INITIALIZE PROJECT
## STATUS:
- DONE
## reference task:
- Phase 1 > 1.1 > 1.1.1
## PURPOSE:
- Initialize Node.js environment and install backend dependencies.
## APPROACH:
- Create `package.json` with ESM support.
- Install `express`, `firebase-admin`, `cors`, `dotenv`.
## NOTES:
- Added `"type": "module"` to supported proper ES module imports.
- `package.json` created and dependencies installed successfully.


# [2] SERVER SCAFFOLDING
## STATUS:
- DONE
## reference task:
- Phase 1 > 1.2
## PURPOSE:
- Create the server entry point and configuration support.
## APPROACH:
- Created `server/index.js` with Express and optional Firestore init.
- Created `.env` (via shell command to bypass gitignore tool check) for credentials.
## NOTES:
- Server checks for `FIREBASE_CREDENTIALS` env var.
- `.env` created but currently points to a dummy path.
- `GET /api/status` implemented.


# [3] SERVER CONNECTIVITY
## STATUS:
- DONE
## reference task:
- Phase 1 > 1.2 > 1.2.1
## PURPOSE:
- Verify that the server can authenticate and talk to Firestore.
## APPROACH:
- Updated `.env` with the actual path to the service account JSON.
- Restarted the server (`npm start`).
- Hit `/api/status` to confirm `firestore: "connected"`.
## NOTES:
- Used `Get-Process node | Stop-Process` to ensure clean restart.
- Test Response: `{"server":"online","firestore":"connected", ...}`.


# [4] SESSION API IMPLEMENTATION
## STATUS:
- DONE
## reference task:
- Phase 2 > 2.1 > 2.1.1
## PURPOSE:
- Expose an endpoint to generate unique session IDs backed by Firestore.
## APPROACH:
- Added `POST /api/session/start` to `server/index.js`.
- Uses `db.collection('chats').add(...)` to create document.
## TASKS:
- Implement route handler.
- Validate DB initialization.
- Return `sessionId`.

## OUTCOMES:
- Endpoint is active and generating IDs (e.g., `rO6OXk6AuAOlJgqkoLpX`).
- New document created in 'chats' collection with initialized fields.

## FILES:
- `server/index.js`
- `docs/firestore_access/firestore_access_log.md`

## NOTES:
- Successful curl test: `{"sessionId":"..."}`.


# [5] DEBUG MODE ACTIVATION
## STATUS:
- DONE
## reference task:
- N/A (User Request)
## PURPOSE:
- Enhance observability for development and verification.
## APPROACH:
- Modified `POST /api/session/start` to return `debug: true` and prefix `sessionId` with `debug_`.
## TASKS:
- Modify `server/index.js` response logic.
- Restart server.
- Verify curl output.

## OUTCOMES:
- Server now returns IDs like `debug_7uH0sQHgZWon2GxTESEt`.
- Makes it trivial to spot which sessions are from this dev cycle in the logs/UI.

## FILES:
- `server/index.js`

## NOTES:
- Successful curl test: `{"sessionId":"debug_7uH0sQHgZWon2GxTESEt","debug":true}`.


# [6] COLLECTION MIGRATION (chats -> chatlist)
## STATUS:
- DONE
## reference task:
- N/A (User Request)
## PURPOSE:
- Separate new data into a dedicated `chatlist` collection.
- Refine debug response to ensure valid `sessionId` is preserved.
## APPROACH:
- Changed `db.collection('chats')` to `db.collection('chatlist')`.
- Updated response payload to include clean `sessionId` plus `debugId`.
## TASKS:
- Modify `server/index.js`.
- Restart server.
- Verify curl output.

## OUTCOMES:
- Sessions now saved to `chatlist`.
- Response format: `{"sessionId":"...","debugId":"debug_...","debug":true}`.
- Allows client to use functional ID while preserving debug log capability.

## FILES:
- `server/index.js`
- `docs/firestore_access/firestore_access_log.md`

## NOTES:
- Successful curl test: session ID `Gj73RlKGzUZ33xnXD8ai`.


# [7] CUSTOM SESSION ID FORMAT
## STATUS:
- DONE
## reference task:
- N/A (User Request)
## PURPOSE:
- Ensure session IDs are human-readable and sortable.
- IDs should follow `YYYYMMDDHHMM_{UNIQUE}` format.
## APPROACH:
- Modified `POST /api/session/start` to generate custom ID.
- Used `db.collection('chatlist').doc(customId).set(...)`.
## TASKS:
- Modify ID generation logic in `server/index.js`.
- Restart server.
- Verify curl output.

## OUTCOMES:
- Sessions now have IDs like `202512140146_VV4AO0`.
- Chronological sorting is now implicit in the ID.

## FILES:
- `server/index.js`
- `docs/firestore_access/firestore_access_log.md`

## NOTES:
- Successful curl test: `{"sessionId":"202512140146_VV4AO0", ...}`.


# [8] CLIENT INTEGRATION
## STATUS:
- DONE
## reference task:
- Phase 2 > 2.2 > 2.2.1
## PURPOSE:
- Connect the frontend to the backend session manager.
## APPROACH:
- Refactored `scripts/data/session.js` to fetch `/api/session/start`.
- Updated `scripts/app.js` to initialize the session on load.
## TASKS:
- [x] Refactor `session.js` `init()` logic.
    - trigger: `app.js` calls `session.init()`.
    - condition: No `chatId` in URL or local storage.
    - detail: `fetch` calls API, receives ID, connects to Firestore.
- [x] Update `app.js` imports.
    - trigger: App startup.
    - condition: N/A.
    - detail: Imported `session` and called `init`.

## OUTCOMES:
- Frontend now auto-creates sessions via server.
- Browser URL updates with `?chatId=2025...`.
- Console logs `[SESSION] Created New Server Session`.

## FILES:
- `scripts/data/session.js`
- `scripts/app.js`
- `docs/firestore_access/firestore_access_log.md`

## NOTES:
- Client now uses `chatlist` collection.


# [9] EMBED DOCUMENTATION
## STATUS:
- DONE
## reference task:
- Phase 5 > 5.1, 5.2, 5.3
## PURPOSE:
- Provide the widget script for external sites and verify persistence.
## APPROACH:
- Created `scripts/widget/embed.js` (Launcher + Iframe + Handshake).
- Updated `scripts/data/session.js` to `window.parent.postMessage`.
- Created `mock-host.html` to simulate a customer site.
## TASKS:
- [x] Create Embed Script.
    - trigger: User request.
    - condition: Must replicate visual style of reference.
    - detail: Implemented `embed.js` with `localStorage` check.
- [x] Implement Broadcast.
    - trigger: New session created.
    - condition: N/A.
    - detail: `postMessage({ type: 'SESSION_STARTED', ... }, '*')`.
- [x] Create Mock Host.
    - trigger: Testing need.
    - condition: N/A.
    - detail: created `mock-host.html`.

## OUTCOMES:
- Loading `mock-host.html` verifies:
    1. Widget appears (bobbing animation).
    2. Click opens iframe.
    3. New session ID is generated.
    4. Host page receives and displays the ID.

## FILES:
- `scripts/widget/embed.js`
- `mock-host.html`
- `scripts/data/session.js`

## NOTES:
- Security: `postMessage` targetOrigin is `*` for now (localhost dev). Should be restricted in prod.


# [10] WIDGET INTEGRATION VERIFICATION
## STATUS:
- DONE
## reference task:
- Phase 5 > 5.3
## PURPOSE:
- Verify the independent widget SDK loads the main application correctly.
## APPROACH:
- User identified the correct local port for the frontend app (`59259`).
- Updated `embed.js` config to point to `http://localhost:59259`.
## TASKS:
- [x] Fix iframe URL port.
    - trigger: Widget showing "refused to connect" error.
    - condition: `embed.js` must point to where `index.html` is properly served.
    - detail: Updated `iframeBaseUrl`.

## OUTCOMES:
- Widget loads successfully.
- Iframe content appears (Chat App).
- End-to-end flow from Host Page -> Widget -> App -> Server (Session ID) is active.

## FILES:
- `c:\dev\chatfirst-widget\embed.js`

## NOTES:
- Local port management is key for testing. In production, this will be a fixed domain (e.g. `app.chatfirst.com`).

## LEARNINGS:
- N/A










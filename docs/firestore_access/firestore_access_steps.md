# FIRESTORE DATA INTEGRATION PLAN
Layperson guide for getting our chat experience fully wired into Firestore, organized into small, testable phases.

---

# 1 SETUP CREDENTIALS
## STATUS: PENDING
## PURPOSE:
Obtain and secure the Firebase service-account key so backend code can talk to Firestore with elevated permissions.
## APPROACH:
Use the Firebase console to generate a new service-account JSON, store it outside the repo, and reference it via an environment variable that backend services can read.
## TASKS:
- REQUEST SERVICE ACCOUNT KEY: Generate a fresh JSON key from Firebase Project Settings → Service Accounts.
- SECURE KEY STORAGE: Move the JSON outside the repo, lock down OS permissions, and document its absolute path.
- UPDATE CONFIGURATION: Add an environment variable (e.g., `FIREBASE_CREDENTIALS`) that points to the stored key path.
## FILES:
- docs/firestore_access_steps.md: This checklist tracks completion of each setup phase.
- scripts/config.js: Holds the Firebase project identifiers you’ll match when generating the key.

---

# 2 TEST CONNECTION & SERVER SETUP
## STATUS: PENDING
## PURPOSE:
Confirm that the backend can authenticate with Firestore by spinning up a tiny server and hitting a “status” endpoint.
## APPROACH:
Install `firebase-admin` plus a lightweight HTTP framework, initialize the Admin SDK using the environment variable, and expose an endpoint that attempts a trivial Firestore read/write.
## TASKS:
- INSTALL DEPENDENCIES: Add `firebase-admin` and the chosen server framework (e.g., Express) to `package.json`.
- INITIALIZE ADMIN SDK: Create shared bootstrap code that loads the service-account key and configures the Firestore client.
- CREATE STATUS ENDPOINT: Build `/api/status` that responds only after a Firestore ping succeeds.
## FILES:
- package.json: Declares the new server dependencies so everyone installs the same versions.
- server/index.js: Hosts the Admin SDK bootstrap code and the `/api/status` handler.

---

# 3 START USER SESSION
## STATUS: PENDING
## PURPOSE:
Create a session document the moment a user opens the chat so every later write can target the same Firestore record.
## APPROACH:
Expose an API route such as `/api/session/start` that generates a unique ID, stores metadata (`createdAt`, `hostDomain`, empty maps), and returns the ID to the iframe/host handshake.
## TASKS:
- CREATE SESSION API: Add the `/api/session/start` route to `server/index.js`.
- WRITE INITIAL SESSION DOC: Use Firestore to insert the new document with timestamps, `userData`, and `productChoice`.
- RETURN SESSION ID: Send the document ID back to the client so the iframe query string and postMessage can reuse it.
## FILES:
- server/index.js: Contains the route logic for session creation and the Firestore write call.
- scripts/data/session.js: Client helper that calls the session API and stores the returned ID for future updates.

---

# 4 SAVE FACET DATA
## STATUS: PENDING
## PURPOSE:
Persist the selected facets (“categoria”, “sistema”, etc.) for the active session so reloading the chat replays the same configuration.
## APPROACH:
Define a standard payload for facet selections, then expose `/api/session/:id/product-choice` (or similar) to merge those fields into the Firestore document whenever the wizard or Gemini changes them.
## TASKS:
- DEFINE FACET STRUCTURE: Document exact keys and acceptable values that the API will accept.
- IMPLEMENT SAVE ENDPOINT: Add a route on the server that validates the payload and updates Firestore with atomic merges.
- HOOK UP CLIENT CALLS: Update `scripts/app.js` so every facet change triggers the save endpoint before the UI rerenders.
## FILES:
- server/index.js: Hosts the facet-saving endpoint and merge logic.
- scripts/app.js: Calls the endpoint whenever `currentSelections` changes to keep Firestore aligned.

---

# 5 SAVE USER DATA (MESSAGES & HANDOFF)
## STATUS: PENDING
## PURPOSE:
Capture user contact info and conversation history so handoff flows survive across visits and operators can review transcripts.
## APPROACH:
Add endpoints (e.g., `/api/session/:id/user-data` and `/api/session/:id/messages`) that append contact fields or message objects to the session document and its `messages` subcollection, then call them from the chat UI whenever a user or Gemini sends a message.
## TASKS:
- CREATE USER-DATA ENDPOINT: Merge `userName`, `userPhone`, `userEmail`, and `talkToHuman` into the session document.
- CREATE MESSAGE ENDPOINT: Append message bubbles to a `messages` subcollection with timestamps and `role`.
- UPDATE CHAT FLOW: Modify `scripts/ui/chat.js` (and any Gemini orchestrator) to call these endpoints after every send/receive event.
## FILES:
- server/index.js: Implements the user-data and message endpoints plus Firestore writes.
- scripts/ui/chat.js: Sends user messages to the new endpoints and refreshes the UI when Firestore pushes updates.
- scripts/data/session.js: Supplies the active session ID needed by both endpoints.

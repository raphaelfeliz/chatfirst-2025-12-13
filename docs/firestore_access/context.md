# Firestore Integration Context
This document captures the high-level background needed before wiring our configurator and chat UI to Firestore via the new service-account driven backend.

## Current Status
- **Frontend-only state:** The live wizard keeps selections inside the browser (`currentSelections` in `scripts/app.js`), rebuilds the chat transcript from that state, and loses everything on refresh.
- **No persistent chat:** Free-form chat entries exist only in the DOM; once a facet changes, the chat pane resets and nothing is saved server-side.
- **Backend reference only:** The Python Cloud Function in `gemini-endpoint/main.py` is an archive reference. There is no active backend connected to Firestore or the UI.
- **Docs/plan ready:** We now have `docs/firestore_access/firestore_access_steps.md` describing phases for credentials, server setup, session creation, facet saves, and user data saves.

## Target State
- **Session continuity:** Every visitor gets a Firestore session document (`users/{uid}` or `sessions/{id}`) as soon as the widget loads so the same state can resume across visits.
- **Facet persistence:** Facet selections (“categoria”, “sistema”, etc.) persist to Firestore on every change and are reloaded when the chat restarts.
- **User data reliability:** Contact info (`userName`, `userPhone`, `userEmail`, `talkToHuman`) is stored centrally, enabling smooth human handoff and CRM follow-ups.
- **Message history:** Both user messages and Gemini responses are written to a `messages` collection/subcollection so the chat UI can stream real-time updates and operators have a transcript.
- **Backend mediation:** A Node-based backend sits between the UI, Firestore, and Gemini, enforcing schema, validating payloads, and owning the service-account key.

## General Approach
1. **Secure access:** Generate and store the Firebase service-account JSON outside the repo, reference it via environment variables, and use it to bootstrap `firebase-admin`.
2. **Spin up backend:** Create a minimal Node server (`server/index.js`) with endpoints for health checks, session creation, facet updates, user-data updates, and message logging.
3. **Implement host-widget handshake:** Use localStorage in the host page to keep session IDs, pass them into the iframe query string, and sync new IDs via `postMessage`.
4. **Persist state incrementally:** Call the new endpoints from `scripts/app.js`, `scripts/ui/chat.js`, and any Gemini orchestrator whenever selections, contact data, or messages change.
5. **Validate via smoke tests:** After each phase, use small cURL commands or Firebase console checks to confirm documents update as expected before moving on.

With this context in mind, follow the phase checklist in `docs/firestore_access/firestore_access_steps.md` to move from today’s ephemeral UI to a production-grade Firestore-backed experience.

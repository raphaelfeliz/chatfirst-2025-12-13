# Contact & Message Persistence Plan (Simulated AI)

This plan details the steps to wire up the storage for User Contact Information and Chat History into Firestore. Since the real AI (Gemini) integration is currently pending, we will implement a "Simulation Mode" to trigger these saves from the frontend, ensuring our database plumbing is solid before adding the complex AI logic.

---

## 1. Backend: User Data Endpoint
**Layman Context:**
Think of this as installing a secure mailbox specifically for "Business Cards". When a user decides to share their name or phone number, the website needs a specific, safe place on the server to send that card. This step involves building that receiver slot in our server code so it knows how to take that card and file it into the correct customer's folder in the database.

**Tasks:**
- [ ] **Implement Route:** Add `PUT /api/session/:sessionId/user-data` to `server/index.js`.
- [ ] **Validation:** Ensure the server only accepts valid fields (`userName`, `userPhone`, `userEmail`, `talkToHuman`).
- [ ] **Firestore Write:** Use `db.collection('chatlist').doc(sessionId).update(...)` to merge this data.

**Verification:**
- **Agent Test:** Use `curl` to send a JSON payload with dummy contact info to a known session ID and assert the server returns `200 OK`.
- **User Double-Check:** You will check the server logs (or Firestore console if you wish) to see that the fields actually appeared in the document.

---

## 2. Backend: Message Logging Endpoint
**Layman Context:**
Currently, our chat is like a phone call that isn't recorded—once you hang up (refresh the page), the words are gone. We are building a "Transcript Logbook". We will create a system where every single text bubble sent by you or the bot is immediately written into a permanent sub-folder in the database. This ensures that even if the power goes out, the conversation history is safe.

**Tasks:**
- [ ] **Implement Route:** Add `POST /api/session/:sessionId/messages` to `server/index.js`.
- [ ] **Structure:** Messages will be saved as a **Sub-collection** named `messages` inside the session document.
- [ ] **Payload:** Expect `{ role: 'user' | 'assistant', content: '...', timestamp: ... }`.

**Verification:**
- **Agent Test:** Send a `POST` request simulating a user saying "Hello" and an assistant saying "Hi there".
- **User Double-Check:** N/A (Agent verification should be sufficient here, user verifies in Step 5).

---

## 3. Frontend: Client Data Layer
**Layman Context:**
Now that the server (the destination) is ready, we need to teach the browser (the sender) how to package this information. We are updating the `SessionController`, which is like the browser's "Shipping Department". We will give it two new standard procedures: one for shipping "Business Cards" (user data) and one for shipping "Transcript Lines" (messages).

**Tasks:**
- [ ] **Update `session.js`:** Add method `saveUserData(data)` that calls the `PUT` endpoint.
- [ ] **Update `session.js`:** Add method `logMessage(role, content)` that calls the `POST` endpoint.

**Verification:**
- **Agent Test:** I will write a small temporary script in the browser console (via `window.session`) to call these new functions and verify they trigger the correct network requests without errors.

---

---

## 4. Frontend: Simulation Triggers (The "Fake AI")
**Layman Context:**
Since we don't have the "Smart Brain" (AI) installed yet to automatically realize when you've typed a name or asked for a human, we need a manual override to test our pipes. We will create a "Developer Mode" command. When you type a specific secret code into the chat, the website will pretend the AI just extracted your contact info and attempt to save it. This proves our storage works without needing the real AI yet.

**Tasks:**
- [ ] **Command Listener:** In `scripts/ui/chat.js`, listen for a specific input string like `/sim-contact`.
- [ ] **Trigger Action:** When detected, fire `session.saveUserData()` with hardcoded dummy data (e.g., "John Doe", "555-0199") and set `talkToHuman: true`.
- [ ] **Visual Feedback:** Show a small system alert or log in the chat saying "Simulating Contact Save...".

**Verification:**
- **User Double-Check:** You will open the chat, type `/sim-contact`, and confirm that the UI doesn't crash. Then, you'll verify (via the provided tools or logs) that "John Doe" was saved to the server.

---

## 5. Frontend: Live Chat Logging
**Layman Context:**
The final piece of the puzzle is "Wiretapping" our own chat box. We will hook into the "Send" button. Every time a message bubble appears on the screen—whether you typed it or the bot replied—we simultaneously send a copy to our new "Transcript Logbook" on the server.

**Tasks:**
- [ ] **Hook User Send:** In `scripts/ui/chat.js`, inside the send handler, call `session.logMessage('user', text)`.
- [ ] **Hook Bot Reply:** Wherever the mock/simulated bot reply is generated, call `session.logMessage('assistant', text)`.

**Verification:**
- **User Double-Check:** You will have a normal conversation with the mock bot. Then, we will query the database to list all messages for your session. If the list matches your conversation, we are successful.

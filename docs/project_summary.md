# Project Overview: Chatfirst Fábrica do Alúminio

## Project Summary
This application is an interactive product configurator for aluminum windows and doors ("esquadrias"). It employs a **Hybrid Architecture**:
1.  **Frontend**: A responsive web interface (HTML/Tailwind/JS) that works as a visual wizard or a chat bot.
2.  **Backend Control**: A Node.js/Express server that manages session creation.
3.  **Persistence**: Google Firestore acts as the real-time database, syncing state between the client, server, and potential admin tools.

The app is designed to be embedded (via `iframe`) into a parent host site, communicating session states back to the host via `postMessage`.

---

## UI and Design Structure
The user interface is built with **HTML5** and styled using **Tailwind CSS**. It is responsive, featuring a split-view on desktop and a tabbed view on mobile.

### 1. Navigation Bar (`nav#main-navbar`)
The top persistent header.
*   **Parent**: `body`
*   **Children**:
    *   `navbar-brand`: Displays the logo.
    *   `restart-button`: A global reset action to clear all selections.
*   **Summary**: Provides branding and a quick way to start over.

### 2. Mobile Tab Bar (`div#mobile-tab-bar`)
Visible only on mobile devices (`lg:hidden`).
*   **Parent**: `body`
*   **Children**:
    *   `tab-wizard`: Switches view to the visual selector.
    *   `tab-chat`: Switches view to the conversation history.
*   **Summary**: Manages screen real estate on small devices by toggling between the two main interaction modes.

### 3. Wizard Column (`div#wizard-column`)
The primary interaction area (Left side on Desktop, Main tab on Mobile).
*   **Parent**: `main#main-content`
*   **Children**:
    *   `wizard-header`: Shows the current question title (e.g., "Qual a categoria?").
    *   `breadcrumb-container`: A horizontal list of "chips" showing previous choices. Allows users to jump back steps.
    *   `option-grid`: The dynamic container where visually rich cards (Image + Label) appear for the user to click.
    *   `result-area`: A hidden-by-default container that overlays the grid when a final product is found.
*   **Summary**: This is the "Engine Room" where users make decisions. It dynamically updates based on the current context.

### 4. Chat Sidebar (`aside#chat-sidebar`)
The contextual assistant (Right side on Desktop, Secondary tab on Mobile).
*   **Parent**: `main#main-content`
*   **Children**:
    *   `chat-messages`: A scrollable feed that logs the conversation history (Bot questions + User answers).
    *   `chat-input-area`: A text field for users to ask free-form questions.
*   **Summary**: Acts as a "living receipt" of the interaction. It mirrors the wizard's progress in a text format and allows for (simulated) AI assistance.

---

## Detailed Application Flows

### 1. Session Lifecycle & Handshake
The app never runs "stateless". It always ensures a valid session ID exists to track user progress.

*   **Initialization**: `session.js -> init()`
    1.  **Check URL**: Looks for `?chatId=...`.
    2.  **If Missing**:
        *   Calls `POST /api/session/start` on the backend.
        *   Server generates a unique ID (Timestamp + Random) and creates a blank Firestore document.
        *   Client receives ID, updates URL, and broadcasts `SESSION_STARTED` to the parent window (Host).
    3.  **If Present**: Connects directly to the existing Firestore document using the ID from the URL.

### 2. The Decision Engine Layout (`logic.js`)
The core logic is deterministic and driven by a priority list (`FACET_ORDER`).

1.  **User Selection**: User clicks an option (e.g., "Janela").
2.  **State Update**: `handleSelection()` updates the local state object.
3.  **Loop (`runFacetLoop`)**:
    *   **Filter**: `applyFilters()` reduces the 400+ product catalog down to matching items.
    *   **Check Next Facet**: The engine looks at the *next* attribute in priority (e.g., "Sistema").
    *   **Auto-Resolution**:
        *   **>1 Options**: Stops and asks the user (renders cards).
        *   **1 Option**: **Auto-selects** that value and loops again immediately (skips the question).
        *   **0 Options**: Flags a deadlock error.
    *   **Termination**: If only 1 product remains, the loop ends and displays the final result.

### 3. Data Persistence (Firestore)
All significant actions are mirrored to the cloud for analytics and state recovery.

*   **Selections**:
    *   **Trigger**: Every valid click in the Wizard or Chat.
    *   **Endpoint**: `PUT /api/session/:id/product-choice`
    *   **Data**: The entire `currentSelections` object.
*   **User Data**:
    *   **Trigger**: User enters details (Name, Phone) or runs `/sim-contact`.
    *   **Endpoint**: `PUT /api/session/:id/user-data`
    *   **Data**: Name, Phone, Email, Opt-in status.
*   **Chat Messages**:
    *   **Trigger**: User sends a text or Bot replies.
    *   **Endpoint**: `POST /api/session/:id/messages`
    *   **Data**: Content, Role (user/assistant), Timestamp.
    *   **Note**: stored in a `messages` sub-collection for scalability.

### 4. Logging & Debugging Flow
The project uses a sophisticated custom logging system to aid development without cluttering the console.

*   **Codebase Map (`code_control/update_map.py`)**:
    *   **Role**: A Python script runs before build/commit.
    *   **Action**: Scans all `.js` files, identifying functions and extracting `@desc` comments.
    *   **Output**: Generates `scripts/utils/codebaseMap.js`.
*   **The Logger (`scripts/utils/logger.js`)**:
    *   **Auto-Labeling**: When `logger.log()` is called, it inspects the stack trace. It uses the `codebaseMap` to find *who* called it and automatically applies a category label (e.g., `[UI]`, `[LOGIC]`).
    *   **Grouping**: Uses `console.groupCollapsed` to keep logs tidy.
    *   **State Diffing**: The `session.js` listener uses `logger.track()` to visualy show Red/Green diffs when Firestore state changes.

### 5. Admin & Monitoring
*   **Tool**: `scripts/check_admin.js`
*   **Role**: A simplified CLI script for developers.
*   **Usage**: Connects to the same Firestore using `.env` credentials and prints the last 5 sessions, including their current state and message history. Useful for verifying that data is actually reaching the backend.

---

## Notes on Legacy & Redundant Features
1.  **Simulation Commands**:
    *   `t/sim-contact` in the Chat Input is a dev-tool to inject fake user data. It should be removed before production.
2.  **Mock Host**:
    *   `mock-host.html` is strictly for testing `iframe` communication.
3.  **Hardcoded "Gemini" Bot**:
    *   The `chat.js` file contains a simulated `setTimeout` response for the bot. This is a placeholder for the real Gemini API call.
4.  **Tailwind CDN**:
    *   Currently loading Tailwind via CDN. Recommended to move to a build process (Vite/PostCSS) for production performance.

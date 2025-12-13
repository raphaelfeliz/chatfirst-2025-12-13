# Context for storedInformation.md

To fully understand why the application stores data as described in `storedInformation.md`, it's essential to grasp the core architectural principle: establishing a **single, unified source of truth**. Before this system was implemented, the application suffered from data desynchronization, where the user's selections were not saved, and the AI had no context of the user's journey. The current architecture solves this by ensuring that all session data—both the user's product configuration and personal information—is managed centrally in a single Firestore document, making it globally accessible and consistently up-to-date.

The user's journey begins with the **Product Configurator**. This system, managed by the `configuratorEngine.js` module, is a state machine that guides the user through a series of questions. With each selection a user makes (e.g., choosing "Porta" over "Janela"), the engine updates a `product-choice` map in the central application state. This update is immediately persisted to Firestore. The engine then filters its product catalog based on the new selections and determines the next logical question to ask, creating a dynamic and interactive filtering experience. This flow is the primary mechanism for populating the `product-choice` map detailed in `storedInformation.md`.

Parallel to the configurator is the **Chat and AI flow**, powered by Google Gemini. Users can either click the configurator's options or type freely into the chat input. Any text input is sent to the Gemini AI service. The AI's role is to interpret the user's natural language and respond with a `message` to be displayed in the chat, and, crucially, a structured `data` payload. This payload contains instructions to modify the application's state, such as updating the `product-choice` map to match a user's text request or updating the `userData` map with information like a name or email address.

The **Orchestrator** (`orchestrator.js`) is the critical link between the AI and the application's state. It receives the entire response object from Gemini. First, it takes the AI's conversational `message` and adds it to the chat history, which creates a new document in the `messages` subcollection in Firestore. Next, it processes the `data` payload from the AI. Based on the `target` specified in the payload (e.g., `product-choice` or `user-data`), the orchestrator calls the appropriate functions to update the central state in `appState.js`, which in turn saves the changes to the main Firestore document. This mechanism is how the AI directly and safely influences the persistent state of the application.

Finally, the **Human Handoff flow** demonstrates how these systems work together. When a user clicks the "Falar com especialista" button, a `talkToHuman` flag in the `userData` map is set to `true`. This state change is immediately detected by the `handleHandoff` function in the orchestrator. This function then checks the state for the user's name and contact information. If this data is missing, it injects new AI messages into the chat to ask for it. Once the required `userData` is present in the state, the orchestrator adds the final `whatsapp-link` bubble to the chat. This entire process is driven by state changes and illustrates how `userData` is progressively populated and why specialized message bubbles (`isHandoff`, `whatsapp-link`) are stored in the chat history.


# Stored Information Overview

This document outlines all the information that is persisted by the application, how it is stored, and the technology used.

## High-Level Architecture: Firestore Integration

The application uses **Google Cloud Firestore** as its primary data store. The entire state of a user's session is saved within a single Firestore document. This approach ensures data persistence, real-time synchronization, and a consistent user experience, even if the user refreshes the page.

Each unique chat session is represented by a single **document** within a top-level **collection** named `chats`. The `chatId` for the session is used as the unique identifier for its corresponding document.

The core of this integration is the `appState.js` module, which acts as the single source of truth for all session data. It is responsible for:
1.  Managing the in-memory state.
2.  Persisting any changes to the Firestore document.
3.  Notifying other modules of state changes using a pub/sub pattern.

## Firestore Data Structure

Here is a conceptual model of the Firestore data structure for a single chat session:

```
chats (collection)
└── {chatId} (document)
    ├── createdAt: Timestamp
    ├── product-choice: Map
    ├── userData: Map
    │
    └── messages (subcollection)
        ├── {messageId1}: Map (Message Bubble)
        ├── {messageId2}: Map (Message Bubble)
        └── ...
```

---

### 1. Main Chat Document Fields

The root of each chat document (e.g., `/chats/{chatId}`) contains fields that store the overall state of the user's interaction.

#### `product-choice` (Map)

This field is a map (or object) that stores the user's selections from the product configurator. It represents the "facets" the user has chosen.

-   **How it's updated:** When a user clicks an option in the UI, the `configuratorEngine` updates the in-memory state via `appState.js`. The `appState` module then automatically persists the entire `product-choice` object to the Firestore document.
-   **Example Structure:**
    ```json
    {
      "categoria": "porta",
      "sistema": "porta-correr",
      "persiana": "sim",
      "persianaMotorizada": "motorizada",
      "material": "pvc",
      "folhas": null,
      "finalProduct": {
        "id": "porta-correr-pvc-persiana-motorizada",
        "slug": "porta-de-correr-em-pvc-com-persiana-integrada-e-motorizada",
        "image": "assets/images/final-product.png"
      }
    }
    ```

#### `userData` (Map)

This field is a map containing information about the user, which is typically gathered during the "human handoff" flow.

-   **How it's updated:** The AI determines when to ask for user information. When the user provides it, the AI's response includes a data payload that the `orchestrator` uses to update the `userData` object in `appState.js`, which then persists it to Firestore.
-   **Key Fields:**
    -   `talkToHuman` (Boolean): A flag that is set to `true` when the user clicks "Falar com especialista." This is the primary trigger for the human handoff flow.
    -   `userName` (String): The user's name.
    -   `userEmail` (String): The user's email address.
    -   `userPhone` (String): The user's phone number.
-   **Example Structure:**
    ```json
    {
      "talkToHuman": true,
      "userName": "Jane Doe",
      "userEmail": "jane.doe@example.com",
      "userPhone": null
    }
    ```

### 2. `messages` (Subcollection)

This is a **subcollection** within each chat document. Storing messages in a subcollection is a scalable pattern that avoids making the parent document too large. Each document within this subcollection represents a single "chat bubble" displayed in the UI.

-   **How it's updated:** Every time a user or the AI generates a message, a new document is created in the `messages` subcollection via the `addMessage` function in `chatApi.js`.
-   **Common Document Fields:**
    -   `userType` (String): Either `"human"` or `"ai"`.
    -   `text` (String): The text content of the message.
    -   `timestamp` (Timestamp): The time the message was created.
-   **Specialized Bubble Fields:** Some messages have a special `bubbleType` to render them as interactive components rather than simple text bubbles.
    -   `bubbleType: "product-summary"`: Includes `product` and `definitions` maps.
    -   `bubbleType: "product-link"`: Includes a `url`.
    -   `bubbleType: "specialist-button"`: Renders the button that triggers the handoff flow.
    -   `bubbleType: "whatsapp-link"`: Renders the final link to WhatsApp, constructed dynamically.
    -   `isHandoff` (Boolean): A flag set to `true` for messages that are part of the handoff flow (e.g., "Com quem eu falo?"), which gives them a distinct style.

-   **Example Message Document (`/chats/{chatId}/messages/{messageId}`):**
    ```json
    {
      "userType": "ai",
      "bubbleType": "whatsapp-link",
      "text": "Clique para falar com um especialista",
      "timestamp": "2024-08-02T22:00:00.000Z"
    }
    ```

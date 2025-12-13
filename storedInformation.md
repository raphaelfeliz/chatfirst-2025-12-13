# Stored Information Documentation

This document outlines how the application manages state and stores information during the user session.

## 1. Application State (Selections)
**Source of Truth**: `scripts/app.js` -> `currentSelections` variable.

The core state of the application is maintained in an in-memory object called `currentSelections`. This object tracks the user's choices for each step of the configuration wizard.

- **Structure**:
  ```javascript
  let currentSelections = {
      categoria: null,
      sistema: null,
      persiana: null,
      motorizada: null,
      material: null,
      folhas: null
  };
  ```
- **Lifecycle**:
  - Initialized with `null` values on page load.
  - Updated incrementally as the user selects options in the wizard.
  - Reset to initial state when the "Reiniciar" button is clicked.
  - **Persistence**: None. This state is lost if the browser page is refreshed.

## 2. Chat Information
**Management**: `scripts/ui/chat.js` -> `renderChat` function.

The chat interface does not maintain a persistent history of messages in the traditional sense. Instead, the conversation flow is **derived** from the `currentSelections` state.

- **Structured Flow (Wizard)**:
  - Every time the user makes a selection, the `renderChat` function clears the chat window and rebuilds the conversation from scratch.
  - It iterates through the `currentSelections` to generate:
    - **Bot Questions**: Based on the facet title (e.g., "Qual a categoria?").
    - **User Answers**: Based on the selected value (e.g., "Janela").
  - This ensures the chat always reflects the current state of the wizard.

- **Free-form Messages (User Input)**:
  - **Storage**: Ephemeral (DOM only).
  - User can type messages in the input field.
  - These messages are appended directly to the chat container HTML.
  - **Limitation**: Since `renderChat` clears the container on every wizard update, any free-form text typed by the user (and the bot's placeholder responses) will be **erased** if the user subsequently clicks an option in the wizard.

## 3. Product Data
- **Source**: `scripts/productCatalog.js`
- **Storage**: Static constant `PRODUCT_CATALOG`. This data is read-only and loaded into memory when the application starts.

## 4. Derived State
- **Logic**: `scripts/logic.js` -> `runFacetLoop`
- The application calculates the "Current Question" and "Matching Products" dynamically based on `currentSelections`. This derived state is not stored permanently but recalculated on every interaction to update the UI.

## Summary
| Information Type | Storage Mechanism | Persistence |
| :--- | :--- | :--- |
| **User Selections** | In-memory variable (`currentSelections` in `app.js`) | Session only (lost on refresh) |
| **Chat History** | Derived dynamically from Selections + Ephemeral DOM | Recreated on update / Lost on refresh |
| **Product Catalog** | In-memory Constant | Static |

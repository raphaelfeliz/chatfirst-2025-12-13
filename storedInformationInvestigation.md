# Backend Logic Investigation (`main.py`)

This document explains the functionality of the `main.py` file, which serves as the server-side logic for the Chat and Product Configurator.

## Overview
`main.py` is a Google Cloud Function that acts as a secure proxy between the frontend client and the Google Gemini API. Its primary purpose is to enforce a specific behavior for the AI agent, ensuring it acts as a "Specialized Window & Door Configurator" and returns structured data that the frontend can programmatically understand.

## Core Features

### 1. HTTP Endpoint & Security
- **Type**: It defines an HTTP function (`def gemini_endpoint(request)`) compatible with Google Cloud Functions framework.
- **CORS**: It implements Cross-Origin Resource Sharing (CORS) headers to allow the frontend application to call it from a browser.
- **Validation**: It strictly validates that the incoming request is valid JSON and contains a non-empty `prompt`.

### 2. Context Injection
The function constructs a complex "System Prompt" that is fed to Gemini. This prompt is dynamically built using three sources of context:
1.  **User Prompt**: What the user just typed.
2.  **Product Selection**: The current state of the wizard (via `productChoice` in the request).
3.  **User Data**: Known information about the user (via `userData` in the request).

### 3. Knowledge Base Integration
- It loads a `kb.yaml` file from the disk.
- This content is injected directly into the prompt, giving Gemini "ground truth" information (e.g., shipping policies, accepted payment methods) to answer user questions factually.

### 4. The "Three Missions" Architecture
The system prompt instructs Gemini to operate in one of three distinct modes, prioritized logically:

| Priority | Mission | Condition | Action |
| :--- | :--- | :--- | :--- |
| **1 (Highest)** | **Handoff / Data Collection** | `talkToHuman` is `true` | The AI focuses *only* on extracting contact info (`userName`, `userEmail`, etc.) from the user's text. It ignores product questions. |
| **2 (Medium)** | **Handoff Detection** | User asks for "price", "human", "negotiation" | The AI detects the intent to leave the automated flow. It returns a flag to set `talkToHuman` to `true`. |
| **3 (Lowest)** | **Product Configuration** | Default state | The AI maps the user's natural language (e.g., "quero uma de correr") to specific technical attributes (e.g., `sistema: "porta-correr"`). |

### 5. Strict JSON Output
Crucially, the function instructs Gemini to return **only** a valid JSON object relative to the specific schema defined in the prompt.
- **Benefits**: This prevents the "hallucination" of free-text formatting and ensures the frontend code can always parse the response to update its state.
- **Schema**:
    ```json
    {
      "status": "success",
      "message": "Natural language response...",
      "data": {
        "target": "product-choice" (or "user-data"),
        "payload": { ... }
      }
    }
    ```

### 6. Error Handling
- The function includes a `try-except` block to catch invalid JSON responses from Gemini ("Repair" logic could be added here in the future).
- It handles missing API keys or malformed requests gracefully, returning standard HTTP error codes.

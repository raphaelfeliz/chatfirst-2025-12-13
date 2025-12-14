# Gemini Endpoint Implementation Plan

**INSTRUCTIONS:**
- Each checkpoint must be verified in at least 2 ways: first by the Agent, then by the User.
- Never mark a checkpoint as complete until verified by the User.
- It is acceptable to create temporary checkpoints for testing purposes.

---

# 1 PHASE: FOUNDATION & LOCAL SETUP
- PURPOSE: Establish a clean, isolated Python environment and verify basic HTTP functionality before adding complex logic.
- APPROACH: Create the directory structure, set up a virtual environment, and run a minimal "Hello World" server using `functions-framework`.
- SUCCESS: A local server accepts a POST request and returns a JSON response.
- **STATUS**: [x] COMPLETED

## 1.1 CHECKPOINT: PROJECT ISOLATION
- PURPOSE: Ensure the AI service has its own dedicated workspace and dependencies, separate from the main app.
- APPROACH: Create `gemini-service` folder, `requirements.txt`, and a virtual environment.
- SUCCESS: `venv` is active and dependencies are installed without errors.
- **SUCCESS EVIDENCE**: [x] Verified by Agent (Pip install success)

### 1.1.1 STEP: DIRECTORY & DEPENDENCIES
- PURPOSE: Define the file structure and libraries.
- APPROACH: Use `os` tools to create folders and write `requirements.txt`.
- SUCCESS: Files exist and `pip install` succeeds.
#### TASKS:
- [x] 1.1.1.1 TASK: Create `c:\dev\chat-nov28\gemini-service` folder.
- [x] 1.1.1.2 TASK: Create `requirements.txt` with `functions-framework`, `google-generativeai`, `pyyaml`.
- [x] 1.1.1.3 TASK: Create `python -m venv venv` and install dependencies.

## 1.2 CHECKPOINT: HELLO WORLD ENDPOINT
- PURPOSE: Verify that the `functions-framework` can serve requests locally.
- APPROACH: Write a minimal `main.py` that echoes a JSON input.
- SUCCESS: `curl localhost:8080` returns the expected JSON.
- **SUCCESS EVIDENCE**: [x] Verified by Agent ({"message": "Hello World"})

### 1.2.1 STEP: BASIC SERVER
- PURPOSE: Implement the entry point.
- APPROACH: Write `main.py` with a simple function decorated with `@functions_framework.http`.
- SUCCESS: Server starts and logs "Running...".
#### TASKS:
- [x] 1.2.1.1 TASK: Create `main.py` with a simple `gemini_chat` function.
- [x] 1.2.1.2 TASK: Run the server locally using `functions-framework --target=gemini_chat`.
- [x] 1.2.1.3 TASK: VERIFICATION (Agent): Run a `curl` command in a separate terminal.
- [x] 1.2.1.4 TASK: VERIFICATION (User): User confirms they can hit the endpoint.

---

# 2 PHASE: LOGIC & KNOWLEDGE BASE
- PURPOSE: Implement the "Brain" logic—loading the Knowledge Base (KB) and constructing the system prompt—without ringing up costs on the real AI API yet.
- APPROACH: Implement `kb.yaml` loading and the prompt builder function. Mock the AI response to verify the logic flow.
- SUCCESS: The endpoint returns a simulated response that correctly incorporates data from `kb.yaml` and user input.
- **STATUS**: [x] PENDING

## 2.1 CHECKPOINT: KB LOADER
- PURPOSE: Ensure the app can read and parse the YAML configuration.
- APPROACH: Create `kb.yaml` and a Python function to read/cache it.
- SUCCESS: Endpoint can return the raw KB content as debug output.
- **SUCCESS EVIDENCE**: [x] Verified by Agent (KB JSON Preview), [x] Verified by User (Browser Check)

### 2.1.1 STEP: YAML PARSING
- PURPOSE: Read the file safely.
- APPROACH: Implement `load_knowledge_base()` using `yaml.safe_load`.
- SUCCESS: Logs show loaded data structure.
#### TASKS:
- [x] 2.1.1.1 TASK: Create `kb.yaml` with initial rules.
- [x] 2.1.1.2 TASK: Update `main.py` to load this file on startup/request.
- [x] 2.1.1.3 TASK: VERIFICATION (Agent): Call endpoint and check if it echoes KB data.

## 2.2 CHECKPOINT: PROMPT BUILDER (MOCKED)
- PURPOSE: Verify that the system prompt is constructed correctly based on the "3-Priority Mission" architecture.
- APPROACH: Implement `build_system_prompt()` and wire it into the main handler. Return the *generated prompt* as the response (for inspection) instead of calling the AI.
- SUCCESS: The response contains the formatted prompt with User Context and KB rules.
- **SUCCESS EVIDENCE**: [x] Verified by Agent (Debug Prompt returned), [x] Verified by User (Curl Output)

### 2.2.1 STEP: CONTEXT INJECTION
- PURPOSE: Ensure user data and product choices are inserted into the prompt.
- APPROACH: Add logic to parse input JSON (`userData`, `productChoice`) and format strings.
- SUCCESS: Input JSON changes result in different Prompt outputs.
#### TASKS:
- [x] 2.2.1.1 TASK: Implement `build_system_prompt` function.
- [x] 2.2.1.2 TASK: Update handler to call this function and return the result.
- [x] 2.2.1.3 TASK: VERIFICATION (Agent): Send various JSON payloads (e.g., with/without user data) and verify prompt differences.

---

# 3 PHASE: AI INTEGRATION
- PURPOSE: Connect to the real Google Gemini API.
- APPROACH: Configure the SDK with the API Key and replace the mock return with the actual `model.generate_content()` call.
- SUCCESS: The endpoint returns a valid, intelligent JSON response from Gemini.
- **STATUS**: [x] PENDING

## 3.1 CHECKPOINT: LIVE CALL
- PURPOSE: End-to-end integration test.
- APPROACH: Inject `GEMINI_API_KEY` (locally) and call the model.
- SUCCESS: A question like "Janela de vidro?" returns a valid JSON with `target: product-choice`.
- **SUCCESS EVIDENCE**: [ ] Pending

### 3.1.1 STEP: SDK CONFIGURATION
- PURPOSE: Secure connection to Google's API.
- APPROACH: Read env var and initialize `genai.configure()`.
- SUCCESS: No authentication errors.
#### TASKS:
- [ ] 3.1.1.1 TASK: Add `google-generativeai` logic to `main.py`.
- [ ] 3.1.1.2 TASK: Set up local `.env` or environment variable for testing.
- [ ] 3.1.1.3 TASK: VERIFICATION (Agent): Perform a live query.
- [ ] 3.1.1.4 TASK: VERIFICATION (User): User performs a live query.

---

# 4 PHASE: DEPLOYMENT & CLIENT
- PURPOSE: Publish the service to the cloud and connect the frontend Application.
- APPROACH: Deploy to Cloud Run using `gcloud`, then update the JS client to fetch from this new URL.
- SUCCESS: The live `chat-nov28` app interacts with the Gemini bot.
- **STATUS**: [ ] PENDING

## 4.1 CHECKPOINT: CLOUD DEPLOYMENT
- PURPOSE: Make the service public (securely).
- APPROACH: Use `gcloud functions deploy` or `gcloud run deploy`.
- SUCCESS: A public HTTPS URL that responds to our Curl tests.
- **SUCCESS EVIDENCE**: [ ] Pending

### 4.1.1 STEP: PRODUCTION BUILD
- PURPOSE: Push code to Google Cloud.
- APPROACH: Run deployment command.
- SUCCESS: Deployment finishes with status "Active".
#### TASKS:
- [ ] 4.1.1.1 TASK: Create `Dockerfile` (Optional, if using custom runtime) or use Buildpacks.
- [ ] 4.1.1.2 TASK: Run `gcloud run deploy gemini-chat-service`.
- [ ] 4.1.1.3 TASK: VERIFICATION (Agent): Curl the prod URL.

## 4.2 CHECKPOINT: FRONTEND INTEGRATION
- PURPOSE: Replace the mock frontend logic with the real API call.
- APPROACH: Edit `scripts/config.js` and `scripts/ui/chat.js`.
- SUCCESS: Typing in the chat interface triggers a network call and displays the response.
- **SUCCESS EVIDENCE**: [ ] Pending

### 4.2.1 STEP: JS CLIENT UPDATE
- PURPOSE: Connect the wires.
- APPROACH: Switch `setTimeout` mock to `fetch()`.
- SUCCESS: Network tab shows 200 OK.
#### TASKS:
- [ ] 4.2.1.1 TASK: Update `GEMINI_ENDPOINT_URL` in `config.js`.
- [ ] 4.2.1.2 TASK: Implement `fetch` in `chat.js`.
- [ ] 4.2.1.3 TASK: VERIFICATION (User): Full functional test in the browser.

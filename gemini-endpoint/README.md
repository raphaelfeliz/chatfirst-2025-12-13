# Gemini Endpoint Overview

## Folder Components
- `main.py` – Active Cloud Function entry point; loads `kb.yaml`, builds priority-based system prompt, caches the KB, and handles Gemini calls plus strict JSON validation. Includes mock imports for local testing and a `__main__` block for a local run harness.
- `kb.yaml` – Portuguese FAQ snippets injected into the prompt so Gemini can answer policy/warranty/payment questions before handing off.
- `gemini_run_plan/` – Planning artifacts, including an alternate `main.py` with a more prescriptive handoff-first flow, two sample “hello world” style Cloud Functions, and the high-level `gemini_run_summary.md` integration plan.
- `requirements.txt` (one level up) – Declares `functions-framework`, `google-generativeai`, and `PyYAML`, matching what Cloud Functions needs to execute `main.py`.

## Integration Plans
1. **Current lightweight prompt (`gemini-endpoint/main.py`)**  
   - Mission stack: human handoff → data collection → product configuration.  
   - Emphasizes strict JSON output, temperature 0 calls, and KB injection at call time.  
   - Designed for Cloud Function portability with lazy import mocks for local dev.
2. **Plan version (`gemini_run_plan/gemini-endpoint/main.py`)**  
   - Forces `GEMINI_API_KEY` at import, embeds the KB once, and defines Portuguese instructions with explicit handoff triggers and payload schemas.  
   - Aligns closely with the `gemini_run_summary.md` checklist (handoff detection, facet preservation, validation layers).  
   - Useful reference if you want the stricter, KB-first tone and deterministic state-preservation rules.
3. **Supporting templates** (`gemini_run_plan/gemini-endpoint/hello_world.py`, `gemini-v2.py`)  
   - Minimal JSON responders for testing deployment plumbing before wiring the full Gemini flow.

## Deploying as a Standalone Cloud Function
- Use the `gemini_endpoint` entry point from `gemini-endpoint/main.py`.  
- Package the folder plus `kb.yaml` and the root `requirements.txt`.  
- Provide `GEMINI_API_KEY` via environment variables in Cloud Functions (or Cloud Run).  
- The function already handles CORS, enforces POST with JSON bodies, validates Gemini output, and returns errors when the model emits invalid JSON.  
- For local tests, run `python gemini-endpoint/main.py` after setting `GEMINI_API_KEY`; the script’s mock request path skips the actual API call if the key is missing.

## Recommended Next Steps
1. Decide whether to keep the lighter production prompt or adopt the stricter plan-version prompt/validation rules.  
2. Implement the validation checklist from `gemini_run_summary.md` (email/phone/name validators, facet preservation, JSON schema enforcement).  
3. Wire the `/api/chat` frontend caller using the documented request/response contract and handle the `target` states (`product-choice`, `user-data`, `handoff`).  
4. Add README/API contract updates if this folder becomes the canonical deployment package.

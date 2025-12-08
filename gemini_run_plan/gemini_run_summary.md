# Gemini Integration Plan: Simple & Error-Resistant

## Architecture Overview

The AI integration uses **three-tier decision logic**:
1. **Deterministic Logic** (client-side `logic.js`) — Handles all product attribute filtering
2. **AI Extraction** (Gemini API) — Extracts only **user data** (name, phone, email) and **intent detection** (handoff signals)
3. **Hybrid Response** (backend `main.py`) — Combines deterministic product results with AI-extracted user data

**Goal**: Keep AI responsibilities minimal, avoid AI hallucinations by using AI only for natural language extraction.

---

## Phase 1: Client-Side (Unchanged Deterministic Core)

The existing `scripts/` folder remains the source of truth for product filtering:
- `logic.js` filters products deterministically based on user selections
- `productCatalog.js` is the single source of truth for all product data
- `constants.js` defines all valid facet values (no ambiguity)

**No changes needed here** — this layer is bulletproof.

---

## Phase 2: Backend Integration (`main.py`)

### Request Flow
```
Client → POST /api/chat → Gemini Endpoint
├─ Input: { prompt, productChoice, userData, conversationHistory }
├─ Process:
│  ├─ Load KB (knowledge base with FAQ/hints)
│  ├─ Call Gemini with strict extraction prompt
│  ├─ Parse AI response
│  └─ Validate extracted data
└─ Output: { target, payload, message }
```

### Endpoint Contract

**Input:**
```json
{
  "prompt": "Quero uma janela de correr com persiana motorizada",
  "productChoice": { "categoria": "janela", "sistema": "janela-correr" },
  "userData": { "userName": null, "userPhone": null, "userEmail": null, "talkToHuman": false },
  "conversationHistory": []
}
```

**Output:**
```json
{
  "status": "success",
  "target": "product-choice" | "user-data" | "handoff",
  "message": "Achei! Uma janela de correr é perfeita para você...",
  "payload": {
    "extractedData": { 
      "userName": null, 
      "userPhone": "11999999999", 
      "userEmail": null 
    },
    "extractedFacets": {
      "categoria": "janela",
      "sistema": null,
      "persiana": null,
      "persianaMotorizada": null,
      "material": null,
      "folhas": null
    },
    "handoffRequired": false
  }
}
```

---

## Phase 2a: Gemini Prompt (Simplified & Error-Resistant)

### Mission Structure (Priority-Based)

**PRIORITY 1: DETECT HANDOFF INTENT**
- Keywords: "preço", "orçamento", "comprar", "falar com humano", "atendente", "gerente"
- Action: **Answer the question first using KB**, then set `target: "handoff"`
- Message format: "[Answer from KB] + Para te ajudar com isso, vou transferir você para um humano."
- Example: User asks "Aceitam pix?" → Reply: "Sim! Aceitamos pix com 5% de desconto. Vou transferir você para um humano para o fechamento."

**PRIORITY 2: EXTRACT USER DATA & PRODUCT FACETS**
- Extract user data: `userName`, `userPhone`, `userEmail`
- Extract product facets from user input using **only valid catalog values**:
  - `categoria`: "janela" | "porta"
  - `sistema`: "janela-correr" | "porta-correr" | "maxim-ar" | "giro"
  - `persiana`: "sim" | "nao"
  - `persianaMotorizada`: "motorizada" | "manual" (only if persiana="sim")
  - `material`: "vidro" | "vidro + veneziana" | "lambri" | "veneziana" | "vidro + lambri"
  - `folhas`: 1 | 2 | 3 | 4 | 6
- **Always return all facets** in the response (copy from input if unchanged)
  - If user previously selected `categoria: "janela"` and doesn't mention changing it → return `categoria: "janela"`
  - If user explicitly changes their mind ("Quero uma porta") → update to `categoria: "porta"`
  - Only set to null if it was null in the input and the user didn't mention it on the prompt.
- Example 1: Input has `categoria: "janela"`, user says "com vidro" (no mention of category) → Return `categoria: "janela"` (unchanged)
- Example 2: Input has `categoria: "janela"`, user says "mas quero uma porta" → Return `categoria: "porta"` (changed)
- Only populate fields with high confidence (>90%)
- **Do not invent facets** — stick to catalog attributes only



### Gemini Config
- `temperature: 0.0` — Deterministic extraction
- `response_mime_type: "application/json"` — Force structured output
- System prompt includes:
  - **Valid facet values only** (read from productCatalog.js)
  - Current product state (read-only)
  - Extraction rules with examples
  - Instruction: "Do not invent facet values; use only the valid options provided"

---

## Phase 2b: Error Handling & Validation

### Validation Layer (Before Returning to Client)

1. **JSON Validity** — Gemini must return valid JSON
   - If invalid: Return error with empty payload
2. **Extracted Data Validation**
   - Phone: Accept as-is if AI identified it
   - Email: Contains @ and domain
   - Name: Non-empty, < 100 chars
3. **Field Combination**
   - If `handoffRequired: true`, **still return extracted user data** (name, phone, email)
   - Message should answer the question first, then mention handoff
   - Missing fields → null
   - Missing message → "Um momento..."

### Error Responses
```json
{
  "status": "error",
  "message": "Não consegui processar sua mensagem. Tente de novo.",
  "payload": { 
    "extractedData": { "userName": null, "userPhone": null, "userEmail": null },
    "extractedFacets": { "categoria": null, "sistema": null, "persiana": null, "persianaMotorizada": null, "material": null, "folhas": null }
  }
}
```

---

## Phase 3: Client-Side Integration

The frontend will:

1. **Send to Gemini**
   ```javascript
   const response = await fetch('/api/chat', {
     method: 'POST',
     body: JSON.stringify({
       prompt: userInput,
       productChoice: currentSelections,
       userData: { userName, userPhone, userEmail, talkToHuman }
     })
   });
   ```

2. **Handle Response**
   - If `target: "handoff"` → Route to human agent
   - If `extractedData` (name/phone/email) → Update userData in state
   - If `extractedFacets` (product attributes) → Merge with currentSelections and trigger product filter
   - Always display `message` to user

3. **Trigger Product Logic**
   - Product filtering stays 100% deterministic (client-side `logic.js`)
   - AI is never involved in product selection

---

## Key Principles for Simplicity & Reliability

| Principle | Implementation |
|-----------|-----------------|
| **AI Minimal** | AI only extracts names/emails/intents; never decides product |
| **Deterministic Default** | If AI fails, return safe empty data; client continues normally |
| **Validation First** | Always validate AI output before trusting it |
| **KB as Reference** | KB helps Gemini understand context but doesn't override rules |
| **Clear Boundaries** | Client = Product Logic; AI = Data Extraction; Backend = Orchestration |
| **Fail Gracefully** | Bad AI response ≠ Crash; just don't update userData |

---

## Implementation Checklist

This checklist breaks down the integration into specific, actionable tasks across backend, frontend, testing, and documentation layers. Each task should be completed and validated before moving to the next phase.

### Backend (`main.py`)
- [ ] **Refactor with validation layer**: Create validator functions for email (must contain @), phone (non-empty), and name (< 100 chars). Build a `validate_response()` function that checks Gemini's JSON output before returning to client.
- [ ] **Parse and preserve facets**: Implement logic to copy input `productChoice` to output `extractedFacets`, then selectively update only fields that changed based on Gemini's extraction (respect unchanged values).
- [ ] **Implement three-priority mission logic**: Structure Gemini's system prompt with explicit priorities: (1) Detect handoff keywords and answer KB question first, (2) Extract user data + product facets preserving state, (3) Return clean JSON with `target`, `message`, `payload`.
- [ ] **Load KB for fallback responses**: Update `load_knowledge_base()` to inject FAQ content into system prompt so Gemini can answer common questions (pix, warranty, pricing) before handoff.

### Frontend (Chat UI Integration)
- [ ] **Create `/api/chat` caller function**: Build async function `sendToChatEndpoint(prompt, productChoice, userData)` that POSTs to backend, handles network errors, and returns parsed response.
- [ ] **Handle handoff target**: When response has `target: "handoff"`, route UI to human agent view, disable product selection, show "Conectando com agente...".
- [ ] **Merge extracted facets with state**: Update `currentSelections` from `extractedFacets` in response (only non-null fields override; preserve existing selections). Trigger `runFacetLoop()` to update product filter.
- [ ] **Update userData in state**: Merge `extractedData` (name, phone, email) into app's `userData` object; display confirmation message in chat UI.

### Testing & Validation
- [ ] **Mock Gemini responses for error cases**: Create test mocks for invalid JSON, missing fields, invalid email, out-of-range phone, mismatched facets (e.g., persianaMotorizada="motorizada" but persiana="nao"). Verify backend returns safe defaults without crashing.
- [ ] **Integration tests**: Test full flow: user input → Gemini call → validation → response → UI update. Verify facet preservation (e.g., "quero vidro" doesn't null out categoria).

### Documentation
- [ ] **Add API contract to README**: Document request/response schema, valid facet values, error codes, authentication (API key), CORS headers. Include example curl request and response.
- [ ] **Add Gemini prompt template**: Document the exact system prompt structure (missions, facet list, KB injection) so future changes are clear.
- [ ] **Handoff flow diagram**: Show decision tree (handoff detected? → answer + transfer : extract facets → filter products).

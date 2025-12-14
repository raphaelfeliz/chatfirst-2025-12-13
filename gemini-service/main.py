import functions_framework
import json
import yaml
import os
import sys

# Global Cache
_KB_CONTENT = None
KB_FILE = "kb.yaml"

def load_knowledge_base():
    """Loads and caches the knowledge base from disk."""
    global _KB_CONTENT
    if _KB_CONTENT:
        return _KB_CONTENT
    
    try:
        # Resolve absolute path for robustness in Cloud Run
        base_path = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_path, KB_FILE)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            kb_data = yaml.safe_load(f)
        _KB_CONTENT = json.dumps(kb_data, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error loading KB: {e}", file=sys.stderr)
        _KB_CONTENT = "{}"
    
    return _KB_CONTENT

def build_system_prompt(user_prompt, product_choice, user_data, kb_content):
    """Constructs the system prompt based on the 3-priority mission architecture."""
    
    # Context Serialization (Handle None/Empty)
    ctx_product = json.dumps(product_choice, ensure_ascii=False) if product_choice else "None"
    ctx_user = json.dumps(user_data, ensure_ascii=False) if user_data else "{}"

    return f"""
    You are a specialized Window & Door Configurator Agent.
    Your goal is to process the user's request and return a SINGLE JSON object.

    **CONTEXT**
    - User Prompt: "{user_prompt}"
    - Current Product: {ctx_product}
    - User Data: {ctx_user}

    **KNOWLEDGE BASE**
    {kb_content}

    **MISSIONS (IN ORDER OF PRIORITY)**

    1. **PRIORITY 1: HUMAN HANDOFF (EXIT)**
       - CHECK: Does the user explicitly ask for a human, price, buying, or negotiation?
       - ACTION: Stop configuration. Set `target: "user-data"` and `payload: {{ "talkToHuman": true }}`.
       - MESSAGE: Friendly acknowledgment and handoff.

    2. **PRIORITY 2: DATA COLLECTION (LEAD)**
       - CHECK: Is `talkToHuman` TRUE in User Data?
       - ACTION: Extract `userName`, `userPhone`, or `userEmail` from the prompt.
       - OUTPUT: Set `target: "user-data"` with extracted fields.
       - MESSAGE: Confirm receipt or ask for missing info.

    3. **PRIORITY 3: PRODUCT CONFIGURATION (CORE)**
       - CHECK: Default if P1 and P2 are not met.
       - ACTION: Map user intent to valid product attributes.
       - OUTPUT: Set `target: "product-choice"` with identified attributes.
       - MESSAGE: Helpful guidance or confirmation based on the KB.

    **OUTPUT SCHEMA (STRICT JSON)**
    {{
      "status": "success",
      "message": "User-facing message in Portuguese",
      "data": {{
        "target": "product-choice" | "user-data",
        "payload": {{ ...values... }}
      }}
    }}
    """

@functions_framework.http
def gemini_chat(request):
    """
    Mental model:
    input: request object
    output: tuple (body, status_code, headers)
    """
    
    # Enable CORS for local testing/frontend integration
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }

    # Handle OPTIONS for CORS preflight
    if request.method == 'OPTIONS':
        headers['Access-Control-Allow-Methods'] = 'POST'
        headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return ('', 204, headers)

    # 1. Input Parsing
    req_json = request.get_json(silent=True) or {}
    user_prompt = req_json.get("prompt", "")
    
    # 2. Load KB
    kb_content = load_knowledge_base()
    
    # 3. Build Prompt (Mock Logic)
    system_prompt = build_system_prompt(
        user_prompt,
        req_json.get("productChoice"),
        req_json.get("userData"),
        kb_content
    )
    
    # Return PROMPT for verification (Checkpoint 2.2)
    return (json.dumps({
        "message": "Prompt Built Successfully", 
        "debug_prompt": system_prompt
    }), 200, headers)

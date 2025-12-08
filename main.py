try:
    import functions_framework
except ImportError:
    # Mock for local testing without the package
    class functions_framework:
        @staticmethod
        def http(func):
            return func

import json
import os
import sys
try:
    import yaml
except ImportError:
    # Mock for local testing
    class yaml:
        @staticmethod
        def safe_load(f):
            return {"mock": "data"}

try:
    import google.generativeai as genai
except ImportError:
    # Mock for local testing
    class genai:
        @staticmethod
        def configure(api_key): pass
        class GenerativeModel:
            def __init__(self, model_name): pass
            def generate_content(self, prompt, generation_config=None):
                # Return a mock response object
                class Response:
                    text = '{"status": "success", "message": "Mock response", "data": {"target": "product-choice", "payload": {}}}'
                return Response()


# Configuration
MODEL_NAME = "gemini-2.5-flash"
KB_FILE = "kb.yaml"

# Global Cache
_KB_CONTENT = None

def load_knowledge_base():
    """Loads and caches the knowledge base from disk."""
    global _KB_CONTENT
    if _KB_CONTENT:
        return _KB_CONTENT
    
    try:
        with open(KB_FILE, 'r', encoding='utf-8') as f:
            kb_data = yaml.safe_load(f)
        _KB_CONTENT = json.dumps(kb_data, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error loading KB: {e}", file=sys.stderr)
        _KB_CONTENT = "{}"
    
    return _KB_CONTENT

def build_system_prompt(user_prompt, product_choice, user_data, kb_content):
    """Constructs the system prompt based on the 3-priority mission architecture."""
    
    # Context Serialization
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
       - VALID ATTRIBUTES:
         - categoria: "janela" | "porta"
         - sistema: "janela-correr" | "porta-correr" | "maxim-ar" | "giro"
         - persiana: "sim" | "nao"
         - persianaMotorizada: "motorizada" | "manual" (only if persiana="sim")
         - material: "vidro" | "vidro + veneziana" | "lambri" | "veneziana" | "vidro + lambri"
         - folhas: 1 | 2 | 3 | 4 | 6
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
def gemini_endpoint(request):
    """HTTP Cloud Function entry point."""
    
    # CORS Headers
    headers = {"Access-Control-Allow-Origin": "*"}
    if request.method == "OPTIONS":
        headers.update({
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        })
        return ("", 204, headers)

    # Input Validation
    try:
        req_json = request.get_json(silent=True)
        if not req_json or "prompt" not in req_json:
            return (json.dumps({"status": "error", "message": "Missing 'prompt'"}), 400, headers)
    except Exception:
        return (json.dumps({"status": "error", "message": "Invalid JSON"}), 400, headers)

    # Execution
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")

        kb_content = load_knowledge_base()
        system_prompt = build_system_prompt(
            req_json["prompt"],
            req_json.get("productChoice"),
            req_json.get("userData"),
            kb_content
        )

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(req_json.get("model", MODEL_NAME))
        
        response = model.generate_content(
            system_prompt,
            generation_config={"temperature": 0.0, "response_mime_type": "application/json"}
        )

        # Validate JSON response
        try:
            json.loads(response.text) # Check validity
            return (response.text, 200, headers)
        except json.JSONDecodeError:
            return (json.dumps({"status": "error", "message": "Model returned invalid JSON"}), 500, headers)

    except Exception as e:
        print(f"Internal Error: {e}", file=sys.stderr)
        return (json.dumps({"status": "error", "message": str(e)}), 500, headers)

# Local Testing
if __name__ == "__main__":
    # Mock Request Class
    class MockRequest:
        def __init__(self, data): self.data = data
        def get_json(self, silent=True): return self.data
        @property
        def method(self): return "POST"

    # Test Case
    test_payload = {
        "prompt": "Quero uma janela de correr de vidro",
        "productChoice": {},
        "userData": {"talkToHuman": False}
    }
    
    print("--- Running Local Test ---")
    try:
        # Ensure API Key is set for local test
        if "GEMINI_API_KEY" not in os.environ:
            print("WARNING: GEMINI_API_KEY not set. Skipping actual API call.")
        else:
            resp = gemini_endpoint(MockRequest(test_payload))
            print(f"Status: {resp[1]}")
            print(f"Body: {resp[0]}")
    except Exception as e:
        print(f"Test Failed: {e}")
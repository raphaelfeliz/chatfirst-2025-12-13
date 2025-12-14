import functions_framework
import json

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

    return (json.dumps({"message": "Hello World"}), 200, headers)

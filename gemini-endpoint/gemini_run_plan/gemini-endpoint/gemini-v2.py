import json

import functions_framework


@functions_framework.http
def gemini_v2(request):
    """Minimal HTTP Cloud Function that returns a JSON 'hello world'."""

    # CORS preflight
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    }

    if request.method != "POST":
        return (
            json.dumps({"status": "error", "message": "Only POST is supported."}),
            405,
            headers,
        )

    body = {
        "status": "success",
        "message": "Hello, world from gemini-v2!",
        "data": {},
    }

    return (json.dumps(body), 200, headers)

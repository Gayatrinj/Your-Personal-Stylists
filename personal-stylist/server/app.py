# server/app.py
import os, re, json, base64
from typing import Any, Dict, List

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import google.generativeai as genai

load_dotenv()  # reads server/.env

PORT = int(os.getenv("PORT", "8787"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)

# Permissive during dev; tighten later to FRONTEND_ORIGIN if you want.
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

# ---------- helpers ----------
def require_key() -> None:
    if not GEMINI_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY in server/.env")
    genai.configure(api_key=GEMINI_API_KEY)

def list_models_for_key(api_key: str) -> List[Dict[str, Any]]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json().get("models", [])

def pick_gemini_model(api_key: str) -> str:
    models = list_models_for_key(api_key)
    supported = [
        m["name"].replace("models/", "")
        for m in models
        if "generateContent" in m.get("supportedGenerationMethods", [])
    ]
    preferences = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest", "gemini-pro-latest"]
    for pref in preferences:
        if pref in supported:
            return pref
    if supported:
        return supported[0]
    raise RuntimeError("No Gemini models available for this key.")

def get_model():
    require_key()
    model_id = pick_gemini_model(GEMINI_API_KEY)
    return genai.GenerativeModel(model_id), model_id

def build_prompt(payload: Dict[str, Any]) -> str:
    prompt = payload.get("prompt", "")
    style = payload.get("style", "")
    season = payload.get("season", "")
    occasion = payload.get("occasion", "")
    palette = payload.get("palette", [])
    if not isinstance(palette, list):
        palette = []
    preferred = ", ".join(palette) if palette else "any"

    return f"""
You are a fashion stylist.
Return ONLY a valid JSON array (no prose, no backticks), exactly 6 objects:
{{
  "id": "string",
  "title": "string",
  "subtitle": "string",
  "tags": ["{style}", "{season}", "{occasion}"],
  "score": 0-100,
  "imageUrls": [],
  "explanation": "why this works",
  "highlights": [],
  "confidence": 0.0,
  "buyLinks": []
}}
Constraints:
- Style: {style}
- Occasion: {occasion}
- Season: {season}
- Preferred colors: {preferred}
User prompt: {prompt}
""".strip()

def safe_parse_array(text: str) -> List[Dict[str, Any]]:
    if not text:
        return []
    # strip code fences
    text = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).replace("```", "").strip()
    # try direct
    try:
        data = json.loads(text)
        return data if isinstance(data, list) else []
    except Exception:
        pass
    # try first [...] block
    m = re.search(r"\[[\s\S]*\]", text)
    if m:
        try:
            data = json.loads(m.group(0))
            return data if isinstance(data, list) else []
        except Exception:
            return []
    return []

# ---------- routes ----------
@app.get("/api/health")
def health():
    from datetime import datetime, timezone
    return jsonify({"ok": True, "time": datetime.now(timezone.utc).isoformat()})

@app.post("/api/gemini/suggest")
def gemini_suggest():
    try:
        print("[/api/gemini/suggest] start")
        model, model_id = get_model()
        instruction = build_prompt(request.json or {})
        result = model.generate_content(instruction)

        text = getattr(result, "text", None) or "[]"
        print("[/api/gemini/suggest] raw first 300:", text[:300].replace("\n", " "))
        data = safe_parse_array(text)
        print("[/api/gemini/suggest] parsed items:", len(data))
        return jsonify({"outfits": data, "model": model_id})
    except requests.HTTPError as he:
        print("[HTTP ERROR]", he)
        try:
            print("[HTTP ERROR JSON]", he.response.json())
        except Exception:
            print("[HTTP ERROR TEXT]", he.response.text)
        return jsonify({"outfits": [], "error": "HTTP error talking to Gemini"}), 200
    except Exception as e:
        import traceback
        print("[UNCAUGHT EXCEPTION]", e)
        print(traceback.format_exc())
        return jsonify({"outfits": [], "error": str(e)}), 200

@app.post("/api/gemini/suggest-from-photo")
def gemini_suggest_from_photo():
    try:
        if "file" not in request.files:
            return jsonify({"outfits": [], "error": "No image uploaded"}), 400

        file = request.files["file"]
        style = request.form.get("style", "")
        season = request.form.get("season", "")
        occasion = request.form.get("occasion", "")
        palette_raw = request.form.get("palette", "[]")

        try:
            palette = json.loads(palette_raw)
            if not isinstance(palette, list): palette = []
        except Exception:
            palette = []

        preferred_colors = ", ".join(palette) if palette else "any"

        model, model_id = get_model()
        vision_prompt = f"""
Identify the clothing pieces/colors in the image, then suggest exactly 6 remixable outfits.
Return ONLY a JSON array of objects with:
"id","title","subtitle","tags","score","imageUrls","explanation","highlights","confidence","buyLinks".
Constraints:
- Style: {style}
- Occasion: {occasion}
- Season: {season}
- Preferred colors: {preferred_colors}
""".strip()

        b64 = base64.b64encode(file.read()).decode("utf-8")
        result = model.generate_content([
            {"text": vision_prompt},
            {"inline_data": {"mime_type": file.mimetype, "data": b64}},
        ])

        text = getattr(result, "text", None) or "[]"
        print("[/api/gemini/suggest-from-photo] raw first 300:", text[:300].replace("\n", " "))
        data = safe_parse_array(text)
        print("[/api/gemini/suggest-from-photo] parsed items:", len(data))
        return jsonify({"outfits": data, "model": model_id})
    except requests.HTTPError as he:
        try:
            detail = he.response.json()
        except Exception:
            detail = {"status": he.response.status_code, "text": he.response.text}
        return jsonify({"outfits": [], "error": detail}), 200
    except Exception as e:
        print("[GEMINI PHOTO ERROR]", e)
        return jsonify({"outfits": [], "error": str(e)}), 200

@app.get("/api/gemini/models")
def gemini_models():
    try:
        require_key()
        models = list_models_for_key(GEMINI_API_KEY)
        return jsonify({"models": models}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # threaded helps keep the server responsive during long model calls
    app.run(host="0.0.0.0", port=PORT, debug=True, threaded=True)

import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load key from .env.local
load_dotenv('.env.local')
api_key = os.getenv('VITE_GEMINI_API_KEY')

if not api_key:
    print("Error: VITE_GEMINI_API_KEY not found in .env.local")
    exit(1)

genai.configure(api_key=api_key)

try:
    # Use the model typically used in the script
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("hello")
    print("API Key is ACTIVE and responding.")
    print("Standard Free Tier Limits for Gemini 2.0 Flash:")
    print("- 1,500 Requests per day")
    print("- 15 Requests per minute")
    print("- 1 million Tokens per minute")
    print("\nNote: Individual remaining daily quota cannot be checked via the API, only in the Google AI Studio dashboard.")
except Exception as e:
    if "429" in str(e):
        print("ALERT: You have reached your API RATE LIMIT (Quota exceeded for today or per-minute).")
    else:
        print(f"API Error: {e}")

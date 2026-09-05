# Kokborok Dictionary & Translator Project

This project is a modern, responsive web application designed to bridge the language gap between English and indigenous languages like Kokborok (and potentially others like Uchoi).

## Project Workflow (End-to-End)

This section describes the complete flow of data from user input to the final response.

### 1. User Input
The user interacts with the application in two ways:
*   **Text Input:** Typing a word or phrase into the search bar.
*   **Voice Input:** Using the microphone button (Web Speech API) to speak Kokborok words.

### 2. Processing & Lookup
Once input is received, the application performs two parallel operations:



#### B. AI Analysis (Generative AI)
*   **Technique:** If the user requests "Analyze", the input is sent to the **Google Gemini API**.
*   **Model:** Uses `gemini-2.5-flash`.
*   **Process:**
    1.  Constructs a prompt acting as an "expert linguist".
    2.  Requests "Meaning" and "Example Usage".
    3.  Fetches the generated response.
*   **Result:** A rich, context-aware explanation is displayed alongside the static definition.

### 3. Data Extraction Pipeline (Backend)
The static JSON data was generated through a custom Python extraction pipeline:
1.  **Source:** `6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf`.
2.  **Extraction:** Python scripts (`scripts/build_dictionary.py`) use **`pdfplumber`** to read the PDF.
3.  **Parsing:**
    *   **Column-Awareness:** Splits pages into 4 columns to handle the dictionary layout.
    *   **Regex Pattern Matching:** Identifies Headwords, Parts of Speech (n., v., adj.), and definitions.
4.  **Output:** The structured data is saved as `dictionary.json`.


## Tech Stack

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS
*   **Data Processing:** Python (`pdfplumber`, `re`)
*   **AI/NLP:** Google Gemini API (`@google/genai`), Web Speech API
*   **Data Storage:** Local JSON files


## Deployments

Live Demo Link : https://kokborok-lexlator.vercel.app

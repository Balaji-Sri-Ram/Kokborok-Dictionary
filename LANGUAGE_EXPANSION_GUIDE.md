# Language Expansion & Ingestion Manual

This guide explains how to add a new language to your website and ingest the data from a PDF/Word file on your own.

## Step 1: File Preparation
1. Create a folder named `ingest` in the project root if it doesn't exist.
2. Place your **PDF** or **Word (.docx)** file inside that folder.

## Step 2: Running the Ingestor (Commands)
I have created a specialized script: [ingest_language.py](./scripts/ingest_language.py). It uses AI to read the file and update your database.

**Run these commands in your terminal:**

1. Install required Python tools (only once):
```bash
pip install pdfplumber python-docx python-dotenv google-generativeai
```

2. Run the ingestor:
```bash
python scripts/ingest_language.py
```

3. Follow the terminal prompts:
   - Enter the **Language Name** (e.g., `Uchoi`).
   - Enter the **File Path** (e.g., `ingest/uchoi_data.pdf`).

---

## Step 3: Required Code Changes
After the script finishes, you need to tell the Website that a new language is available.

### 1. Update [LanguageContext.tsx](./context/LanguageContext.tsx)
Add your new language to the `Language` type:

```typescript
// Line 3: Add your language to the list
export type Language = 
  | 'Kokborok' 
  | 'Uchoi' 
  | 'YourNewLanguage'; // <--- Add here
```

### 2. Update [LanguageSelector.tsx](./components/LanguageSelector.tsx)
Add the language to the `LANGUAGES` array so it appears in the dropdown menu:

```typescript
const LANGUAGES = [
  'Kokborok',
  'Uchoi',
  'YourNewLanguage' // <--- Add here
];
```

---

## Step 4: Verification
1. Run `npm run dev` to start the website.
2. Click the Language Selector (Globe icon) and select your new language.
3. Try searching for a word in the dictionary — the results will now be pulled from the new language field in `dictionary.json`.

> [!TIP]
> **Maximum Accuracy**: The `ingest_language.py` script uses your Gemini API key (from `.env.local`) to process the text. This is much more accurate than traditional code because the AI understands the linguistic context of the dictionary entries.

> [!CAUTION]
> **API Limits**: If your PDF is very large (hundreds of pages), the script might reach the AI token limit. It is best to process a few pages at a time or contact me to upgrade the script for "Batch Processing."

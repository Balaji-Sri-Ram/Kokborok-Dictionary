
import React, { useState, useEffect } from 'react';
import { BookOpen, Info } from 'lucide-react';
import { InputArea } from './components/InputArea';
import { ResultTable } from './components/ResultTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import ThemeToggle from './components/ThemeToggle';
import { translateText } from './services/translator';
import { analyzeWithAI } from './services/aiService';
import { MOCK_EXAMPLES } from './constants';
import { TranslationResult, AnalysisStatus, AI_MODELS } from './types';

// Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (ev: SpeechRecognitionEvent) => void;
    onerror: (ev: any) => void;
    onend: () => void;
  }
}

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisContent, setAnalysisContent] = useState('');
  const [analysisError, setAnalysisError] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recog = new SpeechRec();
      recog.continuous = false;
      recog.lang = 'en-US';

      recog.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);
      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleTranslate = () => {
    const translationResults = translateText(inputText);
    setResults(translationResults);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setAnalysisContent('');
    setAnalysisError('');
  };

  const handleAnalyze = async () => {
    if (!inputText) return;
    setAnalysisStatus(AnalysisStatus.LOADING);
    setAnalysisError('');
    try {
      const result = await analyzeWithAI(inputText, selectedModel);
      setAnalysisContent(result);
      setAnalysisStatus(AnalysisStatus.SUCCESS);
    } catch (error: any) {
      setAnalysisError(error.message || "Unable to generate analysis.");
      setAnalysisStatus(AnalysisStatus.ERROR);
    }
  };

  const loadExample = (text: string) => {
    setInputText(text);
    setTimeout(() => {
      setResults(translateText(text));
      setAnalysisStatus(AnalysisStatus.IDLE);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">Kokborok <span className="text-indigo-600 dark:text-violet-400">Dictionary</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-violet-950/60 text-indigo-700 dark:text-violet-300 border border-indigo-100 dark:border-violet-800/50">
              Dataset: Debbarma Dictionary (Rev. 2025)
            </span>
            <a href="https://en.wikipedia.org/wiki/Kokborok" target="_blank" rel="noopener" className="text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors">
              <Info size={20} />
            </a>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 transition-colors duration-300">
        <div className="grid grid-cols-1 gap-8">
          <section>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dictionary Search</h2>
              <div className="flex gap-2">
                {MOCK_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(ex)}
                    className="text-[10px] md:text-xs bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-violet-950/50 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-violet-400 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
            <InputArea
              value={inputText}
              onChange={setInputText}
              onTranslate={handleTranslate}
              isListening={isListening}
              toggleListening={toggleListening}
            />
          </section>

          {results.length > 0 && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <ResultTable results={results} />
              <AnalysisPanel
                status={analysisStatus}
                content={analysisContent}
                error={analysisError}
                onAnalyze={handleAnalyze}
                canAnalyze={!!inputText}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-6 mt-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 dark:text-zinc-500 text-sm">
          <p>© 2026 Kokborok NLP Project - Comprehensive Dictionary Edition</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Model: Gemini 3 Pro</span>
            <span>Dataset V3.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

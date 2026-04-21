
import React, { useState, useEffect } from 'react';
import { BookOpen, Info } from 'lucide-react';
import { InputArea } from '@/components/InputArea';
import { ResultTable } from '@/components/ResultTable';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import NavTabs from '@/components/NavTabs';
import { TranslatorView } from '@/components/TranslatorView';
import { translateText } from '@/services/translator';
import { analyzeWithAI } from '@/services/aiService';
import { MOCK_EXAMPLES } from '@/constants';
import { TranslationResult, AnalysisStatus, AI_MODELS } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { selectedLanguage, t, dictionaryData, isLoadingData } = useLanguage();

  // Dynamic Browser Title
  useEffect(() => {
    document.title = t('Kokborok Lexlator');
  }, [selectedLanguage, t]);
  const [analysisContent, setAnalysisContent] = useState('');
  const [analysisError, setAnalysisError] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [activeTab, setActiveTab] = useState<'dictionary' | 'translator'>('dictionary');

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
    const translationResults = translateText(inputText, selectedLanguage, dictionaryData);
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
      setResults(translateText(text, selectedLanguage, dictionaryData));
      setAnalysisStatus(AnalysisStatus.IDLE);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-900/90">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-xl text-white shadow-lg">
              <BookOpen size={18} className="sm:w-5 sm:h-5" />
            </div>
            <motion.h1 
              key={selectedLanguage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm sm:text-lg font-bold text-slate-800 dark:text-zinc-100 tracking-tight hidden md:block"
            >
              {t('Kokborok')} <span className="text-indigo-600 dark:text-violet-400">Lexlator</span>
            </motion.h1>
          </div>

          {/* Middle: Navigation Tabs */}
          <div className="flex-1 flex justify-center min-w-0">
            <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-1 sm:gap-3 flex-shrink-0">
            <span className="hidden xl:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-violet-950/60 text-indigo-700 dark:text-violet-300 border border-indigo-100 dark:border-violet-800/50 uppercase tracking-tight">
              Dataset V3.1
            </span>
            <a 
              href={`https://en.wikipedia.org/wiki/${selectedLanguage}`} 
              target="_blank" 
              rel="noopener" 
              className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors"
            >
              <Info size={18} />
            </a>
            <LanguageSelector />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 transition-colors duration-300">

        {isLoadingData && (
          <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 flex items-center gap-3 animate-in zoom-in duration-300">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Loading {selectedLanguage} Dataset...</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'dictionary' ? (
            <motion.div 
              key="dictionary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-8"
            >
              <section>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('Dictionary Search')}</h2>
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
            </motion.div>
          ) : (
            <motion.div
              key="translator"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TranslatorView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-6 mt-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 dark:text-zinc-500 text-sm">
          <p>© 2026 {t('Kokborok')} Lexlator - {t('Dictionary and Translator Web App')}</p>
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

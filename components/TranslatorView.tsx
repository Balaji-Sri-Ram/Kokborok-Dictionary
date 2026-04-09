import React, { useState, useEffect, useRef } from 'react';
import { Copy, Trash2, Languages, Volume2, Check, Sparkles, ArrowRightLeft } from 'lucide-react';
import { translateEnglishToTarget, translateTargetToEnglish } from '../services/translator';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const TranslatorView: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mode, setMode] = useState<'en-to-kb' | 'kb-to-en'>('en-to-kb');
  const [isSwapping, setIsSwapping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t, selectedLanguage } = useLanguage();

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    setIsTranslating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const translation = mode === 'en-to-kb' 
        ? translateEnglishToTarget(input, selectedLanguage) 
        : translateTargetToEnglish(input, selectedLanguage);
      setOutput(translation);
      setIsTranslating(false);
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setMode(prev => prev === 'en-to-kb' ? 'kb-to-en' : 'en-to-kb');
      if (output) {
        setInput(output);
        setOutput(input);
      }
      setIsSwapping(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Direction Toggle Header */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 ${mode === 'en-to-kb' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
          English
        </div>
        
        <button
          onClick={handleSwap}
          className={`p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:border-indigo-400 dark:hover:border-violet-500 transition-all duration-500 ${isSwapping ? 'rotate-180 scale-110' : 'hover:scale-110'}`}
          title="Swap languages"
        >
          <ArrowRightLeft size={18} className="text-indigo-600 dark:text-violet-400" />
        </button>

        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 ${mode === 'kb-to-en' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
          {t('Kokborok')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="relative group">
          <div className={`absolute -top-3 left-4 px-2 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-[10px] font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-widest z-10 transition-transform duration-500 ${isSwapping ? 'scale-0' : 'scale-100'}`}>
            {mode === 'en-to-kb' ? t('From: English') : `${t('From')}: ${t('Kokborok')}`}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-violet-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'en-to-kb' ? t('Enter English text...') : `${t('Enter')} ${t('Kokborok')} ${t('text')}...`}
              className="w-full h-48 md:h-64 p-6 bg-transparent resize-none focus:outline-none text-slate-700 dark:text-zinc-200 text-lg leading-relaxed"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {input && (
                <button
                  onClick={handleClear}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear text"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="relative group">
          <div className={`absolute -top-3 left-4 px-2 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-[10px] font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-widest z-10 transition-transform duration-500 ${isSwapping ? 'scale-0' : 'scale-100'}`}>
            {mode === 'en-to-kb' ? `${t('To')}: ${t('Kokborok')}` : t('To: English')}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm min-h-[12rem] md:min-h-[16rem] transition-all duration-300">
            <div className="p-6 text-lg leading-relaxed text-slate-800 dark:text-zinc-100 whitespace-pre-wrap">
              {output || (
                <span className="text-slate-400 dark:text-zinc-600 italic">
                  {isTranslating ? t('Translating...') : t('Result will appear here...')}
                </span>
              )}
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {output && (
                <>
                  <button
                    onClick={handleCopy}
                    className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      isCopied 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}
                    title="Copy translation"
                  >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                    title="Listen"
                  >
                    <Volume2 size={18} />
                  </button>
                </>
              )}
            </div>
            
            {isTranslating && (
              <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles size={16} className="text-indigo-500 dark:text-violet-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-violet-950/30 text-indigo-700 dark:text-violet-300 rounded-full text-xs font-medium border border-indigo-100 dark:border-violet-800/50 shadow-sm">
          <Languages size={14} />
          {t('Universal Translator')}: English / {t('Kokborok')} {t('Parallel Engine')}
        </div>
      </div>
    </div>
  );
};

export default TranslatorView;

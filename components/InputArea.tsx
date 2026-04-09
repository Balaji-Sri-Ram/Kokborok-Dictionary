import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onTranslate: () => void;
  isListening: boolean;
  toggleListening: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onTranslate,
  isListening,
  toggleListening
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div className="group rounded-2xl border-2 border-slate-300 dark:border-zinc-700 transition-all duration-300 focus-within:border-indigo-600 dark:focus-within:border-violet-500">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${t('Enter Kokborok text here')} (e.g., 'Khaini bwkha')...`}
            className="w-full p-6 text-lg text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 bg-transparent border-none outline-none focus:ring-0 resize-none min-h-[120px]"
            spellCheck={false}
          />

          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Clear text"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 border-t-2 border-slate-300 dark:border-zinc-700 group-focus-within:border-indigo-600 dark:group-focus-within:border-violet-500 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isListening
                ? 'bg-red-100 text-red-600 animate-pulse ring-1 ring-red-200'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
            >
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              {isListening ? t('Listening...') : t('Dictate')}
            </button>
          </div>

          <button
            onClick={onTranslate}
            disabled={!value.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all"
          >
            <Search size={18} />
            {t('Translate')}
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';



const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedLanguage, setSelectedLanguage, availableLanguages } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          transition-all duration-300 select-none cursor-pointer
          border shadow-sm active:scale-95
          ${isOpen 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-200/50 dark:bg-violet-600 dark:border-violet-500 dark:shadow-violet-900/50' 
            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:text-violet-400'
          }
        `}
      >
        <Globe size={16} className={`${isOpen ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">{selectedLanguage}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Animated Dropdown */}
      <div 
        className={`
          absolute right-0 mt-2 w-64 max-h-[70vh] overflow-y-auto
          bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl
          border border-slate-200 dark:border-zinc-800
          rounded-2xl shadow-2xl z-50
          origin-top-right transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
          custom-scrollbar
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
        `}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6366f1;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #818cf8;
          }
        `}</style>
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Select Language
          </div>
          {availableLanguages.map((lang, index) => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLanguage(lang);
                setIsOpen(false);
              }}
              style={{ transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm
                transition-all duration-200 group
                ${selectedLanguage === lang 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-violet-500/10 dark:text-violet-300' 
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:translate-x-1'
                }
                ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
              `}
            >
              <span className="font-medium">{lang}</span>
              {selectedLanguage === lang && (
                <Check size={14} className="text-indigo-600 dark:text-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;

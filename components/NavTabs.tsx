import React from 'react';
import { BookOpen, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavTabsProps {
  activeTab: 'dictionary' | 'translator';
  onTabChange: (tab: 'dictionary' | 'translator') => void;
}

const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  return (
    <div className="relative flex p-1.5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800/80 shadow-inner">
      {/* Sliding Background */}
      <div 
        className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white dark:bg-zinc-900 rounded-xl shadow-md transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          activeTab === 'translator' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      
      <button
        onClick={() => onTabChange('dictionary')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-300 ${
          activeTab === 'dictionary' 
          ? 'text-indigo-600 dark:text-violet-400' 
          : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
        }`}
      >
        <BookOpen size={16} />
        <span>{t('Dictionary')}</span>
      </button>
      
      <button
        onClick={() => onTabChange('translator')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
          activeTab === 'translator' 
          ? 'text-indigo-600 dark:text-violet-400' 
          : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
        }`}
      >
        <Languages size={18} />
        <span className="text-xs">{t('Translator')}</span>
      </button>
    </div>
  );
};

export default NavTabs;

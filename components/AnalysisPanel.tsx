import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, Bot, ChevronDown } from 'lucide-react';
import { AnalysisStatus, AI_MODELS } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AnalysisPanelProps {
  status: AnalysisStatus;
  content: string;
  error?: string;
  onAnalyze: () => void;
  canAnalyze: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  status,
  content,
  error,
  onAnalyze,
  canAnalyze,
  selectedModel,
  onModelChange
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-950 dark:to-violet-950/30 rounded-2xl border border-indigo-100 dark:border-violet-900/50 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-600 dark:bg-violet-700 rounded-lg text-white shadow-md shadow-violet-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-zinc-100">{t('AI Context Analysis')}</h3>
            <div className="flex items-center mt-1">
              <span className="text-sm text-slate-500 dark:text-zinc-500 mr-2">Powered by</span>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  disabled={status === AnalysisStatus.LOADING}
                  className="appearance-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs rounded-md pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer disabled:opacity-50"
                >
                  {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {status !== AnalysisStatus.LOADING && (
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className="px-4 py-2 bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 rounded-lg text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {t('Analyze Phrase')}
          </button>
        )}
      </div>

      {status === AnalysisStatus.LOADING && (
        <div className="flex flex-col items-center justify-center py-8 text-violet-600 dark:text-violet-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <p className="text-sm font-medium animate-pulse">{t('Consulting linguistic models')}...</p>
        </div>
      )}

      {status === AnalysisStatus.SUCCESS && (
        <div className="text-slate-800 dark:text-zinc-200 prose prose-indigo dark:prose-invert prose-sm max-w-none bg-white/50 dark:bg-zinc-900/60 p-4 rounded-xl border border-indigo-100/50 dark:border-zinc-800">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      {status === AnalysisStatus.ERROR && (
        <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
          {error || "Unable to generate analysis. Please check your API key or connection."}
        </div>
      )}

      {status === AnalysisStatus.IDLE && (
        <p className="text-slate-500 dark:text-zinc-500 text-sm italic">
          {t('Click "Analyze Phrase" to get deep insights, grammatical structure, and cultural context for your')} {t('Kokborok')} {t('text')}.
        </p>
      )}
    </div>
  );
};
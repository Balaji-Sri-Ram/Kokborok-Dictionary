
import React from 'react';
import { TranslationResult } from '@/types';
import { Volume2, AlertCircle } from 'lucide-react';

interface ResultTableProps {
  results: TranslationResult[];
}


export const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  if (results.length === 0) return null;

  const expandPOS = (pos: string) => {
    const map: Record<string, string> = {
      "n.": "Noun",
      "v.": "Verb",
      "v.t.": "Verb Transitive",
      "v.i.": "Verb Intransitive",
      "vt.": "Verb Transitive",
      "vi.": "Verb Intransitive",
      "adj.": "Adjective",
      "adv.": "Adverb",
      "prep.": "Preposition",
      "conj.": "Conjunction",
      "pron.": "Pronoun",
      "interj.": "Interjection"
    };
    const cleaned = pos.toLowerCase().trim();
    return map[cleaned] || map[cleaned + "."] || pos;
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Lexical Lookup</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[10px] sm:text-sm uppercase tracking-wider">
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium border-b border-slate-200 dark:border-zinc-800">Input Word</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium border-b border-slate-200 dark:border-zinc-800">English Headword</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium border-b border-slate-200 dark:border-zinc-800">Pronunciation</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium border-b border-slate-200 dark:border-zinc-800">POS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {results.map((item, index) => {
              if (item.found && item.entries && item.entries.length > 0) {
                return (
                  <React.Fragment key={index}>
                    {item.entries.map((entry, entryIndex) => (
                      <tr
                        key={`${index}-${entryIndex}`}
                        className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-900/60`}
                      >
                        {/* Only render Input Word cell for the first entry of the group */}
                        {entryIndex === 0 && (
                          <td
                            className="px-3 sm:px-6 py-3 sm:py-4 align-top bg-white dark:bg-zinc-950"
                            rowSpan={item.entries.length}
                          >
                            <span className="font-semibold text-slate-800 dark:text-zinc-100 text-base sm:text-lg sticky top-0">
                              {item.original}
                            </span>
                          </td>
                        )}

                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-700 dark:text-zinc-200 font-medium text-sm sm:text-base">
                          {entry.english}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 w-fit px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium">
                            <Volume2 size={12} className="sm:w-3.5 sm:h-3.5" />
                            {entry.pronunciation}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300">
                            {expandPOS(entry.pos)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              } else {
                return (
                  <tr key={index} className="bg-amber-50/30 dark:bg-amber-900/10">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{item.original}</span>
                    </td>
                    <td colSpan={3} className="px-6 py-4 text-slate-400 dark:text-zinc-500 italic">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        Not in static cache. Use AI Analysis for this term.
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

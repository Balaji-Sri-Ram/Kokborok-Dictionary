import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATING_EMOJIS = ['😠', '😕', '😐', '🙂', '🤩'];
const RATING_LABELS = ['Terrible', 'Needs Work', 'Okay', 'Good', 'Amazing!'];
const RATING_COLORS = [
  'text-red-500',
  'text-orange-500',
  'text-yellow-500',
  'text-emerald-500',
  'text-indigo-500'
];
const RATING_BG_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-emerald-500',
  'bg-indigo-500'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [useCase, setUseCase] = useState<string>('translator');
  const [otherUseCase, setOtherUseCase] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "95b73209-9369-4c42-9951-33302c2c0632",
          subject: "New Feedback for Kokborok Lexlator",
          rating: `${rating} / 5 (${RATING_LABELS[rating - 1]})`,
          primary_use_case: useCase,
          other_use_case_specified: otherUseCase,
          feedback_comments: feedback,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setRating(5);
          setUseCase('translator');
          setOtherUseCase('');
          setFeedback('');
          onClose();
        }, 2000);
      } else {
        console.error("Failed to submit feedback", result);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-16 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="relative w-full max-w-[480px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col z-10 max-h-[95vh]"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-zinc-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Share Feedback</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="p-12 flex flex-col items-center justify-center text-center space-y-4 h-[400px]"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Thank You!</h3>
              <p className="text-slate-500 dark:text-zinc-400">Your feedback helps us make Kokborok Lexlator better for everyone.</p>
            </motion.div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                
                {/* Rating Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    How would you rate your experience? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <motion.div 
                      key={rating}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl mb-1 drop-shadow-sm"
                    >
                      {RATING_EMOJIS[rating - 1]}
                    </motion.div>
                    <span className={`text-sm font-bold mb-3 ${RATING_COLORS[rating - 1]}`}>
                      {RATING_LABELS[rating - 1]}
                    </span>
                    
                    <div className="w-full relative px-2">
                      <div className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg relative overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-lg pointer-events-none transition-all duration-300 ${RATING_BG_COLORS[rating - 1]}`}
                          style={{ width: `calc(${(rating - 1) * 25}%)` }}
                        ></div>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="1"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex justify-between w-full mt-1.5 text-[10px] text-slate-400 dark:text-zinc-500 font-bold px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Use Case */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    What do you use most? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dictionary', 'Translator', 'Learning', 'Other'].map((item) => {
                      const id = item.toLowerCase();
                      const isSelected = useCase === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setUseCase(id)}
                          className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                  {useCase === 'other' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 overflow-hidden"
                    >
                      <label htmlFor="otherUseCase" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Please specify <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="otherUseCase"
                        value={otherUseCase}
                        onChange={(e) => setOtherUseCase(e.target.value)}
                        placeholder="E.g., Research, Fun, etc."
                        className="w-full bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                        required
                      />
                    </motion.div>
                  )}
                </div>

                {/* Open Feedback */}
                <div className="space-y-2">
                  <label htmlFor="feedback" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    How can we improve?
                  </label>
                  <textarea
                    id="feedback"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you love, or what could be better..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (useCase === 'other' && !otherUseCase.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

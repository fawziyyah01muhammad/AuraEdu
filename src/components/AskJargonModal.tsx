import React, { useState } from 'react';
import { X, Sparkles, HelpCircle, BookOpen, Lightbulb } from 'lucide-react';

interface AskJargonModalProps {
  initialTerm: string;
  contextText?: string;
  preferredLanguage: string;
  onClose: () => void;
}

export const AskJargonModal: React.FC<AskJargonModalProps> = ({
  initialTerm,
  contextText,
  preferredLanguage,
  onClose,
}) => {
  const [term, setTerm] = useState(initialTerm);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    plainEnglish?: string;
    localExplanation?: string;
    memoryHook?: string;
  } | null>(null);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!term.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/ask-jargon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          context: contextText,
          preferredLanguage,
        }),
      });

      if (!res.ok) throw new Error('Failed to query term');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialTerm) {
      handleAsk();
    }
  }, [initialTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors"
          id="btn-close-jargon-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Instant Jargon Explainer</h3>
            <p className="text-xs text-slate-500">Ask AI about any confusing academic concept</p>
          </div>
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder="Type any word or phrase..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            id="input-ask-jargon-term"
          />
          <button
            type="submit"
            disabled={isLoading || !term.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            id="btn-submit-ask-jargon"
          >
            {isLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Explain</span>
          </button>
        </form>

        {isLoading && (
          <div className="py-8 text-center text-xs text-indigo-600 font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Consulting AI Learning Science Engine...</span>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Plain English & Analogy
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {result.plainEnglish}
              </p>
            </div>

            {result.localExplanation && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  In {preferredLanguage}
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {result.localExplanation}
                </p>
              </div>
            )}

            {result.memoryHook && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exam Memory Hook</span>
                </div>
                <p className="text-xs text-slate-800 italic font-medium">
                  "{result.memoryHook}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

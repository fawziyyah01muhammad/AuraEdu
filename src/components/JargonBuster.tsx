import React, { useState } from 'react';
import { Sparkles, BookOpen, Search, HelpCircle, Languages, Check, Copy } from 'lucide-react';
import { JargonTerm } from '../types';

interface JargonBusterProps {
  jargonTerms: JargonTerm[];
  preferredLanguage: string;
  onAskJargon: (term: string) => void;
}

export const JargonBuster: React.FC<JargonBusterProps> = ({
  jargonTerms,
  preferredLanguage,
  onAskJargon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const filteredTerms = jargonTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.simplifiedExplanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (termText: string) => {
    navigator.clipboard.writeText(termText);
    setCopiedTerm(termText);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Jargon Buster & Local Terminology
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              {jargonTerms.length} Terms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Demystifies intimidating academic jargon into everyday language and {preferredLanguage} equivalents.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search jargon term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            id="input-search-jargon"
          />
        </div>
      </div>

      {/* Grid of Jargon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((jargon, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all"
            id={`jargon-card-${idx}`}
          >
            <div>
              {/* Term Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {jargon.term}
                  </h4>
                </div>
                <button
                  onClick={() => handleCopy(`${jargon.term}: ${jargon.simplifiedExplanation}`)}
                  className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                  title="Copy term explanation"
                >
                  {copiedTerm === jargon.term ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Simplified Explanation */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Plain Language Meaning</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                  {jargon.simplifiedExplanation}
                </p>
              </div>

              {/* Local Language Translation or Vernacular */}
              {(jargon.localLanguageTerm || jargon.localLanguageTranslation) && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <Languages className="w-3 h-3 text-emerald-600" />
                    <span>In {preferredLanguage}</span>
                  </div>
                  {jargon.localLanguageTerm && (
                    <p className="text-xs font-bold text-slate-900 mb-0.5">
                      {jargon.localLanguageTerm}
                    </p>
                  )}
                  {jargon.localLanguageTranslation && (
                    <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                      "{jargon.localLanguageTranslation}"
                    </p>
                  )}
                </div>
              )}

              {/* Formal Academic Definition */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Formal Academic Definition:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {jargon.definition}
                </p>
              </div>
            </div>

            {/* Ask AI button */}
            <button
              onClick={() => onAskJargon(jargon.term)}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 hover:text-indigo-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              id={`btn-ask-jargon-${idx}`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI for deeper analogy or memory hook</span>
            </button>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
          No jargon terms matched your search filter. Try clearing the search box.
        </div>
      )}
    </div>
  );
};

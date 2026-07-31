import React from 'react';
import { BookOpen, Sparkles, Languages, RotateCcw, Award } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface NavbarProps {
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  onReset: () => void;
  hasActiveCourse: boolean;
  totalQuizzesCompleted?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedLanguage,
  onLanguageChange,
  onReset,
  hasActiveCourse,
  totalQuizzesCompleted = 0,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset} id="brand-logo">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-100">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                AuraEdu
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                AI Simplifier
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              University Course Simplifier & Audio Quizzer
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Quiz score badge if available */}
          {totalQuizzesCompleted > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{totalQuizzesCompleted} Quizzes Passed</span>
            </div>
          )}

          {/* Preferred Language Selector */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors" id="language-selector-btn">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>{currentLang.flag} {currentLang.name}</span>
            </div>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 hidden group-hover:block z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Study Audio & Notes Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedLanguage === lang.code ? 'text-indigo-600 font-bold bg-indigo-50/70' : 'text-slate-700'
                  }`}
                  id={`lang-opt-${lang.code}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset / New Course button */}
          {hasActiveCourse && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-100"
              title="Upload another course"
              id="new-course-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Course</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

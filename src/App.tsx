import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CourseUpload } from './components/CourseUpload';
import { CourseOverview } from './components/CourseOverview';
import { AskJargonModal } from './components/AskJargonModal';
import { CourseAnalysis } from './types';
import { SUPPORTED_LANGUAGES } from './data/languages';
import { Sparkles, AlertCircle, BookOpen, Brain, Languages } from 'lucide-react';

export default function App() {
  const [course, setCourse] = useState<CourseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('yo'); // Default to Yoruba / local language option
  const [activeJargonTerm, setActiveJargonTerm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleStartSimplification = async (content: string, title: string, academicLevel: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setLoadingStep('Analyzing course structure & decomposing dense jargon...');

      const stepTimer1 = setTimeout(() => {
        setLoadingStep(`Writing audio study scripts in ${langObj.name}...`);
      }, 3000);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Crafting real-world analogies & interactive quizzes...');
      }, 6000);

      const res = await fetch('/api/simplify-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          academicLevel,
          preferredLanguage: langObj.name,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to simplify course');
      }

      const data: CourseAnalysis = await res.json();
      setCourse(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while processing course content');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setCourse(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onReset={handleReset}
          hasActiveCourse={!!course}
        />

        {/* Error Toast */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-700 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner Screen */}
        {isLoading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-inner">
                <Brain className="w-10 h-10 text-indigo-600 animate-bounce" />
              </div>
              <Sparkles className="w-6 h-6 text-emerald-500 absolute -top-2 -right-2 animate-spin" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Simplifying Course Contents
              </h3>
              <p className="text-xs text-indigo-700 font-mono font-medium animate-pulse">
                {loadingStep}
              </p>
              <p className="text-[11px] text-slate-500 pt-2">
                Target Language: <span className="text-slate-800 font-bold">{langObj.flag} {langObj.name}</span>
              </p>
            </div>
          </div>
        ) : !course ? (
          <CourseUpload
            onStartSimplification={handleStartSimplification}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            isLoading={isLoading}
          />
        ) : (
          <CourseOverview
            course={course}
            onResetCourse={handleReset}
            onAskJargon={(term) => setActiveJargonTerm(term)}
            preferredLanguage={langObj.name}
          />
        )}
      </div>

      {/* Jargon modal */}
      {activeJargonTerm && (
        <AskJargonModal
          initialTerm={activeJargonTerm}
          preferredLanguage={langObj.name}
          onClose={() => setActiveJargonTerm(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p className="flex items-center justify-center gap-2 font-medium">
          <span>AuraEdu • AI University Course Simplifier & Audio Quizzer</span>
        </p>
      </footer>
    </div>
  );
}

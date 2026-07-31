import React, { useState } from 'react';
import { CourseAnalysis, QuizResult } from '../types';
import { BookOpen, Sparkles, Languages, Clock, Award, CheckCircle2, RotateCcw, Share2, Layers, Brain } from 'lucide-react';
import { SegmentView } from './SegmentView';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface CourseOverviewProps {
  course: CourseAnalysis;
  onResetCourse: () => void;
  onAskJargon: (term: string) => void;
  preferredLanguage: string;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  course,
  onResetCourse,
  onAskJargon,
  preferredLanguage,
}) => {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});

  const totalJargonCount = course.segments.reduce(
    (acc, seg) => acc + (seg.jargonTerms ? seg.jargonTerms.length : 0),
    0
  );

  const totalStudyTime = course.segments.reduce(
    (acc, seg) => acc + (seg.durationMinutes || 5),
    0
  );

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResults((prev) => ({ ...prev, [result.segmentId]: result }));
  };

  const completedQuizzesCount = Object.keys(quizResults).length;
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === preferredLanguage) || SUPPORTED_LANGUAGES[0];

  const currentSegment = course.segments[activeSegmentIndex] || course.segments[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>{course.subject}</span>
              </span>
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                {course.academicLevel}
              </span>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                <span>{currentLang.flag}</span>
                <span>Audio in {currentLang.name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
              {course.overallSummary}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Study Segments</span>
              <span className="text-xl font-extrabold text-slate-900">{course.segments.length} Modules</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Jargon Busted</span>
              <span className="text-xl font-extrabold text-indigo-600">{totalJargonCount} Terms</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Est. Audio Time</span>
              <span className="text-xl font-extrabold text-emerald-600">~{totalStudyTime} Mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Selector Tabs / Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 border-r border-slate-200 pr-4">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Modules:</span>
          </div>

          {course.segments.map((seg, idx) => {
            const isCompleted = !!quizResults[seg.id];
            const isActive = idx === activeSegmentIndex;

            return (
              <button
                key={seg.id || idx}
                onClick={() => setActiveSegmentIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                id={`seg-tab-${idx}`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                  isActive ? 'bg-white text-indigo-600 font-bold' : 'bg-slate-200 text-slate-700 font-bold'
                }`}>
                  {idx + 1}
                </span>
                <span>{seg.title}</span>
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Segment Detailed View */}
      {currentSegment && (
        <SegmentView
          segment={currentSegment}
          segmentIndex={activeSegmentIndex}
          totalSegments={course.segments.length}
          preferredLanguage={preferredLanguage}
          onSelectSegment={setActiveSegmentIndex}
          onQuizComplete={handleQuizComplete}
          onAskJargon={onAskJargon}
        />
      )}
    </div>
  );
};

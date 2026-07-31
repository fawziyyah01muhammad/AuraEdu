import React, { useState } from 'react';
import { CourseSegment, QuizResult } from '../types';
import { BookOpen, Radio, Sparkles, Award, ArrowLeft, ArrowRight, Lightbulb, CheckCircle2, Copy, Check, MessageSquare } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { JargonBuster } from './JargonBuster';
import { QuizComponent } from './QuizComponent';

interface SegmentViewProps {
  segment: CourseSegment;
  segmentIndex: number;
  totalSegments: number;
  preferredLanguage: string;
  onSelectSegment: (index: number) => void;
  onQuizComplete: (result: QuizResult) => void;
  onAskJargon: (term: string) => void;
}

export const SegmentView: React.FC<SegmentViewProps> = ({
  segment,
  segmentIndex,
  totalSegments,
  preferredLanguage,
  onSelectSegment,
  onQuizComplete,
  onAskJargon,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'audio' | 'jargon' | 'quiz'>('summary');
  const [copiedAnalogy, setCopiedAnalogy] = useState(false);

  const copyAnalogy = () => {
    navigator.clipboard.writeText(segment.analogy);
    setCopiedAnalogy(true);
    setTimeout(() => setCopiedAnalogy(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Segment Header & Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full uppercase tracking-wider">
              Segment {segmentIndex + 1} of {totalSegments} • ~{segment.durationMinutes} min study
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {segment.title}
            </h2>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-2">
            <button
              disabled={segmentIndex === 0}
              onClick={() => onSelectSegment(segmentIndex - 1)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              id="btn-prev-segment"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="text-xs text-slate-500 font-mono font-bold px-1">
              {segmentIndex + 1} / {totalSegments}
            </span>
            <button
              disabled={segmentIndex === totalSegments - 1}
              onClick={() => onSelectSegment(segmentIndex + 1)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              id="btn-next-segment"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Original summary preview bar */}
        <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900 not-italic">Original Focus: </span>
          {segment.originalContentSummary}
        </p>

        {/* Main Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            id="tab-segment-summary"
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Simplified Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'audio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            id="tab-segment-audio"
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>🎧 Audio Explainer ({preferredLanguage})</span>
          </button>

          <button
            onClick={() => setActiveTab('jargon')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'jargon'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            id="tab-segment-jargon"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>💡 Jargon Buster ({segment.jargonTerms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            id="tab-segment-quiz"
          >
            <Award className="w-4 h-4 text-sky-600" />
            <span>🧠 Knowledge Quiz ({segment.quiz.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Simplified Summary & Analogy */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Main Simplified Explanation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Simplified Plain Language Explanation</span>
              </h3>
              <button
                onClick={() => onAskJargon(segment.title)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                id="btn-ask-about-segment"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Question</span>
              </button>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed font-sans space-y-3 whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200">
              {segment.simplifiedContent}
            </div>
          </div>

          {/* Real World Analogy Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-amber-950 text-base">
                  Real-World Relatable Analogy
                </h3>
              </div>
              <button
                onClick={copyAnalogy}
                className="text-xs text-amber-900 hover:text-black p-1.5 bg-white rounded-lg border border-amber-200 flex items-center gap-1 font-semibold shadow-sm"
                id="btn-copy-analogy"
              >
                {copiedAnalogy ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-amber-900 italic leading-relaxed bg-white/80 p-4 rounded-xl border border-amber-200/80">
              "{segment.analogy}"
            </p>
          </div>

          {/* Key Exam Takeaways */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key Takeaways for Exam Revision</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {segment.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: On-the-Go Audio Guide */}
      {activeTab === 'audio' && (
        <AudioPlayer
          audioScript={segment.audioScript}
          selectedLanguage={preferredLanguage}
          segmentTitle={segment.title}
          simplifiedContent={segment.simplifiedContent}
        />
      )}

      {/* Tab 3: Jargon Buster */}
      {activeTab === 'jargon' && (
        <JargonBuster
          jargonTerms={segment.jargonTerms}
          preferredLanguage={preferredLanguage}
          onAskJargon={onAskJargon}
        />
      )}

      {/* Tab 4: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <QuizComponent
          segmentId={segment.id}
          segmentTitle={segment.title}
          quizQuestions={segment.quiz}
          onQuizComplete={onQuizComplete}
        />
      )}
    </div>
  );
};

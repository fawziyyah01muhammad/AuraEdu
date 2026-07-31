import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Languages, GraduationCap, ArrowRight, CheckCircle2, BookOpen, Brain, Atom, TrendingUp, Network } from 'lucide-react';
import { COURSE_SAMPLES } from '../data/samples';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { CourseSample } from '../types';

interface CourseUploadProps {
  onStartSimplification: (content: string, title: string, academicLevel: string) => void;
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isLoading: boolean;
}

export const CourseUpload: React.FC<CourseUploadProps> = ({
  onStartSimplification,
  selectedLanguage,
  onLanguageChange,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'samples'>('samples');
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Upper Undergraduate');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setPastedText(text);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: CourseSample) => {
    onStartSimplification(sample.fullText, sample.title, sample.difficulty);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    onStartSimplification(pastedText, customTitle || 'Uploaded Course Material', academicLevel);
  };

  const getSampleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-6 h-6 text-purple-400" />;
      case 'Atom': return <Atom className="w-6 h-6 text-cyan-400" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'Network': return <Network className="w-6 h-6 text-amber-400" />;
      default: return <BookOpen className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AuraEdu AI Study Companion</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Complex Course Jargon Into <span className="text-indigo-600">Audio Summaries & Quizzes</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
          Upload any lecture notes, textbook chapter, or syllabus. AuraEdu demystifies dense academic jargon, generates explained audio guides in your preferred language (including Pidgin, Yoruba, Hausa, Swahili & more), and creates interactive quizzes.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'samples'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-samples"
            >
              🎓 Try Sample Courses
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-paste"
            >
              📝 Paste Notes / Text
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-upload"
            >
              📁 Upload Document
            </button>
          </div>

          {/* Academic Level Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Target Level:</span>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-600"
              id="select-academic-level"
            >
              <option value="High School">High School / Prep</option>
              <option value="Lower Undergraduate">First Year / General Uni</option>
              <option value="Upper Undergraduate">Upper Undergraduate (Core Major)</option>
              <option value="Master's / Post-Grad">Master's / Advanced Post-Grad</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Preloaded Course Samples */}
        {activeTab === 'samples' && (
          <div>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Click any sample course material below to generate instant jargon summaries, local language audio, and interactive quizzes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COURSE_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                  id={`sample-card-${sample.id}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-200 shadow-sm">
                        {getSampleIcon(sample.icon)}
                      </div>
                      <span className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full">
                        {sample.difficulty}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                      {sample.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 mb-2">
                      {sample.subject}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Analyze & Generate Audio</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Paste Notes or Syllabus */}
        {activeTab === 'paste' && (
          <form onSubmit={handleSubmitCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course Title or Module Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Organic Chemistry: Substitution & Elimination Reactions"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                id="input-course-title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paste Course Content / Lecture Notes / Syllabus Text
              </label>
              <textarea
                rows={8}
                placeholder="Paste complex text, lecture transcripts, textbook excerpts, or syllabus notes here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono leading-relaxed transition-colors"
                id="input-course-text"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                {pastedText.length > 0 ? `${pastedText.length} characters pasted` : 'Supports up to ~15,000 characters per analysis'}
              </span>
              <button
                type="submit"
                disabled={!pastedText.trim() || isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 text-sm"
                id="btn-submit-pasted"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simplify Course Content</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload Document File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              id="dropzone-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm text-indigo-600">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Drag and drop your course notes or syllabus here
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                Supports TXT, Markdown, PDF, or Word documents with academic lecture contents.
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-sm transition-colors"
              >
                Browse Files
              </button>
            </div>

            {fileName && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{fileName}</p>
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Ready to simplify
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSubmitCustom}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-100"
                  id="btn-process-file"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simplify File</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Jargon Deconstruction</h4>
            <p className="text-[11px] text-slate-500">Dense academic terms parsed into clear analogies and simple everyday words.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Local Language Audio</h4>
            <p className="text-[11px] text-slate-500">Audio study explainers formatted in Pidgin, Yoruba, Hausa, Swahili, Spanish & more.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 border border-amber-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Interactive Knowledge Quizzes</h4>
            <p className="text-[11px] text-slate-500">Instant test questions after each module with detailed explanations to boost exam retention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

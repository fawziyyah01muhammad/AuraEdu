export interface JargonTerm {
  term: string;
  definition: string;
  simplifiedExplanation: string;
  localLanguageTerm?: string;
  localLanguageTranslation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AudioScript {
  title: string;
  language: string;
  narratorScript: string;
  breakdownBulletPoints: string[];
}

export interface CourseSegment {
  id: string;
  title: string;
  durationMinutes: number;
  originalContentSummary: string;
  simplifiedContent: string;
  analogy: string;
  jargonTerms: JargonTerm[];
  audioScript: AudioScript;
  quiz: QuizQuestion[];
  keyTakeaways: string[];
}

export interface CourseAnalysis {
  id: string;
  title: string;
  subject: string;
  academicLevel: string;
  preferredLanguage: string;
  overallSummary: string;
  segments: CourseSegment[];
  createdAt: string;
}

export interface CourseSample {
  id: string;
  title: string;
  subject: string;
  icon: string;
  difficulty: string;
  description: string;
  fullText: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceLangCode: string; // e.g. 'es-ES', 'fr-FR', 'yo-NG', 'ha-NG', 'ig-NG', 'sw-KE', 'hi-IN', 'ar-SA'
}

export interface QuizResult {
  segmentId: string;
  score: number;
  total: number;
  answers: Record<number, number>;
  completedAt: string;
}

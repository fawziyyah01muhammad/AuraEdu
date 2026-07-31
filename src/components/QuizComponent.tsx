import React, { useState } from 'react';
import { QuizQuestion, QuizResult } from '../types';
import { CheckCircle2, XCircle, Award, RotateCcw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizComponentProps {
  segmentId: string;
  segmentTitle: string;
  quizQuestions: QuizQuestion[];
  onQuizComplete: (result: QuizResult) => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  segmentId,
  segmentTitle,
  quizQuestions,
  onQuizComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (submittedQuestions[currentQuestionIndex]) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] === undefined) return;

    setSubmittedQuestions((prev) => ({ ...prev, [currentQuestionIndex]: true }));

    // If last question, complete quiz
    if (currentQuestionIndex === totalQuestions - 1) {
      calculateAndFinish();
    }
  };

  const calculateAndFinish = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        score += 1;
      }
    });

    setIsCompleted(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log('Confetti failed silently', e);
    }

    onQuizComplete({
      segmentId,
      score,
      total: totalQuestions,
      answers: selectedAnswers,
      completedAt: new Date().toISOString(),
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setIsCompleted(false);
  };

  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
        No quiz questions available for this segment.
      </div>
    );
  }

  // Final summary view
  if (isCompleted) {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) score += 1;
    });
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Quiz Completed!
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
            Your Mastery Score: {score} / {totalQuestions} ({percentage}%)
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {percentage >= 80
              ? '🌟 Outstanding! You have mastered this course segment.'
              : percentage >= 50
              ? '👍 Good job! Review the explanations to seal key concepts.'
              : '💪 Keep practicing! Re-listen to the audio guide to boost retention.'}
          </p>
        </div>

        {/* Breakdown of answers */}
        <div className="space-y-3 text-left max-w-xl mx-auto">
          {quizQuestions.map((q, idx) => {
            const userAnswer = selectedAnswers[idx];
            const isCorrect = userAnswer === q.correctOptionIndex;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-1">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Your answer: <span className="font-bold text-slate-900">{q.options[userAnswer]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        Correct answer: {q.options[q.correctOptionIndex]}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-600 mt-1 italic leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestartQuiz}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          id="btn-retake-quiz"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Segment Quiz</span>
        </button>
      </div>
    );
  }

  const isAnswered = submittedQuestions[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestionIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            Interactive Knowledge Test
          </span>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h3>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-6 h-1.5 rounded-full transition-colors ${
                idx === currentQuestionIndex
                  ? 'bg-indigo-600'
                  : submittedQuestions[idx]
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Text */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
          {currentQuestion.question}
        </h4>

        {/* Options Grid */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrect = optIdx === currentQuestion.correctOptionIndex;

            let optionStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
              } else if (isSelected) {
                optionStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-bold';
              } else {
                optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-sm';
            }

            return (
              <button
                key={optIdx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all ${optionStyle}`}
                id={`quiz-option-${currentQuestionIndex}-${optIdx}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Box when Answered */}
      {isAnswered && (
        <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explanation & Learning Point</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {!isAnswered ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={selectedOption === undefined}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            id="btn-confirm-answer"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={
              currentQuestionIndex < totalQuestions - 1
                ? handleNextQuestion
                : calculateAndFinish
            }
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            id="btn-next-question"
          >
            <span>
              {currentQuestionIndex < totalQuestions - 1
                ? 'Next Question'
                : 'Finish & View Score'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

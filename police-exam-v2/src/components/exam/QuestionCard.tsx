import React from 'react';
import { useExamStore } from '@/stores/useExamStore';

const THAI_LETTERS = ['ก', 'ข', 'ค', 'ง'];

export const QuestionCard: React.FC = () => {
  const { questions, currentIndex, userAnswers, isReviewMode, selectAnswer } = useExamStore();
  
  if (!questions || questions.length === 0 || !questions[currentIndex]) {
    return <div className="text-center py-10 text-slate-500">ไม่มีข้อมูลข้อสอบ</div>;
  }

  const currentQ = questions[currentIndex];
  const selectedChoice = userAnswers[currentIndex];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      {/* Subject Badge & Number */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <span className="text-xs font-bold px-3 py-1 bg-red-50 text-[#BD1B0B] rounded-full border border-red-200">
          ข้อที่ {currentIndex + 1} จาก {questions.length} ข้อ
        </span>
        {currentQ.chapter && (
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {currentQ.chapter}
          </span>
        )}
      </div>

      {/* Question Text */}
      <h2 className="text-lg font-bold text-slate-800 leading-relaxed mb-6">
        {currentQ.questionText}
      </h2>

      {/* 4 Choices (ก, ข, ค, ง) */}
      <div className="space-y-3">
        {currentQ.choices.map((choiceText, idx) => {
          const isSelected = selectedChoice === idx;
          const isCorrect = idx === currentQ.correctAnswer;
          
          let btnStyle = "w-full text-left p-3.5 rounded-xl border font-medium transition-all flex items-center gap-3.5 ";
          let badgeStyle = "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ";

          if (isReviewMode) {
            if (isCorrect) {
              btnStyle += "bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-bold";
              badgeStyle += "bg-emerald-600 text-white";
            } else if (isSelected) {
              btnStyle += "bg-red-50 border-2 border-red-600 text-red-900 font-bold";
              badgeStyle += "bg-red-600 text-white";
            } else {
              btnStyle += "bg-white border-slate-200 text-slate-400 opacity-60";
              badgeStyle += "bg-slate-100 text-slate-400";
            }
          } else {
            if (isSelected) {
              btnStyle += "bg-red-50 border-2 border-[#BD1B0B] text-red-900 font-bold shadow-sm";
              badgeStyle += "bg-[#BD1B0B] text-white";
            } else {
              btnStyle += "bg-white border-slate-200 text-slate-700 hover:border-red-400 hover:bg-slate-50";
              badgeStyle += "bg-slate-100 text-slate-600";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isReviewMode}
              onClick={() => selectAnswer(idx)}
              className={btnStyle}
            >
              <div className={badgeStyle}>{THAI_LETTERS[idx]}</div>
              <span className="flex-1 text-[15px]">{choiceText}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Review Mode Only) */}
      {isReviewMode && currentQ.explanation && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <span>💡 คำอธิบายเฉลย:</span>
          </div>
          {currentQ.explanation}
          {currentQ.reference && (
            <div className="mt-2 text-xs text-amber-700 font-semibold">
              แหล่งอ้างอิง: {currentQ.reference}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

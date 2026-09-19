import { create } from 'zustand';
import { Question } from '@/types/exam';

interface ExamStore {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<number, number>; // { [qIdx]: choiceIdx (0-3) }
  isSubmitted: boolean;
  isReviewMode: boolean;
  remainingSeconds: number;
  totalSeconds: number;

  // Actions
  initExam: (questions: Question[], durationSeconds?: number) => void;
  selectAnswer: (choiceIdx: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitExam: () => void;
  startReview: () => void;
  decrementTimer: () => void;
  getScore: () => { score: number; total: number; percentage: number };
}

export const useExamStore = create<ExamStore>((set, get) => ({
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  isSubmitted: false,
  isReviewMode: false,
  remainingSeconds: 0,
  totalSeconds: 0,

  initExam: (questions, durationSeconds = 5400) => {
    let savedAnswers = {};
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('police_exam_active_session');
        if (local) savedAnswers = JSON.parse(local).userAnswers || {};
      } catch (e) {}
    }

    set({
      questions,
      currentIndex: 0,
      userAnswers: savedAnswers,
      isSubmitted: false,
      isReviewMode: false,
      remainingSeconds: durationSeconds,
      totalSeconds: durationSeconds,
    });
  },

  selectAnswer: (choiceIdx) => {
    const { currentIndex, userAnswers, isReviewMode } = get();
    if (isReviewMode) return; // ห้ามแก้ไขในโหมดตรวจเฉลย

    const updated = { ...userAnswers, [currentIndex]: choiceIdx };
    set({ userAnswers: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('police_exam_active_session', JSON.stringify({ userAnswers: updated }));
      } catch (e) {}
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  submitExam: () => {
    set({ isSubmitted: true });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('police_exam_active_session');
      } catch (e) {}
    }
  },

  startReview: () => {
    set({ isReviewMode: true, currentIndex: 0 });
  },

  decrementTimer: () => {
    const { remainingSeconds, isSubmitted, submitExam } = get();
    if (isSubmitted) return;

    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0 });
      submitExam(); // หมดเวลา ส่งข้อสอบอัตโนมัติ
    } else {
      set({ remainingSeconds: remainingSeconds - 1 });
    }
  },

  getScore: () => {
    const { questions, userAnswers } = get();
    const total = questions.length;
    let score = 0;

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return { score, total, percentage };
  }
}));

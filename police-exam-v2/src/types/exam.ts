export type SubjectKey = 
  | 'MATH_GENERAL'
  | 'THAI'
  | 'ENGLISH'
  | 'POLICE_LAW'
  | 'COMPUTER_SOC'
  | 'POLICE_RULES';

export type Track = 'PRABPRAM' | 'AMNUAYKAN' | 'GENERAL';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: number;
  subject: SubjectKey;
  chapter?: string;
  questionText: string;
  choices: string[];      // 4 choices ["ก", "ข", "ค", "ง"]
  correctAnswer: number;  // 0, 1, 2, 3 (0=ก, 1=ข, 2=ค, 3=ง)
  explanation?: string;
  reference?: string;
  difficulty?: Difficulty;
}

export interface ExamSet {
  id: number;
  title: string;
  subjectKey: SubjectKey;
  chapter?: string;
  track: Track;
  totalCount: number;
  questions?: Question[];
}

export interface ExamSessionState {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<number, number>; // { [questionIdx]: choiceIdx (0-3) }
  isSubmitted: boolean;
  isReviewMode: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

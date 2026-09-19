"use client";

import React from "react";
import {
  Calculator,
  BookOpen,
  Languages,
  Scale,
  Laptop,
  FileText,
} from "lucide-react";

export interface SubjectItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  questionCount: number;
  bgLight: string;
  textColor: string;
  borderColor: string;
}

const SUBJECTS: SubjectItem[] = [
  {
    id: "math",
    title: "ความสามารถทั่วไป",
    subtitle: "คณิตศาสตร์ • อนุกรม • ตรรกะ",
    icon: <Calculator className="w-6 h-6" />,
    questionCount: 500,
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "hover:border-blue-300",
  },
  {
    id: "thai",
    title: "ภาษาไทย",
    subtitle: "หลักภาษา • การอ่านจับใจความ",
    icon: <BookOpen className="w-6 h-6" />,
    questionCount: 420,
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "hover:border-emerald-300",
  },
  {
    id: "english",
    title: "ภาษาอังกฤษ",
    subtitle: "Grammar • Vocab • Conversation",
    icon: <Languages className="w-6 h-6" />,
    questionCount: 450,
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "hover:border-amber-300",
  },
  {
    id: "law",
    title: "กฎหมายประชาชน",
    subtitle: "พ.ร.บ.ตำรวจ • อาญา • วิ.อาญา",
    icon: <Scale className="w-6 h-6" />,
    questionCount: 480,
    bgLight: "bg-rose-50",
    textColor: "text-police-800",
    borderColor: "hover:border-rose-300",
  },
  {
    id: "computer",
    title: "คอมพิวเตอร์ & สังคม",
    subtitle: "สารสนเทศ • อาเซียน • วัฒนธรรม",
    icon: <Laptop className="w-6 h-6" />,
    questionCount: 380,
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "hover:border-purple-300",
  },
  {
    id: "secretariat",
    title: "งานสารบรรณ",
    subtitle: "ระเบียบสำนักนายกฯ • ลักษณะ ๕๔",
    icon: <FileText className="w-6 h-6" />,
    questionCount: 220,
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "hover:border-cyan-300",
  },
];

interface SubjectGridProps {
  onSelectSubject?: (subjectId: string) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({ onSelectSubject }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          คลังข้อสอบ 6 หมวดวิชา
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          เลือกทำรายวิชา
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {SUBJECTS.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onSelectSubject?.(sub.id)}
            className={`bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col items-start justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${sub.borderColor} group touch-manipulation`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${sub.bgLight} ${sub.textColor}`}
            >
              {sub.icon}
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-police-800 transition-colors leading-snug mb-1">
                {sub.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">
                {sub.subtitle}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>{sub.questionCount}+ ข้อ</span>
              <span className="text-police-800 group-hover:underline">ฝึกทำ →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

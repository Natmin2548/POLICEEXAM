import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExamSet {
  id: number;
  questions: number;
  time: number;
  score?: number;
  total?: number;
}

interface Chapter {
  id: number;
  title: string;
  questions: number;
  completed: boolean;
  score?: number;
  examSets: ExamSet[];
}

interface Subject {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  lessons: number;
  totalQuestions: number;
  bg: string;
  accent: string;
  chapters: Chapter[];
  stats: { highScore: number; attempts: number; avgScore: number; mastery: string };
}

// ─── Data ────────────────────────────────────────────────────────────────────

const subjects: Subject[] = [
  {
    id: "sarabun",
    title: "งานสารบรรณ",
    subtitle: "ระเบียบสำนักนายกฯ ๒๕๒๖",
    emoji: "📄",
    lessons: 12,
    totalQuestions: 420,
    bg: "#EFF6FF",
    accent: "#2563EB",
    stats: { highScore: 92, attempts: 18, avgScore: 78, mastery: "ดีมาก" },
    chapters: [
      { id: 1, title: "การรับ-ส่งหนังสือ", questions: 45, completed: true, score: 88, examSets: [ { id: 1, questions: 25, time: 30, score: 22, total: 25 }, { id: 2, questions: 25, time: 30, score: 20, total: 25 }, { id: 3, questions: 50, time: 60, score: 43, total: 50 } ] },
      { id: 2, title: "การเก็บรักษาหนังสือ", questions: 38, completed: true, score: 76, examSets: [ { id: 1, questions: 25, time: 30, score: 18, total: 25 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
      { id: 3, title: "การทำลายหนังสือ", questions: 32, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 4, title: "ชนิดของหนังสือราชการ", questions: 50, completed: true, score: 92, examSets: [ { id: 1, questions: 25, time: 30, score: 24, total: 25 }, { id: 2, questions: 25, time: 30, score: 23, total: 25 }, { id: 3, questions: 50, time: 60, score: 47, total: 50 }, { id: 4, questions: 50, time: 60 } ] },
      { id: 5, title: "ชั้นความเร็วและชั้นความลับ", questions: 28, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 6, title: "มาตรฐานตราครุฑและตราสาร", questions: 40, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
    ],
  },
  {
    id: "general",
    title: "ความสามารถทั่วไป",
    subtitle: "อนุกรม ร้อยละ ตรรกศาสตร์ & คำนวณ",
    emoji: "🧮",
    lessons: 8,
    totalQuestions: 310,
    bg: "#F0FDF4",
    accent: "#16A34A",
    stats: { highScore: 80, attempts: 12, avgScore: 65, mastery: "พอใช้" },
    chapters: [
      { id: 1, title: "อนุกรมและความสัมพันธ์", questions: 55, completed: true, score: 80, examSets: [ { id: 1, questions: 25, time: 30, score: 20, total: 25 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60, score: 40, total: 50 } ] },
      { id: 2, title: "ร้อยละและสัดส่วน", questions: 48, completed: true, score: 72, examSets: [ { id: 1, questions: 25, time: 30, score: 17, total: 25 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 3, title: "ตรรกศาสตร์", questions: 40, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
      { id: 4, title: "การคำนวณพื้นฐาน", questions: 35, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
    ],
  },
  {
    id: "society",
    title: "สังคมและวัฒนธรรม",
    subtitle: "AEC ศาสนา และเหตุการณ์ปัจจุบัน",
    emoji: "🌏",
    lessons: 6,
    totalQuestions: 220,
    bg: "#FFF7ED",
    accent: "#EA580C",
    stats: { highScore: 74, attempts: 8, avgScore: 62, mastery: "พอใช้" },
    chapters: [
      { id: 1, title: "ประชาคมอาเซียน (AEC)", questions: 42, completed: true, score: 74, examSets: [ { id: 1, questions: 25, time: 30, score: 18, total: 25 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 2, title: "ศาสนาและประเพณีไทย", questions: 38, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 3, title: "เหตุการณ์ปัจจุบัน", questions: 50, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 50, time: 60 } ] },
    ],
  },
  {
    id: "law",
    title: "กฎหมายที่ควรรู้",
    subtitle: "พ.ร.บ.ตำรวจ และ ป.วิ.อาญา",
    emoji: "⚖️",
    lessons: 15,
    totalQuestions: 580,
    bg: "#FAF5FF",
    accent: "#7C3AED",
    stats: { highScore: 88, attempts: 22, avgScore: 75, mastery: "ดีมาก" },
    chapters: [
      { id: 1, title: "พ.ร.บ.ตำรวจแห่งชาติ ๒๕๖๕", questions: 60, completed: true, score: 88, examSets: [ { id: 1, questions: 25, time: 30, score: 22, total: 25 }, { id: 2, questions: 25, time: 30, score: 21, total: 25 }, { id: 3, questions: 50, time: 60, score: 44, total: 50 } ] },
      { id: 2, title: "ประมวลกฎหมายวิธีพิจารณาความอาญา", questions: 75, completed: true, score: 82, examSets: [ { id: 1, questions: 25, time: 30, score: 20, total: 25 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60, score: 41, total: 50 }, { id: 4, questions: 50, time: 60 } ] },
      { id: 3, title: "กฎหมายอาญา หมวดหลัก", questions: 55, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
      { id: 4, title: "สิทธิผู้ต้องหาและผู้เสียหาย", questions: 40, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
    ],
  },
  {
    id: "tech",
    title: "เทคโนโลยีสารสนเทศ",
    subtitle: "พ.ร.บ.คอมฯ และความรู้ไซเบอร์",
    emoji: "💻",
    lessons: 9,
    totalQuestions: 290,
    bg: "#F0FDFA",
    accent: "#0891B2",
    stats: { highScore: 66, attempts: 6, avgScore: 55, mastery: "ปรับปรุง" },
    chapters: [
      { id: 1, title: "พ.ร.บ.คอมพิวเตอร์ ๒๕๕๐/๒๕๖๐", questions: 48, completed: true, score: 66, examSets: [ { id: 1, questions: 25, time: 30, score: 16, total: 25 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
      { id: 2, title: "ความมั่นคงปลอดภัยไซเบอร์", questions: 40, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 3, title: "ระบบสารสนเทศขององค์กร", questions: 35, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 50, time: 60 } ] },
    ],
  },
  {
    id: "rule54",
    title: "ลักษณะที่ ๕๔",
    subtitle: "ระเบียบสารบรรณตำรวจ ๒๕๕๖",
    emoji: "📋",
    lessons: 10,
    totalQuestions: 350,
    bg: "#FFF1F2",
    accent: "#E11D48",
    stats: { highScore: 85, attempts: 14, avgScore: 70, mastery: "ดีมาก" },
    chapters: [
      { id: 1, title: "โครงสร้างและหลักการสารบรรณ", questions: 45, completed: true, score: 85, examSets: [ { id: 1, questions: 25, time: 30, score: 21, total: 25 }, { id: 2, questions: 25, time: 30, score: 22, total: 25 }, { id: 3, questions: 50, time: 60, score: 43, total: 50 } ] },
      { id: 2, title: "หนังสือตำรวจภายใน-ภายนอก", questions: 50, completed: true, score: 78, examSets: [ { id: 1, questions: 25, time: 30, score: 19, total: 25 }, { id: 2, questions: 25, time: 30 }, { id: 3, questions: 50, time: 60 } ] },
      { id: 3, title: "ทะเบียนรับ-ส่งตำรวจ", questions: 38, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 25, time: 30 } ] },
      { id: 4, title: "แฟ้มสะสมผลงานตำรวจ", questions: 32, completed: false, examSets: [ { id: 1, questions: 25, time: 30 }, { id: 2, questions: 50, time: 60 } ] },
    ],
  },
];

const masteryColors: Record<string, { color: string; bg: string }> = {
  ดีมาก: { color: "#16A34A", bg: "#F0FDF4" },
  พอใช้: { color: "#D97706", bg: "#FFFBEB" },
  ปรับปรุง: { color: "#BD1B0B", bg: "#FDF2F1" },
};

// ─── Shared Icons ─────────────────────────────────────────────────────────────

function ChevronRight({ color = "#CBD5E1", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ChevronLeft({ color = "#0F172A", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon({ color = "#94A3B8" }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Step 0: Subject Grid ─────────────────────────────────────────────────────

function SubjectGrid({ subjects, onSelect, search, setSearch }: {
  subjects: Subject[];
  onSelect: (s: Subject) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const filtered = subjects.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Hero Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#FDF2F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #FBCFCB",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              <path d="M9 7h7M9 11h7M9 15h4" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
              คลังข้อสอบนายสิบตำรวจ
            </h1>
            <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
              เลือกหมวดวิชาเพื่อเริ่มฝึกฝนข้อสอบจริง
            </p>
          </div>
          <span
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              padding: "4px 12px",
              background: "#FDF2F1",
              border: "1px solid #FBCFCB",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: "#BD1B0B",
            }}
          >
            6 หมวดวิชาหลัก
          </span>
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            padding: "0 16px",
            height: 44,
          }}
        >
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาวิชา หรือหัวข้อ..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#0F172A",
              background: "transparent",
              fontFamily: "Kanit, sans-serif",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {filtered.map((subj) => (
          <button
            key={subj.id}
            onClick={() => onSelect(subj)}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 20,
              padding: "18px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.07)";
              el.style.borderColor = "#CBD5E1";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "#E2E8F0";
            }}
          >
            {/* Accent corner */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 48, height: 48, borderRadius: "0 20px 0 48px", background: subj.bg, opacity: 0.8 }} />

            {/* Emoji icon */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: subj.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {subj.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.3, marginBottom: 4, fontFamily: "Kanit" }}>{subj.title}</p>
              <p style={{ fontSize: 11.5, color: "#94A3B8", lineHeight: 1.4, fontFamily: "Kanit" }}>{subj.subtitle}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  background: subj.bg,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  color: subj.accent,
                }}
              >
                <DocIcon />
                {subj.lessons} บทเรียน
              </span>
              <span style={{ fontSize: 12, color: subj.accent, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                เริ่มฝึกฝน
                <ChevronRight color={subj.accent} size={13} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#CBD5E1" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p style={{ fontSize: 14, fontWeight: 500 }}>ไม่พบวิชาที่ค้นหา</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>ลองค้นหาด้วยคำอื่น</p>
        </div>
      )}
    </>
  );
}

// ─── Step 1: Chapter View ──────────────────────────────────────────────────────

function ChapterView({ subject, onBack, onSelectChapter }: {
  subject: Subject;
  onBack: () => void;
  onSelectChapter: (ch: Chapter) => void;
}) {
  const [activeTab, setActiveTab] = useState<"chapters" | "stats">("chapters");
  const completedCount = subject.chapters.filter((c) => c.completed).length;

  const m = masteryColors[subject.stats.mastery] || masteryColors["พอใช้"];

  return (
    <>
      {/* Back nav */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          color: "#64748B",
          marginBottom: 16,
          padding: 0,
          fontFamily: "Kanit, sans-serif",
        }}
      >
        <ChevronLeft />
        เลือกวิชาอื่น
      </button>

      {/* Subject summary banner */}
      <div
        style={{
          background: subject.bg,
          border: `1px solid ${subject.accent}22`,
          borderRadius: 20,
          padding: "20px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}
        >
          {subject.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{subject.title}</h2>
          <p style={{ fontSize: 12, color: "#64748B" }}>{subject.subtitle}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: subject.accent, background: "#fff", borderRadius: 20, padding: "2px 10px", border: `1px solid ${subject.accent}33` }}>
              {subject.lessons} บทเรียน
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#64748B" }}>
              ✓ {completedCount}/{subject.chapters.length} บท
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#64748B" }}>
              {subject.totalQuestions} ข้อ
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: 4,
          marginBottom: 16,
          gap: 4,
        }}
      >
        {[
          { id: "chapters" as const, label: "บทเรียน" },
          { id: "stats" as const, label: "สถิติรายวิชา" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 11,
              border: "none",
              background: activeTab === tab.id ? "#fff" : "transparent",
              boxShadow: activeTab === tab.id ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
              fontSize: 13.5,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "#0F172A" : "#94A3B8",
              cursor: "pointer",
              fontFamily: "Kanit, sans-serif",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chapters" ? (
        /* Chapter list */
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {subject.chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch)}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "border-color 0.15s, box-shadow 0.15s",
                fontFamily: "Kanit, sans-serif",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#CBD5E1";
                el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E2E8F0";
                el.style.boxShadow = "none";
              }}
            >
              {/* Chapter number */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: ch.completed ? "#F0FDF4" : "#F8FAFC",
                  border: `1px solid ${ch.completed ? "#BBF7D0" : "#E2E8F0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: ch.completed ? "#16A34A" : "#94A3B8",
                  flexShrink: 0,
                }}
              >
                {ch.id < 10 ? `0${ch.id}` : ch.id}
              </div>

              {/* Chapter info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", lineHeight: 1.3, marginBottom: 4 }}>
                  บทที่ {ch.id} {ch.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    {ch.questions} ข้อ
                  </span>
                  {ch.completed && ch.score !== undefined && (
                    <>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#E2E8F0", display: "inline-block" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: ch.score >= 80 ? "#16A34A" : ch.score >= 60 ? "#D97706" : "#BD1B0B" }}>
                        {ch.score}%
                      </span>
                    </>
                  )}
                  {!ch.completed && (
                    <>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#E2E8F0", display: "inline-block" }} />
                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>ยังไม่ได้ทำ</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {ch.completed && <CheckCircle />}
                <ChevronRight size={15} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Stats view */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            {
              label: "คะแนนสูงสุด",
              value: `${subject.stats.highScore}`,
              unit: "/100",
              color: "#16A34A",
              bg: "#F0FDF4",
              icon: "🏆",
            },
            {
              label: "จำนวนครั้งที่ทำ",
              value: `${subject.stats.attempts}`,
              unit: "ครั้ง",
              color: "#2563EB",
              bg: "#EFF6FF",
              icon: "📝",
            },
            {
              label: "คะแนนเฉลี่ย",
              value: `${subject.stats.avgScore}`,
              unit: "%",
              color: "#D97706",
              bg: "#FFFBEB",
              icon: "📊",
            },
            {
              label: "ระดับความชำนาญ",
              value: subject.stats.mastery,
              unit: "",
              color: m.color,
              bg: m.bg,
              icon: "⭐",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 18,
                padding: "18px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8" }}>{stat.label}</span>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{stat.icon}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                {stat.unit && <span style={{ fontSize: 13, color: "#94A3B8" }}>{stat.unit}</span>}
              </div>
              {/* Progress bar for score stats */}
              {(stat.label === "คะแนนสูงสุด" || stat.label === "คะแนนเฉลี่ย") && (
                <div style={{ marginTop: 10, height: 4, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${stat.value}%`,
                      background: stat.color,
                      borderRadius: 4,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Step 2: Exam Sets ─────────────────────────────────────────────────────────

function ExamSetList({ subject, chapter, onBack }: {
  subject: Subject;
  chapter: Chapter;
  onBack: () => void;
}) {
  const [startingSet, setStartingSet] = useState<number | null>(null);

  return (
    <>
      {/* Back nav */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          color: "#64748B",
          marginBottom: 16,
          padding: 0,
          fontFamily: "Kanit, sans-serif",
        }}
      >
        <ChevronLeft />
        กลับไปเลือกหมวด
      </button>

      {/* Chapter banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: 20,
          padding: "20px 22px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: subject.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {subject.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>{subject.title}</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
            บทที่ {chapter.id} {chapter.title}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              <DocIcon />
              {chapter.questions} ข้อทั้งหมด
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {chapter.examSets.length} ชุดข้อสอบ
            </span>
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>ชุดข้อสอบพร้อมสอบ</h3>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>
          {chapter.examSets.filter((s) => s.score !== undefined).length}/{chapter.examSets.length} ชุด
        </span>
      </div>

      {/* Exam set cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {chapter.examSets.map((set) => {
          const done = set.score !== undefined && set.total !== undefined;
          const pct = done ? Math.round((set.score! / set.total!) * 100) : null;
          const isStarting = startingSet === set.id;

          return (
            <div
              key={set.id}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 18,
                padding: "18px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              {/* Set number badge */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: done ? "#FDF2F1" : "#F8FAFC",
                  border: `1px solid ${done ? "#FBCFCB" : "#E2E8F0"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 500, color: "#94A3B8", lineHeight: 1 }}>ชุดที่</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: done ? "#BD1B0B" : "#94A3B8", lineHeight: 1.2 }}>{set.id}</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#0F172A" }}>
                    <DocIcon />
                    {set.questions} ข้อ
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#E2E8F0", display: "inline-block" }} />
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
                    <ClockIcon />
                    {set.time} นาที
                  </span>
                </div>

                {done ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        padding: "2px 10px",
                        background: pct! >= 80 ? "#F0FDF4" : pct! >= 60 ? "#FFFBEB" : "#FDF2F1",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        color: pct! >= 80 ? "#16A34A" : pct! >= 60 ? "#D97706" : "#BD1B0B",
                      }}
                    >
                      ได้ {set.score}/{set.total}
                    </span>
                    <div style={{ flex: 1, height: 4, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: pct! >= 80 ? "#16A34A" : pct! >= 60 ? "#F59E0B" : "#BD1B0B",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", flexShrink: 0 }}>{pct}%</span>
                  </div>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 10px",
                      background: "#F8FAFC",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#94A3B8",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    ยังไม่เคยทำ
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => setStartingSet(set.id)}
                style={{
                  flexShrink: 0,
                  padding: isStarting ? "9px 14px" : "9px 16px",
                  background: "#BD1B0B",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Kanit, sans-serif",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  opacity: isStarting ? 0.75 : 1,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#9A1509"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#BD1B0B"; }}
              >
                {isStarting ? "กำลังโหลด..." : done ? "ทำอีกครั้ง" : "เริ่มทำชุดนี้"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stars rating */}
      <div
        style={{
          marginTop: 16,
          background: "#FFFBEB",
          border: "1px solid #FEF3C7",
          borderRadius: 16,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>
          ทำให้ครบทุกชุดเพื่อปลดล็อกสถิติและ AI วิเคราะห์จุดอ่อน
        </p>
      </div>
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function QuestionBank() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [search, setSearch] = useState("");

  const handleSelectSubject = (s: Subject) => {
    setSelectedSubject(s);
    setStep(1);
    setSearch("");
  };

  const handleSelectChapter = (ch: Chapter) => {
    setSelectedChapter(ch);
    setStep(2);
  };

  const handleBackToSubjects = () => {
    setStep(0);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const handleBackToChapters = () => {
    setStep(1);
    setSelectedChapter(null);
  };

  return (
    <>
      {step === 0 && (
        <SubjectGrid
          subjects={subjects}
          onSelect={handleSelectSubject}
          search={search}
          setSearch={setSearch}
        />
      )}
      {step === 1 && selectedSubject && (
        <ChapterView
          subject={selectedSubject}
          onBack={handleBackToSubjects}
          onSelectChapter={handleSelectChapter}
        />
      )}
      {step === 2 && selectedSubject && selectedChapter && (
        <ExamSetList
          subject={selectedSubject}
          chapter={selectedChapter}
          onBack={handleBackToChapters}
        />
      )}
    </>
  );
}

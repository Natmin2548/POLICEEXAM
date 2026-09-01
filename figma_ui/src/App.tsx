import { useState, useEffect } from "react";
import QuestionBank from "./QuestionBank";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const radarData = [
  { subject: "สารบรรณ", A: 88 },
  { subject: "คำนวณ", A: 78 },
  { subject: "สังคม", A: 74 },
  { subject: "กฎหมาย", A: 85 },
  { subject: "ไอที/คอม", A: 70 },
  { subject: "ลักษณะ๕๔", A: 82 },
];

const barData = [
  { subject: "สารบรรณ", score: 88, status: "ดีมาก" },
  { subject: "คำนวณ", score: 78, status: "พอใช้" },
  { subject: "สังคม", score: 74, status: "พอใช้" },
  { subject: "กฎหมาย", score: 85, status: "ดีมาก" },
  { subject: "ไอที/คอม", score: 70, status: "พอใช้" },
  { subject: "ลักษณะ๕๔", score: 82, status: "ดีมาก" },
];

const lineData = [
  { week: "W1", score: 62 },
  { week: "W2", score: 65 },
  { week: "W3", score: 70 },
  { week: "W4", score: 68 },
  { week: "W5", score: 75 },
  { week: "W6", score: 80 },
  { week: "W7", score: 78 },
  { week: "W8", score: 84 },
];

const statusColors: Record<string, string> = {
  ดีมาก: "#16A34A",
  พอใช้: "#D97706",
  ปรับปรุง: "#BD1B0B",
};

const navItems = [
  { id: "home", label: "หน้าหลัก", icon: HomeIcon },
  { id: "bank", label: "คลังข้อสอบ", icon: BankIcon },
  { id: "battle", label: "แบทเทิล", icon: BattleIcon },
  { id: "community", label: "ชุมชน", icon: CommunityIcon },
  { id: "profile", label: "โปรไฟล์", icon: ProfileIcon },
];

const tracks = [
  { id: "prabpram", label: "ปราบปราม", icon: "🛡️", desc: "ตำรวจสายปฏิบัติการ ปราบปรามอาชญากรรม (150 ข้อ)" },
  { id: "amnuay", label: "อำนวยการ", icon: "📋", desc: "ตำรวจสายอำนวยการและสนับสนุน (150 ข้อ)" },
  { id: "tm", label: "ตม.", icon: "✈️", desc: "ตรวจคนเข้าเมือง เน้นภาษาอังกฤษและระเบียบ (150 ข้อ)" },
];

const actionCards = [
  {
    id: "compress",
    label: "บีบอัดรูป",
    sublabel: "ลดขนาดไฟล์สมัครสอบตำรวจ",
    icon: CompressIcon,
    bg: "#F0FDF4",
    accent: "#16A34A",
  },
  {
    id: "bank",
    label: "คลังข้อสอบ",
    sublabel: "6 หมวดวิชาพร้อมบทเรียน",
    icon: LibraryIcon,
    bg: "#EFF6FF",
    accent: "#2563EB",
  },
  {
    id: "battle",
    label: "แบทเทิล",
    sublabel: "ดวลข้อสอบ 1v1 & อันดับ",
    icon: SwordsIcon,
    bg: "#FFF7ED",
    accent: "#EA580C",
  },
  {
    id: "vocab",
    label: "คลังคำศัพท์",
    sublabel: "Flashcards อังกฤษ-ตำรวจ",
    icon: VocabIcon,
    bg: "#FAF5FF",
    accent: "#7C3AED",
  },
];

// Sample vocab cards
const sampleVocabs = [
  { word: "Investigation", pos: "n.", meaning: "การสืบสวน, การไต่สวนข้อเท็จจริง" },
  { word: "Suspect", pos: "n.", meaning: "ผู้ต้องสงสัย" },
  { word: "Evidence", pos: "n.", meaning: "พยานหลักฐาน" },
  { word: "Witness", pos: "n.", meaning: "พยานบุคคลที่เห็นเหตุการณ์" },
  { word: "Jurisdiction", pos: "n.", meaning: "เขตอำนาจศาล หรืออำนาจตามกฎหมาย" },
  { word: "Interrogation", pos: "n.", meaning: "การสอบปากคำ, การซักถาม" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function HomeIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BankIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

function BattleIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6 2 2-6 6-2-2z" />
      <path d="M3 21l7-7" />
      <path d="M21 3l-3 3" />
    </svg>
  );
}

function CommunityIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M2 20c0-3.3 3.1-6 7-6 1.5 0 2.9.4 4 1.1" />
      <path d="M15 19c0-2.2 2.1-4 4.5-4S24 16.8 24 19" />
    </svg>
  );
}

function ProfileIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#BD1B0B" stroke="#BD1B0B" strokeWidth="0">
      <path d="M12 2L3 6v6c0 5.3 3.9 10.2 9 11.4C17.1 22.2 21 17.3 21 12V6L12 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
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

function CompressIcon({ size = 24, color = "#16A34A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v4M3 9h4M15 3v4M21 9h-4M9 21v-4M3 15h4M15 21v-4M21 15h-4" />
    </svg>
  );
}

function LibraryIcon({ size = 24, color = "#2563EB" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M9 7h7M9 11h7M9 15h4" />
    </svg>
  );
}

function SwordsIcon({ size = 24, color = "#EA580C" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="22" x2="22" y2="16" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function VocabIcon({ size = 24, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-4.4 0-8 2.2-8 5s3.6 5 8 5 8-2.2 8-5-3.6-5-8-5z" />
      <path d="M4 8v5c0 2.8 3.6 5 8 5s8-2.2 8-5V8" />
      <path d="M4 13v5c0 2.8 3.6 5 8 5s8-2.2 8-5v-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BD1B0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5c-1.2-2-4-2-5 0-2 .5-3 2.5-2 4-1.5.5-2 2-1.5 3.5C2.5 14 4 15 5.5 15c.5 1.5 2 2 3 1.5C9.5 18 11 18.5 12 18" />
      <path d="M12 5c1.2-2 4-2 5 0 2 .5 3 2.5 2 4 1.5.5 2 2 1.5 3.5C21.5 14 20 15 18.5 15c-.5 1.5-2 2-3 1.5C14.5 18 13 18.5 12 18" />
      <line x1="12" y1="5" x2="12" y2="18" />
    </svg>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ fontFamily: "Kanit", fontSize: 13, color: "#64748B", marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: "Kanit", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>{payload[0].value} คะแนน</p>
      </div>
    );
  }
  return null;
}

function CustomLineTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ fontFamily: "Kanit", fontSize: 13, color: "#64748B", marginBottom: 2 }}>สัปดาห์ {label}</p>
        <p style={{ fontFamily: "Kanit", fontSize: 16, fontWeight: 600, color: "#BD1B0B" }}>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
}

// ─── Track Selection Modal ───────────────────────────────────────────────────

function TrackModal({ onClose, onStartTrack }: { onClose: () => void; onStartTrack: (track: string) => void }) {
  const [selected, setSelected] = useState<string>("prabpram");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>เลือกสายการสอบ</h3>
            <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>เลือกสายที่คุณต้องการทำข้อสอบเพื่อรักษา Streak</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                border: `1.5px solid ${selected === t.id ? "#BD1B0B" : "#F1F5F9"}`,
                borderRadius: 16,
                background: selected === t.id ? "#FDF2F1" : "#fff",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 28 }}>{t.icon}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", fontFamily: "Kanit" }}>{t.label}</p>
                <p style={{ fontSize: 12, color: "#64748B", fontFamily: "Kanit", marginTop: 2 }}>{t.desc}</p>
              </div>
              {selected === t.id && (
                <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#BD1B0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            marginTop: 20,
            padding: "14px 0",
            borderRadius: 14,
            background: "#BD1B0B",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "Kanit",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(189,27,11,0.25)",
            transition: "all 0.2s ease",
          }}
          onClick={() => { onStartTrack(selected); }}
        >
          เริ่มทำข้อสอบสาย {tracks.find((t) => t.id === selected)?.label}
        </button>
      </div>
    </div>
  );
}

// ─── Image Compressor Modal ──────────────────────────────────────────────────

function CompressorModal({ onClose }: { onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setCompressedSize(`~${Math.round(file.size / 1024 * (quality / 100))} KB (ต้นฉบับ ${Math.round(file.size / 1024)} KB)`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "24px",
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CompressIcon size={20} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>บีบอัดรูปถ่ายสมัครสอบ</h3>
              <p style={{ fontSize: 12, color: "#94A3B8" }}>ปรับขนาดไฟล์ให้อยู่ในเกณฑ์ 50-100 KB</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><CloseIcon /></button>
        </div>

        <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: "24px 16px", textAlign: "center", background: "#F8FAFC", marginBottom: 16 }}>
          {preview ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <img src={preview} alt="Preview" style={{ maxWidth: 140, maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid #E2E8F0" }} />
              <p style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>{compressedSize}</p>
            </div>
          ) : (
            <label style={{ cursor: "pointer", display: "block" }}>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📷</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", display: "block" }}>คลิกเพื่อเลือกรูปถ่ายหน้าตรง</span>
              <span style={{ fontSize: 12, color: "#94A3B8", display: "block", marginTop: 4 }}>รองรับ JPG, PNG, WEBP</span>
            </label>
          )}
        </div>

        {selectedFile && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", marginBottom: 6 }}>
              <span>คุณภาพการบีบอัด:</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#16A34A" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 600, cursor: "pointer", fontFamily: "Kanit" }}>ปิด</button>
          {selectedFile && (
            <button
              onClick={() => {
                alert("ดาวน์โหลดรูปภาพที่บีบอัดเรียบร้อยแล้ว!");
                onClose();
              }}
              style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "#16A34A", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "Kanit" }}
            >
              ดาวน์โหลดรูป (บีบอัดแล้ว)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vocab Flashcard Modal ───────────────────────────────────────────────────

function VocabModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = sampleVocabs[index];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>📖</span>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Flashcard คำศัพท์ตำรวจ</h3>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#7C3AED", background: "#FAF5FF", padding: "3px 10px", borderRadius: 20 }}>{index + 1}/{sampleVocabs.length}</span>
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            minHeight: 180,
            background: flipped ? "#FAF5FF" : "#F8FAFC",
            border: `1.5px solid ${flipped ? "#C084FC" : "#E2E8F0"}`,
            borderRadius: 20,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textAlign: "center",
            marginBottom: 20,
            transition: "all 0.2s ease",
          }}
        >
          {!flipped ? (
            <>
              <span style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{current.pos}</span>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0" }}>{current.word}</h2>
              <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500 }}>💡 แตะเพื่อดูคำแปลภาษาไทย</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600, marginBottom: 6 }}>ความหมาย</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#581C87", margin: "0 0 8px 0" }}>{current.meaning}</h3>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>({current.word} - {current.pos})</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setFlipped(false); setIndex((prev) => (prev > 0 ? prev - 1 : sampleVocabs.length - 1)); }}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 700, cursor: "pointer", fontFamily: "Kanit" }}
          >
            ‹ คำก่อนหน้า
          </button>
          <button
            onClick={() => { setFlipped(false); setIndex((prev) => (prev < sampleVocabs.length - 1 ? prev + 1 : 0)); }}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "Kanit" }}
          >
            คำถัดไป ›
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────

function ProfileModal({ user, onClose, onLogout }: { user: any; onClose: () => void; onLogout: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #BD1B0B 0%, #7A1107 100%)",
            color: "#fff",
            fontSize: 26,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 20px rgba(189,27,11,0.25)",
          }}
        >
          {user?.fullName ? user.fullName.charAt(0) : "ส"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>{user?.fullName || "สมชาย ใจดี"}</h3>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 16px 0" }}>{user?.email || "somchai@policeexam.com"}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#F8FAFC", borderRadius: 16, padding: "14px", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, color: "#94A3B8", display: "block" }}>Streak สะสม</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#BD1B0B" }}>{user?.streakCount || 0} วัน 🔥</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#94A3B8", display: "block" }}>สถานะบัญชี</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>{user?.role || "ผู้ใช้งานทั่วไป"}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "1px solid #FEE2E2",
            background: "#FEF2F2",
            color: "#BD1B0B",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Kanit",
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showCompressor, setShowCompressor] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("userProfile");
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    window.location.replace("/index.html");
  };

  const handleActionClick = (cardId: string) => {
    if (cardId === "bank") {
      setActiveNav("bank");
    } else if (cardId === "compress") {
      setShowCompressor(true);
    } else if (cardId === "vocab") {
      setShowVocab(true);
    } else if (cardId === "battle") {
      alert("โหมดแบทเทิลกำลังปรับปรุงระบบให้ดียิ่งขึ้น จะเปิดให้ใช้งานเร็วๆ นี้ครับ!");
    }
  };

  const handleStartTrack = (trackId: string) => {
    setShowTrackModal(false);
    setActiveNav("bank");
  };

  return (
    <div style={{ fontFamily: "Kanit, sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Top Nav ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #F1F5F9",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => setActiveNav("home")}
          style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer" }}
        >
          <ShieldIcon />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F172A" }}>POLICE</span>
          <span style={{ fontSize: 16, fontWeight: 400, color: "#BD1B0B" }}>EXAM</span>
        </div>

        {/* Search pill */}
        <div style={{ flex: 1, position: "relative", maxWidth: 480, margin: "0 auto" }}>
          <div
            onClick={() => setActiveNav("bank")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 50,
              padding: "0 16px",
              height: 38,
              cursor: "pointer",
            }}
          >
            <SearchIcon />
            <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 400 }}>ค้นหาข้อสอบ วิชา หรือหมวดหมู่...</span>
          </div>
        </div>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Admin badge */}
          {(user?.role === "ADMIN" || user?.role === "OWNER" || true) && (
            <a
              href="/home/admin.html"
              style={{
                textDecoration: "none",
                padding: "4px 12px",
                background: "#FDF2F1",
                border: "1px solid #FBCFCB",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                color: "#BD1B0B",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              ADMIN
            </a>
          )}

          {/* Bell */}
          <div
            onClick={() => alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้")}
            style={{ position: "relative", cursor: "pointer", padding: 4 }}
          >
            <BellIcon />
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#BD1B0B",
                border: "1.5px solid #fff",
              }}
            />
          </div>

          {/* Avatar */}
          <div
            onClick={() => setShowProfile(true)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #BD1B0B 0%, #7A1107 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {user?.fullName ? user.fullName.charAt(0) : "ส"}
          </div>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <main
        style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", maxWidth: 900, width: "100%", margin: "0 auto" }}
      >
        {activeNav === "bank" ? (
          <QuestionBank />
        ) : (
          <>
            {/* ── Streak Banner ── */}
            <div
              style={{
                background: "linear-gradient(135deg, #BD1B0B 0%, #8B0F06 60%, #6B0A04 100%)",
                borderRadius: 24,
                padding: "26px 26px 22px",
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px -5px rgba(189, 27, 11, 0.35)",
              }}
            >
              {/* Decorative background circles */}
              <div style={{ position: "absolute", top: -40, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -30, right: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>🔥</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
                      Daily Challenge
                    </p>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.25, margin: 0 }}>
                      {user?.streakCount || 0} วันติดต่อกัน!
                    </h2>
                    <p style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.85)", marginTop: 4, margin: "4px 0 0 0" }}>
                      ทำข้อสอบวันนี้เพื่อรักษา Streak และพัฒนาความแม่นยำของคุณ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowTrackModal(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    color: "#BD1B0B",
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: "Kanit",
                    border: "none",
                    borderRadius: 50,
                    padding: "10px 22px",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <span>⚡</span>
                  เริ่มทำข้อสอบทันที
                </button>
              </div>
            </div>

            {/* ── Action Grid ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {actionCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleActionClick(card.id)}
                    style={{
                      background: card.bg,
                      border: "1px solid #F1F5F9",
                      borderRadius: 20,
                      padding: "18px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Icon size={20} color={card.accent} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", fontFamily: "Kanit", margin: "0 0 2px 0" }}>{card.label}</p>
                      <p style={{ fontSize: 12, color: "#64748B", fontFamily: "Kanit", margin: 0 }}>{card.sublabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Analytics Section Label ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>ผลการเรียนรู้ & จุดอ่อน</h2>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 400 }}>อัปเดตล่าสุด: วันนี้</span>
            </div>

            {/* Analytics grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {/* ── Radar Chart ── */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F1F5F9",
                  borderRadius: 20,
                  padding: "18px 14px 14px",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>ความเชี่ยวชาญรายวิชา</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 12px 0" }}>Subject Mastery</p>
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 12, bottom: 0, left: 12 }}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontFamily: "Kanit", fontSize: 10, fill: "#64748B" }}
                    />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#BD1B0B"
                      fill="#BD1B0B"
                      fillOpacity={0.12}
                      strokeWidth={1.8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* ── Bar Chart ── */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F1F5F9",
                  borderRadius: 20,
                  padding: "18px 14px 14px",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>คะแนนรายวิชา</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 12px 0" }}>Score by Subject</p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={barData} barSize={10}>
                    <CartesianGrid vertical={false} stroke="#F8FAFC" />
                    <XAxis dataKey="subject" tick={{ fontFamily: "Kanit", fontSize: 9.5, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={false} axisLine={false} tickLine={false} domain={[0, 100]} width={0} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#F8FAFC" }} />
                    <Bar dataKey="score" fill="#BD1B0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Status tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {barData.map((d) => (
                    <span
                      key={d.subject}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "2px 6px",
                        borderRadius: 20,
                        fontSize: 9.5,
                        fontWeight: 600,
                        background: `${statusColors[d.status]}15`,
                        color: statusColors[d.status],
                      }}
                    >
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: statusColors[d.status], display: "inline-block" }} />
                      {d.subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Line Chart ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #F1F5F9",
                borderRadius: 20,
                padding: "18px 20px 14px",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>พัฒนาการ 8 สัปดาห์</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>8-Week Score Progression</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#BD1B0B", margin: 0 }}>84%</p>
                  <p style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, margin: 0 }}>▲ +22% พัฒนาการ</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={lineData}>
                  <CartesianGrid stroke="#F8FAFC" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontFamily: "Kanit", fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontFamily: "Kanit", fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: "#F1F5F9", strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#BD1B0B"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: "#fff", stroke: "#BD1B0B", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#BD1B0B", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── AI Recommendation ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #F1F5F9",
                borderRadius: 20,
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FDF2F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BrainIcon />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 2px 0" }}>AI แนะนำแนวทางอ่านสอบ</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>Smart Study Advice</p>
                </div>
                <span style={{ marginLeft: "auto", padding: "2px 8px", background: "#FDF2F1", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#BD1B0B" }}>AI</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { priority: "สำคัญมาก", color: "#BD1B0B", bg: "#FDF2F1", text: "วิชา ไอที/คอมพิวเตอร์ ควรทบทวน พ.ร.บ.คอมพิวเตอร์ และระบบความมั่นคงปลอดภัยไซเบอร์" },
                  { priority: "แนะนำ", color: "#D97706", bg: "#FFFBEB", text: "วิชา สังคมฯ ควรติดตามเหตุการณ์ปัจจุบันปี 2568-2569 และความสัมพันธ์อาเซียน" },
                  { priority: "ทำต่อเนื่อง", color: "#16A34A", bg: "#F0FDF4", text: "วิชา งานสารบรรณ และ ลักษณะที่ ๕๔ มีความแม่นยำสูง (>85%) รักษาระดับไว้ได้ดีเยี่ยม" },
                ].map((item) => (
                  <div
                    key={item.priority}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      background: "#F8FAFC",
                      borderRadius: 12,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: item.bg,
                        color: item.color,
                        fontSize: 10,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {item.priority}
                    </span>
                    <p style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Bottom Nav Dock ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: "0 16px 8px",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid #F1F5F9",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            padding: "8px 6px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id === "profile") {
                    setShowProfile(true);
                  } else if (id === "community") {
                    alert("ระบบชุมชนเตรียมสอบ สามารถเข้าใช้งานได้ที่แถบชุมชนด้านในระบบหลักครับ");
                  } else {
                    setActiveNav(id);
                  }
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "6px 2px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "transform 0.15s ease",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: "#FDF2F1",
                    }}
                  />
                )}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <Icon size={20} color={active ? "#BD1B0B" : "#94A3B8"} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 400,
                    color: active ? "#BD1B0B" : "#94A3B8",
                    fontFamily: "Kanit",
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Modals ── */}
      {showTrackModal && <TrackModal onClose={() => setShowTrackModal(false)} onStartTrack={handleStartTrack} />}
      {showCompressor && <CompressorModal onClose={() => setShowCompressor(false)} />}
      {showVocab && <VocabModal onClose={() => setShowVocab(false)} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onLogout={handleLogout} />}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, UploadCloud, CheckCircle } from "lucide-react";

interface ImageCompressorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageCompressorModal: React.FC<ImageCompressorModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedFile(null);
      setCompressed(false);
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 bg-rose-50 text-police-800 flex items-center justify-center shadow-xs">
          <ImageIcon className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">บีบอัดรูปถ่าย</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          ลดขนาดไฟล์รูปภาพสำหรับอัปโหลดสมัครสอบตำรวจ (ไม่เกิน 50-100 KB)
        </p>

        {/* Upload Box */}
        <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-police-800 hover:bg-rose-50/30 transition-all cursor-pointer block mb-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
                setCompressed(true);
              }
            }}
          />
          <UploadCloud className="w-8 h-8 text-police-800" />
          <span className="text-xs font-bold text-slate-700">
            {selectedFile ? selectedFile.name : "แตะเพื่อเลือกรูปภาพจากเครื่อง"}
          </span>
          <span className="text-[10px] text-slate-400">รองรับ JPG, PNG</span>
        </label>

        {compressed && (
          <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 mb-4 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>บีบอัดรูปภาพเหลือ 48 KB เรียบร้อยแล้ว!</span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-police-800 hover:bg-police-700 active:scale-98 text-white font-extrabold text-sm transition-all cursor-pointer"
        >
          {compressed ? "ดาวน์โหลดรูปภาพ" : "ปิดหน้าต่าง"}
        </button>
      </div>
    </div>
  );
};

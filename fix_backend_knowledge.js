const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', 'utf8');

// Add Gemini import
if (!code.includes('@google/generative-ai')) {
  code = code.replace(
    "const prisma = new PrismaClient();",
    "const prisma = new PrismaClient();\nconst { GoogleGenerativeAI } = require('@google/generative-ai');\nconst genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;"
  );
}

const apiToAdd = `
// ==========================================
// KNOWLEDGE BASE & AI EXAM GENERATOR
// ==========================================

// 1. Get all knowledge documents
app.get('/api/admin/knowledge', authenticateToken, async (req, res) => {
  // Only allow admin (if you have role check, add it. Here we just let anyone with token for now, assuming admin dashboard)
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(docs);
  } catch (err) {
    console.error('Fetch knowledge docs error:', err);
    res.status(500).json({ error: 'Failed to fetch knowledge documents' });
  }
});

// 2. Add new knowledge document
app.post('/api/admin/knowledge', authenticateToken, async (req, res) => {
  const { title, category, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'กรุณากรอกชื่อและเนื้อหา' });
  
  try {
    const doc = await prisma.knowledgeDocument.create({
      data: { title, category: category || 'ทั่วไป', content }
    });
    res.json(doc);
  } catch (err) {
    console.error('Create knowledge error:', err);
    res.status(500).json({ error: 'Failed to create knowledge document' });
  }
});

// 3. Delete knowledge document
app.delete('/api/admin/knowledge/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.knowledgeDocument.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete knowledge error:', err);
    res.status(500).json({ error: 'Failed to delete knowledge document' });
  }
});

// 4. Generate Exam using Gemini AI
app.post('/api/admin/knowledge/:id/generate', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { questionCount, examTitle } = req.body;
  
  if (!genAI) return res.status(500).json({ error: 'ไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบ' });

  try {
    const doc = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'ไม่พบเอกสาร' });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = \`
คุณคือผู้เชี่ยวชาญการออกข้อสอบ จงอ่านเนื้อหาต่อไปนี้ และสร้างข้อสอบปรนัย (4 ตัวเลือก) จำนวน \${questionCount || 5} ข้อ
โดยให้สอดคล้องกับเนื้อหามากที่สุด

เนื้อหา:
"""
\${doc.content}
"""

ส่งผลลัพธ์กลับมาในรูปแบบ JSON Array เท่านั้น (ไม่ต้องมีคำอธิบายอื่น ไม่ต้องมี markdown \`\`\`json) โดยให้แต่ละข้อมีโครงสร้างดังนี้:
[
  {
    "question": "คำถาม...",
    "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."],
    "correctAnswerIndex": 0, // เลข 0-3 ตำแหน่งที่ถูกต้อง
    "explanation": "คำอธิบายว่าทำไมถึงตอบข้อนี้"
  }
]
\`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('\`\`\`json')) jsonStr = jsonStr.substring(7);
    if (jsonStr.startsWith('\`\`\`')) jsonStr = jsonStr.substring(3);
    if (jsonStr.endsWith('\`\`\`')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    jsonStr = jsonStr.trim();
    
    const generatedQuestions = JSON.parse(jsonStr);

    // Save to ExamSet and Questions
    const examSet = await prisma.examSet.create({
      data: {
        title: examTitle || \`แบบทดสอบจาก: \${doc.title}\`,
        category: doc.category,
        totalCount: generatedQuestions.length,
        createdById: req.user.userId,
        isPublic: true
      }
    });

    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      await prisma.question.create({
        data: {
          examSetId: examSet.id,
          questionText: q.question,
          choice1: q.choices[0] || "",
          choice2: q.choices[1] || "",
          choice3: q.choices[2] || "",
          choice4: q.choices[3] || "",
          correctAnswer: q.correctAnswerIndex + 1, // DB uses 1-4
          explanation: q.explanation || "",
          sortOrder: i
        }
      });
    }

    res.json({ success: true, examSetId: examSet.id, count: generatedQuestions.length });
  } catch (err) {
    console.error('Generate exam error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการให้ AI สร้างข้อสอบ: ' + err.message });
  }
});
`;

if (!code.includes('/api/admin/knowledge')) {
  code = code.replace(
    "// ==========================================\n// START SERVER\n// ==========================================",
    apiToAdd + "\n// ==========================================\n// START SERVER\n// =========================================="
  );
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', code);
  console.log('Backend Knowledge Base APIs added successfully');
} else {
  console.log('APIs already exist');
}

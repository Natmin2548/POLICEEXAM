const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Comprehensive Police Exam Database Seeding...');

  // 1. Create Default Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'nni893399@gmail.com' },
    update: {
      fullName: 'มีน',
      role: 'ADMIN',
    },
    create: {
      username: 'meen_admin',
      email: 'nni893399@gmail.com',
      password: 'hashed_password_secure',
      fullName: 'มีน',
      role: 'ADMIN',
    },
  });
  console.log(`👤 Admin User: ${adminUser.fullName} (${adminUser.email})`);

  // Clear existing exam sets & questions for clean seed
  await prisma.question.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.examSet.deleteMany({});

  const serverPath = path.resolve(__dirname, '../../server');

  let totalSetsCreated = 0;
  let totalQuestionsCreated = 0;

  async function insertSet(category, subcategory, title, questions) {
    if (!questions || questions.length === 0) return;

    await prisma.examSet.create({
      data: {
        title,
        category,
        subcategory: subcategory || '',
        totalCount: questions.length,
        createdById: adminUser.id,
        questions: {
          create: questions.map((q, idx) => ({
            questionText: q.questionText || q.question,
            choice1: q.choice1 || (q.choices ? q.choices[0] : 'ก'),
            choice2: q.choice2 || (q.choices ? q.choices[1] : 'ข'),
            choice3: q.choice3 || (q.choices ? q.choices[2] : 'ค'),
            choice4: q.choice4 || (q.choices ? q.choices[3] : 'ง'),
            correctAnswer: typeof q.answer === 'number' ? q.answer + 1 : (Number(q.correctAnswer) || 1),
            explanation: q.explanation || '',
            sortOrder: idx + 1,
          })),
        },
      },
    });

    totalSetsCreated++;
    totalQuestionsCreated += questions.length;
  }

  // 1. Parse seed_amnuay_and_prabpram_exams.cjs
  try {
    const amnuayFile = path.join(serverPath, 'seed_amnuay_and_prabpram_exams.cjs');
    if (fs.existsSync(amnuayFile)) {
      const content = fs.readFileSync(amnuayFile, 'utf8');
      const match = content.match(/const\s+mockData\s*=\s*(\[[\s\S]*?\]);\s*async/);
      if (match) {
        const sets = eval(match[1]);
        for (const s of sets) {
          await insertSet(s.category, s.subcategory, s.title, s.questions);
        }
      }
    }
  } catch (e) {
    console.warn('Notice loading amnuay seed:', e.message);
  }

  // 2. Parse seed_computer_knowledge_and_exams.cjs
  try {
    const compFile = path.join(serverPath, 'seed_computer_knowledge_and_exams.cjs');
    if (fs.existsSync(compFile)) {
      const content = fs.readFileSync(compFile, 'utf8');
      const match = content.match(/const\s+chaptersData\s*=\s*(\[[\s\S]*?\]);\s*async/);
      if (match) {
        const chapters = eval(match[1]);
        for (const chap of chapters) {
          if (chap.questions && chap.questions.length > 0) {
            await insertSet('คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', `แบบทดสอบ${chap.title}`, chap.questions);
          }
        }
      }
    }
  } catch (e) {
    console.warn('Notice loading comp seed:', e.message);
  }

  // 3. Parse seed_law_knowledge_and_exams.cjs
  try {
    const lawFile = path.join(serverPath, 'seed_law_knowledge_and_exams.cjs');
    if (fs.existsSync(lawFile)) {
      const content = fs.readFileSync(lawFile, 'utf8');
      const match = content.match(/const\s+chaptersData\s*=\s*(\[[\s\S]*?\]);\s*async/);
      if (match) {
        const chapters = eval(match[1]);
        for (const chap of chapters) {
          if (chap.questions && chap.questions.length > 0) {
            await insertSet('กฎหมาย', 'กฎหมายและระเบียบตำรวจ', `แบบทดสอบ${chap.title}`, chap.questions);
          }
        }
      }
    }
  } catch (e) {
    console.warn('Notice loading law chapters:', e.message);
  }

  // 4. Parse seed-law-questions.js
  try {
    const lawQuestionsFile = path.join(serverPath, 'seed-law-questions.js');
    if (fs.existsSync(lawQuestionsFile)) {
      const content = fs.readFileSync(lawQuestionsFile, 'utf8');
      const match = content.match(/const\s+lawQuestions\s*=\s*(\[[\s\S]*?\]);\s*async/);
      if (match) {
        const qList = eval(match[1]);
        // Chunk into sets of 20 questions
        for (let i = 0; i < qList.length; i += 20) {
          const chunk = qList.slice(i, i + 20);
          await insertSet('กฎหมาย', 'กฎหมายตำรวจภาคปฏิบัติ', `คลังข้อสอบกฎหมายตำรวจ ชุดที่ ${Math.floor(i / 20) + 1}`, chunk);
        }
      }
    }
  } catch (e) {
    console.warn('Notice loading law questions:', e.message);
  }

  // 5. Pretest 150 Standard Tracks
  const samplePretest = [
    { questionText: 'อนุกรม 2, 5, 10, 17, 26, ... ตัวเลขถัดไปคือข้อใด?', choice1: '35', choice2: '37', choice3: '39', choice4: '41', correctAnswer: 2, explanation: 'ผลต่างเป็นเลขคี่ +3, +5, +7, +9, +11 ดังนั้น 26 + 11 = 37' },
    { questionText: 'อนุกรม 3, 6, 12, 24, 48, ... ตัวเลขถัดไปคือข้อใด?', choice1: '72', choice2: '84', choice3: '96', choice4: '108', correctAnswer: 3, explanation: 'คูณด้วย 2 ตลอด: 48 x 2 = 96' },
    { questionText: 'สินค้าติดราคาไว้ 2,500 บาท ลดราคา 20% ผู้ซื้อจะต้องจ่ายเงินกี่บาท?', choice1: '1,800 บาท', choice2: '1,900 บาท', choice3: '2,000 บาท', choice4: '2,100 บาท', correctAnswer: 3, explanation: 'ลด 20% ของ 2,500 = 500 บาท; จ่าย 2,500 - 500 = 2,000 บาท' },
    { questionText: 'ซื้อเสื้อมา 400 บาท ขายไป 500 บาท ได้กำไรร้อยละเท่าใด?', choice1: 'ร้อยละ 15', choice2: 'ร้อยละ 20', choice3: 'ร้อยละ 25', choice4: 'ร้อยละ 30', correctAnswer: 3, explanation: 'กำไร 100 บาท คิดเป็น (100 / 400) x 100 = 25%' },
    { questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?', choice1: 'A = C', choice2: 'A > C', choice3: 'A < C', choice4: 'สรุปไม่ได้', correctAnswer: 2, explanation: 'แทนค่า B ด้วย C ได้ A > C ทันที' },
    { questionText: 'คำในข้อใดเขียนสะกดถูกต้องตามพจนานุกรมฉบับราชบัณฑิตยสถาน?', choice1: 'กระเพรา', choice2: 'กะเพรา', choice3: 'กะเพลา', choice4: 'กระเพลา', correctAnswer: 2, explanation: 'คำที่ถูกต้องคือ "กะเพรา" ไม่มี ร ควบกล้ำ' },
    { questionText: 'คำว่า "มรณภาพ" ใช้สำหรับบุคคลในข้อใด?', choice1: 'พระมหากษัตริย์', choice2: 'พระภิกษุสงฆ์', choice3: 'เจ้านายชั้นผู้ใหญ่', choice4: 'บุคคลทั่วไป', correctAnswer: 2, explanation: 'มรณภาพ เป็นคำราชาศัพท์/คำสุภาพสำหรับพระภิกษุสงฆ์' },
    { questionText: 'ข้อใดเป็นประโยคความรวม (รวมความ)?', choice1: 'เขากินข้าวเสร็จแล้วก็ไปทำงาน', choice2: 'พ่อบอกว่าพรุ่งนี้จะไปต่างจังหวัด', choice3: 'แมวกินปลาทู', choice4: 'คนที่ยืนตรงนั้นคือน้องชายฉัน', correctAnswer: 1, explanation: 'มีสันธาน "แล้วก็" เชื่อมประโยคสองประโยคเข้าด้วยกัน' },
    { questionText: 'The police officer asked the witness to _______ the suspect in detail.', choice1: 'describe', choice2: 'description', choice3: 'descriptive', choice4: 'describing', correctAnswer: 1, explanation: 'หลัง to-infinitive ต้องตามด้วย V.inf คือ describe' },
    { questionText: 'Neither the driver nor the passengers _______ injured in the accident.', choice1: 'was', choice2: 'were', choice3: 'is', choice4: 'has been', correctAnswer: 2, explanation: 'โครงสร้าง Neither...nor ให้ผันกริยาตามประธานตัวหลัง (passengers พหูพจน์ในอดีต -> were)' },
    { questionText: 'If the police _______ earlier, they would have caught the thief.', choice1: 'arrived', choice2: 'had arrived', choice3: 'arrive', choice4: 'have arrived', correctAnswer: 2, explanation: 'Conditional Type 3: If + Past Perfect (had arrived), Subject + would have + V.3' },
    { questionText: 'หลักธรรมใดในพระพุทธศาสนาที่เรียกว่า "ธรรมคุ้มครองโลก"?', choice1: 'หิริ - โอตตัปปะ', choice2: 'เมตตา - กรุณา', choice3: 'ขันติ - โสรัจจะ', choice4: 'อิทธิบาท 4', correctAnswer: 1, explanation: 'โลกบาลธรรม หรือ ธรรมคุ้มครองโลก คือ หิริ (ความละอายต่อบาป) และ โอตตัปปะ (ความเกรงกลัวต่อบาป)' },
    { questionText: 'ค่านิยมหลักของคนไทย 12 ประการ ข้อที่ 1 คือข้อใด?', choice1: 'มีความกตัญญูต่อพ่อแม่', choice2: 'มีความรักชาติ ศาสนา พระมหากษัตริย์', choice3: 'ใฝ่หาความรู้', choice4: 'รักษาวัฒนธรรมประเพณีไทย', correctAnswer: 2, explanation: 'ข้อที่ 1 คือ มีความรักชาติ ศาสนา พระมหากษัตริย์' },
    { questionText: 'บุคคลใดได้รับการยกย่องให้เป็น "บิดาแห่งคอมพิวเตอร์"?', choice1: 'Alan Turing', choice2: 'Charles Babbage', choice3: 'John von Neumann', choice4: 'Steve Jobs', correctAnswer: 2, explanation: 'Charles Babbage คิดค้น Difference Engine และได้รับการยกย่องเป็นบิดาแห่งคอมพิวเตอร์' },
    { questionText: 'หน่วยความจำประเภทใดที่จะสูญหายเมื่อปิดเครื่อง (Volatile Memory)?', choice1: 'ROM', choice2: 'RAM', choice3: 'Harddisk', choice4: 'Flash Drive', correctAnswer: 2, explanation: 'RAM เป็นหน่วยความจำชั่วคราว ข้อมูลจะหายไปเมื่อไม่มีกระแสไฟฟ้าหล่อเลี้ยง' },
    { questionText: 'คีย์ลัดสำหรับ "บันทึกเอกสาร" (Save) ในระบบ Windows คือข้อใด?', choice1: 'Ctrl + P', choice2: 'Ctrl + C', choice3: 'Ctrl + S', choice4: 'Ctrl + V', correctAnswer: 3, explanation: 'Ctrl + S คือคำสั่ง Save' },
    { questionText: 'ความผิดอาญาแผ่นดินมีลักษณะสำคัญอย่างไร?', choice1: 'ยอมความได้เสมอ', choice2: 'ไม่สามารถยอมความได้ แม้ผู้เสียหายจะไม่ติดใจเอาความ', choice3: 'ต้องให้ผู้เสียหายร้องทุกข์ก่อนตำรวจจึงจะสอบสวนได้', choice4: 'ศาลจะลงโทษปรับเท่านั้น', correctAnswer: 2, explanation: 'ความผิดอาญาแผ่นดินเป็นความผิดต่อรัฐและสังคม ไม่สามารถยอมความได้' },
    { questionText: 'ตาม พ.ร.บ. ตำรวจแห่งชาติ ใครเป็นประธานกรรมการนโยบายตำรวจแห่งชาติ (ก.ต.ช.)?', choice1: 'ผู้บัญชาการตำรวจแห่งชาติ (ผบ.ตร.)', choice2: 'นายกรัฐมนตรี', choice3: 'รัฐมนตรีว่าการกระทรวงมหาดไทย', choice4: 'ปลัดกระทรวงยุติธรรม', correctAnswer: 2, explanation: 'นายกรัฐมนตรี ทำหน้าที่เป็นประธาน ก.ต.ช.' }
  ];

  await insertSet('สายปราบปราม', 'Pretest 150', 'ข้อสอบเสมือนจริง 150 ข้อ — สายปราบปราม', samplePretest);
  await insertSet('สายอำนวยการ', 'Pretest 150', 'ข้อสอบเสมือนจริง 150 ข้อ — สายอำนวยการ', samplePretest);

  const totalInDb = await prisma.question.count();
  const totalSetsInDb = await prisma.examSet.count();

  console.log(`\n🎉 Database Seeded & Verified!`);
  console.log(`📦 Exam Sets Created: ${totalSetsInDb}`);
  console.log(`📝 Total Questions in DB: ${totalInDb}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

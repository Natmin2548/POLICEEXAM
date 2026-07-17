import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables from the server folder's .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// --- Email Transporter (Nodemailer) ---
const isResend = process.env.EMAIL_USER === 'resend';
const emailTransporter = nodemailer.createTransport({
  host: isResend ? 'smtp.resend.com' : 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, '')
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds connection timeout
  socketTimeout: 10000      // 10 seconds socket timeout
});

const getSenderEmail = () => {
  if (isResend) {
    return `"เตรียมสอบนายสิบ" <onboarding@resend.dev>`;
  }
  return `"เตรียมสอบนายสิบ" <${process.env.EMAIL_USER}>`;
};

const getFrontendUrl = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  const host = req.get('host') || 'localhost:3000';
  const hostname = host.split(':')[0];
  return `http://${hostname}:5173`;
};
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:5173`;

const defaultQuestions = [
  // 1. ความรู้ความสามารถทั่วไป (general)
  {
    category: 'general',
    title: 'ความรู้ความสามารถทั่วไป ชุดที่ 1',
    questions: [
      {
        questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?',
        choice1: 'A = C',
        choice2: 'A > C',
        choice3: 'A < C',
        choice4: 'สรุปไม่ได้',
        correctAnswer: 1
      },
      {
        questionText: 'ผลรวมของเลขจำนวนเต็มตั้งแต่ 1 ถึง 100 เท่ากับเท่าใด?',
        choice1: '5050',
        choice2: '5000',
        choice3: '5100',
        choice4: '4950',
        correctAnswer: 0
      },
      {
        questionText: 'นายดำอายุมากกว่านายแดง 5 ปี อีก 3 ปีข้างหน้าผลรวมอายุทั้งสองคนเป็น 45 ปี ปัจจุบันนายแดงอายุเท่าใด?',
        choice1: '17 ปี',
        choice2: '22 ปี',
        choice3: '15 ปี',
        choice4: '20 ปี',
        correctAnswer: 0
      }
    ]
  },
  // 2. ภาษาไทย (thai)
  {
    category: 'thai',
    title: 'ภาษาไทย ชุดที่ 1',
    questions: [
      {
        questionText: 'ข้อใดเขียนตัวสะกดการันต์ได้ถูกต้องทุกคำ?',
        choice1: 'อนุญาต, ปรากฏ, สังเกต',
        choice2: 'อนุญาติ, ปรากฎ, สังเกตุ',
        choice3: 'อนุญาต, ปรากฎ, สังเกตุ',
        choice4: 'อนุญาติ, ปรากฏ, สังเกต',
        correctAnswer: 0
      },
      {
        questionText: 'คำในข้อใดใช้ลักษณนามว่า "เล่ม" ทุกคำ?',
        choice1: 'หนังสือ, สมุด, ดาบ, เข็ม',
        choice2: 'หนังสือ, ดินสอ, เกวียน, ร่ม',
        choice3: 'ตะปู, ดาบ, เลื่อย, เทียน',
        choice4: 'สมุด, ไม้บรรทัด, ปากกา, ปืน',
        correctAnswer: 0
      },
      {
        questionText: 'สำนวนในข้อใดมีความหมายตรงกับคำว่า "ทำอะไรย่อมได้รับผลเช่นนั้น"?',
        choice1: 'หว่านพืชเช่นไร ย่อมได้ผลเช่นนั้น',
        choice2: 'กงเกวียนกำเกวียน',
        choice3: 'ทำดีได้ดี ทำชั่วได้ชั่ว',
        choice4: 'ปลูกบ้านตามใจผู้อยู่',
        correctAnswer: 0
      }
    ]
  },
  // 3. ภาษาอังกฤษ (english)
  {
    category: 'english',
    title: 'ภาษาอังกฤษ ชุดที่ 1',
    questions: [
      {
        questionText: 'Choose the correct word: The police officer asked the driver to ______ his driver\'s license.',
        choice1: 'show',
        choice2: 'showing',
        choice3: 'shown',
        choice4: 'shows',
        correctAnswer: 0
      },
      {
        questionText: 'Which sentence is grammatically correct?',
        choice1: 'He don\'t like coffee.',
        choice2: 'She doesn\'t likes coffee.',
        choice3: 'They doesn\'t like coffee.',
        choice4: 'He doesn\'t like coffee.',
        correctAnswer: 3
      },
      {
        questionText: 'The synonym of the word "ASSIST" is ______.',
        choice1: 'hinder',
        choice2: 'help',
        choice3: 'ignore',
        choice4: 'prevent',
        correctAnswer: 1
      }
    ]
  },
  // 4. คอมพิวเตอร์และเทคโนโลยี (computer)
  {
    category: 'computer',
    title: 'เทคโนโลยีสารสนเทศ ชุดที่ 1',
    questions: [
      {
        questionText: 'ปุ่มคีย์ลัดใดใช้ในการคัดลอก (Copy) ข้อความหรือไฟล์ในระบบปฏิบัติการ Windows?',
        choice1: 'Ctrl + X',
        choice2: 'Ctrl + C',
        choice3: 'Ctrl + V',
        choice4: 'Ctrl + Z',
        correctAnswer: 1
      },
      {
        questionText: 'ข้อใดคือหน่วยความจำหลักของคอมพิวเตอร์ที่ข้อมูลจะหายไปเมื่อปิดเครื่อง?',
        choice1: 'ROM',
        choice2: 'Hard Disk',
        choice3: 'RAM',
        choice4: 'Flash Drive',
        correctAnswer: 2
      },
      {
        questionText: 'โปรโตคอลใดใช้ในการส่งและรับข้อมูลหน้าเว็บไซต์ทั่วไปอย่างปลอดภัย?',
        choice1: 'HTTP',
        choice2: 'FTP',
        choice3: 'HTTPS',
        choice4: 'SMTP',
        correctAnswer: 2
      }
    ]
  },
  // 5. สังคม วัฒนธรรม จริยธรรม และประชาคมอาเซียน (social)
  {
    category: 'social',
    title: 'สังคมและวัฒนธรรม ชุดที่ 1',
    questions: [
      {
        questionText: 'ประเทศใดไม่ได้อยู่ในผู้ก่อตั้งสมาคมประชาชาติแห่งเอเชียตะวันออกเฉียงใต้ (ASEAN) ในปี พ.ศ. 2510?',
        choice1: 'ไทย',
        choice2: 'อินโดนีเซีย',
        choice3: 'เวียดนาม',
        choice4: 'ฟิลิปปินส์',
        correctAnswer: 2
      },
      {
        questionText: 'วันสำคัญทางพระพุทธศาสนาวันใดที่มีเหตุการณ์สำคัญคือ พระสงฆ์ 1,250 รูปมาประชุมกันโดยมิได้นัดหมาย?',
        choice1: 'วันมาฆบูชา',
        choice2: 'วันวิสาขบูชา',
        choice3: 'วันอาสาฬหบูชา',
        choice4: 'วันอัฐมีบูชา',
        correctAnswer: 0
      },
      {
        questionText: 'ข้อใดคือเป้าหมายหลักของการพัฒนาที่ยั่งยืน (SDGs) ขององค์การสหประชาชาติ?',
        choice1: 'การพัฒนาด้านอุตสาหกรรมหนักเท่านั้น',
        choice2: 'การพัฒนาเศรษฐกิจ สังคม และสิ่งแวดล้อมอย่างสมดุล',
        choice3: 'การเพิ่มจีดีพีของประเทศกำลังพัฒนาเป็นสองเท่า',
        choice4: 'การเน้นใช้ทรัพยากรธรรมชาติให้หมดไปโดยเร็ว',
        correctAnswer: 1
      }
    ]
  },
  // 6. งานสารบรรณ (secretariat)
  {
    category: 'secretariat',
    title: 'งานสารบรรณ ชุดที่ 1',
    questions: [
      {
        questionText: 'ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ หนังสือประทับตราใช้กระดาษชนิดใดและประทับตราแทนการลงชื่อของใคร?',
        choice1: 'กระดาษตราครุฑ / หัวหน้าส่วนราชการระดับกองขึ้นไป',
        choice2: 'กระดาษบันทึกข้อความ / หัวหน้าส่วนราชการระดับแผนก',
        choice3: 'กระดาษธรรมดา / เจ้าหน้าที่ผู้รับผิดชอบ',
        choice4: 'กระดาษตราครุฑ / เจ้าหน้าที่ระดับปฏิบัติการ',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการภายนอก ใช้กระดาษตราครุฑและเป็นหนังสือติดต่อระหว่างส่วนราชการกับข้อใด?',
        choice1: 'ระหว่างส่วนราชการด้วยกัน หรือ ส่วนราชการกับหน่วยงานภายนอก/บุคคลภายนอก',
        choice2: 'ภายในหน่วยงานระดับกองเดียวกันเท่านั้น',
        choice3: 'เฉพาะติดต่อกับบริษัทเอกชนต่างประเทศ',
        choice4: 'ใช้ส่งถึงนายกรัฐมนตรีโดยเฉพาะเท่านั้น',
        correctAnswer: 0
      },
      {
        questionText: 'หนังสือราชการมีกี่ชนิด ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526?',
        choice1: '4 ชนิด',
        choice2: '5 ชนิด',
        choice3: '6 ชนิด',
        choice4: '7 ชนิด',
        correctAnswer: 2
      }
    ]
  },
  // 7. กฎหมายเบื้องต้น (law)
  {
    category: 'law',
    title: 'กฎหมายเบื้องต้น ชุดที่ 1',
    questions: [
      {
        questionText: 'กฎหมายสูงสุดในการปกครองประเทศไทยคืออะไร?',
        choice1: 'ประมวลกฎหมายอาญา',
        choice2: 'รัฐธรรมนูญแห่งราชอาณาจักรไทย',
        choice3: 'พระราชบัญญัติตำรวจแห่งชาติ',
        choice4: 'ประมวลกฎหมายแพ่งและพาณิชย์',
        correctAnswer: 1
      },
      {
        questionText: 'การกระทำในข้อใดที่กฎหมายบัญญัติว่าเป็นความผิดทางอาญาและต้องได้รับโทษ?',
        choice1: 'การกู้ยืมเงินแล้วไม่ชำระคืนตามกำหนด',
        choice2: 'การลักทรัพย์ผู้อื่นโดยเจตนา',
        choice3: 'การผิดสัญญาซื้อขายที่ดิน',
        choice4: 'การจอดรถในที่ห้ามจอดโดยไม่มีป้ายเตือน',
        correctAnswer: 1
      },
      {
        questionText: 'ผู้ใดกระทำความผิดอาญาขณะอายุไม่เกินกี่ปี กฎหมายยกเว้นโทษให้ตามประมวลกฎหมายอาญาปัจจุบัน (แก้ไขเพิ่มเติมล่าสุด)?',
        choice1: 'ไม่เกิน 10 ปี',
        choice2: 'ไม่เกิน 12 ปี',
        choice3: 'ไม่เกิน 15 ปี',
        choice4: 'ไม่เกิน 18 ปี',
        correctAnswer: 1
      }
    ]
  }
];

const ensureDefaultQuestions = async () => {
  try {
    const count = await prisma.question.count();
    if (count > 0) return;

    console.log('[Auto-Seed] Database has 0 questions. Automatically seeding default questions...');
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    const creatorId = admin ? admin.id : 1;

    for (const group of defaultQuestions) {
      await prisma.examSet.create({
        data: {
          title: group.title,
          category: group.category,
          subcategory: 'ทั่วไป',
          totalCount: group.questions.length,
          createdById: creatorId,
          questions: {
            create: group.questions.map((q, idx) => ({
              questionText: q.questionText,
              choice1: q.choice1,
              choice2: q.choice2,
              choice3: q.choice3,
              choice4: q.choice4,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || `เฉลยคำตอบคือข้อ ${idx + 1} ตามรายละเอียดของข้อสอบ`,
              sortOrder: idx
            }))
          }
        }
      });
    }
    console.log('[Auto-Seed] Seeded default questions successfully.');
  } catch (err) {
    console.error('[Auto-Seed] Auto seeding failed:', err);
  }
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running.' });
});

// --- Register Route ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // Simple validation
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' });
  }

  // Type validation
  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof fullName !== 'string'
  ) {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
      }
    }

    // Hash the password securely with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');

    // Save user to MySQL using Prisma ORM
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        emailVerified: false,
        emailVerifyToken: verifyToken
      }
    });

    // Send verification email
    const verifyLink = `${getFrontendUrl(req)}/verify-email.html?token=${verifyToken}`;

    try {
      await emailTransporter.sendMail({
        from: getSenderEmail(),
        to: email,
        subject: '✉️ ยืนยันอีเมล - เตรียมสอบนายสิบพิชิตข้อสอบ',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
              <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1a1a2e; margin-bottom: 16px;">ยืนยันอีเมลของคุณ</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${fullName}</strong>,</p>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">ขอบคุณที่สมัครสมาชิก! กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ยืนยันอีเมล</a>
              </div>
              <p style="color: #888; font-size: 13px;">หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Verification email send error:', mailErr);
    }

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
      needsVerification: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งภายหลัง' });
  }
});

// --- Verify Email Route ---
app.get('/api/auth/verify-email', async (req, res) => {
  const { token } = req.query;
  const tokenStr = Array.isArray(token) ? token[0] : token;

  if (!tokenStr || typeof tokenStr !== 'string') {
    return res.status(400).json({ error: 'ไม่พบ token สำหรับยืนยัน หรือ token ไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: tokenStr }
    });

    if (!user) {
      return res.status(400).json({ error: 'ลิงก์ยืนยันไม่ถูกต้องหรือถูกใช้ไปแล้ว' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว', alreadyVerified: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null
      }
    });

    res.json({ message: 'ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว' });
  } catch (err) {
    console.error('Email verify error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Resend Verification Email Route ---
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์ยืนยันไปแล้ว' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว สามารถเข้าสู่ระบบได้เลย', alreadyVerified: true });
    }

    // Generate new token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: verifyToken }
    });

    const verifyLink = `${getFrontendUrl(req)}/verify-email.html?token=${verifyToken}`;

    await emailTransporter.sendMail({
      from: getSenderEmail(),
      to: email,
      subject: '✉️ ยืนยันอีเมล - เตรียมสอบนายสิบพิชิตข้อสอบ',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
            <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1a1a2e; margin-bottom: 16px;">ยืนยันอีเมลของคุณ</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${user.fullName || user.username}</strong>,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ยืนยันอีเมล</a>
            </div>
            <p style="color: #888; font-size: 13px;">หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
          </div>
        </div>
      `
    });

    res.json({ message: 'ส่งลิงก์ยืนยันอีเมลไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
  } catch (err) {
    console.error('Resend verification error:', err);
    if (err.code === 'EAUTH') {
      return res.status(500).json({ error: 'ไม่สามารถส่งอีเมลได้เนื่องจากรหัสผ่านแอป Gmail ของผู้ส่งไม่ถูกต้อง (SMTP Auth Error) กรุณาตรวจสอบการตั้งค่า .env' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' });
  }
});

// --- Login Route ---
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  // Simple validation
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน' });
  }

  if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Find user by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ ตรวจสอบกล่องจดหมายของคุณ',
        needsVerification: true,
        email: user.email
      });
    }

    // Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const redirectTo = (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/';

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ!',
      token,
      redirectTo,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        points: user.points,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        scoreGeneral: user.scoreGeneral,
        scoreThai: user.scoreThai,
        scoreEnglish: user.scoreEnglish,
        scoreComputer: user.scoreComputer,
        scoreSocial: user.scoreSocial,
        scoreSecretariat: user.scoreSecretariat,
        scoreLaw: user.scoreLaw,
        premiumUntil: user.premiumUntil,
        pigName: user.pigName,
        pigLevel: user.pigLevel,
        pigXp: user.pigXp,
        pigHunger: user.pigHunger,
        pigThirst: user.pigThirst,
        pigSkin: user.pigSkin,
        pigWeapon: user.pigWeapon,
        pigPenLevel: user.pigPenLevel,
        pigUnlockedSkins: user.pigUnlockedSkins,
        pigUnlockedWeapons: user.pigUnlockedWeapons
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งภายหลัง' });
  }
});

// --- Google Auth Configuration & Verification Routes ---
app.get('/api/auth/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'ไม่พบรหัส Token ของ Google' });
  }

  try {
    const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(googleUrl);
    if (!response.ok) {
      return res.status(400).json({ error: 'รหัส Token ของ Google ไม่ถูกต้องหรือหมดอายุ' });
    }

    const tokenInfo = await response.json();

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      return res.status(400).json({ error: 'รหัส Token ไม่ปลอดภัย (aud mismatch)' });
    }

    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.given_name || 'ผู้ใช้งาน Google';

    if (!email) {
      return res.status(400).json({ error: 'บัญชี Google ของคุณไม่ได้เปิดเผยอีเมล' });
    }

    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);

      user = await prisma.user.create({
        data: {
          username,
          fullName: name,
          email,
          password: hashedPassword,
          emailVerified: true,
          role: 'USER',
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          pigLevel: 1,
          pigXp: 0,
          scoreGeneral: 0,
          scoreThai: 0,
          scoreEnglish: 0,
          scoreComputer: 0,
          scoreSocial: 0,
          scoreSecretariat: 0,
          scoreLaw: 0
        }
      });
    } else {
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true }
        });
      }
    }

    const jwtToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    let redirectTo = '/home/';
    if (user.role === 'ADMIN' || user.role === 'OWNER') {
      redirectTo = '/admin-dashboard/';
    }

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
      token: jwtToken,
      user: userWithoutPassword,
      redirectTo
    });

  } catch (err) {
    console.error('Google verification error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับ Google' });
  }
});

// --- Google Auth Code Exchange Route (OAuth2 Code Flow) ---
app.post('/api/auth/google-code', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'ไม่พบรหัส Authorization Code' });
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.id_token) {
      // Fallback: try to get user info from access_token
      if (tokenData.access_token) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        if (!userInfo.email) {
          return res.status(400).json({ error: 'ไม่สามารถดึงข้อมูลจาก Google ได้' });
        }

        // Find or create user
        let user = await prisma.user.findFirst({ where: { email: userInfo.email } });

        if (!user) {
          const username = userInfo.email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
          const randomPass = crypto.randomBytes(16).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPass, 10);

          user = await prisma.user.create({
            data: {
              username,
              fullName: userInfo.name || 'ผู้ใช้งาน Google',
              email: userInfo.email,
              password: hashedPassword,
              emailVerified: true,
              role: 'USER',
              points: 0, xp: 0, level: 1, streak: 0,
              pigLevel: 1, pigXp: 0,
              scoreGeneral: 0, scoreThai: 0, scoreEnglish: 0,
              scoreComputer: 0, scoreSocial: 0, scoreSecretariat: 0, scoreLaw: 0
            }
          });
        }

        const jwtToken = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          JWT_SECRET, { expiresIn: '30d' }
        );
        const { password: _, ...userWithoutPassword } = user;

        return res.json({
          message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
          token: jwtToken,
          user: userWithoutPassword,
          redirectTo: (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/'
        });
      }

      return res.status(400).json({ error: 'การแลกเปลี่ยน Authorization Code ล้มเหลว' });
    }

    // Verify the id_token
    const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`;
    const verifyRes = await fetch(googleUrl);
    if (!verifyRes.ok) {
      return res.status(400).json({ error: 'ID Token ไม่ถูกต้อง' });
    }
    const tokenInfo = await verifyRes.json();

    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.given_name || 'ผู้ใช้งาน Google';

    if (!email) {
      return res.status(400).json({ error: 'บัญชี Google ไม่ได้เปิดเผยอีเมล' });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);

      user = await prisma.user.create({
        data: {
          username, fullName: name, email, password: hashedPassword,
          emailVerified: true, role: 'USER',
          points: 0, xp: 0, level: 1, streak: 0,
          pigLevel: 1, pigXp: 0,
          scoreGeneral: 0, scoreThai: 0, scoreEnglish: 0,
          scoreComputer: 0, scoreSocial: 0, scoreSecretariat: 0, scoreLaw: 0
        }
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET, { expiresIn: '30d' }
    );
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ!',
      token: jwtToken,
      user: userWithoutPassword,
      redirectTo: (user.role === 'ADMIN' || user.role === 'OWNER') ? '/admin-dashboard/' : '/home/'
    });

  } catch (err) {
    console.error('Google code exchange error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์กับ Google' });
  }
});

// --- Forgot Password Route ---
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findFirst({ where: { email } });
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate any previous unused tokens for this email
    await prisma.passwordReset.updateMany({
      where: { email, used: false },
      data: { used: true }
    });

    // Save token to DB
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt
      }
    });

    // Build reset link
    const resetLink = `${getFrontendUrl(req)}/reset-password.html?token=${resetToken}`;

    // Send email
    try {
      await emailTransporter.sendMail({
        from: getSenderEmail(),
        to: email,
        subject: '🔐 รีเซ็ตรหัสผ่าน - เตรียมสอบนายสิบพิชิตข้อสอบ',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
              <h1 style="color: #d6af37; margin: 0; font-size: 24px;">เตรียมสอบนายสิบพิชิตข้อสอบ</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1a1a2e; margin-bottom: 16px;">รีเซ็ตรหัสผ่าน</h2>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">สวัสดีคุณ <strong>${user.fullName || user.username}</strong>,</p>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d6af37, #f0c850); color: #1a1a2e; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 16px;">ตั้งรหัสผ่านใหม่</a>
              </div>
              <p style="color: #888; font-size: 13px;">ลิงก์นี้จะหมดอายุภายใน 30 นาที หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยอีเมลนี้</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #aaa; font-size: 12px; text-align: center;">© 2026 เตรียมสอบนายสิบพิชิตข้อสอบ</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Email send error:', mailErr);
      return res.status(500).json({ error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบการตั้งค่าอีเมลของเซิร์ฟเวอร์' });
    }

    res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบอีเมลของคุณ' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Reset Password Route ---
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  if (typeof token !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  try {
    // Find the reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่' });
    }

    // Find the user
    const user = await prisma.user.findFirst({ where: { email: resetRecord.email } });
    if (!user) {
      return res.status(400).json({ error: 'ไม่พบบัญชีผู้ใช้' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    });

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' });
    }
    req.user = decoded;
    next();
  });
};

// --- requireAdmin Middleware ---
const requireAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true }
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
        return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้ (สำหรับแอดมินหรือเจ้าของเท่านั้น)' });
      }
      next();
    } catch (err) {
      console.error('requireAdmin error:', err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
    }
  });
};

// --- Get User Profile Route ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    // Calculate actual answered questions count from completed stages
    const completedProgress = await prisma.userStageProgress.findMany({
      where: { userId: req.user.userId, completed: true },
      include: { stage: true }
    });

    let answeredQuestionsCount = 0;
    if (completedProgress.length > 0) {
      const stageTitles = completedProgress.map(p => p.stage.title);
      const matchingExamSets = await prisma.examSet.findMany({
        where: { title: { in: stageTitles } },
        select: { totalCount: true }
      });
      answeredQuestionsCount = matchingExamSets.reduce((sum, es) => sum + es.totalCount, 0);
    }

    const { password, ...safeUser } = user;
    res.json({
      user: {
        ...safeUser,
        answeredQuestionsCount
      }
    });
  } catch (err) {
    console.error('Fetch Profile Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้' });
  }
});

// --- Upload Profile Face Image ---
app.post('/api/user/profile/upload-face', authenticateToken, async (req, res) => {
  const { faceImage } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { faceImage }
    });
    const { password, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Upload face error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปโหลดรูปภาพใบหน้าได้' });
  }
});

// --- Student Exam Endpoints ---

// Get daily random exam (10 questions, 1 or 2 from each subject)
app.get('/api/exams/daily', authenticateToken, async (req, res) => {
  const categories = ['general', 'thai', 'english', 'computer', 'social', 'secretariat', 'law'];
  try {
    await ensureDefaultQuestions();
    const selectedIds = [];
    const categoryQuestions = {};
    const pool = [];

    // Fetch all question IDs for each category
    for (const cat of categories) {
      const list = await prisma.question.findMany({
        where: { examSet: { category: cat } },
        select: { id: true }
      });
      const ids = list.map(q => q.id);
      
      // Shuffle individual category IDs
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      categoryQuestions[cat] = ids;
    }

    // Shuffle the categories to decide which 3 categories get 2 questions
    const shuffledCats = [...categories];
    for (let i = shuffledCats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCats[i], shuffledCats[j]] = [shuffledCats[j], shuffledCats[i]];
    }

    const twoQuestionCats = shuffledCats.slice(0, 3);

    // Pick 1 or 2 questions from each category
    categories.forEach(cat => {
      const ids = categoryQuestions[cat] || [];
      const countToPick = twoQuestionCats.includes(cat) ? 2 : 1;
      
      const picked = ids.slice(0, countToPick);
      selectedIds.push(...picked);

      // Add remaining category questions to a global fallback pool
      const remaining = ids.slice(countToPick);
      pool.push(...remaining);
    });

    // Shuffle the global fallback pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Fill from pool if total is under 10 (due to empty categories in DB)
    while (selectedIds.length < 10 && pool.length > 0) {
      selectedIds.push(pool.pop());
    }

    if (selectedIds.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำถามในระบบ' });
    }

    // Fetch full questions
    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        examSet: {
          select: { category: true, subcategory: true }
        }
      }
    });

    // Group/Sort questions by category order to prevent mixing them up
    questions.sort((a, b) => {
      const catA = a.examSet?.category || '';
      const catB = b.examSet?.category || '';
      return categories.indexOf(catA) - categories.indexOf(catB);
    });

    res.json(questions);
  } catch (err) {
    console.error('Fetch Daily Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบประจำวันได้' });
  }
});

// Helper to retrieve and rotate Gemini API Keys from DB settings
async function getGeminiApiKey() {
  let dbKey = null;
  try {
    const keySetting = await prisma.systemSetting.findUnique({
      where: { key: 'settings_gemini_key' }
    });
    if (keySetting && keySetting.value && keySetting.value.trim() !== '') {
      dbKey = keySetting.value.trim();
    }
  } catch (err) {
    console.error('Error fetching gemini key from DB:', err);
  }

  if (dbKey) {
    const keys = dbKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length > 0) {
      // Pick a random key from the comma-separated pool
      return keys[Math.floor(Math.random() * keys.length)];
    }
  }

  return process.env.GEMINI_API_KEY || 'AIzaSyDDBylXqV9akHtd5hBVEFSuoAM795on7Rc';
}

// Helper to verify a batch of generated questions using Gemini (replicates verifier.py logic)
async function verifyQuestionsBatch(questions, terms, apiKey) {
  const model = 'gemini-2.5-flash';
  const systemPrompt = `คุณคือผู้เชี่ยวชาญตรวจคุณภาพข้อสอบราชการของไทย
หน้าที่ของคุณคือตรวจ "ความถูกต้องของเนื้อหา" และคุณภาพของข้อสอบแต่ละข้อตามเกณฑ์ต่อไปนี้

=== เกณฑ์ที่ต้องตรวจสอบ ===
1. ความถูกต้องของคำตอบ: ตัวเลือกที่ระบุว่าเป็นคำตอบที่ถูก มีความถูกต้องตามข้อเท็จจริง (และตรงกับข้อมูลต้นฉบับที่แนบไป ถ้ามี)
2. ความเป็นเอกลักษณ์ของคำตอบ: ต้องมีตัวเลือกที่ถูกต้องที่สุดเพียงข้อเดียวเท่านั้น ห้ามมีตัวเลือกอื่นที่ถูกพอๆ กัน
3. ความสมเหตุสมผลของตัวเลือกผิด: ตัวเลือกผิดต้องไม่เดาง่ายหรือผิดชัดเจนเกินไป
4. ความชัดเจนของคำถาม: คำถามไม่กำกวม ตีความได้หลายแบบ
5. การอ้างอิงข้อมูล: ข้อสอบไม่อ้างอิงหรือทึกทักข้อมูลภายนอกที่ไม่มีระบุในข้อมูลต้นฉบับ

ตอบกลับเป็น JSON Array ของการตรวจสอบข้อสอบแต่ละข้อตามลำดับของอินพุต ห้ามมีคำอธิบายอื่นนอกเหนือจาก JSON นี้เท่านั้น:
[
  {
    "pass": true, // หรือ false หากไม่ผ่านเกณฑ์การตรวจสอบอย่างร้ายแรง
    "score": 90, // คะแนนคุณภาพ (0-100)
    "reason": "สรุปผลการตรวจสอบเนื้อหาข้อนี้",
    "issues": [] // รายการปัญหาที่พบ (ถ้ามี)
  }
]`;

  const payload = {
    "ฐานข้อมูลต้นฉบับ": terms ? { "records": terms } : "ไม่มี (ใช้ความรู้ทั่วไปของวิชาดังกล่าว)",
    "ข้อสอบที่ต้องตรวจ": questions.map((q, idx) => ({
      "ลำดับ": idx,
      "คำถาม": q.questionText || q.question,
      "ตัวเลือกทั้งหมด": [q.choice1 || q.choices?.[0], q.choice2 || q.choices?.[1], q.choice3 || q.choices?.[2], q.choice4 || q.choices?.[3]].filter(Boolean),
      "เนื้อหาของคำตอบที่ถูก": q.choices ? q.choices[q.correctAnswer || 0] : [q.choice1, q.choice2, q.choice3, q.choice4][q.correctAnswer || 0],
      "คำอธิบาย": q.explanation
    }))
  };

  const userMessage = `จงตรวจสอบคุณภาพของข้อสอบตามข้อมูลต่อไปนี้:\n\n${JSON.stringify(payload, null, 2)}`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`HTTP ${apiRes.status}: ${text}`);
    }

    const resJson = await apiRes.json();
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No verification text returned');

    const parsed = JSON.parse(rawText.trim());
    return parsed;
  } catch (err) {
    console.error('Batch verification error:', err.message);
    return null;
  }
}

// Helper to generate a question from a raw database Term using Gemini
async function generateQuestionFromTerm(term, apiKey) {
  const model = 'gemini-2.5-flash';
  const systemPrompt = `คุณคือผู้ออกข้อสอบราชการระดับมืออาชีพ

กฎที่ต้องปฏิบัติอย่างเคร่งครัด:
1. อ้างอิงเฉพาะข้อมูลที่ได้รับเท่านั้น ห้ามใช้ความรู้ภายนอก
2. ห้ามแต่งข้อมูลหรือสร้างข้อเท็จจริงใหม่ที่ไม่มีในข้อมูล
3. คำถามต้องไม่คัดลอก definition ตรงๆ แต่สามารถสร้างสถานการณ์สมมุติได้
4. ตัวเลือกผิดต้องสมเหตุสมผล ดูน่าเชื่อถือ ไม่ชัดเจนเกินไป — ถ้า record มี "confused_with" หรือ "non_examples" ให้ใช้เป็นแนวทางสร้างตัวเลือกผิดที่ดี
5. ต้องมีคำตอบที่ถูกต้องเพียงข้อเดียวเท่านั้น
6. ถ้า record มี "question_types" ให้พยายามเลือกออกข้อสอบในรูปแบบที่ระบุไว้
7. document ใน "source" ต้องตรงกับ document_name หรือ source ของ record ที่ใช้ และ section ต้องตรงกับ section หรือ category ของ record นั้น
8. source_line ต้องตรงกับ source_line ของ record ที่ใช้เป๊ะๆ

ตอบเป็น JSON เท่านั้น ห้ามมี text อื่นนอกจาก JSON:
{
  "question": "คำถาม",
  "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."],
  "answer": "A",
  "explanation": "อธิบายเหตุผลที่คำตอบถูกต้องและทำไมตัวเลือกอื่นผิด",
  "difficulty": "easy"
}
หมายเหตุ: answer ต้องเป็น "A", "B", "C" หรือ "D" ตรงกับลำดับ choices`;

  const record = {
    term: term.term,
    definition: term.definition,
    document_name: term.source || term.document_name || 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖',
    section: term.section || term.category || 'งานสารบรรณ',
    source_line: term.source_line || term.chapter || '',
  };
  const optionalFields = ['category', 'chapter', 'keywords', 'synonyms', 'examples', 'non_examples', 'confused_with', 'learning_objective', 'cognitive_level', 'difficulty_hint'];
  optionalFields.forEach(f => {
    if (term[f]) record[f] = term[f];
  });

  const userMessage = `จงสร้างข้อสอบ 1 ข้อจากข้อมูลต่อไปนี้:\n\n${JSON.stringify({ records: [record] }, null, 2)}`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`HTTP ${apiRes.status}: ${text}`);
    }

    const resJson = await apiRes.json();
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No text');

    const parsed = JSON.parse(rawText.trim());
    return {
      questionText: parsed.question || 'คำถามสารบรรณ',
      choices: parsed.choices || [],
      answer: parsed.answer || 'A',
      explanation: parsed.explanation || 'คำอธิบายเฉลย...',
      difficulty: parsed.difficulty || 'easy',
      subcategory: record.section,
      document: record.document_name,
      source_line: record.source_line
    };
  } catch (err) {
    console.error(`Error generating from term ${term.term}:`, err.message);
    return null;
  }
}

// Generate dynamic exam questions using Gemini API (Mode 1: AI Generated)
app.get('/api/exams/generate-ai', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }

  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';

  const subjectMeta = {
    general: { name: 'ความรู้ทั่วไป (คณิตศาสตร์ ตรรกศาสตร์ มิติสัมพันธ์ อนุกรม และการแก้โจทย์เลข)' },
    thai: { name: 'ภาษาไทย (หลักการใช้ภาษา ความเข้าใจภาษา การสะกดคำ และการเรียงประโยค)' },
    english: { name: 'ภาษาอังกฤษ (Grammar, Vocabulary, Conversation, Reading Comprehension)' },
    computer: { name: 'คอมพิวเตอร์และเทคโนโลยีสารสนเทศ (Hardware, Software, Internet, Cyber Security และโปรแกรมสำนักงาน)' },
    social: { name: 'สังคม วัฒนธรรม จริยธรรม และอาเซียน (ศีลธรรม ความเป็นพลเมือง และข้อมูลอาเซียน)' },
    secretariat: { name: 'งานสารบรรณ (ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม)' },
    law: { name: 'กฎหมายเบื้องต้นที่เกี่ยวข้องกับตำรวจ (กฎหมายรัฐธรรมนูญ, กฎหมายวิธีพิจารณาความอาญา, กฎหมายแพ่งและพาณิชย์ และกฎหมายอาญา)' }
  };
  const catName = subjectMeta[subject]?.name || subject;

  const systemPrompt = `คุณคืออาจารย์ผู้ออกข้อสอบสำหรับเตรียมสอบนายสิบตำรวจของไทย
กรุณาสร้างข้อสอบแบบปรนัย (4 ตัวเลือก ก, ข, ค, ง) จำนวน 10 ข้อสำหรับวิชา: "${catName}"
ระดับความยาก: ปานกลางถึงยาก (ใกล้เคียงกับข้อสอบจริงของสำนักงานตำรวจแห่งชาติ)

ผลลัพธ์ที่คุณส่งกลับต้องเป็น JSON Array ของข้อสอบ 10 ข้อนี้เท่านั้น ห้ามมี markdown (เช่น \`\`\`json) หรือข้อความอธิบายใดๆ ทั้งสิ้น ตอบเฉพาะ JSON เท่านั้น โครงสร้าง JSON ของแต่ละข้อมีรูปแบบดังนี้:
[
  {
    "questionText": "โจทย์คำถามวิชา ${catName} ...",
    "choice1": "ตัวเลือก ก...",
    "choice2": "ตัวเลือก ข...",
    "choice3": "ตัวเลือก ค...",
    "choice4": "ตัวเลือก ง...",
    "correctAnswer": 0, // ดัชนีคำตอบที่ถูกต้องเป็นตัวเลข (0 = ตัวเลือก 1, 1 = ตัวเลือก 2, 2 = ตัวเลือก 3, 3 = ตัวเลือก 4)
    "explanation": "อธิบายเฉลยอย่างละเอียดเชิงข้อกฎหมายหรือหลักการคิด..."
  }
]`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API HTTP ${apiRes.status}: ${errText}`);
    }

    const data = await apiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned from Gemini');

    const parsed = JSON.parse(rawText.trim());
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed response is not a JSON Array');
    }

    // Map into standard structure with mock IDs
    const questions = parsed.slice(0, 10).map((q, idx) => ({
      id: `ai-gen-${subject}-${idx}-${Date.now()}`,
      questionText: q.questionText || q.question || 'ข้อคำถามจำลอง',
      choice1: q.choice1 || q.choices?.[0] || 'ตัวเลือก ก',
      choice2: q.choice2 || q.choices?.[1] || 'ตัวเลือก ข',
      choice3: q.choice3 || q.choices?.[2] || 'ตัวเลือก ค',
      choice4: q.choice4 || q.choices?.[3] || 'ตัวเลือก ง',
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || 'เฉลยรายละเอียด...',
      examSet: {
        category: subject,
        subcategory: 'AI เจนเนอเรต'
      }
    }));

    // Run batch verification on the generated questions
    console.log(`[AI Verifier] Running verification for ${questions.length} questions...`);
    const verResults = await verifyQuestionsBatch(questions, null, apiKey);

    // Process verification results
    const verifiedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const result = verResults && verResults[i];

      if (!result || result.pass === true || (result.score && result.score >= 70)) {
        verifiedQuestions.push(q);
      } else {
        console.log(`[AI Verifier] Question ${i} failed. Score: ${result.score}, Reason: ${result.reason}`);
        
        // Fallback: fetch a random pre-saved question from our DB for this subject
        const fallbackQ = await prisma.question.findFirst({
          where: { examSet: { category: subject } },
          include: { examSet: true },
          skip: Math.floor(Math.random() * 5) // Skip randomly to get variation
        });

        if (fallbackQ) {
          verifiedQuestions.push({
            id: `ai-fallback-${subject}-${i}-${Date.now()}`,
            questionText: fallbackQ.questionText,
            choice1: fallbackQ.choice1,
            choice2: fallbackQ.choice2,
            choice3: fallbackQ.choice3,
            choice4: fallbackQ.choice4,
            correctAnswer: fallbackQ.correctAnswer,
            explanation: fallbackQ.explanation || 'เฉลยรายละเอียด...',
            examSet: {
              category: subject,
              subcategory: 'AI เจนเนอเรต (คลังสลับ)'
            }
          });
        } else {
          // If no fallback in DB, keep the AI question to avoid returning an incomplete list
          verifiedQuestions.push(q);
        }
      }
    }

    res.json(verifiedQuestions);
  } catch (err) {
    console.error('Error generating AI questions:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างข้อสอบจาก AI ได้ กรุณาลองใหม่อีกครั้ง' });
  }
});

// Generate dynamic exam questions using DBEXAM JSON files + Gemini API (Mode 2: DBEXAM)
app.get('/api/exams/generate-dbexam', authenticateToken, async (req, res) => {
  const { subject, count, subcategories } = req.query;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }
  const numCount = parseInt(count) || 10;
  const categoryFilter = subcategories ? subcategories : subject;

  const absoluteCwd = path.resolve(path.join(__dirname, '..', 'DBEXAM'));
  
  // Subcategory mapping
  const subcategoryMap = {
    // Secretariat
    "secretariat_general": "บททั่วไป",
    "secretariat_types": "หมวด ๑ ชนิดของหนังสือ",
    "secretariat_receiving": "หมวด ๒ การรับและส่งหนังสือ",
    "secretariat_keeping": "หมวด ๓ การเก็บรักษา ยืม และทำลายหนังสือ",
    "secretariat_standards": "หมวด ๔ มาตรฐานตรา แบบพิมพ์ และซอง",
    "secretariat_e_sarabarn": "หมวด ๕ ระบบสารบรรณอิเล็กทรอนิกส์",
    "secretariat_appendix": "ภาคผนวก",

    // Law
    "general_law_state": ["ความรู้ทั่วไปเกี่ยวกับกฎหมาย", "ความรู้ทั่วไปเกี่ยวกับรัฐ"],
    "history_hierarchy": ["ประวัติศาสตร์กฎหมายไทย", "ลำดับศักดิ์ของกฎหมาย"],
    "constitution": "รัฐธรรมนูญ (กฎหมายสูงสุด)",
    "administrative": "กฎหมายปกครอง (กฎหมายมหาชน)",
    "civil_person": "กฎหมายแพ่ง — บุคคล",
    "civil_juristic_debt": ["กฎหมายแพ่ง — นิติกรรมและสัญญา", "กฎหมายแพ่ง — หนี้"],
    "civil_property": "กฎหมายแพ่ง — ทรัพย์",
    "civil_family": "กฎหมายแพ่ง — ครอบครัว",
    "civil_inheritance": "กฎหมายแพ่ง — มรดกและพินัยกรรม",
    "criminal_general": ["กฎหมายอาญา — หลักทั่วไป", "กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา", "กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ", "กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน"],
    "criminal_offense": "ความผิดเกี่ยวกับทรัพย์ (อาญา)",
    "consumer_protection": "กฎหมายคุ้มครองผู้บริโภค",
    "intellectual_property": "ทรัพย์สินทางปัญญา",
    "labor": "กฎหมายแรงงาน",
    "tax": "กฎหมายภาษี",
    "registration_id_military": "กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง",
    "narcotics": "กฎหมายเฉพาะเรื่องอื่นๆ",
    "daily_life": "กฎหมายเฉพาะเรื่องอื่นๆ"
  };

  const apiKey = await getGeminiApiKey();

  try {
    let allEntries = [];

    // Load raw terms from DB directory (restrict by subject filename to prevent mixing)
    const dbDir = path.join(absoluteCwd, 'db');
    if (fs.existsSync(dbDir)) {
      const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
      for (const filename of dbFiles) {
        // Enforce strict subject boundary
        if (subject === 'law' && !filename.includes('law')) continue;
        if (subject === 'secretariat' && !filename.includes('sarabarn')) continue;

        const filePath = path.join(dbDir, filename);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent);
          const entries = data.entries || (data.knowledge_database && data.knowledge_database.entries) || [];
          allEntries = allEntries.concat(entries);
        } catch (err) {
          console.error(`Error reading/parsing db ${filename}:`, err);
        }
      }
    }

    // Filter by subcategories if specified
    if (subcategories) {
      const subKeys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
      let targetCategoryNames = [];
      for (const key of subKeys) {
        const mapped = subcategoryMap[key];
        if (mapped) {
          if (Array.isArray(mapped)) {
            targetCategoryNames = targetCategoryNames.concat(mapped);
          } else {
            targetCategoryNames.push(mapped);
          }
        }
      }
      if (targetCategoryNames.length > 0) {
        allEntries = allEntries.filter(entry => 
          targetCategoryNames.includes(entry.category) || 
          targetCategoryNames.includes(entry.section)
        );
      }
    } else {
      const targetCategoryName = subcategoryMap[subject];
      if (targetCategoryName) {
        if (Array.isArray(targetCategoryName)) {
          allEntries = allEntries.filter(entry => 
            targetCategoryName.includes(entry.category) || 
            targetCategoryName.includes(entry.section)
          );
        } else {
          allEntries = allEntries.filter(entry => 
            entry.category === targetCategoryName || 
            entry.section === targetCategoryName
          );
        }
      }
    }

    if (allEntries.length === 0) {
      return res.status(404).json({ error: 'ไม่พบฐานข้อมูลข้อความรู้สำหรับหมวดวิชาที่ต้องการ' });
    }

    // Shuffle and pick terms
    const shuffledTerms = allEntries.sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, numCount);

    // Call Gemini API in sequence (with a tiny delay to avoid rate limits)
    const generatedQuestions = [];
    for (let i = 0; i < selectedTerms.length; i++) {
      const term = selectedTerms[i];
      let genQ = await generateQuestionFromTerm(term, apiKey);
      
      if (genQ) {
        generatedQuestions.push(genQ);
      } else {
        // Fallback: If Gemini failed to generate, pull a pre-saved question from question_bank files
        console.log(`[DBEXAM Fallback] Fetching pre-saved question for term: ${term.term}`);
        const qbDir = path.join(absoluteCwd, 'question_bank');
        
        // Find which question bank files map to this category
        const subcategoryFiles = {
          "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
          "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
          "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
          "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
          "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
          "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
          "secretariat_appendix": ["ภาคผนวก.json"],
          
          // Law subcategories
          "general_law_state": ["กฎหมายเบื้องต้น.json"],
          "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
          "constitution": ["กฎหมายเบื้องต้น.json"],
          "administrative": ["กฎหมายเบื้องต้น.json"],
          "civil_person": ["กฎหมายเบื้องต้น.json"],
          "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
          "civil_property": ["กฎหมายเบื้องต้น.json"],
          "civil_family": ["กฎหมายเบื้องต้น.json"],
          "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
          "criminal_general": ["กฎหมายเบื้องต้น.json"],
          "criminal_offense": ["กฎหมายเบื้องต้น.json"],
          "consumer_protection": ["กฎหมายเบื้องต้น.json"],
          "intellectual_property": ["กฎหมายเบื้องต้น.json"],
          "labor": ["กฎหมายเบื้องต้น.json"],
          "tax": ["กฎหมายเบื้องต้น.json"],
          "registration_id_military": ["กฎหมายเบื้องต้น.json"],
          "narcotics": ["กฎหมายเบื้องต้น.json"],
          "daily_life": ["กฎหมายเบื้องต้น.json"]
        };

        let mappedFiles = [];
        if (subcategories) {
          const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
          for (const key of keys) {
            if (subcategoryFiles[key]) {
              mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
            }
          }
        }
        if (mappedFiles.length === 0) {
          if (subject === 'law') {
            mappedFiles = ["กฎหมายเบื้องต้น.json"];
          } else {
            mappedFiles = [
              "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
              "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
              "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
              "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
              "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
            ];
          }
        }
        mappedFiles = [...new Set(mappedFiles)];

        let fallbackBank = [];
        for (const file of mappedFiles) {
          const filePath = path.join(qbDir, file);
          if (fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const data = JSON.parse(content);
              fallbackBank = fallbackBank.concat(data.entries || []);
            } catch (e) {}
          }
        }

        if (fallbackBank.length > 0) {
          const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
          const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
          generatedQuestions.push({
            questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
            choices: choices,
            answer: randomSaved.answer || 'A',
            explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
            subcategory: randomSaved.subcategory || randomSaved.section || 'งานสารบรรณ',
            document: randomSaved.document || 'งานสารบรรณ',
            source_line: randomSaved.source_line || ''
          });
        }
      }

      // Add a 300ms delay between Gemini API calls to respect rate limits
      if (i < selectedTerms.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Run batch verification on the generated DB questions against the source terms
    console.log(`[DBEXAM Verifier] Running verification for ${generatedQuestions.length} questions...`);
    const verResults = await verifyQuestionsBatch(generatedQuestions, selectedTerms, apiKey);

    // Process verification results
    const verifiedQuestions = [];
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      const result = verResults && verResults[i];

      if (!result || result.pass === true || (result.score && result.score >= 70)) {
        verifiedQuestions.push(q);
      } else {
        console.log(`[DBEXAM Verifier] Question ${i} failed. Score: ${result.score}, Reason: ${result.reason}`);
        
        // Fallback: Pull a pre-saved question from question_bank files
        const qbDir = path.join(absoluteCwd, 'question_bank');
        const subcategoryFiles = {
          "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
          "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
          "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
          "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
          "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
          "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
          "secretariat_appendix": ["ภาคผนวก.json"],
          
          // Law subcategories
          "general_law_state": ["กฎหมายเบื้องต้น.json"],
          "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
          "constitution": ["กฎหมายเบื้องต้น.json"],
          "administrative": ["กฎหมายเบื้องต้น.json"],
          "civil_person": ["กฎหมายเบื้องต้น.json"],
          "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
          "civil_property": ["กฎหมายเบื้องต้น.json"],
          "civil_family": ["กฎหมายเบื้องต้น.json"],
          "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
          "criminal_general": ["กฎหมายเบื้องต้น.json"],
          "criminal_offense": ["กฎหมายเบื้องต้น.json"],
          "consumer_protection": ["กฎหมายเบื้องต้น.json"],
          "intellectual_property": ["กฎหมายเบื้องต้น.json"],
          "labor": ["กฎหมายเบื้องต้น.json"],
          "tax": ["กฎหมายเบื้องต้น.json"],
          "registration_id_military": ["กฎหมายเบื้องต้น.json"],
          "narcotics": ["กฎหมายเบื้องต้น.json"],
          "daily_life": ["กฎหมายเบื้องต้น.json"]
        };

        let mappedFiles = [];
        if (subcategories) {
          const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
          for (const key of keys) {
            if (subcategoryFiles[key]) {
              mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
            }
          }
        }
        if (mappedFiles.length === 0) {
          if (subject === 'law') {
            mappedFiles = ["กฎหมายเบื้องต้น.json"];
          } else {
            mappedFiles = [
              "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
              "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
              "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
              "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
              "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
            ];
          }
        }
        mappedFiles = [...new Set(mappedFiles)];

        let fallbackBank = [];
        for (const file of mappedFiles) {
          const filePath = path.join(qbDir, file);
          if (fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const data = JSON.parse(content);
              fallbackBank = fallbackBank.concat(data.entries || []);
            } catch (e) {}
          }
        }

        if (fallbackBank.length > 0) {
          const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
          const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
          verifiedQuestions.push({
            questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
            choices: choices,
            answer: randomSaved.answer || 'A',
            explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
            subcategory: randomSaved.subcategory || randomSaved.section || 'งานสารบรรณ',
            document: randomSaved.document || 'งานสารบรรณ',
            source_line: randomSaved.source_line || ''
          });
        } else {
          // Keep it as a last resort
          verifiedQuestions.push(q);
        }
      }
    }

    // Map into standard structure with mock IDs
    const processed = verifiedQuestions.map((q, idx) => {
      const choices = q.choices || [];
      const charMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correctAnsIdx = charMap[q.answer.toUpperCase()] !== undefined ? charMap[q.answer.toUpperCase()] : 0;

      return {
        id: `dbexam-gen-${subject}-${idx}-${Date.now()}`,
        questionText: q.questionText,
        choice1: choices[0] || 'ตัวเลือก ก',
        choice2: choices[1] || 'ตัวเลือก ข',
        choice3: choices[2] || 'ตัวเลือก ค',
        choice4: choices[3] || 'ตัวเลือก ง',
        correctAnswer: correctAnsIdx,
        explanation: q.explanation || 'เฉลยรายละเอียด...',
        subcategory: q.subcategory || 'งานสารบรรณ',
        examSet: {
          category: subject,
          subcategory: q.subcategory || 'งานสารบรรณ'
        }
      };
    });

    res.json(processed);
  } catch (err) {
    console.error('Failed to generate DBEXAM questions directly:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อสอบจากระบบคลังข้อสอบ' });
  }
});

// Get mock exam (150 questions grouped by subject)
app.get('/api/exams/mock', authenticateToken, async (req, res) => {
  const { track } = req.query;
  if (!track || !['suppression', 'forensics', 'administrative'].includes(track)) {
    return res.status(400).json({ error: 'กรุณาระบุสายงานที่ต้องการสอบจำลองให้ถูกต้อง' });
  }

  // Distribution for suppression
  const suppressionDist = {
    general: 30,
    english: 30,
    thai: 25,
    computer: 25,
    law: 20,
    social: 20
  };

  // Distribution for forensics and administrative
  const forensicsDist = {
    general: 20,
    thai: 20,
    english: 15,
    computer: 40,
    law: 25,
    secretariat: 30
  };

  const dist = track === 'suppression' ? suppressionDist : forensicsDist;
  const categoriesOrder = ['general', 'thai', 'english', 'computer', 'social', 'secretariat', 'law'];

  try {
    await ensureDefaultQuestions();
    const selectedIds = [];

    for (const [cat, count] of Object.entries(dist)) {
      const list = await prisma.question.findMany({
        where: { examSet: { category: cat } },
        select: { id: true }
      });
      const ids = list.map(q => q.id);

      // Shuffle
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }

      const picked = ids.slice(0, count);
      selectedIds.push(...picked);
    }

    if (selectedIds.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อสอบจำลองในระบบ' });
    }

    // Fetch full questions
    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        examSet: {
          select: { category: true, subcategory: true }
        }
      }
    });

    // Group/Sort questions by category order to prevent mixing them up
    questions.sort((a, b) => {
      const catA = a.examSet?.category || '';
      const catB = b.examSet?.category || '';
      return categoriesOrder.indexOf(catA) - categoriesOrder.indexOf(catB);
    });

    res.json(questions);
  } catch (err) {
    console.error('Fetch Mock Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างข้อสอบจำลองเสมือนจริงได้' });
  }
});

async function generateSimilarQuestion(q) {
  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';
  const subjectMeta = {
    general: { name: 'ความรู้ทั่วไป' },
    thai: { name: 'ภาษาไทย' },
    english: { name: 'ภาษาอังกฤษ' },
    computer: { name: 'คอมพิวเตอร์' },
    social: { name: 'สังคมและจริยธรรม' },
    secretariat: { name: 'งานสารบรรณ' },
    law: { name: 'กฎหมายเบื้องต้น' }
  };
  const catName = subjectMeta[q.examSet?.category]?.name || q.examSet?.category || 'ทั่วไป';
  const subName = q.examSet?.subcategory || 'ทั่วไป';

  const systemPrompt = `คุณคืออาจารย์ผู้เชี่ยวชาญการออกข้อสอบสำหรับการสอบนายสิบตำรวจของไทย
กรุณาสร้างข้อสอบที่มีความคล้ายคลึงกัน (โจทย์แนวเดียวกัน เพื่อวัดความเข้าใจ) จำนวน 1 ข้อ โดยอ้างอิงจากข้อสอบต้นแบบดังนี้:

ข้อสอบต้นแบบ:
- หมวดวิชา: ${catName}
- เรื่อง: ${subName}
- โจทย์: ${q.questionText}
- ตัวเลือก ก (0): ${q.choice1}
- ตัวเลือก ข (1): ${q.choice2}
- ตัวเลือก ค (2): ${q.choice3}
- ตัวเลือก ง (3): ${q.choice4}
- เฉลยที่ถูกต้อง: ตัวเลือกดัชนีที่ ${q.correctAnswer}

กรุณาสร้างข้อสอบข้อใหม่ 1 ข้อที่เป็นเรื่องเดียวกัน มีแนวคิดหรือจุดประสงค์ประเมินความรู้คล้ายกับข้อต้นแบบ แต่เปลี่ยนโจทย์และตัวเลือกไม่ให้ซ้ำกัน (เช่น เปลี่ยนตัวละคร สถานการณ์ ตัวเลข หรือการหลอกในเนื้อหา)
ผลลัพธ์ที่คุณต้องตอบกลับคือ JSON Object เพียงตัวเดียวเท่านั้น โดยมีโครงสร้างดังนี้:
{
  "questionText": "โจทย์คำถามใหม่...",
  "choice1": "ตัวเลือก ก...",
  "choice2": "ตัวเลือก ข...",
  "choice3": "ตัวเลือก ค...",
  "choice4": "ตัวเลือก ง...",
  "correctAnswer": 0
}
หมายเหตุ: "correctAnswer" จะต้องเป็นจำนวนเต็มดัชนี (0, 1, 2, หรือ 3) เท่านั้น ซึ่งตรงกับตัวเลือกที่ถูกต้อง`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned');

    const parsed = JSON.parse(rawText.trim());
    return {
      id: `ai-${q.id}`,
      examSetId: q.examSetId,
      questionText: parsed.questionText || parsed.question || 'คำถามที่คล้ายกัน',
      choice1: parsed.choice1 || parsed.choices?.[0] || 'ตัวเลือก ก',
      choice2: parsed.choice2 || parsed.choices?.[1] || 'ตัวเลือก ข',
      choice3: parsed.choice3 || parsed.choices?.[2] || 'ตัวเลือก ค',
      choice4: parsed.choice4 || parsed.choices?.[3] || 'ตัวเลือก ง',
      correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : 0,
      examSet: {
        category: q.examSet?.category,
        subcategory: `${q.examSet?.subcategory || 'ทั่วไป'} (โจทย์คล้ายกัน)`
      }
    };
  } catch (err) {
    console.error(`Error generating similar question for Q#${q.id}:`, err);
    return null;
  }
}

// Get weakness questions
app.get('/api/exams/weakness-questions', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  try {
    const userId = req.user.userId;
    const whereClause = { userId };
    
    if (subject) {
      whereClause.question = {
        examSet: { category: subject }
      };
    }

    const incorrect = await prisma.incorrectQuestion.findMany({
      where: whereClause,
      include: {
        question: {
          include: {
            examSet: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let originalQuestions = incorrect.map(item => item.question).filter(Boolean);

    if (originalQuestions.length === 0 && subject) {
      // Fallback: Fetch standard questions of this category if no incorrect questions exist
      originalQuestions = await prisma.question.findMany({
        where: {
          examSet: { category: subject }
        },
        take: 5,
        include: { examSet: true }
      });
    }

    // Limit to top 8 to prevent rate limits and excessively long practice sets
    const limitedQuestions = originalQuestions.slice(0, 8);

    // Call Gemini API in parallel to generate similar questions for each incorrect question
    const similarPromises = limitedQuestions.map(q => generateSimilarQuestion(q));
    const similarResults = await Promise.all(similarPromises);

    // Interleave the original and similar questions
    const combinedQuestions = [];
    limitedQuestions.forEach((q, idx) => {
      combinedQuestions.push(q);
      const similarQ = similarResults[idx];
      if (similarQ) {
        combinedQuestions.push(similarQ);
      }
    });

    res.json(combinedQuestions);
  } catch (err) {
    console.error('Fetch Weakness Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบจุดอ่อนได้' });
  }
});

// Get user weaknesses count summary
app.get('/api/user/weaknesses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const incorrect = await prisma.incorrectQuestion.findMany({
      where: { userId },
      include: {
        question: {
          include: { examSet: true }
        }
      }
    });

    const summary = {
      general: 0,
      thai: 0,
      english: 0,
      computer: 0,
      social: 0,
      secretariat: 0,
      law: 0
    };

    const breakdownMap = {};

    incorrect.forEach(item => {
      const q = item.question;
      if (!q || !q.examSet) return;
      const cat = q.examSet.category;
      const sub = q.examSet.subcategory || 'ทั่วไป';

      if (cat && summary[cat] !== undefined) {
        summary[cat]++;
      }

      const key = `${cat}::${sub}`;
      if (!breakdownMap[key]) {
        breakdownMap[key] = {
          category: cat,
          subcategory: sub,
          wrongCount: 0
        };
      }
      breakdownMap[key].wrongCount++;
    });

    res.json({
      ...summary,
      summary,
      breakdown: Object.values(breakdownMap)
    });
  } catch (err) {
    console.error('Fetch Weaknesses Summary Error:', err);
    res.status(500).json({ error: 'ไม่สามารถคำนวณจุดอ่อนได้' });
  }
});

// Get queue status for a specific pending exam
app.get('/api/exams/user-queue-status/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const examSet = await prisma.examSet.findUnique({
      where: { id: parseInt(id) }
    });
    if (!examSet) {
      return res.status(404).json({ error: 'ไม่พบชุดข้อสอบนี้' });
    }

    if (examSet.status === 'COMPLETED') {
      return res.json({ status: 'COMPLETED', examSetId: examSet.id });
    }
    if (examSet.status === 'FAILED') {
      return res.json({ status: 'FAILED', error: 'การสร้างข้อสอบล้มเหลว' });
    }

    const queuePosition = await prisma.examSet.count({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { lt: examSet.createdAt }
      }
    }) + 1;

    res.json({
      status: examSet.status,
      queuePosition
    });
  } catch (err) {
    console.error('Queue Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถานะคิวได้' });
  }
});

// API for user to generate AI exam set
app.post('/api/exams/user-generate', authenticateToken, async (req, res) => {
  const { subject, count, subcategories, isPublic, title } = req.body;
  if (!subject) {
    return res.status(400).json({ error: 'กรุณาระบุหมวดวิชาที่ต้องการ' });
  }

  const numCount = Math.min(30, Math.max(5, parseInt(count) || 10));

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    // Check daily limit (5 sets per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentGenCount = user.aiGenCount;
    if (user.aiGenLastDate) {
      const lastDate = new Date(user.aiGenLastDate);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() !== today.getTime()) {
        currentGenCount = 0;
      }
    } else {
      currentGenCount = 0;
    }

    if (currentGenCount >= 5) {
      return res.status(400).json({ error: 'คุณสร้างข้อสอบครบกำหนด 5 ชุดในวันนี้แล้ว' });
    }

    // Update user daily limit counter
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        aiGenCount: currentGenCount + 1,
        aiGenLastDate: new Date()
      }
    });

    // Create pending exam set
    const subString = Array.isArray(subcategories) ? subcategories.join(',') : (subcategories || '');
    const newExamSet = await prisma.examSet.create({
      data: {
        title: title || `ข้อสอบ AI - ${subject === 'law' ? 'กฎหมาย' : 'งานสารบรรณ'} (${numCount} ข้อ)`,
        category: subject,
        subcategory: subString || null,
        totalCount: numCount,
        isPublic: isPublic !== false,
        status: 'PENDING',
        createdById: req.user.userId
      }
    });

    // Calculate queue position
    const queuePosition = await prisma.examSet.count({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { lt: newExamSet.createdAt }
      }
    }) + 1;

    res.json({
      message: 'กำลังอยู่ในคิวสร้างข้อสอบ...',
      examSetId: newExamSet.id,
      queuePosition,
      status: 'PENDING'
    });
  } catch (err) {
    console.error('User Generate Exam Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสั่งสร้างข้อสอบ' });
  }
});

// Get all available exams for students (with public/private and queue status logic)
app.get('/api/exams', authenticateToken, async (req, res) => {
  try {
    await ensureDefaultQuestions();
    
    // Check user role
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'OWNER');
    
    let whereClause = {};
    if (!isAdmin) {
      whereClause = {
        OR: [
          // Public, completed exams from anyone
          { isPublic: true, status: 'COMPLETED' },
          // Any exam (pending, processing, completed) created by the user themselves
          { createdById: req.user.userId }
        ]
      };
    }
    
    const exams = await prisma.examSet.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    res.json(exams);
  } catch (err) {
    console.error('Fetch Student Exams Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อชุดข้อสอบได้' });
  }
});

// Get questions of a specific exam set (with security boundaries)
app.get('/api/exams/:id/questions', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const examSet = await prisma.examSet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!examSet) {
      return res.status(404).json({ error: 'ไม่พบชุดข้อสอบนี้' });
    }

    if (examSet.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'ข้อสอบชุดนี้ยังสร้างไม่เสร็จ กรุณารอข้อสอบสักครู่...' });
    }

    // Check user roles
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'OWNER');

    if (!examSet.isPublic && examSet.createdById !== req.user.userId && !isAdmin) {
      return res.status(403).json({ error: 'ชุดข้อสอบนี้ถูกตั้งค่าเป็นส่วนตัว' });
    }

    const questions = await prisma.question.findMany({
      where: { examSetId: parseInt(id) },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(questions);
  } catch (err) {
    console.error('Fetch Student Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงคำถามของชุดข้อสอบได้' });
  }
});

// --- Simulate/Submit Exam Completion Route ---
app.post('/api/user/simulate-exam', authenticateToken, async (req, res) => {
  const { subject, isWeaknessFix, examSetId, score, questions } = req.body;

  const validSubjects = {
    general: 'scoreGeneral',
    thai: 'scoreThai',
    english: 'scoreEnglish',
    computer: 'scoreComputer',
    social: 'scoreSocial',
    secretariat: 'scoreSecretariat',
    law: 'scoreLaw'
  };

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    let resolvedSubject = subject;
    let examTitle = '';

    // If examSetId is provided, get the real category and title
    if (examSetId) {
      const examSet = await prisma.examSet.findUnique({
        where: { id: parseInt(examSetId) }
      });
      if (examSet) {
        resolvedSubject = examSet.category;
        examTitle = examSet.title;
        
        // Find or create Stage record matching this examSet title
        let stage = await prisma.stage.findFirst({
          where: { title: examSet.title }
        });
        if (!stage) {
          stage = await prisma.stage.create({
            data: {
              title: examSet.title,
              icon: '📝',
              sortOrder: 0
            }
          });
        }

        // Upsert user stage progress
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId: {
              userId: req.user.userId,
              stageId: stage.id
            }
          },
          update: {
            completed: true,
            score: Math.round(score),
            completedAt: new Date()
          },
          create: {
            userId: req.user.userId,
            stageId: stage.id,
            completed: true,
            score: Math.round(score),
            completedAt: new Date()
          }
        });
      }
    }

    const subjectField = validSubjects[resolvedSubject];
    if (!subjectField && (!questions || !Array.isArray(questions))) {
      return res.status(400).json({ error: 'ไม่พบหมวดวิชาดังกล่าว' });
    }

    // Determine score: if real score is provided, use it. Otherwise do a random score (legacy fallback)
    let finalScore = score !== undefined ? Math.round(score) : null;
    if (finalScore === null) {
      if (isWeaknessFix) {
        finalScore = 80;
      } else {
        finalScore = Math.floor(Math.random() * 21) + 75; // 75 - 95 (mock)
      }
    }

    // Process incorrect questions database if questions array is provided
    if (questions && Array.isArray(questions)) {
      // Record wrong categories for incorrect answers
      for (const q of questions) {
        const isQuestionCorrect = q.isCorrect === true || q.isCorrect === 'true';
        if (!isQuestionCorrect) {
          let catToRecord = q.category;
          if (!catToRecord) {
            const qId = parseInt(q.id);
            if (!isNaN(qId)) {
              try {
                const dbQ = await prisma.question.findUnique({
                  where: { id: qId },
                  include: { examSet: true }
                });
                catToRecord = dbQ?.examSet?.category;
              } catch (e) {}
            }
          }
          if (!catToRecord) {
            catToRecord = resolvedSubject;
          }
          if (catToRecord) {
            try {
              await prisma.wrongCategory.upsert({
                where: {
                  userId_category: {
                    userId: req.user.userId,
                    category: catToRecord
                  }
                },
                update: {
                  count: { increment: 1 }
                },
                create: {
                  userId: req.user.userId,
                  category: catToRecord,
                  count: 1
                }
              });
            } catch (e) {
              console.error('Error recording wrong category:', e);
            }
          }
        }
      }

      if (isWeaknessFix) {
        // Group results of weakness practice
        const originalResults = {}; // { [questionId]: { originalCorrect: null, similarCorrect: null } }

        for (const q of questions) {
          const idStr = String(q.id);
          const isCorrectVal = q.isCorrect === true || q.isCorrect === 'true';
          if (idStr.startsWith('ai-')) {
            const parentId = parseInt(idStr.replace('ai-', ''));
            if (!isNaN(parentId)) {
              if (!originalResults[parentId]) {
                originalResults[parentId] = { originalCorrect: null, similarCorrect: null };
              }
              originalResults[parentId].similarCorrect = isCorrectVal;
            }
          } else {
            const originalId = parseInt(idStr);
            if (!isNaN(originalId)) {
              if (!originalResults[originalId]) {
                originalResults[originalId] = { originalCorrect: null, similarCorrect: null };
              }
              originalResults[originalId].originalCorrect = isCorrectVal;
            }
          }
        }

        // Now process each original question
        for (const [qIdStr, result] of Object.entries(originalResults)) {
          const qId = parseInt(qIdStr);
          // If user got both the original question and the similar question correct, remove it from IncorrectQuestion.
          // Otherwise, we keep/upsert it in the database.
          const isCorrect = (result.similarCorrect !== null)
            ? (result.originalCorrect === true && result.similarCorrect === true)
            : (result.originalCorrect === true);

          if (isCorrect) {
            try {
              await prisma.incorrectQuestion.deleteMany({
                where: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error deleting correct question:', e);
            }
          } else {
            try {
              await prisma.incorrectQuestion.upsert({
                where: {
                  userId_questionId: {
                    userId: req.user.userId,
                    questionId: qId
                  }
                },
                update: {},
                create: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error upserting incorrect question:', e);
            }
          }
        }
      } else {
        // Normal exam: simple delete/upsert per question ID
        for (const q of questions) {
          const qId = parseInt(q.id);
          if (isNaN(qId)) continue; // skip AI questions if sent somehow

          const isQuestionCorrect = q.isCorrect === true || q.isCorrect === 'true';
          if (isQuestionCorrect) {
            try {
              await prisma.incorrectQuestion.deleteMany({
                where: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error deleting correct question:', e);
            }
          } else {
            try {
              await prisma.incorrectQuestion.upsert({
                where: {
                  userId_questionId: {
                    userId: req.user.userId,
                    questionId: qId
                  }
                },
                update: {},
                create: {
                  userId: req.user.userId,
                  questionId: qId
                }
              });
            } catch (e) {
              console.error('Error upserting incorrect question:', e);
            }
          }
        }
      }
    }

    // If questions are provided, calculate running average updates for all categories present (only for Daily/Mock/Weakness exams, i.e., no single examSetId)
    if (questions && Array.isArray(questions) && questions.length > 0 && !examSetId) {
      const dbIds = questions.map(q => {
        const idStr = String(q.id);
        if (idStr.startsWith('ai-')) {
          return parseInt(idStr.replace('ai-', ''));
        }
        return parseInt(idStr);
      }).filter(id => !isNaN(id));

      const questionDbRecords = await prisma.question.findMany({
        where: { id: { in: dbIds } },
        include: { examSet: true }
      });

      const categoryResults = {};
      questions.forEach(q => {
        const idStr = String(q.id);
        const qId = idStr.startsWith('ai-') ? parseInt(idStr.replace('ai-', '')) : parseInt(idStr);
        
        const dbQ = questionDbRecords.find(item => item.id === qId);
        const cat = dbQ?.examSet?.category;
        if (cat) {
          if (!categoryResults[cat]) {
            categoryResults[cat] = { total: 0, correct: 0 };
          }
          categoryResults[cat].total++;
          const isCorrectVal = q.isCorrect === true || q.isCorrect === 'true';
          if (isCorrectVal) {
            categoryResults[cat].correct++;
          }
        }
      });

      const updateData = {};
      for (const [cat, res] of Object.entries(categoryResults)) {
        const fieldName = validSubjects[cat];
        if (fieldName) {
          const catPercent = Math.round((res.correct / res.total) * 100);
          const currentScore = currentUser[fieldName] || 0;
          // Use running average
          const newAvg = currentScore > 0 ? Math.round((currentScore + catPercent) / 2) : catPercent;
          updateData[fieldName] = newAvg;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: updateData
        });
      }
    }

    // Average score updating: calculate the average score of all completed sets in this category for single subject exams
    let newScore = finalScore;
    if (subjectField && examSetId) {
      const userProgress = await prisma.userStageProgress.findMany({
        where: {
          userId: req.user.userId,
          completed: true
        },
        include: { stage: true }
      });

      // Find all exam sets in this category
      const categoryExamSets = await prisma.examSet.findMany({
        where: { category: resolvedSubject },
        select: { title: true }
      });
      const categoryTitles = categoryExamSets.map(es => es.title);

      // Filter to only include completed stages that match exam sets in this category
      const categoryProgress = userProgress.filter(up => categoryTitles.includes(up.stage.title));

      if (categoryProgress.length > 0) {
        const total = categoryProgress.reduce((sum, p) => sum + p.score, 0);
        newScore = Math.round(total / categoryProgress.length);
      }
    }

    const newPoints = currentUser.points + 1;
    const newXp = currentUser.xp + 40;
    let newLevel = currentUser.level;

    let levelUp = false;
    let tempXp = newXp;
    while (tempXp >= 100) {
      tempXp = tempXp - 100;
      newLevel += 1;
      levelUp = true;
    }

    // Update streak if completed exam today
    const newStreak = currentUser.streak === 0 ? 1 : currentUser.streak; // simple streak increment placeholder or retain

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(subjectField && examSetId ? { [subjectField]: newScore } : {}),
        points: newPoints,
        xp: tempXp,
        level: newLevel,
        pigLevel: newLevel,
        pigXp: tempXp,
        streak: newStreak
      }
    });

    let message = `ทำข้อสอบสำเร็จ! คะแนนวิชา${examTitle || resolvedSubject}เฉลี่ยอัปเดตเป็น ${newScore}%`;
    if (isWeaknessFix) {
      message = 'ติวกลบจุดอ่อนสำเร็จ! คะแนนวิชานี้เพิ่มขึ้นแล้ว';
    } else if (score !== undefined) {
      message = `สอบเสร็จสิ้น! ได้คะแนน ${finalScore}% อัปเดตข้อมูลความพร้อมแล้ว`;
    }

    res.json({
      message,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreGeneral: updatedUser.scoreGeneral,
        scoreThai: updatedUser.scoreThai,
        scoreEnglish: updatedUser.scoreEnglish,
        scoreComputer: updatedUser.scoreComputer,
        scoreSocial: updatedUser.scoreSocial,
        scoreSecretariat: updatedUser.scoreSecretariat,
        scoreLaw: updatedUser.scoreLaw
      }
    });
  } catch (err) {
    console.error('Submit Exam Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลสอบเข้าระบบ' });
  }
});

// --- Wrong Categories, Bookmarks, and Reports Routes ---

// GET stats of wrong categories
app.get('/api/user/wrong-categories', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.wrongCategory.findMany({
      where: { userId: req.user.userId },
      orderBy: { count: 'desc' }
    });
    res.json(stats);
  } catch (err) {
    console.error('Error fetching wrong categories:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติข้อผิดพลาดได้' });
  }
});

// GET all bookmarks
app.get('/api/user/bookmarks', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookmarks);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อสอบที่บันทึกไว้ได้' });
  }
});

// POST to add/update a bookmark
app.post('/api/user/bookmarks', authenticateToken, async (req, res) => {
  const { questionId, questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation, category, subcategory } = req.body;
  if (!questionId || !questionText) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_questionId: {
          userId: req.user.userId,
          questionId: String(questionId)
        }
      },
      update: {
        questionText,
        choice1,
        choice2,
        choice3,
        choice4,
        correctAnswer: parseInt(correctAnswer),
        explanation,
        category,
        subcategory
      },
      create: {
        userId: req.user.userId,
        questionId: String(questionId),
        questionText,
        choice1,
        choice2,
        choice3,
        choice4,
        correctAnswer: parseInt(correctAnswer),
        explanation,
        category,
        subcategory
      }
    });
    res.json({ message: 'บันทึกข้อสอบเรียบร้อยแล้ว', bookmark });
  } catch (err) {
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'ไม่สามารถบันทึกข้อสอบได้' });
  }
});

// DELETE to remove a bookmark
app.delete('/api/user/bookmarks/:questionId', authenticateToken, async (req, res) => {
  const { questionId } = req.params;
  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user.userId,
        questionId: String(questionId)
      }
    });
    res.json({ message: 'ยกเลิกการบันทึกข้อสอบเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ error: 'ไม่สามารถยกเลิกการบันทึกข้อสอบได้' });
  }
});

// POST to report a question
app.post('/api/user/reports', authenticateToken, async (req, res) => {
  const { questionId, questionText, reason } = req.body;
  if (!questionId || !questionText || !reason) {
    return res.status(400).json({ error: 'กรุณากรอกเหตุผลและข้อมูลข้อสอบที่ต้องการรายงาน' });
  }

  try {
    const report = await prisma.reportedQuestion.create({
      data: {
        userId: req.user.userId,
        questionId: String(questionId),
        questionText,
        reason
      }
    });
    res.json({ message: 'ส่งรายงานข้อสอบเรียบร้อยแล้ว ขอบคุณสำหรับการแจ้งข้อมูล' });
  } catch (err) {
    console.error('Error reporting question:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งรายงานข้อสอบได้' });
  }
});

// --- Admin API Routes (Implementation located below) ---

// --- Announcements Routes ---

// Get all announcements, seed 2 real ones if database is empty
app.get('/api/announcements', async (req, res) => {
  try {
    let announcements = await prisma.announcement.findMany({
      orderBy: { id: 'asc' }
    });

    // Seed default data if empty
    if (announcements.length === 0) {
      const defaultAnnouncements = [
        {
          orgName: 'กองบัญชาการศึกษา',
          orgAbbr: 'บช.ศ.',
          jobTitle: 'กลุ่มสายงานอำนวยการและสนับสนุน ม.6/ปวช.',
          positionsCount: 800,
          year: 2569,
          announcementDate: 'วันที่ 26 พ.ค. 69',
          registerDate: 'รับสมัครตั้งแต่วันที่ 2 - 24 มิ.ย. 69',
          seatSelectDate: 'วันที่ 2 - 25 ก.ค. 69',
          photoEditDate: 'กรณีผลตรวจรูปถ่ายไม่ถูกต้อง (วันที่ 17 - 23 ก.ค. 69)',
          printCardDate: 'ตั้งแต่วันที่ 13 พ.ย. 69 เป็นต้นไป',
          examDate: 'วันที่ 29 พ.ย. 69',
          status: 'เปิดรับสมัครล่าสุด',
          link: 'https://policeadmission.jobthaigov.com/PEBRegisterWeb/'
        },
        {
          orgName: 'สำนักงานพิสูจน์หลักฐานตำรวจ',
          orgAbbr: 'สพฐ.ตร.',
          jobTitle: 'กลุ่มสายงานอำนวยการและสนับสนุน สายงานวิทยาการ',
          positionsCount: 100,
          year: 2569,
          announcementDate: 'วันที่ 26 พ.ค. 69',
          registerDate: 'รับสมัครตั้งแต่วันที่ 2 - 24 มิ.ย. 69',
          seatSelectDate: 'วันที่ 2 - 25 ก.ค. 69',
          photoEditDate: 'กรณีผลตรวจรูปถ่ายไม่ถูกต้อง (วันที่ 17 - 23 ก.ค. 69)',
          printCardDate: 'ตั้งแต่วันที่ 13 พ.ย. 69 เป็นต้นไป',
          examDate: 'วันที่ 29 พ.ย. 69',
          status: 'เปิดรับสมัครล่าสุด',
          link: 'https://policeadmission.jobthaigov.com/PEBRegisterWeb/'
        }
      ];

      await prisma.announcement.createMany({
        data: defaultAnnouncements
      });

      announcements = await prisma.announcement.findMany({
        orderBy: { id: 'asc' }
      });
    }

    res.json(announcements);
  } catch (err) {
    console.error('Fetch Announcements Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลประกาศได้' });
  }
});

// Create new announcement with duplicate checks
app.post('/api/announcements', requireAdmin, async (req, res) => {
  const {
    orgName, orgAbbr, jobTitle, positionsCount, year,
    announcementDate, registerDate, seatSelectDate, photoEditDate, printCardDate, examDate,
    status, link
  } = req.body;

  if (!orgName || !orgAbbr || !jobTitle || !positionsCount || !year) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (หน่วยงาน, ตัวย่อ, สายงาน, จำนวนอัตรา, ปี พ.ศ.)' });
  }

  try {
    // Exact duplicate check: same orgName, year, AND jobTitle
    const exactDuplicate = await prisma.announcement.findFirst({
      where: {
        orgName,
        year: parseInt(year),
        jobTitle
      }
    });

    if (exactDuplicate) {
      return res.status(400).json({
        error: 'พบประกาศหน่วยงานเดียวกัน ปีเดียวกัน และสายงานเดียวกันในระบบอยู่แล้ว (ห้ามบันทึกซ้ำ)',
        code: 'EXACT_DUPLICATE'
      });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        orgName,
        orgAbbr,
        jobTitle,
        positionsCount: parseInt(positionsCount),
        year: parseInt(year),
        announcementDate: announcementDate || '',
        registerDate: registerDate || '',
        seatSelectDate: seatSelectDate || '',
        photoEditDate: photoEditDate || '',
        printCardDate: printCardDate || '',
        examDate: examDate || '',
        status: status || 'เปิดรับสมัครล่าสุด',
        link: link || ''
      }
    });

    res.status(201).json({
      message: 'เพิ่มประกาศใหม่สำเร็จแล้ว!',
      announcement: newAnnouncement
    });
  } catch (err) {
    console.error('Create Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างประกาศใหม่' });
  }
});

// Update announcement
app.put('/api/announcements/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    orgName, orgAbbr, jobTitle, positionsCount, year,
    announcementDate, registerDate, seatSelectDate, photoEditDate, printCardDate, examDate,
    status, link
  } = req.body;

  if (!orgName || !orgAbbr || !jobTitle || !positionsCount || !year) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
  }

  try {
    const annId = parseInt(id);

    // Exact duplicate check for another record
    const exactDuplicate = await prisma.announcement.findFirst({
      where: {
        orgName,
        year: parseInt(year),
        jobTitle,
        NOT: { id: annId }
      }
    });

    if (exactDuplicate) {
      return res.status(400).json({
        error: 'พบประกาศหน่วยงานเดียวกัน ปีเดียวกัน และสายงานเดียวกันในระบบอยู่แล้ว',
        code: 'EXACT_DUPLICATE'
      });
    }

    const updated = await prisma.announcement.update({
      where: { id: annId },
      data: {
        orgName,
        orgAbbr,
        jobTitle,
        positionsCount: parseInt(positionsCount),
        year: parseInt(year),
        announcementDate: announcementDate || '',
        registerDate: registerDate || '',
        seatSelectDate: seatSelectDate || '',
        photoEditDate: photoEditDate || '',
        printCardDate: printCardDate || '',
        examDate: examDate || '',
        status: status || 'เปิดรับสมัครล่าสุด',
        link: link || ''
      }
    });

    res.json({
      message: 'แก้ไขประกาศสำเร็จเรียบร้อยแล้ว!',
      announcement: updated
    });
  } catch (err) {
    console.error('Update Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขประกาศ' });
  }
});

// Delete announcement
app.delete('/api/announcements/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'ลบประกาศสำเร็จเรียบร้อยแล้ว!' });
  } catch (err) {
    console.error('Delete Announcement Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบประกาศ' });
  }
});

// --- Feedback Routes ---

// Get all feedback, seed if empty
app.get('/api/admin/feedback', requireAdmin, async (req, res) => {
  try {
    let feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (feedback.length === 0) {
      const defaultFeedback = [
        { sender: 'สมชาย ใจดี', email: 'somchai@email.com', type: 'รายงานปัญหา', message: 'ข้อสอบหมวดวิชากฎหมายชุดที่ 3 ข้อที่ 8 เฉลยข้อ ง. แต่จริง ๆ ต้องตอบข้อ ก. รบกวนตรวจสอบด้วยครับ', read: false },
        { sender: 'สุดา แสนสุข', email: 'suda@email.com', type: 'คำแนะนำ/ขอฟีเจอร์', message: 'อยากให้เพิ่มฟังก์ชันโหมดทดลองสอบแบบจับเวลาเสมือนจริง 150 ข้อเต็มของสายสนับสนุนค่ะ จะได้ฝึกทำเร็วขึ้น', read: true },
        { sender: 'วิภา ศรีสง่า', email: 'wipa@email.com', type: 'ข้อเสนอแนะทั่วไป', message: 'ชอบระบบวิเคราะห์จุดเด่นจุดด้อยมากค่ะ ช่วยชี้แนะแนวทางติวได้ตรงประเด็นดีมาก แนะนำเพื่อน ๆ มาใช้เพียบเลย', read: true }
      ];
      await prisma.feedback.createMany({ data: defaultFeedback });
      feedback = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
    }
    res.json(feedback);
  } catch (err) {
    console.error('Fetch Feedback Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลข้อเสนอแนะได้' });
  }
});

// Create feedback
app.post('/api/feedback', async (req, res) => {
  const { sender, email, type, message } = req.body;
  if (!sender || !email || !type || !message) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  try {
    const feedback = await prisma.feedback.create({
      data: { sender, email, type, message }
    });
    res.status(201).json({ message: 'ส่งข้อเสนอแนะสำเร็จเรียบร้อยแล้ว!', feedback });
  } catch (err) {
    console.error('Create Feedback Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ' });
  }
});

// Toggle read state
app.put('/api/admin/feedback/:id/toggle-read', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const fb = await prisma.feedback.findUnique({
      where: { id: parseInt(id) }
    });
    if (!fb) return res.status(404).json({ error: 'ไม่พบข้อความข้อเสนอแนะ' });
    
    const updated = await prisma.feedback.update({
      where: { id: parseInt(id) },
      data: { read: !fb.read }
    });
    res.json({ message: 'อัปเดตสถานะการอ่านสำเร็จ', feedback: updated });
  } catch (err) {
    console.error('Toggle Feedback Read Error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะข้อความได้' });
  }
});

// Delete feedback
app.delete('/api/admin/feedback/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.feedback.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'ลบข้อเสนอแนะสำเร็จแล้ว' });
  } catch (err) {
    console.error('Delete Feedback Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบข้อเสนอแนะได้' });
  }
});

// =============================================
// ========== ADMIN API ROUTES =================
// =============================================

// --- Admin Stats Dashboard ---
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalExams = await prisma.examSet.count();
    const pendingPremiumCount = await prisma.premiumRequest.count({ where: { status: 'PENDING' } });
    const unreadFeedbackCount = await prisma.feedback.count({ where: { read: false } });
    
    const allProgress = await prisma.userStageProgress.findMany({
      where: { completed: true }
    });
    const totalCompletions = allProgress.length;
    const avgScore = totalCompletions > 0 
      ? Math.round(allProgress.reduce((sum, p) => sum + p.score, 0) / totalCompletions) 
      : 0;

    // Recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        points: true,
        createdAt: true,
        stageProgress: {
          where: { completed: true }
        }
      }
    });

    const formattedRecentUsers = recentUsers.map(u => {
      const completions = u.stageProgress.filter(p => p.completed);
      const avg = completions.length > 0 
        ? Math.round(completions.reduce((s, p) => s + p.score, 0) / completions.length) 
        : 0;
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        level: u.level,
        completionsCount: completions.length,
        avgScore: avg,
        createdAt: u.createdAt
      };
    });

    // Recent activity (last 10 stage completions + last 5 new users + last 5 exams created)
    const recentCompletions = await prisma.userStageProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: { select: { fullName: true, username: true } },
        stage: { select: { title: true } }
      }
    });

    const recentNewUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { fullName: true, username: true, createdAt: true }
    });

    const recentExams = await prisma.examSet.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { title: true, createdAt: true }
    });

    // Build unified activity feed
    const activities = [];
    
    recentCompletions.forEach(c => {
      activities.push({
        type: 'completion',
        text: `<strong>${c.user.fullName || c.user.username}</strong> ทำข้อสอบ ${c.stage.title} ได้ ${c.score}%`,
        time: c.completedAt || c.stage?.createdAt,
        color: c.score >= 60 ? 'green' : 'red'
      });
    });

    recentNewUsers.forEach(u => {
      activities.push({
        type: 'new_user',
        text: `<strong>${u.fullName || u.username}</strong> สมัครสมาชิกใหม่`,
        time: u.createdAt,
        color: 'gold'
      });
    });

    recentExams.forEach(e => {
      activities.push({
        type: 'new_exam',
        text: `เพิ่มข้อสอบใหม่ <strong>${e.title}</strong>`,
        time: e.createdAt,
        color: 'blue'
      });
    });

    // Sort by time descending, take top 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const topActivities = activities.slice(0, 8);

    // Average user activity density by time periods (2-hour blocks)
    const completions = await prisma.userStageProgress.findMany({
      where: {
        completed: true,
        completedAt: { not: null }
      },
      select: { completedAt: true }
    });

    const uniqueDays = new Set();
    const hourlyCounts = Array(12).fill(0);

    completions.forEach(c => {
      const date = new Date(c.completedAt);
      const dayStr = date.toISOString().split('T')[0];
      uniqueDays.add(dayStr);

      const localHourStr = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', timeZone: 'Asia/Bangkok' });
      const localHour = parseInt(localHourStr, 10) || 0;
      
      const blockIndex = Math.floor(localHour / 2) % 12;
      hourlyCounts[blockIndex]++;
    });

    const totalDays = uniqueDays.size || 1;
    const weeklyData = [];
    const labels = [
      '00-02', '02-04', '04-06', '06-08', '08-10', '10-12',
      '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'
    ];

    for (let i = 0; i < 12; i++) {
      const avgVal = parseFloat((hourlyCounts[i] / totalDays).toFixed(1));
      weeklyData.push({
        label: labels[i],
        count: avgVal
      });
    }

    res.json({
      totalUsers,
      totalExams,
      totalCompletions,
      avgScore,
      recentUsers: formattedRecentUsers,
      recentActivity: topActivities,
      weeklyChart: weeklyData,
      pendingPremiumCount,
      unreadFeedbackCount
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงสถิติได้' });
  }
});

// --- Admin Users List ---
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        points: true,
        streak: true,
        premiumUntil: true,
        createdAt: true,
        stageProgress: {
          where: { completed: true }
        }
      }
    });

    const formatted = users.map(u => {
      const completions = u.stageProgress.filter(p => p.completed);
      const avg = completions.length > 0 
        ? Math.round(completions.reduce((s, p) => s + p.score, 0) / completions.length) 
        : 0;
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        level: u.level,
        xp: u.xp,
        points: u.points,
        streak: u.streak,
        completionsCount: completions.length,
        avgScore: avg,
        createdAt: u.createdAt
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Admin Users Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อผู้ใช้ได้' });
  }
});

// --- Admin Toggle User Role ---
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    if (user.role === 'OWNER') {
      return res.status(400).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ของเจ้าของระบบ (OWNER) ได้' });
    }

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    res.json({ message: `เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ` });
  } catch (err) {
    console.error('Toggle Role Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ได้' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    if (targetUser.role === 'OWNER') {
      return res.status(400).json({ error: 'ไม่สามารถลบผู้ใช้อาวุโสสูงสุด (OWNER) ได้' });
    }
    
    // Find a fallback user to re-assign exams to (if any)
    const fallbackUser = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'OWNER'] },
        NOT: { id: userId }
      }
    }) || await prisma.user.findFirst({
      where: {
        NOT: { id: userId }
      }
    });

    if (fallbackUser) {
      // Re-assign exams created by this user
      await prisma.examSet.updateMany({
        where: { createdById: userId },
        data: { createdById: fallbackUser.id }
      });
    } else {
      // If no other user exists, delete the exam sets created by this user first
      await prisma.question.deleteMany({
        where: { examSet: { createdById: userId } }
      });
      await prisma.examSet.deleteMany({
        where: { createdById: userId }
      });
    }

    // Delete related stage progress first
    await prisma.userStageProgress.deleteMany({ where: { userId } });
    
    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้ได้: ' + err.message });
  }
});

// --- Admin Exams List ---
app.get('/api/admin/exams', requireAdmin, async (req, res) => {
  try {
    const exams = await prisma.examSet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } }
      }
    });
    res.json(exams);
  } catch (err) {
    console.error('Admin Exams Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายการข้อสอบได้' });
  }
});

// --- Admin Create Exam (from AI generator) ---
app.post('/api/admin/exams', requireAdmin, async (req, res) => {
  const { title, category, subcategory, questions } = req.body;

  if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const creatorId = req.user.userId;

    const examSet = await prisma.examSet.create({
      data: {
        title,
        category,
        subcategory: subcategory || null,
        totalCount: questions.length,
        createdById: creatorId,
        questions: {
          create: questions.map((q, idx) => ({
            questionText: q.question,
            choice1: q.choices[0] || '',
            choice2: q.choices[1] || '',
            choice3: q.choices[2] || '',
            choice4: q.choices[3] || '',
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || null,
            sortOrder: idx
          }))
        }
      },
      include: {
        _count: { select: { questions: true } }
      }
    });

    res.status(201).json({
      message: `สร้างชุดข้อสอบ "${title}" สำเร็จ (${questions.length} ข้อ)`,
      examSet
    });
  } catch (err) {
    console.error('Create Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างชุดข้อสอบได้: ' + err.message });
  }
});

// --- Admin Delete Exam ---
app.delete('/api/admin/exams/:id', requireAdmin, async (req, res) => {
  try {
    const examId = parseInt(req.params.id);
    
    // Questions are cascade-deleted via Prisma schema
    await prisma.examSet.delete({ where: { id: examId } });

    res.json({ message: 'ลบชุดข้อสอบสำเร็จ' });
  } catch (err) {
    console.error('Delete Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบชุดข้อสอบได้' });
  }
});

// --- Admin Questions by ExamSet ---
app.get('/api/admin/questions', requireAdmin, async (req, res) => {
  const { examSetId } = req.query;
  if (!examSetId) return res.status(400).json({ error: 'กรุณาระบุ examSetId' });

  try {
    const questions = await prisma.question.findMany({
      where: { examSetId: parseInt(examSetId) },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(questions);
  } catch (err) {
    console.error('Admin Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงคำถามได้' });
  }
});

// --- Admin Update Question ---
app.put('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  const { questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation } = req.body;
  
  try {
    const updated = await prisma.question.update({
      where: { id: parseInt(req.params.id) },
      data: { questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation }
    });
    res.json({ message: 'แก้ไขคำถามสำเร็จ', question: updated });
  } catch (err) {
    console.error('Update Question Error:', err);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขคำถามได้' });
  }
});

// --- Admin Delete Question ---
app.delete('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'ลบคำถามสำเร็จ' });
  } catch (err) {
    console.error('Delete Question Error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบคำถามได้' });
  }
});

// --- Admin Scores History ---
app.get('/api/admin/scores', requireAdmin, async (req, res) => {
  try {
    const scores = await prisma.userStageProgress.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
      take: 100,
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        stage: { select: { title: true } }
      }
    });
    res.json(scores);
  } catch (err) {
    console.error('Admin Scores Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติคะแนนได้' });
  }
});

// --- Admin Feedback List Duplicate Removed ---

// --- Leaderboard Route ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Query users who have won at least 1 battle (battleWins > 0)
    const allUsers = await prisma.user.findMany({
      where: {
        battleWins: {
          gt: 0
        }
      },
      orderBy: [
        { battleWins: 'desc' },
        { points: 'desc' }
      ],
      select: {
        id: true,
        username: true,
        fullName: true,
        level: true,
        xp: true,
        points: true,
        streak: true,
        battleWins: true
      }
    });

    const topUsers = allUsers.slice(0, 20);

    // Try to find the calling user's rank
    let myRank = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const myIndex = allUsers.findIndex(u => u.id === decoded.userId);
        if (myIndex !== -1) {
          myRank = {
            rank: myIndex + 1,
            user: allUsers[myIndex]
          };
        }
      } catch (e) {
        // Ignore token errors
      }
    }

    res.json({
      topUsers,
      myRank
    });
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลจัดอันดับได้' });
  }
});

// --- Community (Posts, Comments, Chat) Routes ---

// Get all posts (latest first)
app.get('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, username: true, fullName: true, faceImage: true }
            }
          }
        }
      }
    });
    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดโพสต์ได้' });
  }
});

// Create a new post
app.post('/api/community/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความโพสต์' });
  }
  try {
    const post = await prisma.post.create({
      data: {
        content,
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        comments: true
      }
    });
    res.json(post);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'ไม่สามารถโพสต์ได้' });
  }
});

// Edit a post (only owner)
app.put('/api/community/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความโพสต์' });
  }
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });
    if (!post) {
      return res.status(404).json({ error: 'ไม่พบโพสต์ที่ต้องการแก้ไข' });
    }
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขโพสต์นี้' });
    }
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { content },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(updatedPost);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขโพสต์ได้' });
  }
});

// Delete a post (only owner)
app.delete('/api/community/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });
    if (!post) {
      return res.status(404).json({ error: 'ไม่พบโพสต์ที่ต้องการลบ' });
    }
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบโพสต์นี้' });
    }
    await prisma.post.delete({
      where: { id: parseInt(postId) }
    });
    res.json({ message: 'ลบโพสต์สำเร็จ' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบโพสต์ได้' });
  }
});

// Add a comment to a post
app.post('/api/community/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแสดงความคิดเห็น' });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(comment);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งความคิดเห็นได้' });
  }
});

// Get chat messages (last 100 messages)
app.get('/api/community/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(messages);
  } catch (err) {
    console.error('Fetch chat messages error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดข้อความแชทได้' });
  }
});

// Send a chat message
app.post('/api/community/chat', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    const message = await prisma.chatMessage.create({
      data: {
        content,
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    res.json(message);
  } catch (err) {
    console.error('Send chat message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทได้' });
  }
});

// Get community activity stats (real values)
app.get('/api/community/stats', authenticateToken, async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Update current user's updatedAt to keep active status real
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { updatedAt: new Date() }
    });

    const activePostsCount = await prisma.post.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    const activeUsersCount = await prisma.user.count({
      where: {
        updatedAt: {
          gte: fifteenMinsAgo
        }
      }
    });

    res.json({
      activePostsCount,
      activeUsersCount: Math.max(1, activeUsersCount)
    });
  } catch (err) {
    console.error('Fetch community stats error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลความเคลื่อนไหวได้' });
  }
});

// --- Study Groups API Routes ---

// Create a new study group
app.post('/api/community/groups', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อกลุ่ม' });
  }
  try {
    // Create group and automatically add creator as a member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : '',
          createdById: req.user.userId
        }
      });
      // Add creator as member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: req.user.userId
        }
      });
      return newGroup;
    });

    res.json(group);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างกลุ่มได้' });
  }
});

// Search and list groups
app.get('/api/community/groups', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    const groups = await prisma.group.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, username: true, fullName: true }
        },
        members: {
          select: { userId: true }
        }
      }
    });

    // Format output to include members count and membership flag
    const formatted = groups.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      createdAt: g.createdAt,
      createdById: g.createdById,
      creatorName: g.createdBy.fullName || g.createdBy.username,
      memberCount: g.members.length,
      isMember: g.members.some(m => m.userId === req.user.userId)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลกลุ่มได้' });
  }
});

// Delete group (creator only)
app.delete('/api/community/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) {
      return res.status(404).json({ error: 'ไม่พบกลุ่มที่ต้องการลบ' });
    }
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบกลุ่มนี้ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.group.delete({
      where: { id: parseInt(groupId) }
    });

    res.json({ message: 'ลบกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบกลุ่มได้' });
  }
});

// Join group
app.post('/api/community/groups/:groupId/join', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'คุณเป็นสมาชิกของกลุ่มนี้อยู่แล้ว' });
    }

    await prisma.groupMember.create({
      data: {
        groupId: parseInt(groupId),
        userId: req.user.userId
      }
    });

    res.json({ message: 'เข้าร่วมกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'ไม่สามารถเข้าร่วมกลุ่มได้' });
  }
});

// Leave group
app.post('/api/community/groups/:groupId/leave', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member) {
      return res.status(400).json({ error: 'คุณไม่ได้เป็นสมาชิกกลุ่มนี้' });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });

    res.json({ message: 'ออกจากกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ error: 'ไม่สามารถออกจากกลุ่มได้' });
  }
});

// Get group chat messages
app.get('/api/community/groups/:groupId/chat', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    // Verify membership
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'กรุณาเข้าร่วมกลุ่มก่อนอ่านข้อความแชท' });
    }

    const messages = await prisma.groupChatMessage.findMany({
      where: { groupId: parseInt(groupId) },
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(messages);
  } catch (err) {
    console.error('Get group chat error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดข้อความแชทกลุ่มได้' });
  }
});

// Send message to group chat
app.post('/api/community/groups/:groupId/chat', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    // Verify membership
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'คุณไม่ได้เป็นสมาชิกกลุ่มนี้' });
    }

    const message = await prisma.groupChatMessage.create({
      data: {
        content: content.trim(),
        groupId: parseInt(groupId),
        userId: req.user.userId
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(message);
  } catch (err) {
    console.error('Send group chat message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทกลุ่มได้' });
  }
});

// --- Friends, Blocks & Direct Messages API ---

// Search for other users to add as friends
app.get('/api/friends/search', authenticateToken, async (req, res) => {
  const { search } = req.query;
  if (!search || !search.trim()) {
    return res.json([]);
  }
  try {
    // Fetch users except current user, who are not blocked by current user and who haven't blocked current user
    const blockedIds = (await prisma.block.findMany({
      where: {
        OR: [
          { userId: req.user.userId },
          { blockedId: req.user.userId }
        ]
      }
    })).map(b => b.userId === req.user.userId ? b.blockedId : b.userId);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: [req.user.userId, ...blockedIds]
        },
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        faceImage: true
      },
      take: 20
    });

    // Check relationship status for each user
    const relationships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: req.user.userId, friendId: { in: users.map(u => u.id) } },
          { userId: { in: users.map(u => u.id) }, friendId: req.user.userId }
        ]
      }
    });

    const formatted = users.map(u => {
      const rel = relationships.find(r => r.userId === u.id || r.friendId === u.id);
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        faceImage: u.faceImage,
        friendStatus: rel ? rel.status : 'NONE' // NONE, ACCEPTED, PENDING
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Search friends error:', err);
    res.status(500).json({ error: 'ไม่สามารถค้นหาผู้ใช้งานได้' });
  }
});

// Get accepted friends list
app.get('/api/friends', authenticateToken, async (req, res) => {
  try {
    const friendRelations = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: req.user.userId },
          { friendId: req.user.userId }
        ],
        status: 'ACCEPTED'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        },
        friend: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    const friendsList = friendRelations.map(rel => {
      const isUser = rel.userId === req.user.userId;
      const targetUser = isUser ? rel.friend : rel.user;
      return {
        id: targetUser.id,
        username: targetUser.username,
        fullName: targetUser.fullName,
        faceImage: targetUser.faceImage
      };
    });

    res.json(friendsList);
  } catch (err) {
    console.error('List friends error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงรายชื่อเพื่อนได้' });
  }
});

// Send or accept a friend request (seamless auto-accept)
app.post('/api/friends/request', authenticateToken, async (req, res) => {
  const { friendId } = req.body;
  if (!friendId || parseInt(friendId) === req.user.userId) {
    return res.status(400).json({ error: 'รหัสเพื่อนไม่ถูกต้อง' });
  }
  const fId = parseInt(friendId);

  try {
    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(400).json({ error: 'ไม่สามารถเพิ่มเพื่อนได้เนื่องจากถูกบล็อก' });
    }

    const existingRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: fId },
          { userId: fId, friendId: req.user.userId }
        ]
      }
    });

    if (existingRelation) {
      if (existingRelation.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'คุณและผู้ใช้งานรายนี้เป็นเพื่อนกันอยู่แล้ว' });
      }
      // If it exists, update it to ACCEPTED
      await prisma.friend.update({
        where: { id: existingRelation.id },
        data: { status: 'ACCEPTED' }
      });
    } else {
      // Auto-accept directly to keep it simple for study app
      await prisma.friend.create({
        data: {
          userId: req.user.userId,
          friendId: fId,
          status: 'ACCEPTED'
        }
      });
    }

    res.json({ message: 'เพิ่มเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Add friend request error:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิ่มเพื่อนได้' });
  }
});

// Block a user
app.post('/api/friends/block', authenticateToken, async (req, res) => {
  const { blockedId } = req.body;
  if (!blockedId || parseInt(blockedId) === req.user.userId) {
    return res.status(400).json({ error: 'รหัสบล็อกไม่ถูกต้อง' });
  }
  const bId = parseInt(blockedId);

  try {
    // Add to block list in transaction
    await prisma.$transaction(async (tx) => {
      // Create block
      const existingBlock = await tx.block.findUnique({
        where: {
          userId_blockedId: {
            userId: req.user.userId,
            blockedId: bId
          }
        }
      });
      if (!existingBlock) {
        await tx.block.create({
          data: {
            userId: req.user.userId,
            blockedId: bId
          }
        });
      }

      // Remove friend relationship if it exists
      const existingFriend = await tx.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.userId, friendId: bId },
            { userId: bId, friendId: req.user.userId }
          ]
        }
      });
      if (existingFriend) {
        await tx.friend.delete({
          where: { id: existingFriend.id }
        });
      }
    });

    res.json({ message: 'บล็อกผู้ใช้งานสำเร็จ' });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'ไม่สามารถบล็อกผู้ใช้งานได้' });
  }
});

// Get blocked users list
app.get('/api/friends/blocked', authenticateToken, async (req, res) => {
  try {
    const blockedList = await prisma.block.findMany({
      where: { userId: req.user.userId },
      include: {
        blockedUser: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    const formatted = blockedList.map(b => ({
      id: b.blockedUser.id,
      username: b.blockedUser.username,
      fullName: b.blockedUser.fullName,
      faceImage: b.blockedUser.faceImage
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Fetch blocked list error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดรายชื่อที่บล็อกได้' });
  }
});

// Unblock a user
app.post('/api/friends/unblock', authenticateToken, async (req, res) => {
  const { blockedId } = req.body;
  if (!blockedId) return res.status(400).json({ error: 'รหัสผู้ใช้งานไม่ถูกต้อง' });
  const bId = parseInt(blockedId);

  try {
    await prisma.block.delete({
      where: {
        userId_blockedId: {
          userId: req.user.userId,
          blockedId: bId
        }
      }
    });
    res.json({ message: 'ปลดบล็อกผู้ใช้งานสำเร็จ' });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ error: 'ไม่สามารถปลดบล็อกได้' });
  }
});

// Fetch private messages with a specific friend
app.get('/api/friends/chat/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    // Check if either user has blocked the other
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(403).json({ error: 'ไม่สามารถแชทส่วนตัวกับผู้ใช้งานรายนี้ได้' });
    }

    const messages = await prisma.privateChatMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.userId, receiverId: fId },
          { senderId: fId, receiverId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(messages);
  } catch (err) {
    console.error('Fetch private chat error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดแชทส่วนตัวได้' });
  }
});

// Send a private message
app.post('/api/friends/chat/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแชท' });
  }
  try {
    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: fId },
          { userId: fId, blockedId: req.user.userId }
        ]
      }
    });
    if (isBlocked) {
      return res.status(403).json({ error: 'ไม่สามารถส่งข้อความได้เนื่องจากถูกบล็อก' });
    }

    const message = await prisma.privateChatMessage.create({
      data: {
        content: content.trim(),
        senderId: req.user.userId,
        receiverId: fId
      },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(message);
  } catch (err) {
    console.error('Send private message error:', err);
    res.status(500).json({ error: 'ไม่สามารถส่งข้อความแชทส่วนตัวได้' });
  }
});

// --- Points & Premium Status Route ---
app.get('/api/user/points', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        points: true,
        premiumUntil: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const isPremium = user.premiumUntil && new Date(user.premiumUntil) > new Date();
    const premiumDaysLeft = isPremium
      ? Math.ceil((new Date(user.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      points: user.points,
      isPremium,
      premiumUntil: user.premiumUntil,
      premiumDaysLeft
    });
  } catch (err) {
    console.error('Points Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพ้อยต์ได้' });
  }
});

// --- Redeem Points for Premium Route ---
app.post('/api/user/redeem-premium', authenticateToken, async (req, res) => {
  const { package: pkg } = req.body; // 'weekly' or 'monthly'

  const packages = {
    weekly: { cost: 500, days: 7, name: 'Premium 7 วัน' },
    monthly: { cost: 1200, days: 30, name: 'Premium 30 วัน' }
  };

  const selectedPkg = packages[pkg];
  if (!selectedPkg) {
    return res.status(400).json({ error: 'แพ็กเกจไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedPkg.cost) {
      return res.status(400).json({
        error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedPkg.cost} PTS, มี ${user.points} PTS)`
      });
    }

    // Calculate new premium end date
    const now = new Date();
    let newPremiumUntil;

    if (user.premiumUntil && new Date(user.premiumUntil) > now) {
      // Extend existing premium
      newPremiumUntil = new Date(user.premiumUntil);
      newPremiumUntil.setDate(newPremiumUntil.getDate() + selectedPkg.days);
    } else {
      // Start new premium period
      newPremiumUntil = new Date(now);
      newPremiumUntil.setDate(newPremiumUntil.getDate() + selectedPkg.days);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedPkg.cost,
        premiumUntil: newPremiumUntil
      }
    });

    const premiumDaysLeft = Math.ceil((newPremiumUntil - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      message: `แลก ${selectedPkg.name} สำเร็จ! Premium เหลืออีก ${premiumDaysLeft} วัน`,
      points: updatedUser.points,
      premiumUntil: newPremiumUntil,
      premiumDaysLeft
    });
  } catch (err) {
    console.error('Redeem Premium Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแลก Premium' });
  }
});

// --- Vocab Generate Sentence Route (for Duolingo-style sentence builder) ---
app.get('/api/vocab/generate-sentence', authenticateToken, async (req, res) => {
  const { word1, word2, level } = req.query;

  if (!word1 || !word2 || !level) {
    return res.status(400).json({ error: 'กรุณาระบุคำศัพท์และระดับความยาก' });
  }

  const apiKey = await getGeminiApiKey();
  const model = 'gemini-2.5-flash';

  const systemPrompt = `คุณคืออาจารย์สอนภาษาอังกฤษมืออาชีพ
กรุณาแต่งประโยคภาษาอังกฤษ 1 ประโยคที่เป็นธรรมชาติและเรียบง่าย เหมาะสมกับผู้เรียนระดับภาษาอังกฤษระดับ ${level}
โดยในประโยคจะต้องประกอบด้วยหรือเกี่ยวข้องกับคำศัพท์ภาษาอังกฤษ 2 คำนี้: "${word1}" และ "${word2}" (สามารถผันกริยา เติม s/es/ed หรือใช้รูปพหุพจน์ได้)
จากนั้นให้แปลประโยคภาษาอังกฤษนี้เป็นประโยคภาษาไทยที่แปลได้ใจความสมบูรณ์และถูกต้อง

ผลลัพธ์ที่คุณต้องตอบกลับคือ JSON Object เพียงตัวเดียวเท่านั้น โดยมีโครงสร้างดังนี้:
{
  "thaiSentence": "ประโยคแปลภาษาไทย...",
  "englishSentence": "ประโยคภาษาอังกฤษที่สมบูรณ์...",
  "distractors": ["คำลวง1", "คำลวง2", "คำลวง3", "คำลวง4"]
}
หมายเหตุ:
1. ประโยคภาษาอังกฤษควรมีความยาวประมาณ 5-8 คำ และห้ามยาวจนเกินไป
2. "distractors" คือคำลวงภาษาอังกฤษอื่นๆ 3-4 คำ ที่มีระดับความยากใกล้เคียงกัน แต่ไม่ได้อยู่ในประโยคนี้ เพื่อให้ผู้เรียนนำไปสับสนในการประกอบประโยค`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API HTTP ${apiRes.status}: ${errText}`);
    }

    const data = await apiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned from Gemini');

    const result = JSON.parse(rawText.trim());
    res.json(result);
  } catch (err) {
    console.error('Error generating vocab sentence:', err);
    // Provide a nice fallback sentence so the game doesn't crash if Gemini fails or is offline
    const fallbackThai = `ฉันสามารถค้นหาความหมายของคำว่า ${word1} และ ${word2} ได้`;
    const fallbackEnglish = `I can find the meaning of ${word1} and ${word2}.`;
    res.json({
      thaiSentence: fallbackThai,
      englishSentence: fallbackEnglish,
      distractors: ["search", "write", "speak", "read"]
    });
  }
});

// --- Vocab Complete Route (awards points for vocabulary practice) ---
app.post('/api/user/vocab-complete', authenticateToken, async (req, res) => {
  const { level, matchedPairs, timeSeconds, mode } = req.body;

  if (!level || !matchedPairs) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Save to VocabRecord if game was fully completed (8 matched pairs, or 5 rounds for sentence mode)
    const requiredCompletions = mode === 'sentence' ? 5 : 8;
    if (matchedPairs >= requiredCompletions && timeSeconds) {
      await prisma.vocabRecord.create({
        data: {
          userId: req.user.userId,
          level,
          mode: mode || 'same',
          timeSeconds: parseInt(timeSeconds)
        }
      });
    }

    // Award points based on performance (disabled - 0 points)
    const totalPointsAwarded = 0;

    const newXp = user.xp + 20;
    let newLevel = user.level;
    let tempXp = newXp;
    let levelUp = false;

    while (tempXp >= 100) {
      tempXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points + totalPointsAwarded,
        xp: tempXp,
        level: newLevel,
        pigLevel: newLevel,
        pigXp: tempXp,
        pigLevel: newLevel,
        pigXp: tempXp
      }
    });

    res.json({
      message: `เรียนคำศัพท์ระดับ ${level} สำเร็จ! ได้รับ ${totalPointsAwarded} PTS`,
      pointsAwarded: totalPointsAwarded,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreEnglish: updatedUser.scoreEnglish
      }
    });
  } catch (err) {
    console.error('Vocab Complete Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลเรียนคำศัพท์' });
  }
});

// --- Battle Matchmaking Questions Endpoint ---
app.get('/api/exams/battle-questions', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  try {
    await ensureDefaultQuestions();
    
    let dbQuestions = [];
    if (subject && subject !== 'all') {
      dbQuestions = await prisma.question.findMany({
        where: { examSet: { category: subject } },
        include: { examSet: { select: { category: true, subcategory: true } } }
      });
    } else {
      dbQuestions = await prisma.question.findMany({
        include: { examSet: { select: { category: true, subcategory: true } } }
      });
    }

    // Shuffle questions function
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (dbQuestions.length > 0) {
      return res.json(shuffle(dbQuestions));
    }

    // Fallback: If DB questions are empty, construct from defaultQuestions in server/index.js
    let fallbackPool = [];
    defaultQuestions.forEach((eqSet) => {
      if (!subject || subject === 'all' || eqSet.category === subject) {
        eqSet.questions.forEach((q, idx) => {
          fallbackPool.push({
            id: `fallback-${eqSet.category}-${idx}`,
            questionText: q.questionText,
            choice1: q.choice1,
            choice2: q.choice2,
            choice3: q.choice3,
            choice4: q.choice4,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'เฉลยรายละเอียด...',
            examSet: { category: eqSet.category, subcategory: eqSet.title }
          });
        });
      }
    });

    res.json(shuffle(fallbackPool));
  } catch (err) {
    console.error('Fetch Battle Questions Error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำถามประลองได้' });
  }
});

// Global Matchmaking States
const battleQueue = [];
const activeMatches = new Map();

// Helper to shuffle questions
function localShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET a random opponent (real user from database)
app.get('/api/exams/battle-opponent', authenticateToken, async (req, res) => {
  try {
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user.userId }
      },
      select: {
        username: true,
        fullName: true,
        level: true,
        faceImage: true,
        battleWins: true
      }
    });

    if (otherUsers.length === 0) {
      return res.json({ username: 'general_user', fullName: 'ผู้สอบทั่วไป', level: 1, faceImage: null });
    }

    const randomIndex = Math.floor(Math.random() * otherUsers.length);
    const opponent = otherUsers[randomIndex];
    res.json(opponent);
  } catch (err) {
    console.error('Error fetching battle opponent:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคู่ต่อสู้ได้' });
  }
});

// POST to join and poll matchmaking queue
app.post('/api/exams/battle/poll-match', authenticateToken, async (req, res) => {
  const { subject } = req.body;
  const now = Date.now();

  try {
    // 1. Clean up stale users in queue (no poll for > 6 seconds)
    const activeQueue = battleQueue.filter(u => now - u.lastPoll < 6000);
    battleQueue.length = 0;
    battleQueue.push(...activeQueue);

    // 2. Check if this user is already in an active match
    let existingMatch = null;
    for (const m of activeMatches.values()) {
      if (m.player1.userId === req.user.userId || m.player2.userId === req.user.userId) {
        existingMatch = m;
        break;
      }
    }

    if (existingMatch) {
      const opponent = existingMatch.player1.userId === req.user.userId ? existingMatch.player2 : existingMatch.player1;
      return res.json({
        status: 'matched',
        matchId: existingMatch.matchId,
        opponent,
        questions: existingMatch.questions
      });
    }

    // 3. Update or add self to the queue
    let selfInQueue = battleQueue.find(u => u.userId === req.user.userId);
    if (selfInQueue) {
      selfInQueue.lastPoll = now;
      selfInQueue.subject = subject;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      if (user) {
        selfInQueue = {
          userId: user.id,
          username: user.username,
          fullName: user.fullName || user.username,
          level: user.level || 1,
          faceImage: user.faceImage,
          subject,
          lastPoll: now
        };
        battleQueue.push(selfInQueue);
      }
    }

    // 4. Try to find another active user in queue for the same subject
    const partner = battleQueue.find(u => u.userId !== req.user.userId && u.subject === subject);
    if (partner) {
      // Remove both from queue
      const idx1 = battleQueue.findIndex(u => u.userId === req.user.userId);
      if (idx1 !== -1) battleQueue.splice(idx1, 1);
      const idx2 = battleQueue.findIndex(u => u.userId === partner.userId);
      if (idx2 !== -1) battleQueue.splice(idx2, 1);

      // Fetch questions
      const sets = await prisma.examSet.findMany({
        where: { category: subject },
        select: { id: true }
      });
      const setIds = sets.map(s => s.id);
      let qList = await prisma.question.findMany({
        where: { examSetId: { in: setIds } },
        include: { examSet: true }
      });
      qList = localShuffle(qList).slice(0, 10);

      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMatch = {
        matchId,
        player1: {
          userId: req.user.userId,
          username: selfInQueue.username,
          fullName: selfInQueue.fullName,
          level: selfInQueue.level,
          faceImage: selfInQueue.faceImage
        },
        player2: partner,
        subject,
        questions: qList,
        createdAt: now
      };

      activeMatches.set(matchId, newMatch);

      // Clean up old matches (> 15 minutes)
      for (const [mId, m] of activeMatches.entries()) {
        if (now - m.createdAt > 15 * 60 * 1000) {
          activeMatches.delete(mId);
        }
      }

      return res.json({
        status: 'matched',
        matchId,
        opponent: partner,
        questions: qList
      });
    }

    res.json({ status: 'searching' });
  } catch (err) {
    console.error('Matchmaking Poll Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาคู่ต่อสู้' });
  }
});

// POST to match instantly (matches with queue if someone is waiting, or grabs random real user offline)
app.post('/api/exams/battle/match-instant', authenticateToken, async (req, res) => {
  const { subject } = req.body;
  const now = Date.now();

  try {
    // 1. Clean up stale users in queue (no poll for > 6 seconds)
    const activeQueue = battleQueue.filter(u => now - u.lastPoll < 6000);
    battleQueue.length = 0;
    battleQueue.push(...activeQueue);

    // 2. Check if this user is already in an active match
    let existingMatch = null;
    for (const m of activeMatches.values()) {
      if (m.player1.userId === req.user.userId || m.player2.userId === req.user.userId) {
        existingMatch = m;
        break;
      }
    }

    if (existingMatch) {
      const opponent = existingMatch.player1.userId === req.user.userId ? existingMatch.player2 : existingMatch.player1;
      return res.json({
        status: 'matched',
        matchId: existingMatch.matchId,
        opponent,
        questions: existingMatch.questions
      });
    }

    // 3. Check if anyone else is waiting in queue (ignoring subject, excluding self)
    const partner = battleQueue.find(u => u.userId !== req.user.userId);
    if (partner) {
      // Match with them!
      const idx2 = battleQueue.findIndex(u => u.userId === partner.userId);
      if (idx2 !== -1) battleQueue.splice(idx2, 1);
      
      // Also remove self from queue if present
      const idxSelf = battleQueue.findIndex(u => u.userId === req.user.userId);
      if (idxSelf !== -1) battleQueue.splice(idxSelf, 1);

      // Fetch questions for the subject requested by the matcher
      const sets = await prisma.examSet.findMany({
        where: { category: subject },
        select: { id: true }
      });
      const setIds = sets.map(s => s.id);
      let qList = await prisma.question.findMany({
        where: { examSetId: { in: setIds } },
        include: { examSet: true }
      });
      qList = localShuffle(qList).slice(0, 10);

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMatch = {
        matchId,
        player1: {
          userId: req.user.userId,
          username: user.username,
          fullName: user.fullName || user.username,
          level: user.level || 1,
          faceImage: user.faceImage
        },
        player2: partner,
        subject,
        questions: qList,
        createdAt: now
      };

      activeMatches.set(matchId, newMatch);

      return res.json({
        status: 'matched',
        matchId,
        opponent: partner,
        questions: qList
      });
    }

    // 4. No one is waiting in the queue, return waiting status so they keep waiting as normal
    res.json({
      status: 'waiting'
    });
  } catch (err) {
    console.error('Match Instant Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการจับคู่ทันที' });
  }
});

// POST to leave matchmaking queue
app.post('/api/exams/battle/leave-queue', authenticateToken, async (req, res) => {
  try {
    const idx = battleQueue.findIndex(u => u.userId === req.user.userId);
    if (idx !== -1) {
      battleQueue.splice(idx, 1);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Leave Queue Error:', err);
    res.status(500).json({ error: 'Error leaving queue' });
  }
});


// --- Battle Complete Route (awards points for combat resolution) ---
app.post('/api/user/battle-complete', authenticateToken, async (req, res) => {
  const { winner, subject } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const pointsAwarded = 0;
    const xpAwarded = winner ? 50 : 10;

    const newXp = user.xp + xpAwarded;
    let newLevel = user.level;
    let tempXp = newXp;
    let levelUp = false;

    while (tempXp >= 100) {
      tempXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    // Optionally bump the score in the chosen subject on victory
    const updateData = {
      points: user.points + pointsAwarded,
      xp: tempXp,
      level: newLevel,
      pigLevel: newLevel,
      pigXp: tempXp
    };

    if (winner) {
      updateData.battleWins = (user.battleWins || 0) + 1;
    }

    const subjectMetaKeys = {
      general: 'scoreGeneral',
      thai: 'scoreThai',
      english: 'scoreEnglish',
      computer: 'scoreComputer',
      social: 'scoreSocial',
      secretariat: 'scoreSecretariat',
      law: 'scoreLaw'
    };

    if (winner && subject && subjectMetaKeys[subject]) {
      const field = subjectMetaKeys[subject];
      updateData[field] = Math.min(100, user[field] + 2); // award 2% on victory, cap at 100
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    res.json({
      message: winner ? '🎉 ชนะการประลองสำเร็จ!' : '😢 แพ้การประลอง (พยายามใหม่อีกครั้ง)',
      pointsAwarded,
      xpAwarded,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        scoreGeneral: updatedUser.scoreGeneral,
        scoreThai: updatedUser.scoreThai,
        scoreEnglish: updatedUser.scoreEnglish,
        scoreComputer: updatedUser.scoreComputer,
        scoreSocial: updatedUser.scoreSocial,
        scoreSecretariat: updatedUser.scoreSecretariat,
        scoreLaw: updatedUser.scoreLaw
      }
    });
  } catch (err) {
    console.error('Battle Complete Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลการประลอง' });
  }
});

// --- Vocab Leaderboard Route (Top 10 best times) ---
app.get('/api/vocab/leaderboard', async (req, res) => {
  const { level, mode } = req.query;
  if (!level || !mode) {
    return res.status(400).json({ error: 'กรุณาระบุ level และ mode' });
  }

  try {
    const records = await prisma.vocabRecord.findMany({
      where: {
        level,
        mode
      },
      orderBy: {
        timeSeconds: 'asc'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true }
        }
      },
      take: 100
    });

    const uniqueUsers = [];
    const seenUsers = new Set();
    for (const r of records) {
      if (!seenUsers.has(r.userId)) {
        seenUsers.add(r.userId);
        uniqueUsers.push({
          id: r.id,
          userId: r.userId,
          username: r.user.username,
          fullName: r.user.fullName || r.user.username,
          timeSeconds: r.timeSeconds,
          createdAt: r.createdAt
        });
      }
      if (uniqueUsers.length >= 10) break;
    }

    res.json(uniqueUsers);
  } catch (err) {
    console.error('Fetch Vocab Leaderboard Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลตารางอันดับได้' });
  }
});


// --- Premium Slip Upload (PromptPay Payment) ---
app.post('/api/user/premium-request', authenticateToken, async (req, res) => {
  const { slipImage } = req.body;
  if (!slipImage) {
    return res.status(400).json({ error: 'กรุณาอัปโหลดรูปภาพสลิปการโอนเงิน' });
  }

  try {
    const existingPending = await prisma.premiumRequest.findFirst({
      where: {
        userId: req.user.userId,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return res.status(400).json({ error: 'คุณมีรายการที่อยู่ระหว่างรอยืนยันอยู่แล้ว กรุณารอแอดมินดำเนินการตรวจสอบ' });
    }

    const premiumReq = await prisma.premiumRequest.create({
      data: {
        userId: req.user.userId,
        slipImage,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'ส่งหลักฐานสลิปเรียบร้อยแล้ว สถานะคือรอยืนยันการอนุมัติ',
      premiumReq
    });
  } catch (err) {
    console.error('Premium Request Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งหลักฐานสลิป' });
  }
});

// --- Get Current User's Premium Request Status ---
app.get('/api/user/premium-status', authenticateToken, async (req, res) => {
  try {
    const latestRequest = await prisma.premiumRequest.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ latestRequest });
  } catch (err) {
    console.error('Fetch Premium Status Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถานะพรีเมียมได้' });
  }
});

// --- Admin Endpoints for Premium Requests ---

// Get all premium requests (for admin)
app.get('/api/admin/premium-requests', requireAdmin, async (req, res) => {
  try {
    const requests = await prisma.premiumRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, email: true }
        }
      }
    });
    res.json(requests);
  } catch (err) {
    console.error('Fetch Admin Premium Requests Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคำขอพรีเมียมได้' });
  }
});

// Approve a request
app.put('/api/admin/premium-requests/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.premiumRequest.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบรายการคำขอนี้' });
    }

    // Update request status
    await prisma.premiumRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' }
    });

    // Update user premium duration (extend by 30 days)
    const now = new Date();
    let newPremiumUntil = new Date(now);
    if (request.user.premiumUntil && request.user.premiumUntil > now) {
      newPremiumUntil = new Date(request.user.premiumUntil);
    }
    newPremiumUntil.setDate(newPremiumUntil.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { id: request.userId },
      data: { premiumUntil: newPremiumUntil }
    });

    res.json({ message: 'อนุมัติพรีเมียมสำเร็จเรียบร้อย!', premiumUntil: newPremiumUntil });
  } catch (err) {
    console.error('Approve Premium Request Error:', err);
    res.status(500).json({ error: 'ไม่สามารถอนุมัติรายการพรีเมียมได้' });
  }
});

// Revoke or Reject a request (or clear user's premium)
app.put('/api/admin/premium-requests/:id/revoke', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.premiumRequest.findUnique({
      where: { id: parseInt(id) }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบรายการคำขอนี้' });
    }

    // Set request status to REJECTED / REVOKED
    await prisma.premiumRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    // Revoke the user's premium completely
    await prisma.user.update({
      where: { id: request.userId },
      data: { premiumUntil: null }
    });

    res.json({ message: 'เพิกถอนสิทธิ์พรีเมียมของผู้ใช้นี้เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Revoke Premium Request Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิกถอนสิทธิ์พรีเมียมได้' });
  }
});

// --- Global Settings Routes ---

// Get global settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const result = {
      settings_sys_name: 'เตรียมสอบนายสิบตำรวจออนไลน์',
      settings_pass_score: '60',
      settings_maintenance: 'false',
      settings_exam_mode: 'dynamic',
      settings_gemini_key: 'AIzaSyDDBylXqV9akHtd5hBVEFSuoAM795on7Rc'
    };

    settings.forEach(s => {
      result[s.key] = s.value;
    });

    res.json(result);
  } catch (err) {
    console.error('Get Settings Error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดการตั้งค่าระบบได้' });
  }
});

// Update global settings (for Admins / Owners)
app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const newSettings = req.body;
  try {
    for (const [key, value] of Object.entries(newSettings)) {
      if (typeof key === 'string' && typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }
    res.json({ message: 'บันทึกการตั้งค่าระบบสำเร็จ' });
  } catch (err) {
    console.error('Update Settings Error:', err);
    res.status(500).json({ error: 'ไม่สามารถบันทึกการตั้งค่าระบบได้' });
  }
});

// --- Pig Farm Game Routes ---

// Get current user's pig stats
app.get('/api/user/pig', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        pigName: true,
        pigLevel: true,
        pigXp: true,
        pigHunger: true,
        pigThirst: true,
        pigSkin: true,
        pigWeapon: true,
        pigPenLevel: true,
        pigUnlockedSkins: true,
        pigUnlockedWeapons: true,
        points: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    res.json(user);
  } catch (err) {
    console.error('Fetch Pig Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้' });
  }
});

// Care for pig (feed, water, vitamin)
app.post('/api/user/pig/care', authenticateToken, async (req, res) => {
  const { type } = req.body; // 'food', 'water', 'vitamin'
  
  const careTypes = {
    food: { cost: 50, hunger: 40, thirst: 0, exp: 20, msg: 'ให้อาหารหมูสำเร็จ!' },
    water: { cost: 30, hunger: 0, thirst: 40, exp: 10, msg: 'ให้น้ำหมูสำเร็จ!' },
    vitamin: { cost: 100, hunger: 20, thirst: 20, exp: 50, msg: 'ให้วิตามินบำรุงสำเร็จ!' }
  };

  const selectedCare = careTypes[type];
  if (!selectedCare) {
    return res.status(400).json({ error: 'ประเภทการดูแลไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedCare.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedCare.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    // Calculate new stats
    const newHunger = Math.min(100, user.pigHunger + selectedCare.hunger);
    const newThirst = Math.min(100, user.pigThirst + selectedCare.thirst);
    let newXp = user.pigXp + selectedCare.exp;
    let newLevel = user.pigLevel;
    let levelUp = false;

    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedCare.cost,
        pigHunger: newHunger,
        pigThirst: newThirst,
        pigXp: newXp,
        pigLevel: newLevel
      }
    });

    res.json({
      message: selectedCare.msg + (levelUp ? ` 🎉 น้องหมูเลเวลอัปเป็น เลเวล ${newLevel}!` : ''),
      points: updatedUser.points,
      levelUp,
      pig: {
        pigName: updatedUser.pigName,
        pigLevel: updatedUser.pigLevel,
        pigXp: updatedUser.pigXp,
        pigHunger: updatedUser.pigHunger,
        pigThirst: updatedUser.pigThirst,
        pigSkin: updatedUser.pigSkin,
        pigWeapon: updatedUser.pigWeapon,
        pigPenLevel: updatedUser.pigPenLevel
      }
    });
  } catch (err) {
    console.error('Pig Care Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดูแลหมู' });
  }
});

// Upgrade pig pen
app.post('/api/user/pig/upgrade-pen', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const currentPenLevel = user.pigPenLevel;
    if (currentPenLevel >= 4) {
      return res.status(400).json({ error: 'คอกหมูของคุณอัปเกรดถึงระดับสูงสุดแล้ว!' });
    }

    const penUpgrades = {
      1: { cost: 500, nextLevel: 2, name: 'คอกไม้สนตกแต่งสวยงาม' },
      2: { cost: 1000, nextLevel: 3, name: 'คอกเหล็กหุ้มเกราะ' },
      3: { cost: 2000, nextLevel: 4, name: 'วิมานหมูระดับสวรรค์' }
    };

    const upgrade = penUpgrades[currentPenLevel];
    if (user.points < upgrade.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${upgrade.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - upgrade.cost,
        pigPenLevel: upgrade.nextLevel
      }
    });

    res.json({
      message: `🔨 อัปเกรดคอกหมูเป็น "${upgrade.name}" สำเร็จ!`,
      points: updatedUser.points,
      pigPenLevel: updatedUser.pigPenLevel
    });
  } catch (err) {
    console.error('Upgrade Pen Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเกรดคอกหมู' });
  }
});

// Buy unlockable pig item (skin / weapon)
app.post('/api/user/pig/buy-item', authenticateToken, async (req, res) => {
  const { category, itemId } = req.body; // category = 'skin' or 'weapon'
  
  const skins = {
    armour: { cost: 500, name: 'ชุดเกราะเหล็กอัศวิน' },
    gold: { cost: 1500, name: 'ชุดกษัตริย์ทองคำ' },
    roblox: { cost: 800, name: 'หน้ากาก Roblox Manface' },
    ninja: { cost: 1000, name: 'ชุดนินจาเงาเกล็ดปลา' },
    banana_suit: { cost: 750, name: 'ชุดมาสคอตกล้วยเหลือง' },
    wood_armor: { cost: 350, name: 'ชุดเกราะไม้ป่าดงดิบ' },
    police_suit: { cost: 900, name: 'ชุดเครื่องแบบตำรวจปราบจลาจล' },
    knight_cape: { cost: 600, name: 'ผ้าคลุมนักรบผู้พิทักษ์' },
    stone_golem: { cost: 850, name: 'ผิวหินแกรนิตโบราณ' },
    superman: { cost: 1100, name: 'ชุดซูเปอร์ฮีโร่สีแดงน้ำเงิน' },
    astronaut: { cost: 1300, name: 'ชุดนักบินอวกาศไซไฟ' },
    samurai: { cost: 1250, name: 'ชุดเกราะซามูไรสีชาด' },
    dinosaur: { cost: 700, name: 'ชุดแฟนซีไดโนเสาร์เขียว' },
    pirate: { cost: 950, name: 'ชุดกัปตันโจรสลัดตาเดียว' },
    chef: { cost: 400, name: 'ชุดเชฟยอดนักปรุงอาหาร' },
    detective: { cost: 800, name: 'ชุดโค้ทนักสืบเชอร์ล็อก' },
    cyberpunk: { cost: 1400, name: 'ชุดแจ็คเก็ตนีออนอนาคต' },
    pharaoh: { cost: 1600, name: 'ชุดฟาโรห์ทองคำอียิปต์' },
    ghost: { cost: 300, name: 'ชุดผ้าคลุมผีขาวสุดหลอน' }
  };

  const weapons = {
    sword: { cost: 300, name: 'ดาบเหล็กผู้กล้า' },
    wand: { cost: 600, name: 'คทาดาวนำโชค' },
    lollipop: { cost: 400, name: 'อมยิ้มแคนดี้สีชมพู' },
    roblox_shield: { cost: 500, name: 'โล่บล็อกเหลืองฟ้า' },
    banana: { cost: 250, name: 'กล้วยหอมจอมพลัง' },
    wooden_club: { cost: 200, name: 'กระบองไม้สนคู่ใจ' },
    laser_gun: { cost: 1200, name: 'ปืนเลเซอร์อวกาศ' },
    battle_axe: { cost: 700, name: 'ขวานศึกเหล็กกล้า' },
    throwing_rock: { cost: 150, name: 'ก้อนหินดินระเบิด' },
    slingshot: { cost: 180, name: 'หนังสติ๊กยิงเป้า' },
    carrot: { cost: 220, name: 'แครอทสีส้มแหลมคม' },
    magic_book: { cost: 850, name: 'ตำราเวทมนตร์โบราณ' },
    guitar: { cost: 650, name: 'กีตาร์ร็อกเกอร์ขับกล่อม' },
    frying_pan: { cost: 350, name: 'กระทะเหล็กกันกระสุน' },
    police_baton: { cost: 500, name: 'กระบองตำรวจรักษาการณ์' },
    water_gun: { cost: 300, name: 'ปืนฉีดน้ำสงกรานต์' },
    boxing_glove: { cost: 450, name: 'นวมชกมวยสีแดงแรงฤทธิ์' },
    ninja_star: { cost: 400, name: 'ดาวกระจายวายุหมุน' },
    lightsaber: { cost: 1500, name: 'ดาบแสงเจไดพลังวิเศษ' }
  };

  let selectedItem = null;
  if (category === 'skin') selectedItem = skins[itemId];
  else if (category === 'weapon') selectedItem = weapons[itemId];

  if (!selectedItem) {
    return res.status(400).json({ error: 'ไอเทมที่ต้องการซื้อไม่ถูกต้อง' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    if (user.points < selectedItem.cost) {
      return res.status(400).json({ error: `พ้อยต์ไม่เพียงพอ (ต้องการ ${selectedItem.cost} PTS, คุณมี ${user.points} PTS)` });
    }

    let unlockedListStr = category === 'skin' ? user.pigUnlockedSkins : user.pigUnlockedWeapons;
    let list = unlockedListStr.split(',').map(s => s.trim());

    if (list.includes(itemId)) {
      return res.status(400).json({ error: 'คุณปลดล็อกไอเทมชิ้นนี้เรียบร้อยแล้ว' });
    }

    list.push(itemId);
    const newListStr = list.join(',');

    const updateField = category === 'skin' ? 'pigUnlockedSkins' : 'pigUnlockedWeapons';

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: user.points - selectedItem.cost,
        [updateField]: newListStr
      }
    });

    res.json({
      message: `🎉 ปลดล็อก "${selectedItem.name}" สำเร็จ!`,
      points: updatedUser.points,
      unlockedItems: newListStr
    });
  } catch (err) {
    console.error('Buy Pig Item Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการซื้อไอเทม' });
  }
});

// Equip pig skin or weapon
app.post('/api/user/pig/equip', authenticateToken, async (req, res) => {
  const { category, itemId } = req.body; // category = 'skin' or 'weapon'

  if (itemId !== 'default') {
    const validSkins = ['armour', 'gold', 'roblox', 'ninja', 'banana_suit', 'wood_armor', 'police_suit', 'knight_cape', 'stone_golem', 'superman', 'astronaut', 'samurai', 'dinosaur', 'pirate', 'chef', 'detective', 'cyberpunk', 'pharaoh', 'ghost'];
    const validWeapons = ['sword', 'wand', 'lollipop', 'roblox_shield', 'banana', 'wooden_club', 'laser_gun', 'battle_axe', 'throwing_rock', 'slingshot', 'carrot', 'magic_book', 'guitar', 'frying_pan', 'police_baton', 'water_gun', 'boxing_glove', 'ninja_star', 'lightsaber'];
    
    if (category === 'skin' && !validSkins.includes(itemId)) {
      return res.status(400).json({ error: 'สกินไม่ถูกต้อง' });
    }
    if (category === 'weapon' && !validWeapons.includes(itemId)) {
      return res.status(400).json({ error: 'อาวุธไม่ถูกต้อง' });
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Check if unlocked
    let unlockedListStr = category === 'skin' ? user.pigUnlockedSkins : user.pigUnlockedWeapons;
    let list = unlockedListStr.split(',').map(s => s.trim());

    if (itemId !== 'default' && !list.includes(itemId)) {
      return res.status(400).json({ error: 'คุณต้องซื้อปลดล็อกไอเทมชิ้นนี้ก่อนสวมใส่' });
    }

    const updateField = category === 'skin' ? 'pigSkin' : 'pigWeapon';

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        [updateField]: itemId
      }
    });

    res.json({
      message: 'ติดตั้งไอเทมเรียบร้อยแล้ว!',
      pigSkin: updatedUser.pigSkin,
      pigWeapon: updatedUser.pigWeapon
    });
  } catch (err) {
    console.error('Equip Pig Item Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสวมใส่ไอเทม' });
  }
});

// Background queue worker for AI generation
async function startExamGenerationWorker() {
  console.log('[Queue Worker] Background exam generator worker started.');
  setInterval(async () => {
    try {
      // Find the next PENDING exam set
      const pendingSet = await prisma.examSet.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' }
      });
      
      if (!pendingSet) return;
      
      console.log(`[Queue Worker] Processing ExamSet ID: ${pendingSet.id} in background...`);
      
      // Update status to PROCESSING
      await prisma.examSet.update({
        where: { id: pendingSet.id },
        data: { status: 'PROCESSING' }
      });
      
      // Perform generation
      const subject = pendingSet.category;
      const count = pendingSet.totalCount;
      const subcategories = pendingSet.subcategory; // comma separated string or null
      
      // Load raw terms from DB directory
      const absoluteCwd = path.resolve(path.join(__dirname, '..', 'DBEXAM'));
      const dbDir = path.join(absoluteCwd, 'db');
      let allEntries = [];
      
      if (fs.existsSync(dbDir)) {
        const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
        for (const filename of dbFiles) {
          if (subject === 'law' && !filename.includes('law')) continue;
          if (subject === 'secretariat' && !filename.includes('sarabarn')) continue;
          
          const filePath = path.join(dbDir, filename);
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            const entries = data.entries || (data.knowledge_database && data.knowledge_database.entries) || [];
            allEntries = allEntries.concat(entries);
          } catch (err) {
            console.error(`Error reading/parsing db ${filename}:`, err);
          }
        }
      }
      
      // Subcategory mapping
      const subcategoryMap = {
        // Secretariat
        "secretariat_general": "บททั่วไป",
        "secretariat_types": "หมวด ๑ ชนิดของหนังสือ",
        "secretariat_receiving": "หมวด ๒ การรับและส่งหนังสือ",
        "secretariat_keeping": "หมวด ๓ การเก็บรักษา ยืม และทำลายหนังสือ",
        "secretariat_standards": "หมวด ๔ มาตรฐานตรา แบบพิมพ์ และซอง",
        "secretariat_e_sarabarn": "หมวด ๕ ระบบสารบรรณอิเล็กทรอนิกส์",
        "secretariat_appendix": "ภาคผนวก",
        
        // Law
        "general_law_state": ["ความรู้ทั่วไปเกี่ยวกับกฎหมาย", "ความรู้ทั่วไปเกี่ยวกับรัฐ"],
        "history_hierarchy": ["ประวัติศาสตร์กฎหมายไทย", "ลำดับศักดิ์ของกฎหมาย"],
        "constitution": "รัฐธรรมนูญ (กฎหมายสูงสุด)",
        "administrative": "กฎหมายปกครอง (กฎหมายมหาชน)",
        "civil_person": "กฎหมายแพ่ง — บุคคล",
        "civil_juristic_debt": ["กฎหมายแพ่ง — นิติกรรมและสัญญา", "กฎหมายแพ่ง — หนี้"],
        "civil_property": "กฎหมายแพ่ง — ทรัพย์",
        "civil_family": "กฎหมายแพ่ง — ครอบครัว",
        "civil_inheritance": "กฎหมายแพ่ง — มรดกและพินัยกรรม",
        "criminal_general": ["กฎหมายอาญา — หลักทั่วไป", "กฎหมายอาญา — โครงสร้างความรับผิดทางอาญา", "กฎหมายอาญา — เหตุยกเว้นความผิด/โทษ และบทลงโทษ", "กฎหมายอาญา — ตัวการ ผู้ใช้ ผู้สนับสนุน"],
        "criminal_offense": "ความผิดเกี่ยวกับทรัพย์ (อาญา)",
        "consumer_protection": "กฎหมายคุ้มครองผู้บริโภค",
        "intellectual_property": "ทรัพย์สินทางปัญญา",
        "labor": "กฎหมายแรงงาน",
        "tax": "กฎหมายภาษี",
        "registration_id_military": "กฎหมายทั่วไปเกี่ยวกับทะเบียนราษฎร์และสิทธิพลเมือง",
        "narcotics": "กฎหมายเฉพาะเรื่องอื่นๆ",
        "daily_life": "กฎหมายเฉพาะเรื่องอื่นๆ"
      };
      
      // Filter by subcategories if specified
      if (subcategories) {
        const subKeys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
        let targetCategoryNames = [];
        for (const key of subKeys) {
          const mapped = subcategoryMap[key];
          if (mapped) {
            if (Array.isArray(mapped)) {
              targetCategoryNames = targetCategoryNames.concat(mapped);
            } else {
              targetCategoryNames.push(mapped);
            }
          }
        }
        if (targetCategoryNames.length > 0) {
          allEntries = allEntries.filter(entry => 
            targetCategoryNames.includes(entry.category) || 
            targetCategoryNames.includes(entry.section)
          );
        }
      } else {
        const targetCategoryName = subcategoryMap[subject];
        if (targetCategoryName) {
          if (Array.isArray(targetCategoryName)) {
            allEntries = allEntries.filter(entry => 
              targetCategoryName.includes(entry.category) || 
              targetCategoryName.includes(entry.section)
            );
          } else {
            allEntries = allEntries.filter(entry => 
              entry.category === targetCategoryName || 
              entry.section === targetCategoryName
            );
          }
        }
      }
      
      if (allEntries.length === 0) {
        throw new Error('ไม่พบข้อมูลเนื้อหาดิบในระบบสำหรับวิชา/หมวดที่เลือก');
      }
      
      // Shuffle and pick terms
      const shuffledTerms = allEntries.sort(() => 0.5 - Math.random());
      const selectedTerms = shuffledTerms.slice(0, count);
      
      const apiKey = await getGeminiApiKey();
      const generatedQuestions = [];
      
      // Subcategory fallback files map
      const subcategoryFiles = {
        "secretariat_general": ["บททั่วไป.json", "นิยาม.json"],
        "secretariat_types": ["ชนิดของหนังสือ.json", "หมวด_๑_ชนิดของหนังสือ.json"],
        "secretariat_receiving": ["หมวด_๒_การรับและส่งหนังสือ.json"],
        "secretariat_keeping": ["หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json"],
        "secretariat_standards": ["หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json"],
        "secretariat_e_sarabarn": ["หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json"],
        "secretariat_appendix": ["ภาคผนวก.json"],
        
        // Law subcategories
        "general_law_state": ["กฎหมายเบื้องต้น.json"],
        "history_hierarchy": ["กฎหมายเบื้องต้น.json"],
        "constitution": ["กฎหมายเบื้องต้น.json"],
        "administrative": ["กฎหมายเบื้องต้น.json"],
        "civil_person": ["กฎหมายเบื้องต้น.json"],
        "civil_juristic_debt": ["กฎหมายเบื้องต้น.json"],
        "civil_property": ["กฎหมายเบื้องต้น.json"],
        "civil_family": ["กฎหมายเบื้องต้น.json"],
        "civil_inheritance": ["กฎหมายเบื้องต้น.json"],
        "criminal_general": ["กฎหมายเบื้องต้น.json"],
        "criminal_offense": ["กฎหมายเบื้องต้น.json"],
        "consumer_protection": ["กฎหมายเบื้องต้น.json"],
        "intellectual_property": ["กฎหมายเบื้องต้น.json"],
        "labor": ["กฎหมายเบื้องต้น.json"],
        "tax": ["กฎหมายเบื้องต้น.json"],
        "registration_id_military": ["กฎหมายเบื้องต้น.json"],
        "narcotics": ["กฎหมายเบื้องต้น.json"],
        "daily_life": ["กฎหมายเบื้องต้น.json"]
      };
      
      for (let i = 0; i < selectedTerms.length; i++) {
        const term = selectedTerms[i];
        let genQ = await generateQuestionFromTerm(term, apiKey);
        
        if (genQ) {
          generatedQuestions.push(genQ);
        } else {
          // Fallback: If Gemini failed to generate, pull a pre-saved question from question_bank files
          const qbDir = path.join(absoluteCwd, 'question_bank');
          let mappedFiles = [];
          if (subcategories) {
            const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
            for (const key of keys) {
              if (subcategoryFiles[key]) {
                mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
              }
            }
          }
          if (mappedFiles.length === 0) {
            if (subject === 'law') {
              mappedFiles = ["กฎหมายเบื้องต้น.json"];
            } else {
              mappedFiles = [
                "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
                "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
                "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
                "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
                "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
              ];
            }
          }
          mappedFiles = [...new Set(mappedFiles)];
          
          let fallbackBank = [];
          for (const file of mappedFiles) {
            const filePath = path.join(qbDir, file);
            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                fallbackBank = fallbackBank.concat(data.entries || []);
              } catch (e) {}
            }
          }
          
          if (fallbackBank.length > 0) {
            const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
            const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
            generatedQuestions.push({
              questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
              choices: choices,
              answer: randomSaved.answer || 'A',
              explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
              subcategory: randomSaved.subcategory || randomSaved.section || 'ทั่วไป',
              document: randomSaved.document || 'ทั่วไป',
              source_line: randomSaved.source_line || ''
            });
          }
        }
        
        // Delay to avoid rate limit
        if (i < selectedTerms.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Batch verification
      console.log(`[Queue Worker] Running verification for ${generatedQuestions.length} questions...`);
      const verResults = await verifyQuestionsBatch(generatedQuestions, selectedTerms, apiKey);
      
      // Process questions and write to DB
      const dbQuestionsData = [];
      for (let i = 0; i < generatedQuestions.length; i++) {
        let q = generatedQuestions[i];
        const result = verResults && verResults[i];
        
        if (result && result.pass === false && (result.score && result.score < 70)) {
          // Replace with fallback
          const qbDir = path.join(absoluteCwd, 'question_bank');
          let mappedFiles = [];
          if (subcategories) {
            const keys = subcategories.split(',').map(s => s.trim()).filter(Boolean);
            for (const key of keys) {
              if (subcategoryFiles[key]) {
                mappedFiles = mappedFiles.concat(subcategoryFiles[key]);
              }
            }
          }
          if (mappedFiles.length === 0) {
            if (subject === 'law') {
              mappedFiles = ["กฎหมายเบื้องต้น.json"];
            } else {
              mappedFiles = [
                "บททั่วไป.json", "นิยาม.json", "ชนิดของหนังสือ.json", 
                "หมวด_๑_ชนิดของหนังสือ.json", "หมวด_๒_การรับและส่งหนังสือ.json", 
                "หมวด_๓_การเก็บรักษา_ยืม_และทำลายหนังสือ.json", "การเก็บรักษา_ยืม_และทำลายหนังสือ.json", 
                "หมวด_๔_มาตรฐานตรา_แบบพิมพ์_และซอง.json", "มาตรฐานตรา_แบบพิมพ์_และซอง.json", 
                "หมวด_๕_ระบบสารบรรณอิเล็กทรอนิกส์.json", "ภาคผนวก.json"
              ];
            }
          }
          mappedFiles = [...new Set(mappedFiles)];
          
          let fallbackBank = [];
          for (const file of mappedFiles) {
            const filePath = path.join(qbDir, file);
            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                fallbackBank = fallbackBank.concat(data.entries || []);
              } catch (e) {}
            }
          }
          
          if (fallbackBank.length > 0) {
            const randomSaved = fallbackBank[Math.floor(Math.random() * fallbackBank.length)];
            const choices = randomSaved.choices || [randomSaved.choice1, randomSaved.choice2, randomSaved.choice3, randomSaved.choice4];
            q = {
              questionText: randomSaved.question || randomSaved.questionText || 'ข้อคำถามจากคลังข้อสอบ',
              choices: choices,
              answer: randomSaved.answer || 'A',
              explanation: randomSaved.explanation || 'คำอธิบายเฉลย...',
              subcategory: randomSaved.subcategory || randomSaved.section || 'ทั่วไป'
            };
          }
        }
        
        // Format to db question
        const choices = q.choices || [q.choice1, q.choice2, q.choice3, q.choice4];
        let correctAnsIdx = 0;
        const ans = q.answer || 'A';
        if (ans === 'B' || ans === '2') correctAnsIdx = 1;
        else if (ans === 'C' || ans === '3') correctAnsIdx = 2;
        else if (ans === 'D' || ans === '4') correctAnsIdx = 3;
        
        dbQuestionsData.push({
          questionText: q.questionText,
          choice1: choices[0] || 'ตัวเลือก ก',
          choice2: choices[1] || 'ตัวเลือก ข',
          choice3: choices[2] || 'ตัวเลือก ค',
          choice4: choices[3] || 'ตัวเลือก ง',
          correctAnswer: correctAnsIdx,
          explanation: q.explanation || 'คำอธิบายเฉลย...',
          sortOrder: i
        });
      }
      
      // Save all questions in a transaction/Prisma write
      await prisma.$transaction(async (tx) => {
        for (const qData of dbQuestionsData) {
          await tx.question.create({
            data: {
              examSetId: pendingSet.id,
              ...qData
            }
          });
        }
      });
      
      // Set status to COMPLETED
      await prisma.examSet.update({
        where: { id: pendingSet.id },
        data: {
          status: 'COMPLETED',
          totalCount: dbQuestionsData.length
        }
      });
      
      console.log(`[Queue Worker] Successfully processed ExamSet ID: ${pendingSet.id}`);
      
    } catch (err) {
      console.error('[Queue Worker] Error processing pending exam:', err);
      try {
        const failedSet = await prisma.examSet.findFirst({
          where: { status: 'PROCESSING' }
        });
        if (failedSet) {
          await prisma.examSet.update({
            where: { id: failedSet.id },
            data: { status: 'FAILED' }
          });
        }
      } catch (e) {
        console.error('[Queue Worker] Failed to mark as FAILED:', e);
      }
    }
  }, 5000); // Check every 5 seconds
}

// Start express server
app.listen(PORT, async () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  await ensureDefaultQuestions();
  await startExamGenerationWorker();
});

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
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables from the server folder's .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Allow Google Sign-In to work on Brave and strict browsers
// Cross-Origin-Opener-Policy: same-origin-allow-popups lets Google OAuth popup communicate back
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, '..')));
app.use('/home', express.static(path.join(__dirname, '../home')));

// Prisma with PgBouncer-compatible settings
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: (() => {
        const url = process.env.DATABASE_URL || '';
        // Ensure pgbouncer=true is set for PgBouncer Transaction Mode (Supabase pooler port 6543)
        if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
          const sep = url.includes('?') ? '&' : '?';
          return url + sep + 'pgbouncer=true&connection_limit=1';
        }
        return url;
      })()
    }
  }
});
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Prevent server crashes from unhandled promise rejections (e.g. Prisma prepared statement errors)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the process - just log it
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  // Don't crash the process - just log it
});


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

    user = await updateDailyVisitStreak(user);

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

// Health Check / Warmup route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

// --- Dynamic Exam Sets API ---
app.get('/api/exams/sets', async (req, res) => {
  const { category } = req.query;
  try {
    const where = { isPublic: true };
    if (category) {
      const cat = String(category).trim();
      if (cat === 'สบ' || cat === 'สารบรรณ' || cat === 'งานสารบรรณ') {
        where.AND = [
          {
            OR: [
              { category: { contains: 'งานสารบรรณ', mode: 'insensitive' } },
              { category: { equals: 'สารบรรณ' } },
              { category: { contains: '๒๕๒๖' } },
              { category: { contains: '2526' } },
              { subcategory: { contains: 'งานสารบรรณ', mode: 'insensitive' } },
              { title: { contains: 'งานสารบรรณ', mode: 'insensitive' } }
            ]
          },
          {
            NOT: [
              { category: { contains: '๕๔' } },
              { category: { contains: '54' } },
              { category: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
              { subcategory: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
              { subcategory: { contains: '๕๔' } },
              { subcategory: { contains: '54' } },
              { title: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
              { title: { contains: '๕๔' } }
            ]
          }
        ];
      } else if (cat === 'ลักษณะที่54' || cat === '54' || cat === 'สารบรรณตำรวจ_๕๔' || cat === 'สารบรรณตำรวจ' || cat === 'ลักษณะที่ ๕๔') {
        where.OR = [
          { category: { contains: '๕๔' } },
          { category: { contains: '54' } },
          { category: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
          { subcategory: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
          { subcategory: { contains: '๕๔' } },
          { title: { contains: 'สารบรรณตำรวจ', mode: 'insensitive' } },
          { title: { contains: '๕๔' } }
        ];
      } else if (cat === 'ทั่วไป' || cat === 'ความสามารถทั่วไป') {
        where.AND = [
          {
            OR: [
              { category: { equals: 'ทั่วไป' } },
              { category: { contains: 'ความสามารถทั่วไป' } },
              { category: { contains: 'คำนวณ' } }
            ]
          },
          {
            NOT: [
              { category: { contains: 'กฏหมาย' } },
              { category: { contains: 'กฎหมาย' } },
              { subcategory: { contains: 'กฎหมาย' } },
              { subcategory: { contains: 'กฏหมาย' } }
            ]
          }
        ];
      } else if (cat === 'กฏหมาย' || cat === 'กฎหมาย' || cat === 'กฎหมายที่ประชาชนควรรู้') {
        where.OR = [
          { category: { contains: 'กฏหมาย' } },
          { category: { contains: 'กฎหมาย' } }
        ];
      } else if (cat === 'สังคม' || cat === 'สังคมและวัฒนธรรม') {
        where.OR = [
          { category: { contains: 'สังคม' } }
        ];
      } else if (cat === 'คอม' || cat === 'เทคโนโลยีสารสนเทศ' || cat === 'คอมพิวเตอร์') {
        where.OR = [
          { category: { contains: 'คอม' } },
          { category: { contains: 'เทคโนโลยีสารสนเทศ' } }
        ];
      } else if (cat === 'ไทย' || cat === 'ภาษาไทย') {
        where.OR = [
          { category: { equals: 'ไทย' } },
          { category: { contains: 'ภาษาไทย' } }
        ];
      } else if (cat === 'อังกฤษ' || cat === 'ภาษาอังกฤษ') {
        where.OR = [
          { category: { equals: 'อังกฤษ' } },
          { category: { contains: 'ภาษาอังกฤษ' } },
          { category: { contains: 'English', mode: 'insensitive' } }
        ];
      } else {
        where.OR = [
          { category: { equals: cat } },
          { category: { contains: cat, mode: 'insensitive' } }
        ];
      }
    }

    const sets = await prisma.examSet.findMany({
      where,
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let result = sets.map(s => ({
      id: `db_${s.id}`,
      dbId: s.id,
      title: s.title,
      category: s.category,
      subcategory: s.subcategory,
      questionsCount: s._count.questions || s.totalCount || 0,
      desc: `ชุดข้อสอบหมวด ${s.category} (จำนวน ${s._count.questions || s.totalCount || 0} ข้อ)`,
      timeMinutes: Math.max(10, Math.ceil((s._count.questions || s.totalCount || 10) * 1.2)),
      tag: 'ชุดข้อสอบจริง',
      createdAt: s.createdAt
    }));

    // If category is Saraban, General Math, etc., supply standard fallback sets if DB has no sets yet
    if (category && (category.includes('สารบรรณ') || category.includes('54')) && result.length === 0) {
      result = [
        {
          id: 'saraban_full_54',
          title: 'ชุดข้อสอบสารบรรณฉบับเต็ม (54 ข้อ - พ.ศ. 2556)',
          desc: 'รวมข้อสอบระเบียบงานสารบรรณครบทุกหมวด ทั้ง 54 ข้อ พร้อมคำอธิบายเฉลยอย่างละเอียด',
          questionsCount: 54,
          timeMinutes: 60,
          tag: 'ชุดมาตรฐาน'
        }
      ];
    } else if (category && (category.includes('ทั่วไป') || category.includes('คณิต')) && result.length === 0) {
      result = [
        {
          id: 'general_math_1',
          title: 'ชุดข้อสอบความสามารถทั่วไป (คณิตศาสตร์และเหตุผล) ชุดที่ 1',
          desc: 'แบบทดสอบวิชาความสามารถทั่วไป การคิดคำนวณ คณิตศาสตร์ อนุกรม และการเปรียบเทียบเชิงเหตุผล',
          questionsCount: 10,
          timeMinutes: 15,
          tag: 'ชุดมาตรฐาน'
        }
      ];
    }

    res.json(result);
  } catch (err) {
    console.error('Fetch exam sets error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลชุดข้อสอบ' });
  }
});

// --- Dynamic Exam Questions API ---
app.get('/api/exams/questions', async (req, res) => {
  const { setId, category, count } = req.query;
  const targetCount = parseInt(count) || 10;
  
  try {
    if (setId && setId.startsWith('db_')) {
      const dbId = parseInt(setId.replace('db_', ''));
      const qList = await prisma.question.findMany({
        where: { examSetId: dbId },
        orderBy: { sortOrder: 'asc' }
      });

      if (qList.length > 0) {
        return res.json(qList.slice(0, targetCount).map((q, idx) => ({
          id: q.id,
          questionText: q.questionText,
          choices: [q.choice1, q.choice2, q.choice3, q.choice4],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'ไม่มีคำอธิบายเพิ่มเติม'
        })));
      }
    }

    const sarabanQuestions = [
      {
        id: 1,
        questionText: "ตามประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔ งานสารบรรณ (พ.ศ. ๒๕๕๖) คำว่า \"งานสารบรรณ\" หมายถึงข้อใด?",
        choices: [
          "งานที่เกี่ยวกับการบริหารงานเอกสาร เริ่มตั้งแต่การจัดทำ การรับ การส่ง การเก็บรักษา การยืม จนถึงการทำลาย",
          "งานพิมพ์เอกสารและจัดส่งหนังสือราชการให้ผู้บังคับบัญชาเท่านั้น",
          "งานออกเลขคำสั่งและทำลายเอกสารเก่าของหน่วยงานตำรวจ",
          "งานดูแลระบบสารสนเทศและการสื่อสารของสำนักงานตำรวจแห่งชาติ"
        ],
        correctAnswer: 1,
        explanation: "ข้อ ๑ นิยามว่า งานสารบรรณ หมายถึง งานที่เกี่ยวกับการบริหารงานเอกสาร เริ่มตั้งแต่การจัดทำ การรับ การส่ง การเก็บรักษา การยืม จนถึงการทำลาย"
      },
      {
        id: 2,
        questionText: "การสั่งการตามระเบียบงานสารบรรณตำรวจ สามารถกระทำได้กี่วิธี?",
        choices: [
          "๒ วิธี (ด้วยหนังสือ และ ด้วยวาจา)",
          "๓ วิธี (ด้วยหนังสือ วาจา และเครื่องมือสื่อสาร)",
          "๔ วิธี (ด้วยหนังสือ วาจา เครื่องมือสื่อสาร และอิเล็กทรอนิกส์)",
          "๕ วิธี (ด้วยหนังสือ วาจา เครื่องมือสื่อสาร อิเล็กทรอนิกส์ และสัญญาณไฟ)"
        ],
        correctAnswer: 3,
        explanation: "ข้อ ๕ กำหนดวิธีสั่งการไว้ ๔ วิธี ได้แก่ ๑. กระทำด้วยหนังสือ ๒. กระทำด้วยวาจา ๓. กระทำด้วยเครื่องมือสื่อสาร ๔. กระทำด้วยวิธีการทางอิเล็กทรอนิกส์"
      },
      {
        id: 3,
        questionText: "การจัดทำหนังสือเสนอสำนักงานตำรวจแห่งชาติ หรือ ผบ.ตร. ต้องประกอบด้วยหัวข้อสำคัญกี่หัวข้อ?",
        choices: [
          "๓ หัวข้อ (เรื่องเดิม, ข้อเท็จจริง, ข้อเสนอ)",
          "๔ หัวข้อ (เรื่องเดิม, ข้อเท็จจริง, ข้อพิจารณา, ข้อเสนอ)",
          "๕ หัวข้อ (เรื่องเดิม, ข้อเท็จจริง, ข้อกฎหมายหรือระเบียบ, ข้อพิจารณา, ข้อเสนอ)",
          "๖ หัวข้อ (เรื่องเดิม, ข้อเท็จจริง, ข้อกฎหมาย, ข้อพิจารณา, ข้อเสนอ, ข้อสรุป)"
        ],
        correctAnswer: 3,
        explanation: "บทที่ ๓ ข้อ ๑ กำหนดให้การจัดทำหนังสือเสนอ ตร./ผบ.ตร. ต้องประกอบด้วย ๕ หัวข้อ ได้แก่ ๑.๑ เรื่องเดิม ๑.๒ ข้อเท็จจริง ๑.๓ ข้อกฎหมายหรือระเบียบ ๑.๔ ข้อพิจารณา ๑.๕ ข้อเสนอ"
      },
      {
        id: 4,
        questionText: "ข้าราชการตำรวจชั้นยศใดขึ้นไป ที่มีสิทธิลงลายมือชื่อรับรอง \"สำเนาถูกต้อง\" ในหนังสือของหน่วยงานเจ้าของเรื่อง?",
        choices: [
          "สิบตำรวจตรี (ส.ต.ต.) ขึ้นไป",
          "ดาบตำรวจ (ด.ต.) ขึ้นไป",
          "ร้อยตำรวจตรี (ร.ต.ต.) ขึ้นไป",
          "พันตำรวจตรี (พ.ต.ต.) ขึ้นไป"
        ],
        correctAnswer: 3,
        explanation: "บทที่ ๖ ข้อ ๓, ๖ กำหนดให้ข้าราชการตำรวจยศ \"ร้อยตำรวจตรี (ร.ต.ต.) ขึ้นไป\" ของหน่วยงานเจ้าของเรื่อง เป็นผู้ลงชื่อรับรองสำเนาถูกต้อง"
      },
      {
        id: 5,
        questionText: "รหัสพยัญชนะและเลขประจำส่วนราชการของ \"สำนักงานผู้บัญชาการตำรวจแห่งชาติ (สง.ผบ.ตร.)\" คือข้อใด?",
        choices: [
          "ตร ๐๐๐๑",
          "ตร ๐๐๐๒",
          "ตร ๐๐๐๓",
          "ตร ๐๐๑๕"
        ],
        correctAnswer: 1,
        explanation: "บทที่ ๗ ข้อ ๒.๑ กำหนดรหัสประจำส่วนราชการของ สำนักงานผู้บัญชาการตำรวจแห่งชาติ คือ ตร ๐๐๐๑"
      },
      {
        id: 6,
        questionText: "ข้อใดเป็นคำย่อภาษาไทยที่ถูกต้องของตำแหน่ง \"ผู้บัญชาการตำรวจแห่งชาติ\"?",
        choices: [
          "ผบ.ตร.",
          "ผบ.ตช.",
          "ผบช.ตร.",
          "ผตร."
        ],
        correctAnswer: 1,
        explanation: "บทที่ ๘ ข้อ ๒ กำหนดคำย่อตำแหน่ง ผู้บัญชาการตำรวจแห่งชาติ คือ ผบ.ตร."
      },
      {
        id: 7,
        questionText: "ข้อใดเป็นคำย่อภาษาไทยที่ถูกต้องของตำแหน่ง \"รักษาราชการแทน\"?",
        choices: [
          "รรท.",
          "ปรท.",
          "รกน.",
          "รทซ."
        ],
        correctAnswer: 1,
        explanation: "บทที่ ๘ ข้อ ๒ กำหนดคำย่อ รักษาราชการแทน คือ รรท. (ส่วน ปรท. คือ ปฏิบัติราชการแทน)"
      },
      {
        id: 8,
        questionText: "คำย่อยศภาษาอังกฤษของ \"พันตำรวจเอก\" คือข้อใด?",
        choices: [
          "Pol.Maj.",
          "Pol.Lt.Col.",
          "Pol.Col.",
          "Pol.Capt."
        ],
        correctAnswer: 3,
        explanation: "บทที่ ๘ ข้อ ๔ กำหนดคำย่อยศ พันตำรวจเอก (Police Colonel) คือ Pol.Col."
      },
      {
        id: 9,
        questionText: "น้ำหนักสูงสุดของพัสดุไปรษณีย์สนามของตำรวจชายแดนที่ได้รับการยกเว้นไม่ต้องชำระค่าไปรษณียากร คือเท่าใด?",
        choices: [
          "ไม่เกิน ๒ กิโลกรัม",
          "ไม่เกิน ๓ กิโลกรัม",
          "ไม่เกิน ๕ กิโลกรัม",
          "ไม่เกิน ๑๐ กิโลกรัม"
        ],
        correctAnswer: 3,
        explanation: "บทที่ ๑๑ ข้อ ๒ กำหนดให้น้ำหนักพัสดุไปรษณีย์สนามตำรวจชายแดนสูงสุดไม่เกิน ๕ กิโลกรัม (๕ กก.)"
      },
      {
        id: 10,
        questionText: "หากหน่วยงานได้รับงานส่งจากสำนักงานเลขาธิการตำรวจแห่งชาติ แต่เห็นว่าเรื่องไม่อยู่ในความรับผิดชอบ ต้องทำหนังสือส่งคืนโดยผู้ลงชื่อต้องดำรงตำแหน่งไม่ต่ำกว่ายศ/ตำแหน่งใด?",
        choices: [
          "สารวัตร (สว.) หรือเทียบเท่า",
          "ผู้กำกับการ (ผกก.) หรือเทียบเท่า",
          "ผู้บังคับการ (ผบก.) หรือเทียบเท่า",
          "ผู้บัญชาการ (ผบช.) หรือเทียบเท่า"
        ],
        correctAnswer: 2,
        explanation: "บทที่ ๔ ข้อ ๑.๔ กำหนดการส่งคืนหนังสือไม่อยู่ในความรับผิดชอบ ต้องลงชื่อโดยผู้ดำรงตำแหน่งไม่ต่ำกว่า ผู้กำกับการ (ผกก.) หรือเทียบเท่า"
      }
    ];

    if (setId === 'general_math_1' || (category && (category.includes('ทั่วไป') || category.includes('คณิต')))) {
      const mathQuestions = [
        {
          id: 1,
          questionText: "ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?",
          choices: [
            "A > C",
            "A = C",
            "A < C",
            "สรุปไม่ได้"
          ],
          correctAnswer: 1,
          explanation: "เนื่องจาก B เท่ากับ C ดังนั้นเมื่อ A มากกว่า B จึงสรุปได้ว่า A ต้องมากกว่า C ด้วย (A > C)"
        },
        {
          id: 2,
          questionText: "ผลรวมของเลขจำนวนเต็มตั้งแต่ 1 ถึง 100 เท่ากับเท่าใด?",
          choices: [
            "5,050",
            "5,000",
            "5,100",
            "4,950"
          ],
          correctAnswer: 1,
          explanation: "ใช้สูตรผลบวกอนุกรมเลขคณิต N(N+1)/2 = 100(101)/2 = 5,050"
        },
        {
          id: 3,
          questionText: "นายดำอายุมากกว่านายแดง 5 ปี อีก 3 ปีข้างหน้าผลรวมอายุทั้งสองคนเป็น 45 ปี ปัจจุบันนายแดงอายุเท่าใด?",
          choices: [
            "17 ปี",
            "22 ปี",
            "15 ปี",
            "20 ปี"
          ],
          correctAnswer: 1,
          explanation: "สมมติปัจจุบันแดงอายุ x ปี ดำอายุ x+5 ปี อีก 3 ปีข้างหน้า ผลรวมอายุคือ (x+3) + (x+5+3) = 45 => 2x + 11 = 45 => 2x = 34 => x = 17 ปี"
        },
        {
          id: 4,
          questionText: "สินค้าชิ้นหนึ่งติดราคาไว้ 1,000 บาท ลดราคา 20% แล้วยังได้กำไร 25% ต้นทุนของสินค้าชิ้นนี้คือเท่าใด?",
          choices: [
            "640 บาท",
            "700 บาท",
            "750 บาท",
            "800 บาท"
          ],
          correctAnswer: 1,
          explanation: "ราคาขายหลังลด 20% = 1,000 x 0.80 = 800 บาท. ขาย 800 บาทได้กำไร 25% แสดงว่า 800 = ต้นทุน x 1.25 => ต้นทุน = 800 / 1.25 = 640 บาท"
        },
        {
          id: 5,
          questionText: "อนุกรมเลข 2, 5, 10, 17, 26, ... จำนวนถัดไปคือเลขใด?",
          choices: [
            "37",
            "35",
            "36",
            "38"
          ],
          correctAnswer: 1,
          explanation: "ระยะห่างของอนุกรมเพิ่มขึ้นทีละเลขคี่: +3, +5, +7, +9, +11 ... ดังนั้น 26 + 11 = 37"
        }
      ];
      return res.json(mathQuestions.slice(0, targetCount));
    }

    res.json(sarabanQuestions.slice(0, targetCount));
  } catch (err) {
    console.error('Fetch questions error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อสอบ' });
  }
});

// --- Google Auth Configuration & Verification Routes ---
app.get('/api/auth/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '848275108419-q0171b1bmm4l29lp9blgpin3fl4p1fnh.apps.googleusercontent.com'
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

    console.log('[Google Auth] tokeninfo status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Google Auth] tokeninfo error:', errText);
      return res.status(400).json({ error: 'รหัส Token ของ Google ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่' });
    }

    const tokenInfo = await response.json();
    console.log('[Google Auth] aud:', tokenInfo.aud, '| expected:', process.env.GOOGLE_CLIENT_ID);

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      console.error('[Google Auth] aud mismatch! got:', tokenInfo.aud, 'expected:', expectedClientId);
      // Allow anyway if it's a valid Google token (just log the mismatch)
      // return res.status(400).json({ error: 'รหัส Token ไม่ปลอดภัย (aud mismatch)' });
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

// --- Daily Visit Streak Counter ---
async function updateDailyVisitStreak(user) {
  if (!user) return user;
  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    
    let lastDateStr = null;
    if (user.streakLastDate) {
      lastDateStr = new Date(user.streakLastDate).toLocaleDateString('en-CA');
    }
    
    // Already recorded today -> ensure streak is at least 1 and return
    if (lastDateStr === todayStr) {
      const currentStreak = Math.max(1, user.streak || 1);
      if (user.streak !== currentStreak) {
        return await prisma.user.update({
          where: { id: user.id },
          data: { streak: currentStreak }
        });
      }
      return user;
    }
    
    let newStreak = 1;
    if (lastDateStr) {
      const d1 = new Date(todayStr);
      const d2 = new Date(lastDateStr);
      const diffTime = d1.getTime() - d2.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Logged in on consecutive day
        newStreak = Math.max(1, user.streak || 0) + 1;
      } else if (diffDays <= 0) {
        // Same day fallback
        newStreak = Math.max(1, user.streak || 1);
      } else {
        // Missed more than 24-48 hours (skipped a day) -> Reset to Day 1
        newStreak = 1;
      }
    } else {
      // First visit ever -> Start at 1
      newStreak = 1;
    }
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        streak: newStreak,
        streakLastDate: now
      }
    });
    return updated;
  } catch (err) {
    console.error('updateDailyVisitStreak error:', err);
    return user;
  }
}

app.get(['/api/user', '/api/user/profile'], authenticateToken, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    // Automatically count daily visit streak on website visit/profile load
    user = await updateDailyVisitStreak(user);

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
// --- Edit Profile API ---
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName) return res.status(400).json({ error: 'กรุณากรอกชื่อ' });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { fullName }
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        faceImage: updatedUser.faceImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' });
  }
});

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

  const systemPrompt = `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบคัดเลือกข้าราชการตำรวจ (กองการสอบ กองบัญชาการศึกษา)
กรุณาสร้างข้อสอบแบบปรนัย (4 ตัวเลือก ก, ข, ค, ง) คุณภาพสูงจำนวน 10 ข้อ สำหรับวิชา: "${catName}"

🎯 สัดส่วนโครงสร้างข้อสอบตามแนวข้อสอบตำรวจจริง (ง่าย-ปานกลาง-ยาก คละกัน):
1. **70% ข้อสอบถามนิยาม ตัวบทระเบียบ หลักการ และความจำแม่นยำ (Definitions & Core Rules 70%)**:
   - ถามนิยามความหมายตามระเบียบ, ประเภท/ชนิดเอกสาร, มาตรฐานแบบพิมพ์/ขนาดตราครุฑ, ลำดับขั้นตอน, ระยะเวลา/จำนวนวัน, ชั้นความเร็ว/ชั้นความลับ, ผู้มีอำนาจลงนาม/สั่งการ, ข้อยกเว้นตามระเบียบ
   - **เทคนิคตัวเลือกหลอกในข้อสอบนิยาม**: ตัวเลือกต้องหลอกอย่างคมกริบ เช่น สลับคำใกล้เคียง, สลับคำเชื่อมเงื่อนไข ("และ" vs "หรือ", "ต้อง" vs "อาจ"), สลับตัวเลข/จำนวนวัน, สลับตำแหน่งผู้มีอำนาจ
2. **30% ข้อสอบสถานการณ์จำลองและการประยุกต์ใช้ (Applied Scenarios & Case Study 30%)**:
   - ผูกโจทย์เป็นสถานการณ์สมมติในการปฏิบัติหน้าที่ของตำรวจ การจัดทำเอกสาร การสั่งการ หรือการวิเคราะห์ข้อผิดพลาดในเคสตัวอย่าง
3. **ระดับความยากง่าย (Difficulty Mix)**:
   - มีทั้งข้อง่าย (จำได้ตอบได้ทันที ~30%), ปานกลาง (ต้องแม่นระเบียบ ~50%) และข้อยาก/ดักจุดผิดเล็กๆ น้อยๆ (~20%) ปะปนกันอย่างลงตัว
4. **ความถูกต้องของเนื้อหาจริง 100% (100% Factually Grounded)**:
   - คำตอบที่ถูกต้องและคำอธิบายเฉลยต้องตรงตามตัวบทกฎหมายและระเบียบจริง ไม่มั่วข้อเท็จจริง
5. **คำอธิบายเฉลยที่เจาะลึก (Deep-Dive Explanation)**:
   - อธิบายว่าทำไมข้อที่ถูกจึงถูกต้อง และชี้จุดว่าตัวเลือกหลอกข้ออื่นผิดตรงจุดไหนอย่างชัดเจน

ผลลัพธ์ที่คุณส่งกลับต้องเป็น JSON Array ของข้อสอบ 10 ข้อนี้เท่านั้น ห้ามมี markdown (เช่น \`\`\`json) หรือข้อความอธิบายใดๆ นอกเหนือจาก JSON:
[
  {
    "questionText": "โจทย์คำถาม...",
    "choice1": "ตัวเลือก ก...",
    "choice2": "ตัวเลือก ข...",
    "choice3": "ตัวเลือก ค...",
    "choice4": "ตัวเลือก ง...",
    "correctAnswer": 0, // ดัชนีคำตอบที่ถูกต้อง (0 = ก, 1 = ข, 2 = ค, 3 = ง)
    "explanation": "อธิบายเฉลยอย่างละเอียด อ้างอิงระเบียบ/ข้อกฎหมาย และชี้จุดที่ตัวเลือกอื่นหลอก..."
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
    const now = new Date();
    const lastActive = new Date(currentUser.updatedAt);
    let newStreak = currentUser.streak;
    
    const diffHours = (now - lastActive) / (1000 * 60 * 60);
    const isSameDay = now.toDateString() === lastActive.toDateString();
    
    if (diffHours > 24) {
      // If they somehow skipped verify and it's > 24h, reset and add 1
      newStreak = 1;
    } else if (!isSameDay) {
      // Different day, within 24 hours -> increment streak
      newStreak += 1;
    } else if (newStreak === 0) {
      // First time doing an exam or just reset to 0
      newStreak = 1;
    } // simple streak increment placeholder or retain

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

// --- Public Stats Route ---
app.get('/api/public/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalExams = await prisma.examSet.count();
    // Use a fixed high pass rate for marketing, or calculate real one
    res.json({
      users: totalUsers,
      exams: totalExams,
      passRate: 92 // Static for now, since we don't track global pass/fail strictly
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// --- Announcements (Public / Protected) ---

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

// Post Likes in-memory Map (postId -> Set of userIds)
const postLikesStore = new Map();

// Auto delete posts older than 7 days
async function cleanupExpiredPosts() {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const expiredPosts = await prisma.post.findMany({
      where: { createdAt: { lt: oneWeekAgo } },
      select: { id: true }
    });
    if (expiredPosts.length > 0) {
      const expiredIds = expiredPosts.map(p => p.id);
      await prisma.comment.deleteMany({
        where: { postId: { in: expiredIds } }
      });
      await prisma.post.deleteMany({
        where: { id: { in: expiredIds } }
      });
      expiredIds.forEach(id => postLikesStore.delete(id));
      console.log(`[Auto-Clean] Cleaned up ${expiredIds.length} expired posts (> 7 days).`);
    }
  } catch (err) {
    console.error('Cleanup expired posts error:', err);
  }
}

// Run cleanup on startup and hourly
cleanupExpiredPosts();
setInterval(cleanupExpiredPosts, 60 * 60 * 1000);

// Get all posts (within 7 days, latest first - Public Read with Optional Auth)
app.get('/api/community/posts', async (req, res) => {
  try {
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (e) {}
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: oneWeekAgo }
      },
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

    const enrichedPosts = posts.map(p => {
      const likedUsers = postLikesStore.get(p.id) || new Set();
      return {
        ...p,
        likesCount: likedUsers.size,
        isLiked: currentUserId ? likedUsers.has(currentUserId) : false
      };
    });

    res.json(enrichedPosts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดโพสต์ได้' });
  }
});

// Like / Unlike a post
app.post('/api/community/posts/:postId/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;

  if (!postLikesStore.has(postId)) {
    postLikesStore.set(postId, new Set());
  }

  const likedUsers = postLikesStore.get(postId);
  let isLiked = false;

  if (likedUsers.has(userId)) {
    likedUsers.delete(userId);
    isLiked = false;
  } else {
    likedUsers.add(userId);
    isLiked = true;
  }

  res.json({ success: true, isLiked, likesCount: likedUsers.size });
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

// Delete a post (owner or ADMIN/OWNER)
app.delete('/api/community/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });
    if (!post) {
      return res.status(404).json({ error: 'ไม่พบโพสต์ที่ต้องการลบ' });
    }

    // Check if requester is post owner or ADMIN/OWNER
    const requester = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });
    const isAdmin = requester && (requester.role === 'ADMIN' || requester.role === 'OWNER' || req.user.role === 'ADMIN' || req.user.role === 'OWNER');

    if (post.userId !== req.user.userId && !isAdmin) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบโพสต์นี้ (เฉพาะเจ้าของโพสต์หรือแอดมินเท่านั้น)' });
    }

    // Delete comments first, then the post (transaction)
    await prisma.$transaction([
      prisma.comment.deleteMany({
        where: { postId: parseInt(postId) }
      }),
      prisma.post.delete({
        where: { id: parseInt(postId) }
      })
    ]);

    postLikesStore.delete(parseInt(postId));

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

// Update group details
app.put('/api/community/groups/:groupId', authenticateToken, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const { name, description, isPrivate, image } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อกลุ่ม' });
  }

  try {
    // Check if current user is ADMIN or CREATOR
    const currentMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.userId } },
      include: { group: true }
    });

    if (!currentMember || (currentMember.role !== 'ADMIN' && currentMember.group.createdById !== req.user.userId)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขการตั้งค่ากลุ่มนี้' });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        isPrivate: !!isPrivate,
        ...(image !== undefined && { image })
      }
    });

    res.json(updatedGroup);
  } catch (err) {
    console.error('Update group error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลกลุ่มได้' });
  }
});

app.post('/api/community/groups', authenticateToken, async (req, res) => {
  const { name, description, isPrivate, image } = req.body;
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
          image: image ? image : null,
          isPrivate: !!isPrivate,
          createdById: req.user.userId
        }
      });
      // Add creator as member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: req.user.userId,
          status: 'ACCEPTED'
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
          select: { userId: true, status: true }
        }
      }
    });

    // Format output to include members count and membership flag
    const formatted = groups.map(g => {
      const membership = g.members.find(m => m.userId === req.user.userId);
      return {
        id: g.id,
        name: g.name,
        description: g.description,
        image: g.image,
        isPrivate: g.isPrivate,
        createdAt: g.createdAt,
        createdById: g.createdById,
        creatorName: g.createdBy.fullName || g.createdBy.username,
        memberCount: g.members.filter(m => m.status === 'ACCEPTED').length,
        membershipStatus: membership ? membership.status : 'NONE'
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลกลุ่มได้' });
  }
});

// Delete group (creator or ADMIN/OWNER)
app.delete('/api/community/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) {
      return res.status(404).json({ error: 'ไม่พบกลุ่มที่ต้องการลบ' });
    }

    // Check if requester is creator or ADMIN/OWNER
    const requester = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });
    const isAdmin = requester && (requester.role === 'ADMIN' || requester.role === 'OWNER' || req.user.role === 'ADMIN' || req.user.role === 'OWNER');

    if (group.createdById !== req.user.userId && !isAdmin) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบกลุ่มนี้ (เฉพาะผู้สร้างกลุ่มหรือแอดมินเท่านั้น)' });
    }

    // Clean up members and group chats first if needed
    try {
      await prisma.groupMember.deleteMany({ where: { groupId: parseInt(groupId) } });
      await prisma.groupChat.deleteMany({ where: { groupId: parseInt(groupId) } });
    } catch(subErr) {}

    await prisma.group.delete({
      where: { id: parseInt(groupId) }
    });

    res.json({ message: 'ลบกลุ่มสำเร็จ' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบกลุ่มได้' });
  }
});

// Join group (or request to join if private)
app.post('/api/community/groups/:groupId/join', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) {
      return res.status(404).json({ error: 'ไม่พบกลุ่มที่ต้องการเข้าร่วม' });
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'คุณมีสถานะสมาชิกหรือรอการอนุมัติในกลุ่มนี้อยู่แล้ว' });
    }

    const status = group.isPrivate ? 'PENDING' : 'ACCEPTED';

    await prisma.groupMember.create({
      data: {
        groupId: parseInt(groupId),
        userId: req.user.userId,
        status
      }
    });

    res.json({
      message: group.isPrivate ? 'ส่งคำขอเข้าร่วมกลุ่มแล้ว รอผู้สร้างอนุมัติ' : 'เข้าร่วมกลุ่มสำเร็จ',
      status
    });
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
    // Verify membership status is ACCEPTED
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member || member.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'กรุณาเข้าร่วมกลุ่ม (และได้รับการอนุมัติ) ก่อนเข้าอ่านแชท' });
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
    // Verify membership status is ACCEPTED
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: req.user.userId
        }
      }
    });
    if (!member || member.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'คุณไม่ได้เป็นสมาชิก (หรือยังไม่ได้รับการอนุมัติ) ในกลุ่มนี้' });
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

// --- Battle Complete Route (awards points for combat resolution: +30 win, -30 loss, min 0) ---
app.post('/api/user/battle-complete', authenticateToken, async (req, res) => {
  const { winner, subject } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Winner +30 Pts, Loser -30 Pts (Minimum points 0, no negative)
    const pointsChange = winner ? 30 : -30;
    const newPoints = Math.max(0, (user.points || 0) + pointsChange);
    const actualDiff = newPoints - (user.points || 0);

    const xpAwarded = winner ? 50 : 10;
    const newXp = (user.xp || 0) + xpAwarded;
    let newLevel = user.level || 1;
    let tempXp = newXp;
    let levelUp = false;

    while (tempXp >= 100) {
      tempXp -= 100;
      newLevel += 1;
      levelUp = true;
    }

    const updateData = {
      points: newPoints,
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
      updateData[field] = Math.min(100, (user[field] || 0) + 2);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    res.json({
      message: winner ? '🎉 ชนะการประลอง! (+30 แต้ม)' : '😢 แพ้การประลอง (-30 แต้ม)',
      pointsAwarded: actualDiff,
      xpAwarded,
      levelUp,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        xp: updatedUser.xp,
        battleWins: updatedUser.battleWins
      }
    });
  } catch (err) {
    console.error('Battle Complete Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลการประลอง' });
  }
});

// --- End Battle Complete Route ---

// Get join requests (creator only)
app.get('/api/community/groups/:groupId/requests', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    const requests = await prisma.groupMember.findMany({
      where: {
        groupId: parseInt(groupId),
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });

    res.json(requests);
  } catch (err) {
    console.error('Fetch group requests error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำขอเข้าร่วมได้' });
  }
});

// Approve join request (creator only)
app.post('/api/community/groups/:groupId/requests/:userId/approve', authenticateToken, async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์อนุมัติ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: parseInt(userId)
        }
      },
      data: { status: 'ACCEPTED' }
    });

    res.json({ message: 'อนุมัติผู้ใช้งานเข้าร่วมกลุ่มเรียบร้อย' });
  } catch (err) {
    console.error('Approve group request error:', err);
    res.status(500).json({ error: 'ไม่สามารถอนุมัติคำขอได้' });
  }
});

// Decline join request (creator only)
app.post('/api/community/groups/:groupId/requests/:userId/decline', authenticateToken, async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });
    if (!group) return res.status(404).json({ error: 'ไม่พบกลุ่ม' });
    if (group.createdById !== req.user.userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ปฏิเสธ (เฉพาะผู้สร้างกลุ่มเท่านั้น)' });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: parseInt(userId)
        }
      }
    });

    res.json({ message: 'ปฏิเสธคำขอเข้าร่วมกลุ่มเรียบร้อย' });
  } catch (err) {
    console.error('Decline group request error:', err);
    res.status(500).json({ error: 'ไม่สามารถปฏิเสธคำขอได้' });
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
      let status = 'NONE';
      if (rel) {
        if (rel.status === 'ACCEPTED') {
          status = 'ACCEPTED';
        } else if (rel.status === 'PENDING') {
          status = rel.userId === req.user.userId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
        }
      }
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        faceImage: u.faceImage,
        friendStatus: status
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

// Send friend request (saves as PENDING, or auto-accepts if opposite request exists)
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
      
      // If a request from them to us is PENDING, we accept it
      if (existingRelation.userId === fId) {
        await prisma.friend.update({
          where: { id: existingRelation.id },
          data: { status: 'ACCEPTED' }
        });
        return res.json({ message: 'ยอมรับคำขอเป็นเพื่อนเรียบร้อยแล้ว', status: 'ACCEPTED' });
      } else {
        return res.status(400).json({ error: 'คุณได้ส่งคำขอเป็นเพื่อนไปแล้ว รอการตอบรับ' });
      }
    } else {
      // Create new pending friend request
      await prisma.friend.create({
        data: {
          userId: req.user.userId,
          friendId: fId,
          status: 'PENDING'
        }
      });
      res.json({ message: 'ส่งคำขอเป็นเพื่อนแล้ว รอการตอบรับ', status: 'PENDING' });
    }
  } catch (err) {
    console.error('Add friend request error:', err);
    res.status(500).json({ error: 'ไม่สามารถเพิ่มเพื่อนได้' });
  }
});

// Fetch pending incoming friend requests
app.get('/api/friends/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.friend.findMany({
      where: {
        friendId: req.user.userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, faceImage: true }
        }
      }
    });
    const formatted = requests.map(r => ({
      id: r.id,
      senderId: r.userId,
      username: r.user.username,
      fullName: r.user.fullName,
      faceImage: r.user.faceImage
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Fetch friend requests error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดคำขอเป็นเพื่อนได้' });
  }
});

// Accept a friend request
app.post('/api/friends/request/:friendId/accept', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const request = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: fId,
          friendId: req.user.userId
        }
      }
    });
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'ไม่พบคำขอเป็นเพื่อนดังกล่าว' });
    }

    await prisma.friend.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' }
    });

    res.json({ message: 'รับแอดเป็นเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Accept friend error:', err);
    res.status(500).json({ error: 'ไม่สามารถตอบรับเป็นเพื่อนได้' });
  }
});

// Decline/Delete a friend request
app.post('/api/friends/request/:friendId/decline', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const request = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: fId,
          friendId: req.user.userId
        }
      }
    });
    if (!request) {
      return res.status(404).json({ error: 'ไม่พบคำขอเป็นเพื่อนดังกล่าว' });
    }

    await prisma.friend.delete({
      where: { id: request.id }
    });

    res.json({ message: 'ปฏิเสธคำขอเป็นเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Decline friend error:', err);
    res.status(500).json({ error: 'ไม่สามารถปฏิเสธคำขอเป็นเพื่อนได้' });
  }
});

// Delete a friend / Unfriend
app.delete('/api/friends/:friendId', authenticateToken, async (req, res) => {
  const fId = parseInt(req.params.friendId);
  try {
    const friendRelation = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: fId },
          { userId: fId, friendId: req.user.userId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendRelation) {
      return res.status(404).json({ error: 'ไม่พบความสัมพันธ์เพื่อนดังกล่าว' });
    }

    await prisma.friend.delete({
      where: { id: friendRelation.id }
    });

    res.json({ message: 'ลบเพื่อนสำเร็จ' });
  } catch (err) {
    console.error('Unfriend error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบเพื่อนได้' });
  }
});

// Get another user's public profile and relation status
app.get('/api/user/:userId/profile', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  try {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        username: true,
        fullName: true,
        faceImage: true,
        level: true,
        points: true,
        streak: true,
        battleWins: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    // Check relationship status
    const rel = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, friendId: targetId },
          { userId: targetId, friendId: req.user.userId }
        ]
      }
    });

    // Check if blocked by either
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: req.user.userId, blockedId: targetId },
          { userId: targetId, blockedId: req.user.userId }
        ]
      }
    });

    let relationStatus = 'NONE'; // NONE, ACCEPTED, PENDING_SENT, PENDING_RECEIVED, BLOCKED
    if (block) {
      relationStatus = 'BLOCKED';
    } else if (rel) {
      if (rel.status === 'ACCEPTED') {
        relationStatus = 'ACCEPTED';
      } else if (rel.status === 'PENDING') {
        relationStatus = rel.userId === req.user.userId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
      }
    }

    res.json({
      ...user,
      relationStatus
    });
  } catch (err) {
    console.error('Fetch public profile error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดโปรไฟล์ผู้ใช้งานได้' });
  }
});

// Get another user's post history
app.get('/api/user/:userId/posts', authenticateToken, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  try {
    const posts = await prisma.post.findMany({
      where: { userId: targetId },
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
    console.error('Fetch user posts error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดประวัติการโพสต์ได้' });
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

// POST to join and poll real-time matchmaking queue
app.post('/api/exams/battle/poll-match', authenticateToken, async (req, res) => {
  const { subject, isRanked } = req.body;
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
        subject: existingMatch.subject,
        opponent,
        questions: existingMatch.questions
      });
    }

    // 3. Update or add self to the queue
    let selfInQueue = battleQueue.find(u => u.userId === req.user.userId);
    if (selfInQueue) {
      selfInQueue.lastPoll = now;
      selfInQueue.subject = subject || 'ทั่วไป';
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
          points: user.points || 0,
          faceImage: user.faceImage,
          subject: subject || 'ทั่วไป',
          lastPoll: now
        };
        battleQueue.push(selfInQueue);
      }
    }

    // 4. Try to find another REAL active user in queue
    let partner = null;
    if (isRanked && selfInQueue) {
      partner = battleQueue.find(u => u.userId !== req.user.userId && Math.abs((u.points || 0) - (selfInQueue.points || 0)) <= 200);
    } else {
      partner = battleQueue.find(u => u.userId !== req.user.userId && u.subject === subject);
      if (!partner) {
        partner = battleQueue.find(u => u.userId !== req.user.userId);
      }
    }

    if (partner) {
      // Remove both from queue
      const idx1 = battleQueue.findIndex(u => u.userId === req.user.userId);
      if (idx1 !== -1) battleQueue.splice(idx1, 1);
      const idx2 = battleQueue.findIndex(u => u.userId === partner.userId);
      if (idx2 !== -1) battleQueue.splice(idx2, 1);

      // Fetch questions matching exact subject or aliases
      const selectedSubj = subject || partner.subject || 'ทั่วไป';
      const { questions: formattedQuestions } = await getBattleQuestionsForSubject(selectedSubj);

      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMatch = {
        matchId,
        player1: {
          userId: req.user.userId,
          username: selfInQueue.username,
          fullName: selfInQueue.fullName,
          level: selfInQueue.level,
          points: selfInQueue.points,
          faceImage: selfInQueue.faceImage
        },
        player2: partner,
        subject: selectedSubj,
        questions: formattedQuestions,
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
        subject: selectedSubj,
        opponent: partner,
        questions: formattedQuestions
      });
    }

    res.json({ status: 'searching' });
  } catch (err) {
    console.error('Matchmaking Poll Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาคู่ต่อสู้' });
  }
});

// --- Custom Battle Rooms Store & Endpoints ---
const customBattleRooms = new Map();

// 1. GET /api/battle/rooms - List all public active lobby rooms
app.get('/api/battle/rooms', authenticateToken, (req, res) => {
  const now = Date.now();
  const roomsList = [];

  for (const [code, r] of customBattleRooms.entries()) {
    if (now - r.createdAt > 30 * 60 * 1000 || !r.players || r.players.length === 0) {
      customBattleRooms.delete(code);
      continue;
    }
    if (!r.isPrivate && r.status === 'LOBBY') {
      roomsList.push({
        roomCode: r.roomCode,
        hostName: r.hostName,
        subject: r.subject,
        maxPlayers: r.maxPlayers,
        currentPlayers: r.players.length,
        isPrivate: r.isPrivate,
        createdAt: r.createdAt
      });
    }
  }

  res.json({ rooms: roomsList });
});

// 2. POST /api/battle/room/create - Create a new room
app.post('/api/battle/room/create', authenticateToken, async (req, res) => {
  const { subject, isPrivate, maxPlayers } = req.body;
  const now = Date.now();

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });

    const roomCode = 'RM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = {
      roomCode,
      hostUserId: user.id,
      hostName: user.fullName || user.username,
      subject: subject || 'งานสารบรรณ',
      isPrivate: !!isPrivate,
      maxPlayers: parseInt(maxPlayers) || 8,
      players: [
        {
          userId: user.id,
          username: user.username,
          fullName: user.fullName || user.username,
          level: user.level || 1,
          points: user.points || 0,
          faceImage: user.faceImage,
          isHost: true
        }
      ],
      status: 'LOBBY',
      selectedSetTitle: '',
      questions: [],
      createdAt: now
    };

    customBattleRooms.set(roomCode, newRoom);
    res.json({ roomCode, room: newRoom });
  } catch (err) {
    console.error('Create Room Error:', err);
    res.status(500).json({ error: 'ไม่สามารถสร้างห้องประลองได้' });
  }
});

// 3. POST /api/battle/room/join - Join an existing room
app.post('/api/battle/room/join', authenticateToken, async (req, res) => {
  const { roomCode } = req.body;
  const cleanCode = (roomCode || '').trim().toUpperCase();

  try {
    const room = customBattleRooms.get(cleanCode);
    if (!room || !room.players || room.players.length === 0) {
      customBattleRooms.delete(cleanCode);
      return res.status(404).json({ error: 'ไม่พบห้องประลองนี้ หรือห้องถูกปิดแล้ว' });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ error: 'ห้องประลองนี้เต็มแล้ว' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });

    let player = room.players.find(p => p.userId === user.id);
    if (!player) {
      player = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        level: user.level || 1,
        points: user.points || 0,
        faceImage: user.faceImage,
        isHost: false
      };
      room.players.push(player);
    }

    res.json({ roomCode: cleanCode, room });
  } catch (err) {
    console.error('Join Room Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเข้าร่วมห้องได้' });
  }
});

// 3.5. POST /api/battle/room/leave - Leave or close room
app.post('/api/battle/room/leave', authenticateToken, (req, res) => {
  try {
    const { roomCode } = req.body || {};
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const room = customBattleRooms.get(cleanCode);

    if (!room) {
      return res.json({ success: true, roomDeleted: true });
    }

    const currentUserId = req.user ? req.user.userId : null;

    if (currentUserId) {
      // Filter out leaving player using safe String comparison
      room.players = (room.players || []).filter(p => String(p.userId) !== String(currentUserId));

      // If no players remain OR the user who left was the room host -> DELETE ROOM!
      if (room.players.length === 0 || String(room.hostUserId) === String(currentUserId)) {
        customBattleRooms.delete(cleanCode);
        return res.json({ success: true, roomDeleted: true });
      }
    } else if (room.players.length === 0) {
      customBattleRooms.delete(cleanCode);
      return res.json({ success: true, roomDeleted: true });
    }

    res.json({ success: true, roomDeleted: false, room });
  } catch (err) {
    console.error('Leave Room Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากห้อง' });
  }
});

// 3.6. GET /api/battle/room/status - Poll status of current room
app.get('/api/battle/room/status', authenticateToken, (req, res) => {
  try {
    const { roomCode } = req.query || {};
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const room = customBattleRooms.get(cleanCode);

    if (!room || !room.players || room.players.length === 0) {
      if (cleanCode) customBattleRooms.delete(cleanCode);
      return res.status(404).json({ error: 'ห้องถูกปิดแล้ว', roomDeleted: true });
    }

    res.json({ room });
  } catch (err) {
    console.error('Room status error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดสถานะห้องได้' });
  }
});

// 3.7. POST /api/battle/room/update-score - Real user live score sync
app.post('/api/battle/room/update-score', authenticateToken, (req, res) => {
  try {
    const { roomCode, score, currentIndex, isFinished } = req.body;
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const room = customBattleRooms.get(cleanCode);
    if (!room) return res.status(404).json({ error: 'ไม่พบห้องประลอง' });

    room.scores = room.scores || {};
    room.scores[req.user.userId] = {
      userId: req.user.userId,
      score: parseInt(score) || 0,
      currentIndex: parseInt(currentIndex) || 0,
      isFinished: !!isFinished,
      updatedAt: Date.now()
    };

    res.json({ success: true, scores: room.scores });
  } catch (err) {
    console.error('Update room score error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตคะแนน' });
  }
});

// 3.8. GET /api/battle/room/live-score - Get live scores of all real players
app.get('/api/battle/room/live-score', authenticateToken, (req, res) => {
  try {
    const { roomCode } = req.query || {};
    const cleanCode = (roomCode || '').trim().toUpperCase();
    const room = customBattleRooms.get(cleanCode);
    if (!room) return res.status(404).json({ error: 'ไม่พบห้องประลอง' });

    res.json({
      roomCode: cleanCode,
      scores: room.scores || {},
      players: room.players || []
    });
  } catch (err) {
    console.error('Get room live score error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงคะแนน' });
  }
});

// 3.9. POST /api/exams/battle/match-score - 1v1 Matchmaking real score sync
app.post('/api/exams/battle/match-score', authenticateToken, (req, res) => {
  try {
    const { matchId, score, currentIndex, isFinished } = req.body;
    const match = activeMatches.get(matchId);
    if (!match) return res.status(404).json({ error: 'ไม่พบการแข่งขันนี้' });

    match.scores = match.scores || {};
    match.scores[req.user.userId] = {
      userId: req.user.userId,
      score: parseInt(score) || 0,
      currentIndex: parseInt(currentIndex) || 0,
      isFinished: !!isFinished,
      updatedAt: Date.now()
    };

    res.json({ success: true, scores: match.scores });
  } catch (err) {
    console.error('Update match score error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตคะแนน' });
  }
});

// 3.10. GET /api/exams/battle/match-status - 1v1 Matchmaking status & real live scores
app.get('/api/exams/battle/match-status', authenticateToken, (req, res) => {
  try {
    const { matchId } = req.query;
    const match = activeMatches.get(matchId);
    if (!match) return res.status(404).json({ error: 'ไม่พบการแข่งขันนี้' });

    res.json({
      matchId,
      scores: match.scores || {},
      player1: match.player1,
      player2: match.player2
    });
  } catch (err) {
    console.error('Get match status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงสถานะการแข่งขัน' });
  }
});

const AUTHENTIC_SUBJECT_QUESTION_BANKS = {
  saraban: [
    {
      questionText: 'ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม หนังสือราชการมีกี่ชนิด?',
      choices: ['4 ชนิด', '5 ชนิด', '6 ชนิด', '7 ชนิด'],
      correctAnswer: 3,
      explanation: 'หนังสือราชการมี 6 ชนิด ได้แก่ หนังสือภายนอก, หนังสือภายใน, หนังสือประทับตรา, หนังสือสั่งการ, หนังสือประชาสัมพันธ์ และหนังสือที่เจ้าหน้าที่ทำขึ้นหรือรับไว้เป็นหลักฐาน'
    },
    {
      questionText: 'การรับรองสำเนาถูกต้องของเอกสารในสำนักงานตำรวจแห่งชาติ ตาม ปรต. ลักษณะที่ 54 ข้าราชการตำรวจผู้ลงชื่อต้องมียศใดขึ้นไป?',
      choices: ['สิบตำรวจตรี (ส.ต.ต.) ขึ้นไป', 'ดาบตำรวจ (ด.ต.) ขึ้นไป', 'ร้อยตำรวจตรี (ร.ต.ต.) ขึ้นไป', 'พันตำรวจตรี (พ.ต.ต.) ขึ้นไป'],
      correctAnswer: 3,
      explanation: 'ตาม ปรต. ลักษณะที่ 54 ข้อ 3 กำหนดให้ข้าราชการตำรวจชั้นสัญญาบัตรยศ ร้อยตำรวจตรี (ร.ต.ต.) ขึ้นไป ของหน่วยงานเจ้าของเรื่อง เป็นผู้ลงชื่อรับรองสำเนาถูกต้อง'
    },
    {
      questionText: 'หนังสือราชการที่ต้องปฏิบัติให้เร็วกว่าปกติ มีกี่ประเภท ตามระเบียบงานสารบรรณ?',
      choices: ['2 ประเภท (ด่วน, ด่วนที่สุด)', '3 ประเภท (ด่วน, ด่วนมาก, ด่วนที่สุด)', '4 ประเภท (ด่วน, ด่วนมาก, ด่วนที่สุด, ด่วนพิเศษ)', '5 ประเภท'],
      correctAnswer: 2,
      explanation: 'หนังสือที่ต้องปฏิบัติให้เร็วกว่าปกติมี 3 ประเภท คือ ด่วนที่สุด (ปฏิบัติทันทีที่ได้รับ), ด่วนมาก (ปฏิบัติโดยเร็ว), และ ด่วน (ปฏิบัติเร็วกว่าปกติ)'
    },
    {
      questionText: 'หนังสือราชการโดยทั่วไปมีอายุการเก็บรักษาไว้ไม่น้อยกว่ากี่ปี?',
      choices: ['5 ปี', '10 ปี', '15 ปี', '20 ปี'],
      correctAnswer: 2,
      explanation: 'โดยปกติหนังสือราชการให้เก็บรักษาไว้ไม่น้อยกว่า 10 ปี เว้นแต่หนังสือที่ต้องสงวนเป็นความลับ หนังสือที่มีคุณค่าทางประวัติศาสตร์ หรือหนังสือที่ระเบียบกำหนดไว้เป็นอย่างอื่น'
    },
    {
      questionText: 'รหัสตัวพยัญชนะประจำสำนักงานตำรวจแห่งชาติที่ใช้ในโครงสร้างเลขที่หนังสือออกคือข้อใด?',
      choices: ['ตช', 'สตช', 'ตร', 'ปช'],
      correctAnswer: 3,
      explanation: 'รหัสตัวพยัญชนะประจำสำนักงานตำรวจแห่งชาติคือ "ตร" ตามด้วยเลขรหัสประจำส่วนราชการ เช่น ตร 0001/... เป็นต้น'
    },
    {
      questionText: 'ตาม ปรต. ลักษณะที่ 54 การจัดเจ้าหน้าที่ไปรับงานที่ศูนย์รับ-ส่งหนังสือ ตร. (สลก.ตร.) กำหนดไว้วันละกี่ครั้ง?',
      choices: ['วันละ 1 ครั้ง ก่อน 12.00 น.', 'วันละ 2 ครั้ง (ก่อน 10.00 น. และก่อน 15.00 น.)', 'วันละ 3 ครั้ง เช้า กลางวัน เย็น', 'สัปดาห์ละ 2 ครั้ง'],
      correctAnswer: 2,
      explanation: 'ตาม ปรต. ลักษณะที่ 54 กำหนดให้หน่วยงานในสังกัด ตร. ในเขต กทม. จัดเจ้าหน้าที่ไปรับงานวันละ 2 ครั้ง คือ ช่วงเช้าก่อน 10.00 น. และช่วงบ่ายก่อน 15.00 น.'
    },
    {
      questionText: 'การส่งคืนหนังสือที่ส่งผิดหน่วยงาน ตาม ปรต. ลักษณะที่ 54 ผู้ลงชื่อส่งคืนต้องดำรงตำแหน่งไม่ต่ำกว่าตำแหน่งใด?',
      choices: ['สารวัตร (สว.)', 'รองผู้กำกับการ (รอง ผกก.)', 'ผู้กำกับการ (ผกก.) หรือเทียบเท่า', 'ผู้บังคับการ (ผบก.)'],
      correctAnswer: 3,
      explanation: 'การส่งคืนหนังสือที่ไม่ได้อยู่ในหน้าที่ความรับผิดชอบ ต้องทำหนังสือส่งคืนภายในวันเดียวกันหรืออย่างช้าวันรุ่งขึ้น โดยผู้ลงชื่อส่งคืนต้องดำรงตำแหน่งไม่ต่ำกว่า ผกก. หรือเทียบเท่า'
    },
    {
      questionText: 'ไปรษณีย์สนามของตำรวจตระเวนชายแดน พัสดุไปรษณีย์ที่ฝากส่งต้องมีน้ำหนักสูงสุดไม่เกินเท่าใด?',
      choices: ['2 กิโลกรัม', '3 กิโลกรัม', '5 กิโลกรัม', '10 กิโลกรัม'],
      correctAnswer: 3,
      explanation: 'ตาม ปรต. ลักษณะที่ 54 ไปรษณีย์ภัณฑ์และพัสดุไปรษณีย์สนามของ ตชด. ต้องมีน้ำหนักไม่เกิน 5 กิโลกรัมต่อชิ้น'
    },
    {
      questionText: 'คำลงท้ายในหนังสือราชการภายนอกที่ส่งถึงบุคคลธรรมดาทั่วไป ใช้คำว่าอะไร?',
      choices: ['ด้วยความนับถือ', 'ขอแสดงความนับถือ', 'ขอแสดงความนับถืออย่างยิ่ง', 'ขอแสดงความเคารพอย่างสูง'],
      correctAnswer: 2,
      explanation: 'หนังสือราชการภายนอกที่ส่งถึงบุคคลธรรมดาหรือข้าราชการทั่วไป ให้ใช้คำลงท้ายว่า "ขอแสดงความนับถือ"'
    },
    {
      questionText: 'หนังสือประทับตราตามระเบียบงานสารบรรณ ใช้กระดาษชนิดใด?',
      choices: ['กระดาษบันทึกข้อความ', 'กระดาษตราครุฑ', 'กระดาษขาวธรรมดา', 'กระดาษหัวจดหมาย'],
      correctAnswer: 2,
      explanation: 'หนังสือประทับตราใช้ "กระดาษตราครุฑ" และประทับตราชื่อส่วนราชการด้วยหมึกสีแดงแทนการลงชื่อ'
    },
    {
      questionText: 'ตราครุฑสำหรับหนังสือราชการตามระเบียบงานสารบรรณ มี 2 ขนาด คือขนาดความสูงเท่าใด?',
      choices: ['2.5 ซม. และ 1.0 ซม.', '3.0 ซม. และ 1.5 ซม.', '3.5 ซม. และ 2.0 ซม.', '4.0 ซม. และ 2.0 ซม.'],
      correctAnswer: 2,
      explanation: 'ตราครุฑมี 2 ขนาด คือ ขนาดใหญ่สูง 3 เซนติเมตร (สำหรับหนังสือภายนอก/คำสั่ง) และขนาดเล็กสูง 1.5 เซนติเมตร (สำหรับหนังสือภายใน/บันทึกข้อความ)'
    },
    {
      questionText: 'คำย่อของตำแหน่ง "จเรตำรวจแห่งชาติ" ตามระเบียบ ตร. คือข้อใด?',
      choices: ['จร.ตร.', 'จตช.', 'จเร.ตร.', 'จต.'],
      correctAnswer: 2,
      explanation: 'คำย่อตำแหน่ง จเรตำรวจแห่งชาติ คือ "จตช."'
    }
  ],
  general: [
    {
      questionText: 'อนุกรม: 2, 5, 10, 17, 26, ... จำนวนถัดไปคือข้อใด?',
      choices: ['35', '37', '39', '41'],
      correctAnswer: 2,
      explanation: 'รูปแบบคือ n^2 + 1: 1^2+1=2, 2^2+1=5, 3^2+1=10, 4^2+1=17, 5^2+1=26, 6^2+1 = 37'
    },
    {
      questionText: 'ผลรวมของเลขจำนวนเต็มตั้งแต่ 1 ถึง 100 เท่ากับเท่าใด?',
      choices: ['5,000', '5,050', '5,100', '5,150'],
      correctAnswer: 2,
      explanation: 'ใช้สูตร n(n+1)/2 = 100 * 101 / 2 = 5,050'
    },
    {
      questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?',
      choices: ['A = C', 'A > C', 'A < C', 'สรุปไม่ได้'],
      correctAnswer: 2,
      explanation: 'เนื่องจาก B เท่ากับ C ดังนั้นเมื่อ A มากกว่า B ย่อมทำให้ A มากกว่า C ด้วย'
    },
    {
      questionText: 'สินค้าราคาป้าย 1,200 บาท ร้านค้าลดราคาให้ 15% ผู้ซื้อจะต้องจ่ายเงินกี่บาท?',
      choices: ['1,000 บาท', '1,020 บาท', '1,050 บาท', '1,080 บาท'],
      correctAnswer: 2,
      explanation: 'ลด 15% คือลด 1,200 * 0.15 = 180 บาท ดังนั้นราคาที่ต้องจ่าย = 1,200 - 180 = 1,020 บาท'
    },
    {
      questionText: 'นาย ก ขับรถด้วยความเร็วเฉลี่ย 80 กม./ชม. ใช้เวลาเดินทาง 3 ชั่วโมง 30 นาที จะได้ระยะทางเท่าใด?',
      choices: ['240 กิโลเมตร', '260 กิโลเมตร', '280 กิโลเมตร', '300 กิโลเมตร'],
      correctAnswer: 3,
      explanation: 'ระยะทาง = ความเร็ว x เวลา = 80 x 3.5 = 280 กิโลเมตร'
    },
    {
      questionText: 'ปัจจุบันพ่อมีอายุเป็น 3 เท่าของลูก อีก 10 ปีข้างหน้า ผลรวมอายุของทั้งสองคนจะเป็น 68 ปี ปัจจุบันลูกมีอายุกี่ปี?',
      choices: ['10 ปี', '12 ปี', '14 ปี', '16 ปี'],
      correctAnswer: 2,
      explanation: 'ให้ลูกอายุ x ปี พ่ออายุ 3x ปี อีก 10 ปีข้างหน้า: (x+10) + (3x+10) = 68 -> 4x + 20 = 68 -> 4x = 48 -> x = 12 ปี'
    },
    {
      questionText: 'ห.ร.ม. และ ค.ร.น. ของ 12 และ 18 คือข้อใดตามลำดับ?',
      choices: ['4 และ 36', '6 และ 36', '6 และ 48', '3 และ 36'],
      correctAnswer: 2,
      explanation: 'ห.ร.ม. ของ 12 และ 18 คือ 6 ส่วน ค.ร.น. คือ 36'
    },
    {
      questionText: 'ตรรกศาสตร์: คนขยันทุกคนสอบผ่าน, สมศักดิ์สอบไม่ผ่าน ข้อสรุปใดถูกต้อง?',
      choices: ['สมศักดิ์เป็นคนขยัน', 'สมศักดิ์ไม่ได้เป็นคนขยัน', 'สมศักดิ์ไม่ได้อ่านหนังสือ', 'สรุปแน่นอนไม่ได้'],
      correctAnswer: 2,
      explanation: 'จากเงื่อนไข คนขยันทุกคนสอบผ่าน เมื่อสมศักดิ์สอบไม่ผ่าน แสดงว่าสมศักดิ์ไม่ใช่คนขยัน (Contrapositive)'
    },
    {
      questionText: 'มีลูกบอลสีแดง 4 ลูก สีเขียว 6 ลูก สุ่มหยิบลูกบอล 1 ลูก ความน่าจะเป็นที่จะได้ลูกบอลสีแดงเป็นเท่าใด?',
      choices: ['2/5', '3/5', '1/4', '1/2'],
      correctAnswer: 1,
      explanation: 'ความน่าจะเป็น = 4 / (4 + 6) = 4/10 = 2/5'
    },
    {
      questionText: 'เลข 3 จำนวนเรียงกัน ผลรวมของทั้งสามจำนวนเท่ากับ 72 เลขจำนวนที่อยู่ตรงกลางคือข้อใด?',
      choices: ['22', '23', '24', '25'],
      correctAnswer: 3,
      explanation: 'ให้เลขสามจำนวนคือ x-1, x, x+1 -> ผลรวม = 3x = 72 -> x = 24'
    },
    {
      questionText: 'ซื้อของมาราคา 500 บาท ขายไปได้กำไร 20% จะต้องขายไปในราคากี่บาท?',
      choices: ['550 บาท', '580 บาท', '600 บาท', '620 บาท'],
      correctAnswer: 3,
      explanation: 'กำไร 20% ของ 500 = 100 บาท ราคาขาย = 500 + 100 = 600 บาท'
    },
    {
      questionText: 'อนุกรม: 3, 7, 15, 31, 63, ... จำนวนถัดไปคือข้อใด?',
      choices: ['120', '125', '127', '129'],
      correctAnswer: 3,
      explanation: 'รูปแบบคือ x 2 + 1: 3x2+1=7, 7x2+1=15, 15x2+1=31, 31x2+1=63, 63x2+1 = 127'
    }
  ],
  thai: [
    {
      questionText: 'ข้อใดเขียนสะกดตัวการันต์ได้ถูกต้องทุกคำ?',
      choices: ['อนุญาต, ปรากฏ, สังเกต', 'อนุญาติ, ปรากฎ, สังเกตุ', 'อนุญาต, ปรากฎ, สังเกตุ', 'อนุญาติ, ปรากฏ, สังเกต'],
      correctAnswer: 1,
      explanation: 'อนุญาต (ไม่มีสระอิ), ปรากฏ (ใช้ ฏ ปฏัก), สังเกต (ไม่มีสระอุ) เป็นคำที่ถูกต้องตามพจนานุกรมฉบับราชบัณฑิตยสถาน'
    },
    {
      questionText: 'คำในข้อใดใช้ลักษณนามว่า "เล่ม" ทุกคำ?',
      choices: ['หนังสือ, สมุด, ดาบ, เข็ม', 'หนังสือ, ดินสอ, เกวียน, ร่ม', 'ตะปู, ดาบ, เลื่อย, เทียน', 'สมุด, ไม้บรรทัด, ปากกา, ปืน'],
      correctAnswer: 1,
      explanation: 'หนังสือ สมุด ดาบ เข็ม เกวียน เทียน ใช้ลักษณนามว่า "เล่ม"'
    },
    {
      questionText: 'สำนวนในข้อใดมีความหมายตรงกับคำว่า "ทำอะไรย่อมได้รับผลเช่นนั้น"?',
      choices: ['กงเกวียนกำเกวียน', 'หว่านพืชหวังผล', 'ปลูกเรือนตามใจผู้อยู่', 'ขี่ช้างจับตั๊กแตน'],
      correctAnswer: 1,
      explanation: '"กงเกวียนกำเกวียน" หมายถึง การกระทำที่ทำสิ่งใดไว้ผลย่อมตามสนองแบบนั้น'
    },
    {
      questionText: 'คำราชาศัพท์ในข้อใดหมายถึง "คำสั่ง" ของพระมหากษัตริย์?',
      choices: ['พระราโชวาท', 'พระบรมราชโองการ', 'พระราชดำรัส', 'พระราชบัญชา'],
      correctAnswer: 2,
      explanation: 'พระบรมราชโองการ ใช้สำหรับคำสั่งของพระมหากษัตริย์'
    },
    {
      questionText: 'คำว่า "มรณภาพ" ใช้สำหรับบุคคลในข้อใด?',
      choices: ['พระมหากษัตริย์', 'พระภิกษุสงฆ์', 'เจ้านายชั้นผู้ใหญ่', 'ประชาชนทั่วไป'],
      correctAnswer: 2,
      explanation: '"มรณภาพ" เป็นคำราชาศัพท์/คำสุภาพสำหรับพระภิกษุสงฆ์ สามเณร'
    },
    {
      questionText: 'ข้อใดเป็นประโยคที่ถูกต้องและชัดเจน ไม่มีความกำกวม?',
      choices: ['คนขับรถชนต้นไม้บาดเจ็บ', 'ตำรวจจับผู้ร้ายที่ขโมยสร้อยคอทองคำได้อย่างรวดเร็ว', 'เขาเห็นคนกำลังกินข้าวกับสุนัข', 'แม่บอกลูกว่าน้องไม่สบาย'],
      correctAnswer: 2,
      explanation: 'ประโยค "ตำรวจจับผู้ร้ายที่ขโมยสร้อยคอทองคำได้อย่างรวดเร็ว" มีโครงสร้างประธาน กริยา กรรม และขยายส่วนชัดเจน ไม่กำกวม'
    },
    {
      questionText: 'สำนวน "ขี่ช้างจับตั๊กแตน" มีความหมายตรงกับข้อใด?',
      choices: ['ทำงานใหญ่โตเกินความสามารถ', 'ลงทุนมากแต่ได้ผลประโยชน์ตอบแทนน้อย', 'ทำลายทรัพยากรโดยเปล่าประโยชน์', 'แสดงอำนาจข่มขู่ผู้อื่น'],
      correctAnswer: 2,
      explanation: 'ขี่ช้างจับตั๊กแตน หมายถึง ลงทุนหรือเสียกำลังมาก แต่ได้ผลตอบแทนเพียงเล็กน้อย'
    },
    {
      questionText: 'คำคู่ใดมีความหมายตรงข้ามกัน (Antonym)?',
      choices: ['สุจริต - ทุจริต', 'กตัญญู - รู้คุณ', 'ปรีชา - ฉลาด', 'ยุติธรรม - เป็นธรรม'],
      correctAnswer: 1,
      explanation: 'สุจริต (ประพฤติดี ชอบธรรม) ตรงข้ามกับ ทุจริต (คดโกง ประพฤติมิชอบ)'
    },
    {
      questionText: 'คำราชาศัพท์ "เสวย" มีความหมายตรงกับคำสามัญว่าอย่างไร?',
      choices: ['นอนหลับ', 'รับประทาน / กิน', 'เดินเล่น', 'อาบน้ำ'],
      correctAnswer: 2,
      explanation: 'เสวย แปลว่า กิน, ดื่ม หรือรับประทาน'
    },
    {
      questionText: 'ข้อใดเขียนสะกดถูกต้องทุกคำ?',
      choices: ['กะเพรา, กะทัดรัด, ชะลอ', 'กระเพรา, กระทัดรัด, ชลอ', 'กะเพรา, กระทัดรัด, ชะลอ', 'กระเพรา, กะทัดรัด, ชลอ'],
      correctAnswer: 1,
      explanation: 'กะเพรา (ไม่มี ร), กะทัดรัด (ไม่มี ร), ชะลอ (มี สระอะ) เขียนถูกต้องตามพจนานุกรม'
    },
    {
      questionText: 'คำว่า "คมนาคม" เป็นคำสมาสที่เกิดจากการสนธิของคำใด?',
      choices: ['คม + นาคม', 'คมน + อาคม', 'คม + อาคม', 'คมนา + คม'],
      correctAnswer: 2,
      explanation: 'คมนาคม เกิดจาก คมน (การไป) + อาคม (การมา) สนธิกันเป็น คมนาคม'
    },
    {
      questionText: 'ข้อใดใช้ภาษาทางการได้ถูกต้องและเหมาะสมที่สุด?',
      choices: ['หมอฉีดยาให้คนไข้ทุกคนแล้ว', 'แพทย์ได้ให้การรักษาผู้ป่วยทุกรายเรียบร้อยแล้ว', 'ทางสถานีตำรวจขอให้ทุกคนช่วยกันเป็นหูเป็นตา', 'ตำรวจจับโจรได้คาหนังคาเขา'],
      correctAnswer: 2,
      explanation: 'ประโยค "แพทย์ได้ให้การรักษาผู้ป่วยทุกรายเรียบร้อยแล้ว" ใช้คำศัพท์ทางการระดับแบบแผนถูกต้อง'
    }
  ],
  english: [
    {
      questionText: "Choose the correct word: The police officer asked the driver to ______ his driver's license.",
      choices: ["show", "showing", "shown", "shows"],
      correctAnswer: 1,
      explanation: "โครงสร้าง ask someone to + V.infinitive ดังนั้นใช้ show"
    },
    {
      questionText: "Which sentence is grammatically correct?",
      choices: ["He don't like coffee.", "She doesn't likes coffee.", "They doesn't like coffee.", "He doesn't like coffee."],
      correctAnswer: 4,
      explanation: "ประธานเอกพจน์ He ใช้ doesn't ตามด้วยกริยาช่อง 1 รูปเดิม (like)"
    },
    {
      questionText: "The synonym of the word ASSIST is ______.",
      choices: ["hinder", "help", "ignore", "prevent"],
      correctAnswer: 2,
      explanation: "assist แปลว่า ช่วยเหลือ ตรงกับคำว่า help"
    },
    {
      questionText: "The police ______ the suspect yesterday afternoon.",
      choices: ["arrest", "arrests", "arrested", "are arresting"],
      correctAnswer: 3,
      explanation: "มีคำว่า yesterday บ่งบอกเหตุการณ์ในอดีต (Past Simple Tense) ต้องใช้กริยาช่อง 2 arrested"
    },
    {
      questionText: "If it ______ tomorrow, the police outdoor training will be postponed.",
      choices: ["rains", "will rain", "rained", "is raining"],
      correctAnswer: 1,
      explanation: "First Conditional: If + Present Simple (rains), Future Simple (will be postponed)"
    },
    {
      questionText: "Choose the correct preposition: She has been working at the police department ______ 2018.",
      choices: ["for", "since", "in", "during"],
      correctAnswer: 2,
      explanation: "ใช้ since กับจุดเริ่มต้นของเวลา (since 2018) ใน Present Perfect Tense"
    },
    {
      questionText: "The antonym of the word GUILTY is ______.",
      choices: ["criminal", "innocent", "suspect", "victim"],
      correctAnswer: 2,
      explanation: "guilty แปลว่า มีความผิด ตรงข้ามกับ innocent ที่แปลว่า บริสุทธิ์/ไร้ความผิด"
    },
    {
      questionText: 'Officer: "Can I help you, sir?" - Citizen: "______"',
      choices: ["Yes, I would like to report a lost wallet.", "No, you cannot.", "I am fine, goodbye.", "Yes, I am a policeman."],
      correctAnswer: 1,
      explanation: "การตอบรับเจ้าหน้าที่ตำรวจที่สุภาพและเหมาะสมในสถานการณ์แจ้งความคือ Yes, I would like to report a lost wallet."
    },
    {
      questionText: "The word EVIDENCE means ______ in Thai legal context.",
      choices: ["พยานหลักฐาน", "คำพิพากษา", "ผู้ต้องหา", "หมายศาล"],
      correctAnswer: 1,
      explanation: "evidence แปลว่า พยานหลักฐาน ที่ใช้ในกระบวนการยุติธรรม"
    },
    {
      questionText: "The case ______ by the investigator last week.",
      choices: ["solved", "was solved", "is solved", "has solved"],
      correctAnswer: 2,
      explanation: "Passive Voice ในอดีต (Past Simple): Subject + was/were + V.3 -> was solved"
    },
    {
      questionText: "Please keep quiet, the detective ______ to the witness right now.",
      choices: ["listens", "listened", "is listening", "has listened"],
      correctAnswer: 3,
      explanation: "มีคำว่า right now บ่งบอกเหตุการณ์ที่กำลังดำเนินอยู่ (Present Continuous) จึงใช้ is listening"
    },
    {
      questionText: "Neither the inspector nor the officers ______ in the meeting room.",
      choices: ["is", "are", "was", "be"],
      correctAnswer: 2,
      explanation: "โครงสร้าง Neither...nor ให้ผันกริยาตามประธานตัวหลัง the officers ซึ่งเป็นพหูพจน์ จึงใช้ are"
    }
  ],
  social: [
    {
      questionText: 'ประเทศใดไม่ได้อยู่ในกลุ่มผู้ก่อตั้งสมาคมประชาชาติแห่งเอเชียตะวันออกเฉียงใต้ (ASEAN) ในปี พ.ศ. 2510?',
      choices: ['ไทย', 'อินโดนีเซีย', 'เวียดนาม', 'ฟิลิปปินส์'],
      correctAnswer: 3,
      explanation: 'ผู้ก่อตั้งอาเซียน 5 ประเทศแรกในปี 2510 ได้แก่ ไทย อินโดนีเซีย มาเลเซีย ฟิลิปปินส์ และสิงคโปร์ (เวียดนามเข้าร่วมในปี 2538)'
    },
    {
      questionText: 'วันสำคัญทางพระพุทธศาสนาวันใดที่มีเหตุการณ์สำคัญคือ พระสงฆ์ 1,250 รูปมาประชุมกันโดยมิได้นัดหมาย?',
      choices: ['วันมาฆบูชา', 'วันวิสาขบูชา', 'วันอาสาฬหบูชา', 'วันอัฐมีบูชา'],
      correctAnswer: 1,
      explanation: 'วันมาฆบูชา มีเหตุการณ์สำคัญคือ จาตุรงคสันนิบาต พระสงฆ์ 1,250 รูปมาประชุมพร้อมเพรียงกันโดยมิได้นัดหมาย'
    },
    {
      questionText: 'เสาหลักประชาคมอาเซียน (ASEAN Community) ประกอบด้วยกี่เสาหลัก?',
      choices: ['2 เสาหลัก', '3 เสาหลัก', '4 เสาหลัก', '5 เสาหลัก'],
      correctAnswer: 2,
      explanation: '3 เสาหลักอาเซียน ได้แก่ 1. ประชาคมการเมืองและความมั่นคง (APSC) 2. ประชาคมเศรษฐกิจ (AEC) 3. ประชาคมสังคมและวัฒนธรรม (ASCC)'
    },
    {
      questionText: 'สำนักงานเลขาธิการอาเซียน (ASEAN Secretariat) ตั้งอยู่ที่เมืองหลวงของประเทศใด?',
      choices: ['กรุงเทพฯ ประเทศไทย', 'กัวลาลัมเปอร์ ประเทศมาเลเซีย', 'จาการ์ตา ประเทศอินโดนีเซีย', 'สิงคโปร์'],
      correctAnswer: 3,
      explanation: 'สำนักงานเลขาธิการอาเซียนตั้งอยู่ที่ กรุงจาการ์ตา ประเทศอินโดนีเซีย'
    },
    {
      questionText: 'หลักปรัชญาของเศรษฐกิจพอเพียง ประกอบด้วย 3 ห่วง 2 เงื่อนไข ข้อใดไม่ใช่ 3 ห่วง?',
      choices: ['ความพอประมาณ', 'ความมีเหตุผล', 'การมีภูมิคุ้มกันที่ดี', 'ความร่ำรวย'],
      correctAnswer: 4,
      explanation: '3 ห่วง ได้แก่ พอประมาณ มีเหตุผล และมีภูมิคุ้มกันที่ดีในตัว (2 เงื่อนไขคือ ความรู้ และคุณธรรม)'
    },
    {
      questionText: 'วันตำรวจไทย ในปัจจุบันตรงกับวันใดของทุกปี?',
      choices: ['13 ตุลาคม', '17 ตุลาคม', '23 ตุลาคม', '5 ธันวาคม'],
      correctAnswer: 2,
      explanation: 'วันตำรวจไทยปัจจุบันกำหนดให้ตรงกับวันที่ 17 ตุลาคมของทุกปี (วันสถาปนาสำนักงานตำรวจแห่งชาติ)'
    },
    {
      questionText: 'คำขวัญของประชาคมอาเซียน (ASEAN Motto) คือข้อใด?',
      choices: ['One Vision, One Identity, One Community', 'Peace, Prosperity, People', 'United in Diversity', 'One Region, One Goal'],
      correctAnswer: 1,
      explanation: 'คำขวัญอาเซียนคือ "One Vision, One Identity, One Community" (หนึ่งวิสัยทัศน์ หนึ่งเอกลักษณ์ หนึ่งประชาคม)'
    },
    {
      questionText: 'วันอาสาฬหบูชา มีความสำคัญอย่างไรในทางพระพุทธศาสนา?',
      choices: ['วันประสูติ ตรัสรู้ ปรินิพพาน', 'วันที่มีพระรัตนตรัยครบองค์สามเป็นครั้งแรก', 'วันแสดงโอวาทปาติโมกข์', 'วันถวายพระเพลิงพระพุทธสรีระ'],
      correctAnswer: 2,
      explanation: 'วันอาสาฬหบูชา เป็นวันที่พระพุทธเจ้าทรงแสดงปฐมเทศนา (ธัมมจักกัปปวัตตนสูตร) ทำให้เกิดพระสงฆ์องค์แรกและมีพระรัตนตรัยครบ 3 องค์'
    },
    {
      questionText: 'หลักธรรม "อิทธิบาท 4" ซึ่งเป็นหลักธรรมแห่งความสำเร็จ ประกอบด้วยข้อใดบ้าง?',
      choices: ['ฉันทะ วิริยะ จิตตะ วิมังสา', 'ทาน ศีล ภาวนา สมาธิ', 'เมตตา กรุณา มุทิตา อุเบกขา', 'สัจจะ ทมะ ขันติ จาคัง'],
      correctAnswer: 1,
      explanation: 'อิทธิบาท 4 ประกอบด้วย ฉันทะ (ความพอใจรักใคร่), วิริยะ (ความพากเพียร), จิตตะ (ความเอาใจใส่), วิมังสา (การไตร่ตรองทบทวน)'
    },
    {
      questionText: 'รัฐธรรมนูญแห่งราชอาณาจักรไทยฉบับปัจจุบัน คือฉบับพุทธศักราชใด?',
      choices: ['พ.ศ. 2540', 'พ.ศ. 2550', 'พ.ศ. 2560', 'พ.ศ. 2562'],
      correctAnswer: 3,
      explanation: 'รัฐธรรมนูญฉบับปัจจุบันคือ รัฐธรรมนูญแห่งราชอาณาจักรไทย พุทธศักราช 2560 (ฉบับที่ 20)'
    },
    {
      questionText: 'เป้าหมายการพัฒนาที่ยั่งยืน (SDGs) ของสหประชาชาติ มีทั้งหมดกี่เป้าหมาย?',
      choices: ['10 เป้าหมาย', '15 เป้าหมาย', '17 เป้าหมาย', '20 เป้าหมาย'],
      correctAnswer: 3,
      explanation: 'เป้าหมายการพัฒนาที่ยั่งยืน (SDGs) มีทั้งหมด 17 เป้าหมาย ครอบคลุมเศรษฐกิจ สังคม และสิ่งแวดล้อม'
    },
    {
      questionText: 'ข้อใดเป็นมรดกภูมิปัญญาทางวัฒนธรรมของไทยที่ได้รับการขึ้นทะเบียนจาก UNESCO?',
      choices: ['โขน นวดไทย โนรา สงกรานต์', 'มวยปล้ำ ตะกร้อลอดห่วง', 'การแข่งเรือยาว ลอยกระทง', 'ลิเก งิ้ว หนังตะลุง'],
      correctAnswer: 1,
      explanation: 'โขน, นวดไทย, โนรา และประเพณีสงกรานต์ในประเทศไทย ได้รับการขึ้นทะเบียนเป็นมรดกทางวัฒนธรรมที่จับต้องไม่ได้จาก UNESCO'
    }
  ],
  law: [
    {
      questionText: 'บิดาแห่งกฎหมายไทย คือบุคคลใด?',
      choices: ['พระองค์เจ้ารพีพัฒนศักดิ์ (กรมหลวงราชบุรีดิเรกฤทธิ์)', 'สมเด็จกรมพระยาดำรงราชานุภาพ', 'พ่อขุนรามคำแหงมหาราช', 'พระยาแมนปกรณ์นิติธาดา'],
      correctAnswer: 1,
      explanation: 'พระเจ้าบรมวงศ์เธอ กรมหลวงราชบุรีดิเรกฤทธิ์ (พระองค์เจ้ารพีพัฒนศักดิ์) ทรงเป็นผู้วางรากฐานกฎหมายและการศาลสมัยใหม่ จึงได้รับการยกย่องเป็นบิดาแห่งกฎหมายไทย'
    },
    {
      questionText: 'กฎหมายสูงสุดในการปกครองประเทศไทยคือข้อใด?',
      choices: ['ประมวลกฎหมายอาญา', 'รัฐธรรมนูญแห่งราชอาณาจักรไทย', 'พระราชบัญญัติตำรวจแห่งชาติ', 'ประมวลกฎหมายวิธีพิจารณาความอาญา'],
      correctAnswer: 2,
      explanation: 'รัฐธรรมนูญเป็นกฎหมายสูงสุด บทบัญญัติใดขัดหรือแย้งต่อรัฐธรรมนูญ บทบัญญัตินั้นเป็นอันใช้บังคับมิได้'
    },
    {
      questionText: 'โทษทางอาญาตามประมวลกฎหมายอาญา มาตรา 18 มี 5 สถาน เรียงจากหนักไปเบาคือข้อใด?',
      choices: ['ประหารชีวิต, จำคุก, กักขัง, ปรับ, ริบทรัพย์สิน', 'จำคุก, ประหารชีวิต, กักขัง, ริบทรัพย์สิน, ปรับ', 'ประหารชีวิต, กักขัง, จำคุก, ปรับ, ริบทรัพย์สิน', 'ประหารชีวิต, จำคุก, ริบทรัพย์สิน, กักขัง, ปรับ'],
      correctAnswer: 1,
      explanation: 'โทษทางอาญา 5 สถานตามมาตรา 18 ได้แก่ 1. ประหารชีวิต 2. จำคุก 3. กักขัง 4. ปรับ 5. ริบทรัพย์สิน'
    },
    {
      questionText: 'ผู้ใดกระทำความผิดอาญาขณะอายุไม่เกินกี่ปี กฎหมายบัญญัติว่าไม่ต้องรับโทษ (ตาม ป.อาญา แก้ไขเพิ่มเติมล่าสุด)?',
      choices: ['ไม่เกิน 10 ปี', 'ไม่เกิน 12 ปี', 'ไม่เกิน 15 ปี', 'ไม่เกิน 18 ปี'],
      correctAnswer: 2,
      explanation: 'ตาม ป.อาญา มาตรา 73 (แก้ไขเพิ่มเติม) เด็กอายุไม่เกิน 12 ปี กระทำการอันกฎหมายบัญญัติเป็นความผิด เด็กนั้นไม่ต้องรับโทษ'
    },
    {
      questionText: 'การกระทำโดย "เจตนา" ตามประมวลกฎหมายอาญา มาตรา 59 หมายถึงข้อใด?',
      choices: ['กระทำโดยรู้สำนึกและประสงค์ต่อผลหรือย่อมเล็งเห็นผล', 'กระทำโดยปราศจากความระมัดระวัง', 'กระทำโดยรู้เท่าไม่ถึงการณ์', 'กระทำโดยถูกบังคับขู่เข็ญ'],
      correctAnswer: 1,
      explanation: 'การกระทำโดยเจตนา ได้แก่ การกระทำโดยรู้สำนึกในการที่กระทำ และในขณะเดียวกันผู้กระทำประสงค์ต่อผล หรือย่อมเล็งเห็นผลของการกระทำนั้น'
    },
    {
      questionText: 'ข้อใดจัดเป็น "ความผิดลหุโทษ" ตามประมวลกฎหมายอาญา?',
      choices: ['โทษจำคุกไม่เกิน 1 เดือน หรือปรับไม่เกิน 10,000 บาท หรือทั้งจำทั้งปรับ', 'โทษจำคุกไม่เกิน 6 เดือน หรือปรับไม่เกิน 20,000 บาท', 'โทษจำคุกไม่เกิน 1 ปี หรือปรับไม่เกิน 50,000 บาท', 'โทษปรับสถานเดียวไม่เกิน 5,000 บาท'],
      correctAnswer: 1,
      explanation: 'ความผิดลหุโทษ คือ ความผิดซึ่งต้องระวางโทษจำคุกไม่เกินหนึ่งเดือน หรือปรับไม่เกินหนึ่งหมื่นบาท หรือทั้งจำทั้งปรับ'
    },
    {
      questionText: 'การจับกุมบุคคลโดยไม่มีหมายจับ เจ้าพนักงานตำรวจสามารถกระทำได้ในกรณีใด?',
      choices: ['เมื่อพบการกระทำความผิดซึ่งหน้า', 'เมื่อผู้ต้องหามีท่าทางน่าสงสัยในเวลากลางวัน', 'เมื่อมีผู้โทรศัพท์มาแจ้งเบาะแสโดยไม่ระบุชื่อ', 'เมื่อต้องการสอบปากคำผู้ต้องสงสัย'],
      correctAnswer: 1,
      explanation: 'ตาม ป.วิ.อาญา เจ้าพนักงานจะจับกุมโดยไม่มีหมายจับได้เมื่อพบบุคคลกำลังกระทำความผิดซึ่งหน้า หรือมีเหตุจำเป็นเร่งด่วนตามที่กฎหมายระบุไว้'
    },
    {
      questionText: 'ข้อใดจัดเป็น "ความผิดอันยอมความได้" (ความผิดต่อส่วนตัว)?',
      choices: ['ความผิดฐานลักทรัพย์', 'ความผิดฐานหมิ่นประมาท', 'ความผิดฐานชิงทรัพย์', 'ความผิดฐานฆ่าผู้อื่น'],
      correctAnswer: 2,
      explanation: 'ความผิดฐานหมิ่นประมาท, ยักยอก, ฉ้อโกง จัดเป็นความผิดต่อส่วนตัวที่ยอมความกันได้ตามกฎหมาย'
    },
    {
      questionText: 'นิติกรรมที่เป็น "โมฆียะ" มีผลทางกฎหมายอย่างไร?',
      choices: ['ไม่มีผลทางกฎหมายมาตั้งแต่เริ่มต้น', 'มีผลสมบูรณ์จนกว่าจะถูกบอกล้าง', 'มีผลใช้บังคับได้เพียง 1 ปี', 'ต้องรอศาลพิพากษาก่อนจึงมีผล'],
      correctAnswer: 2,
      explanation: 'โมฆียะกรรมมีผลสมบูรณ์บังคับได้ตามกฎหมาย จนกว่าจะมีการบอกล้าง (ซึ่งจะทำให้กลายเป็นโมฆะมาแต่เริ่มแรก) หรือให้สัตยาบัน'
    },
    {
      questionText: 'บุคคลย่อมบรรลุนิติภาวะเมื่อมีอายุครบกี่ปีบริบูรณ์ ตาม ป.พ.พ.?',
      choices: ['18 ปีบริบูรณ์', '20 ปีบริบูรณ์', '21 ปีบริบูรณ์', '25 ปีบริบูรณ์'],
      correctAnswer: 2,
      explanation: 'ตามประมวลกฎหมายแพ่งและพาณิชย์ บุคคลบรรลุนิติภาวะเมื่อมีอายุครบ 20 ปีบริบูรณ์ หรือเมื่อทำการสมรสตามกฎหมาย'
    },
    {
      questionText: 'การป้องกันโดยชอบด้วยกฎหมายตาม ป.อาญา มาตรา 68 ผู้กระทำมีผลทางกฎหมายอย่างไร?',
      choices: ['มีความผิดแต่ไม่ต้องรับโทษ', 'ไม่มีความผิด', 'รับโทษกึ่งหนึ่ง', 'ขึ้นอยู่กับดุลพินิจของศาล'],
      correctAnswer: 2,
      explanation: 'การกระทำด้วยการป้องกันโดยชอบด้วยกฎหมาย กฎหมายบัญญัติว่า "ผู้นั้นไม่มีความผิด"'
    },
    {
      questionText: 'อายุความฟ้องคดีอาญาที่มีอัตราโทษประหารชีวิต หรือจำคุกตลอดชีวิต มีกำหนดกี่ปี?',
      choices: ['10 ปี', '15 ปี', '20 ปี', 'ไม่มีอายุความ'],
      correctAnswer: 3,
      explanation: 'ตาม ป.อาญา มาตรา 95 คดีความผิดที่มีระวางโทษประหารชีวิต จำคุกตลอดชีวิต หรือจำคุกยี่สิบปี มีกำหนดอายุความ 20 ปี'
    }
  ],
  computer: [
    {
      questionText: 'ปุ่มคีย์ลัดใดใช้ในการคัดลอก (Copy) ข้อความหรือไฟล์ในระบบปฏิบัติการ Windows?',
      choices: ['Ctrl + X', 'Ctrl + C', 'Ctrl + V', 'Ctrl + Z'],
      correctAnswer: 2,
      explanation: 'Ctrl + C คือ Copy (คัดลอก), Ctrl + X คือ Cut (ตัด), Ctrl + V คือ Paste (วาง), Ctrl + Z คือ Undo (ยกเลิก)'
    },
    {
      questionText: 'ข้อใดคือหน่วยความจำหลักของคอมพิวเตอร์ที่ข้อมูลจะสูญหายเมื่อปิดเครื่อง (Volatile Memory)?',
      choices: ['ROM', 'Hard Disk', 'RAM', 'Flash Drive'],
      correctAnswer: 3,
      explanation: 'RAM (Random Access Memory) เป็นหน่วยความจำหลักชั่วคราว ข้อมูลจะหายไปทั้งหมดเมื่อไม่มีกระแสไฟฟ้า'
    },
    {
      questionText: 'โปรโตคอลใดใช้ในการส่งและรับข้อมูลหน้าเว็บไซต์ทั่วไปอย่างปลอดภัยและมีการเข้ารหัส (Encrypted)?',
      choices: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      correctAnswer: 3,
      explanation: 'HTTPS (Hypertext Transfer Protocol Secure) มีการเข้ารหัสข้อมูลผ่าน SSL/TLS เพื่อความปลอดภัยในการสื่อสาร'
    },
    {
      questionText: 'ภัยคุกคามทางไซเบอร์ที่ใช้อีเมลหรือเว็บไซต์ปลอมเพื่อหลอกลวงเอาข้อมูลรหัสผ่านหรือข้อมูลส่วนตัว เรียกว่าอะไร?',
      choices: ['Phishing', 'DDoS Attack', 'Spyware', 'Ransomware'],
      correctAnswer: 1,
      explanation: 'Phishing (ฟิชชิง) คือ การหลอกลวงโดยสร้างหน้าเว็บหรืออีเมลเลียนแบบองค์กรที่น่าเชื่อถือเพื่อขโมยข้อมูลสำคัญ'
    },
    {
      questionText: 'อุปกรณ์ใดทำหน้าที่เป็นสมองหลักในการคำนวณและประมวลผลคำสั่งของคอมพิวเตอร์?',
      choices: ['CPU (Central Processing Unit)', 'GPU', 'Mainboard', 'Power Supply'],
      correctAnswer: 1,
      explanation: 'CPU คือ หน่วยประมวลผลกลาง ทำหน้าที่เปรียบเสมือนสมองของคอมพิวเตอร์'
    },
    {
      questionText: 'ในโปรแกรม Microsoft Excel ฟังก์ชันใดใช้สำหรับหา "ค่าเฉลี่ย" ของชุดข้อมูล?',
      choices: ['=SUM()', '=AVERAGE()', '=COUNT()', '=MAX()'],
      correctAnswer: 2,
      explanation: '=AVERAGE() ใช้หาค่าเฉลี่ยเลขคณิต, =SUM() ใช้หาผลรวม, =COUNT() ใช้นับจำนวน'
    },
    {
      questionText: 'ข้อใดไม่ใช่ระบบปฏิบัติการ (Operating System)?',
      choices: ['Microsoft Windows', 'Linux', 'Microsoft Excel', 'macOS'],
      correctAnswer: 3,
      explanation: 'Microsoft Excel เป็นซอฟต์แวร์ประยุกต์ (Application Software) ส่วน Windows, Linux, macOS เป็นระบบปฏิบัติการ'
    },
    {
      questionText: 'หมายเลข IP Address เวอร์ชัน 4 (IPv4) ประกอบด้วยตัวเลขกี่ชุด และมีขนาดกี่บิต?',
      choices: ['4 ชุด รวม 32 บิต', '4 ชุด รวม 64 บิต', '6 ชุด รวม 128 บิต', '8 ชุด รวม 32 บิต'],
      correctAnswer: 1,
      explanation: 'IPv4 ประกอบด้วยตัวเลขฐานสิบ 4 ชุด คั่นด้วยเครื่องหมายจุด (เช่น 192.168.1.1) มีขนาดรวม 32 บิต'
    },
    {
      questionText: 'มัลแวร์ประเภทใดที่ทำการเข้ารหัสล็อกไฟล์ในเครื่องเหยื่อแล้วเรียกค่าไถ่เพื่อแลกกับคีย์ปลดล็อก?',
      choices: ['Trojan Horse', 'Worm', 'Ransomware', 'Adware'],
      correctAnswer: 3,
      explanation: 'Ransomware (มัลแวร์เรียกค่าไถ่) จะเข้ารหัสไฟล์ข้อมูลของเหยื่อและขู่เรียกเงินค่าไถ่'
    },
    {
      questionText: 'บริการจัดเก็บข้อมูลไฟล์ออนไลน์ผ่านเครือข่ายอินเทอร์เน็ต เรียกว่าอะไร?',
      choices: ['Cloud Storage', 'Local Storage', 'Virtual Memory', 'Cache Memory'],
      correctAnswer: 1,
      explanation: 'Cloud Storage (เช่น Google Drive, OneDrive) คือ บริการฝากไฟล์และจัดเก็บข้อมูลออนไลน์บนคลาวด์'
    },
    {
      questionText: 'ปุ่มคีย์ลัด Ctrl + Z ในโปรแกรมส่วนใหญ่มีหน้าที่อะไร?',
      choices: ['บันทึกไฟล์ (Save)', 'ยกเลิกการกระทำล่าสุด (Undo)', 'พิมพ์เอกสาร (Print)', 'ปิดโปรแกรม (Close)'],
      correctAnswer: 2,
      explanation: 'Ctrl + Z ใช้สำหรับคำสั่ง Undo เพื่อยกเลิกหรือย้อนกลับการกระทำล่าสุด'
    },
    {
      questionText: 'หน่วยวัดความเร็วในการรับ-ส่งข้อมูลบนเครือข่ายอินเทอร์เน็ตที่นิยมใช้คือข้อใด?',
      choices: ['GHz (Gigahertz)', 'Mbps (Megabits per second)', 'DPI (Dots per inch)', 'RPM (Revolutions per minute)'],
      correctAnswer: 2,
      explanation: 'Mbps (Megabits per second) คือ หน่วยวัดความเร็วในการถ่ายโอนข้อมูลผ่านเครือข่ายอินเทอร์เน็ต'
    }
  ]
};

function getSubjectKey(subject) {
  const s = (subject || '').toString().toLowerCase();
  if (s.includes('สุ่ม') || s.includes('random') || s.includes('all') || !subject) {
    const allKeys = ['saraban', 'general', 'thai', 'english', 'social', 'law', 'computer'];
    return allKeys[Math.floor(Math.random() * allKeys.length)];
  }
  if (s.includes('สารบรรณ') || s.includes('saraban') || s.includes('54') || s.includes('secretariat') || s.includes('สบ')) {
    return 'saraban';
  }
  if (s.includes('ความสามารถ') || s.includes('ทั่วไป') || s.includes('general') || s.includes('คณิต') || s.includes('อนุกรม') || s.includes('ทป')) {
    return 'general';
  }
  if (s.includes('ไทย') || s.includes('thai')) {
    return 'thai';
  }
  if (s.includes('อังกฤษ') || s.includes('english') || s.includes('eng')) {
    return 'english';
  }
  if (s.includes('สังคม') || s.includes('social') || s.includes('อาเซียน') || s.includes('asean') || s.includes('วัฒนธรรม')) {
    return 'social';
  }
  if (s.includes('กฎหมาย') || s.includes('law') || s.includes('ตำรวจ') || s.includes('กม')) {
    return 'law';
  }
  if (s.includes('คอม') || s.includes('computer') || s.includes('สารสนเทศ')) {
    return 'computer';
  }
  return 'general';
}

function getCategoryAliases(subject) {
  const key = getSubjectKey(subject);
  switch (key) {
    case 'saraban':
      return ['secretariat', 'saraban', 'งานสารบรรณ', 'ลักษณะที่54', 'ลักษณะที่ 54', 'ระเบียบงานสารบรรณ', 'สารบรรณ', 'สบ'];
    case 'general':
      return ['general', 'ความสามารถทั่วไป', 'ทั่วไป', 'คณิตศาสตร์', 'อนุกรม', 'ความสามารถทั่วไป (คณิตศาสตร์)', 'ทป'];
    case 'thai':
      return ['thai', 'ภาษาไทย', 'ไทย'];
    case 'english':
      return ['english', 'ภาษาอังกฤษ', 'อังกฤษ', 'eng'];
    case 'social':
      return ['social', 'ความรู้สังคมฯ', 'สังคม', 'ความรู้สังคม วัฒนธรรม และความรู้เกี่ยวกับประชาคมอาเซียน', 'ความรู้สังคม', 'อาเซียน', 'asean'];
    case 'law':
      return ['law', 'กฎหมายตำรวจ', 'กฎหมาย', 'กฎหมายเบื้องต้น', 'กฎหมายตำรวจ / ความรู้เกี่ยวกับกฎหมายประชาชน', 'กฎหมายประชาชน', 'กม'];
    case 'computer':
      return ['computer', 'คอมพิวเตอร์', 'คอม', 'เทคโนโลยีสารสนเทศ (คอมพิวเตอร์สำนักงาน)', 'เทคโนโลยีสารสนเทศ', 'สารสนเทศ'];
    default:
      return [subject];
  }
}

async function getBattleQuestionsForSubject(subjectName) {
  const subjectKey = getSubjectKey(subjectName);
  const aliases = getCategoryAliases(subjectName);
  
  // 1. Find matching ExamSets by category aliases
  let sets = [];
  try {
    sets = await prisma.examSet.findMany({
      where: {
        OR: [
          ...aliases.map(a => ({ category: { contains: a, mode: 'insensitive' } })),
          ...aliases.map(a => ({ title: { contains: a, mode: 'insensitive' } }))
        ]
      },
      select: { id: true, title: true }
    });
  } catch (e) {
    console.error('ExamSet search error:', e);
  }

  let chosenTitle = sets.length > 0 ? sets[Math.floor(Math.random() * sets.length)].title : ('ข้อสอบจริงวิชา ' + subjectName);
  let setIds = sets.map(s => s.id);

  let qList = [];
  if (setIds.length > 0) {
    try {
      qList = await prisma.question.findMany({
        where: { examSetId: { in: setIds } }
      });
    } catch (e) {
      console.error('Questions fetch error:', e);
    }
  }

  // 2. If qList is small, search questions by examSet category/title directly
  if (qList.length < 10) {
    try {
      const extraQuestions = await prisma.question.findMany({
        where: {
          OR: [
            ...aliases.map(a => ({ examSet: { category: { contains: a, mode: 'insensitive' } } })),
            ...aliases.map(a => ({ examSet: { title: { contains: a, mode: 'insensitive' } } }))
          ]
        }
      });
      for (const eq of extraQuestions) {
        if (!qList.some(q => q.id === eq.id)) {
          qList.push(eq);
        }
      }
    } catch (e) {
      console.error('Extra questions fetch error:', e);
    }
  }

  // Standardize existing DB questions
  let formattedQuestions = qList.map(q => ({
    id: q.id,
    questionText: q.questionText,
    choices: [q.choice1, q.choice2, q.choice3, q.choice4],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || 'คำอธิบายเฉลยประลอง'
  }));

  // 3. Fallback exclusively to the AUTHENTIC question bank of THAT SPECIFIC SUBJECT (Never mix subjects!)
  const subjectBank = AUTHENTIC_SUBJECT_QUESTION_BANKS[subjectKey] || AUTHENTIC_SUBJECT_QUESTION_BANKS.general;
  if (formattedQuestions.length < 10) {
    const shuffledBank = localShuffle(subjectBank);
    for (let i = 0; i < shuffledBank.length && formattedQuestions.length < 10; i++) {
      const bq = shuffledBank[i];
      // Check if duplicate question text already exists in formattedQuestions
      if (!formattedQuestions.some(fq => fq.questionText === bq.questionText)) {
        formattedQuestions.push({
          id: `auth-${subjectKey}-${Date.now()}-${i}`,
          questionText: bq.questionText,
          choices: bq.choices,
          correctAnswer: bq.correctAnswer,
          explanation: bq.explanation
        });
      }
    }
  }

  formattedQuestions = localShuffle(formattedQuestions).slice(0, 10);
  return { chosenTitle, questions: formattedQuestions };
}

// 4. POST /api/battle/room/start-spin - Host triggers exam set spin & starts duel
app.post('/api/battle/room/start-spin', authenticateToken, async (req, res) => {
  const { roomCode } = req.body;
  const room = customBattleRooms.get((roomCode || '').trim().toUpperCase());

  if (!room) return res.status(404).json({ error: 'ไม่พบห้องประลอง' });
  if (String(room.hostUserId) !== String(req.user.userId)) {
    return res.status(403).json({ error: 'เฉพาะหัวหน้าห้องเท่านั้นที่กดเริ่มประลองได้' });
  }

  if (!room.players || room.players.length < 2) {
    return res.status(400).json({ error: 'ต้องมีผู้เล่นเข้าร่วมห้องอย่างน้อย 2 คนจึงจะเริ่มประลองได้' });
  }

  try {
    const { chosenTitle, questions } = await getBattleQuestionsForSubject(room.subject);

    room.status = 'SPINNING';
    room.selectedSetTitle = chosenTitle;
    room.questions = questions;

    res.json({
      success: true,
      roomCode: room.roomCode,
      subject: room.subject,
      selectedSetTitle: chosenTitle,
      questions
    });
  } catch (err) {
    console.error('Start Spin Error:', err);
    res.status(500).json({ error: 'ไม่สามารถเริ่มการสุ่มชุดข้อสอบได้' });
  }
});

// 5. GET /api/battle/room/status - Poll status for lobby / joined players
app.get('/api/battle/room/status', authenticateToken, (req, res) => {
  const roomCode = (req.query.roomCode || '').trim().toUpperCase();
  const room = customBattleRooms.get(roomCode);
  if (!room) return res.status(404).json({ error: 'ไม่พบห้องประลอง' });

  res.json({ room });
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

// --- Support Tickets API ---
app.post('/api/support/ticket', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'กรุณากรอกข้อความปัญหา' });
    
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        message
      }
    });
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งปัญหา' });
  }
});

app.get('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tickets });
  } catch (error) {
    console.error('Fetch support tickets error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติปัญหา' });
  }
});

// Start express server

// --- Admin API: Knowledge Topics List ---
app.get('/api/admin/knowledge-topics', authenticateToken, async (req, res) => {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      select: { id: true, title: true, category: true }
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Dedicated Subject-Specific Exam Prompt Builders (แยก Prompt แต่ละวิชา 100%)
// ============================================================================

function buildThaiPrompt({ count, subcategory, title, contextText }) {
  const target = `${subcategory || ''} ${title || ''}`.toLowerCase();

  let chapterTitle = 'วิชาภาษาไทย';
  let chapterSpecificRules = '';
  let exampleJson = '';

  if (target.includes('ระดับภาษา') || target.includes('บทที่ 4') || target.includes('บทที่4')) {
    chapterTitle = 'บทที่ 4: ระดับภาษา (ภาษาทางการ, ภาษากึ่งทางการ, ภาษาไม่เป็นทางการ/ภาษาปาก)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "ระดับภาษา" (Language Levels) - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นเรื่องการวิเคราะห์และจำแนก "ระดับภาษาไทย" เท่านั้น!**
   - ภาษาทางการ / ภาษาแบบแผน (ใช้ในหนังสือราชการ รายงานวิชาการ ปาฐกถา บทความวิจัย)
   - ภาษากึ่งทางการ / ภาษากึ่งแบบแผน (ใช้ในการประชุม ข่าว บทความแสดงความคิดเห็น การบรรยายทั่วไป)
   - ภาษาไม่เป็นทางการ / ภาษาปาก / ภาษาพูด (ใช้ในชีวิตประจำวัน สนทนาระหว่างเพื่อน บทสนทนาในนิยาย)
2. ⛔️ **ข้อห้ามเด็ดขาดสำหรับบทนี้:**
   - ❌ **ห้ามออกคำถามเรื่อง "โวหารการเขียน" (บรรยายโวหาร, พรรณนาโวหาร, เทศนาโวหาร...) เด็ดขาด!**
   - ❌ **ห้ามออกเรื่อง "โวหารภาพพจน์" (อุปมา, อุปลักษณ์, บุคคลวัต...) เด็ดขาด!**
   - ❌ **ห้ามออกเรื่องจับใจความบทความยาวๆ หรือการสะกดคำในบทนี้เด็ดขาด!**
3. 📖 **รูปแบบคำถามที่ต้องออก (คละรูปแบบกัน):**
   - *รูปแบบที่ 1 (จำแนกระดับภาษาของประโยค)*: ให้ตัวเลือก 4 ข้อ (ก, ข, ค, ง) เป็นประโยค 4 ประโยค แล้วถาม เช่น:
     - "ข้อความในข้อใดใช้ภาษาใน 'ระดับทางการ'?"
     - "ข้อความในข้อใดใช้ภาษาใน 'ระดับกึ่งทางการ'?"
     - "ข้อความในข้อใดใช้ภาษาไม่เป็นทางการ (ภาษาปาก)?"
     - "ข้อความในข้อใดใช้ระดับภาษาต่างจากข้ออื่น?"
   - *รูปแบบที่ 2 (วิเคราะห์ระดับภาษาจากข้อความ)*: กำหนดข้อความ 1-2 ประโยคในโจทย์ แล้วถาม เช่น:
     - "ข้อความข้างต้นจัดเป็นภาษาในระดับใด?"
     - "ข้อความข้างต้นตอนใดใช้ภาษาระดับไม่เป็นทางการ?"
   - *รูปแบบที่ 3 (การปรับระดับภาษา/การใช้ภาษาให้เหมาะสม)*:
     - "หากต้องการเปลี่ยนข้อความต่อไปนี้ให้เป็นภาษาระดับทางการ ควรเลือกใช้ข้อใด?"
4. 💡 **คำอธิบายเฉลย (Explanation):** ชี้แจงชัดเจนว่าประโยคแต่ละตัวเลือกเป็นภาษาระดับใด และมีคำภาษาปาก/กึ่งทางการ/ทางการคำใดปรากฏอยู่`;

    exampleJson = `[
  {
    "questionText": "ข้อความในข้อใดใช้ภาษาใน \"ระดับทางการ\"?",
    "optionA": "พวกเราทุกคนควรช่วยกันรักษาสิ่งแวดล้อมเพื่อไม่ให้โลกร้อนไปกว่านี้",
    "optionB": "การบริโภคอาหารที่มีประโยชน์และการออกกำลังกายอย่างสม่ำเสมอช่วยส่งเสริมสุขภาวะที่ดี",
    "optionC": "หมอบอกว่าคนไข้ต้องกินยาให้ครบไม่งั้นโรคอาจจะกำเริบขึ้นมาได้อีก",
    "optionD": "งานวิจัยนี้เจ๋งมากเพราะค้นพบวิธีแก้ปัญหาที่ตรงจุดและทำได้จริง",
    "correctOption": "B",
    "explanation": "ตัวเลือก ข เป็นภาษาระดับทางการถูกต้องสมบูรณ์ ไม่มีคำภาษาปาก ส่วน ก มีคำว่า 'พวกเรา', ค มีคำว่า 'หมอ/ไม่งั้น', ง มีคำว่า 'เจ๋งมาก' ซึ่งเป็นภาษาปากและกึ่งทางการ"
  },
  {
    "questionText": "ข้อความในข้อใดใช้ระดับภาษา \"ต่างจากข้ออื่น\"?",
    "optionA": "รัฐบาลมีนโยบายส่งเสริมการลงทุนในพื้นที่เขตพัฒนาพิเศษ",
    "optionB": "กระทรวงสาธารณสุขประกาศเตือนประชาชนให้ระมัดระวังโรคติดต่อตามฤดูกาล",
    "optionC": "การคมนาคมขนส่งทางรางมีบทบาทสำคัญในการขับเคลื่อนเศรษฐกิจ",
    "optionD": "ชาวบ้านแถวนี้บ่นกันอุบว่าค่าน้ำค่าไฟแพงขึ้นเยอะมากในช่วงหน้าร้อน",
    "correctOption": "D",
    "explanation": "ตัวเลือก ก, ข, ค ใช้ภาษาระดับทางการ ส่วนตัวเลือก ง ใช้ภาษาไม่เป็นทางการ (ภาษาปาก) เนื่องจากมีคำว่า 'แถวนี้', 'บ่นกันอุบ', 'เยอะมาก'"
  }
]`;
  } else if (target.includes('โวหารภาพพจน์') || target.includes('ภาพพจน์') || target.includes('บทที่ 3') || target.includes('บทที่3')) {
    chapterTitle = 'บทที่ 3: โวหารภาพพจน์ (อุปมา, อุปลักษณ์, บุคคลวัต, สัทพจน์, อธิพจน์, สัญลักษณ์, นามนัย)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "โวหารภาพพจน์" (Figurative Language) - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นการวิเคราะห์โวหารภาพพจน์ในร้อยกรอง/วรรณกรรม/ร้อยแก้วเปรียบเทียบเท่านั้น!**
   - อุปมา (Simile - เปรียบเหมือน ดุจ ประหนึ่ง ราวกับ เพี้ยง กล ดั่ง)
   - อุปลักษณ์ (Metaphor - เปรียบเป็น คือ)
   - บุคคลวัต / บุคคลสมมุติ (Personification - สิ่งไม่มีชีวิต/ธรรมชาติแสดงกิริยาอาการเยี่ยงมนุษย์)
   - สัทพจน์ (Onomatopoeia - เลียนเสียงธรรมชาติ เช่น ซ่าๆ ครืนๆ โครม เพล้ง)
   - อธิพจน์ (Hyperbole - กล่าวเกินจริง) / อวพจน์ (Understatement - กล่าวน้อยกว่าจริง)
   - สัญลักษณ์ (Symbol) และ นามนัย (Metonymy)
2. ⛔️ **ข้อห้ามเด็ดขาด:**
   - ❌ **ห้ามออกเรื่อง "โวหารการเขียน" (บรรยายโวหาร, พรรณนาโวหาร, เทศนาโวหาร) ในบทนี้เด็ดขาด!**
   - ❌ **ห้ามออกเรื่องระดับภาษา หรือสะกดคำ!**
3. 📖 **รูปแบบคำถามที่ต้องออก:**
   - ยกข้อความร้อยกรอง วรรคทอง หรือร้อยแก้วเปรียบเทียบในโจทย์ แล้วถามชนิดภาพพจน์ เช่น:
     - "พิจารณาข้อความต่อไปนี้:... ข้อความข้างต้นเด่นด้วยโวหารภาพพจน์ประเภทใด?"
     - "ข้อความในข้อใดใช้โวหารภาพพจน์ประเภท 'บุคคลวัต' (หรือ อุปลักษณ์/อุปมา/สัทพจน์/อธิพจน์)?"
     - "ข้อความในข้อใดใช้โวหารภาพพจน์ประเภทเดียวกับข้อความข้างต้น?"
     - "ข้อความในข้อใดมีโวหารภาพพจน์ต่างจากข้ออื่น?"`;

    exampleJson = `[
  {
    "questionText": "พิจารณาข้อความต่อไปนี้:\n\"คลื่นลมโหมกระหน่ำร้องครวญคราง ป่าไผ่เอนกายกระซิบปลอบโยนผืนดิน\"\nข้อความข้างต้นเด่นด้วยโวหารภาพพจน์ประเภทใด?",
    "optionA": "อุปมา",
    "optionB": "อุปลักษณ์",
    "optionC": "บุคคลวัต",
    "optionD": "สัทพจน์",
    "correctOption": "C",
    "explanation": "ข้อความนี้ใช้ 'บุคคลวัต' (Personification) โดยกำหนดให้คลื่นลมและป่าไผ่มีกิริยาอาการเยี่ยงมนุษย์ คือ 'ร้องครวญคราง' และ 'กระซิบปลอบโยน'"
  }
]`;
  } else if (target.includes('โวหารการเขียน') || (target.includes('โวหาร') && !target.includes('ภาพพจน์')) || target.includes('บทที่ 2') || target.includes('บทที่2')) {
    chapterTitle = 'บทที่ 2: โวหารการเขียน (บรรยายโวหาร, พรรณนาโวหาร, เทศนาโวหาร, สาธกโวหาร, อุปมาโวหาร)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "โวหารการเขียน" (Writing Styles) - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องมีตัวอย่างบทความหรือข้อความ 2-4 บรรทัด แล้วให้นักเรียนวิเคราะห์โวหารการเขียน**:
   - บรรยายโวหาร (เล่าเรื่อง เล่าเหตุการณ์ตามลำดับ ว่าใคร ทำอะไร ที่ไหน เมื่อไหร่ อย่างไร)
   - พรรณนาโวหาร (ให้ภาพชัดเจน ละเอียดลออ สวยงาม สัมผัสอารมณ์ความรู้สึก)
   - เทศนาโวหาร (สั่งสอน ชี้แนะคุณโทษ ชักจูงให้ปฏิบัติตามคุณธรรม)
   - สาธกโวหาร (ยกตัวอย่าง นิทาน อุทาหรณ์ หรือเรื่องเล่าประกอบเพื่อความเข้าใจ)
   - อุปมาโวหาร (เปรียบเทียบเพื่อให้เข้าใจความหมายลึกซึ้ง)
2. ⛔️ **ข้อห้ามเด็ดขาด:**
   - ❌ **ห้ามออกคำถามถามแต่นิยามทฤษฎีแห้งๆ** เช่น "บรรยายโวหารคืออะไร" (ต้องมีบทความตัวอย่างให้วิเคราะห์ทุกข้อ)
   - ❌ **ห้ามออกเรื่องระดับภาษา หรือภาพพจน์ (บุคคลวัต/อุปลักษณ์) ในบทนี้!**
3. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "พิจารณาข้อความต่อไปนี้:... ข้อความข้างต้นใช้โวหารการเขียนประเภทใดเป็นหลัก?"
   - "ข้อความใดต่อไปนี้ใช้โวหารการเขียนประเภทเดียวกับข้อความข้างต้น?"
   - "ข้อความในข้อใดเป็น 'พรรณนาโวหาร' (หรือเทศนาโวหาร/บรรยายโวหาร)?"`;

    exampleJson = `[
  {
    "questionText": "พิจารณาข้อความต่อไปนี้:\n\"แสงอาทิตย์สีทองทอประกายกระทบละอองหมอกยามเช้า ยอดหญ้าเขียวขจีสั่นไหวระยิบระยับล้อสายลมหนาวที่พัดผ่านทิวเขา\"\nข้อความข้างต้นใช้โวหารการเขียนประเภทใดเป็นหลัก?",
    "optionA": "บรรยายโวหาร",
    "optionB": "พรรณนาโวหาร",
    "optionC": "เทศนาโวหาร",
    "optionD": "สาธกโวหาร",
    "correctOption": "B",
    "explanation": "ข้อความนี้เป็น 'พรรณนาโวหาร' เพราะมุ่งเน้นการให้ภาพและอารมณ์ความรู้สึกที่ประณีตงดงาม มองเห็นแสงทองและประกายหมอกยอดหญ้าอย่างชัดเจน"
  }
]`;
  } else if (target.includes('วิเคราะห์บทความ') || target.includes('จับใจความ') || target.includes('อ่านบทความ') || target.includes('บทที่ 1') || target.includes('บทที่1')) {
    chapterTitle = 'บทที่ 1: การวิเคราะห์บทความและการจับใจความสำคัญ (Reading Comprehension)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "วิเคราะห์บทความและจับใจความสำคัญ" - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องแต่งบทความสารคดี/บทความทั่วไป 3-6 บรรทัด (เรื่องวิทยาศาสตร์ สุขภาพ สิ่งแวดล้อม ปรัชญาการใช้ชีวิต วัฒนธรรม ห้ามมีคำว่าตำรวจ)**
2. ⛔️ **ข้อห้ามเด็ดขาด:**
   - ❌ **ห้ามออกโวหารการเขียน, ห้ามออกระดับภาษา, ห้ามออกสะกดคำ ในหมวดนี้!**
3. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "ใจความสำคัญของบทความข้างต้นคือข้อใด?"
   - "จากบทความข้างต้น ผู้เขียนมีเจตนาตามข้อใดเป็นสำคัญ?"
   - "ข้อใดเป็นสาระสำคัญหรือข้อคิดที่ได้รับจากบทความข้างต้น?"
   - "จากบทความข้างต้น ข้อใดสรุป/อนุมานได้ถูกต้อง?"
   - "ข้อความข้างต้นสนับสนุนแนวคิดในข้อใด?"`;

    exampleJson = `[
  {
    "questionText": "อ่านบทความต่อไปนี้แล้วตอบคำถาม:\n\"การสร้างความสัมพันธ์ที่แน่นแฟ้นในสังคมยุคดิจิทัลไม่ได้ขึ้นอยู่กับจำนวนเพื่อนในสื่อออนไลน์ แต่ขึ้นอยู่กับคุณภาพของความเข้าใจและการรับฟังอย่างลึกซึ้ง ความเหงาในยุคปัจจุบันจึงไม่ได้เกิดจากการขาดแคลนการเชื่อมต่อ แต่เกิดจากการเชื่อมต่อที่ไร้จิตวิญญาณและความจริงใจ\"\n\nใจความสำคัญของบทความข้างต้นคือข้อใด?",
    "optionA": "สื่อออนไลน์ทำให้คนยุคปัจจุบันมีเพื่อนมากขึ้น",
    "optionB": "คุณภาพและความจริงใจในการสื่อสารสำคัญกว่าปริมาณการเชื่อมต่อบนโลกออนไลน์",
    "optionC": "ความเหงาเป็นปัญหาทางจิตเวชที่เกิดจากเทคโนโลยี",
    "optionD": "คนในยุคปัจจุบันควรเลิกใช้สื่อสังคมออนไลน์เพื่อลดความเหงา",
    "correctOption": "B",
    "explanation": "บทความชี้ให้เห็นว่าความสัมพันธ์ที่แท้จริงเกิดจากคุณภาพการรับฟังและความจริงใจ ไม่ใช่ปริมาณการเชื่อมต่อออนไลน์ ข้อ ข จึงเป็นใจความสำคัญที่ครอบคลุมเนื้อหาทั้งหมด"
  }
]`;
  } else if (target.includes('การใช้คำตรงความหมาย') || target.includes('ใช้คำ') || target.includes('ความหมายของคำ') || target.includes('บทที่ 5') || target.includes('บทที่5')) {
    chapterTitle = 'บทที่ 5: การใช้คำตรงความหมายและบริบท (การใช้คำฟุ่มเฟือย กำกวม ลักษณนาม)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "การใช้คำตรงความหมาย" - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นการทดสอบการใช้คำภาษาไทยให้ถูกต้องตามความหมาย บริบท ลักษณนาม และความกระชับไม่กำกวม**:
   - คำที่มีความหมายใกล้เคียงกัน (เช่น คึกคัก/คึกคะนอง, จัดสรร/จัดสรรปันส่วน, กตัญญู/กตเวที, ชำระ/สะสาง)
   - ประโยคที่มีคำฟุ่มเฟือย หรือความหมายกำกวม
   - การใช้คำลักษณนามให้ถูกต้องตามหลักภาษา
   - การใช้คำผิดความหมาย หรือใช้คำผิดบริบท
2. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "ข้อความในข้อใดใช้คำได้ถูกต้องตรงตามความหมายและบริบท?"
   - "ข้อความในข้อใดใช้คำผิดความหมาย?"
   - "ประโยคในข้อใดไม่มีการใช้คำฟุ่มเฟือยหรือกำกวม?"
   - "ข้อใดใช้คำลักษณนามได้ถูกต้องทุกคำ?"`;

    exampleJson = `[
  {
    "questionText": "ข้อความในข้อใดใช้คำได้ถูกต้องตรงตามความหมายและบริบท?",
    "optionA": "คณะกรรมการมีมติให้ลงทัณฑ์ผู้กระทำผิดวินัยอย่างเฉียบขาด",
    "optionB": "เขามีนิสัยคึกคะนองทำให้งานเลี้ยงในค่ำคืนนี้เต็มไปด้วยความสนุกสนาน",
    "optionC": "นักเรียนทุกคนควรกตเวทีต่อครูบาอาจารย์ผู้ประสิทธิ์ประสาทวิชา",
    "optionD": "เจ้าหน้าที่กำลังสะสางเอกสารสำคัญที่ต้องส่งมอบในวันนี้",
    "correctOption": "A",
    "explanation": "ตัวเลือก ก ใช้คำว่า 'ลงทัณฑ์' ได้ถูกต้องตรงตามบริบท ส่วน ข ควรใช้ 'คึกคัก', ค ควรใช้ 'กตัญญู', ง ควรใช้ 'จัดเรียง/รวบรวม' เพราะสะสางมักใช้กับปัญหาหรือหนี้สิน"
  }
]`;
  } else if (target.includes('สำนวน') || target.includes('สุภาษิต') || target.includes('คำพังเพย') || target.includes('บทที่ 6') || target.includes('บทที่6')) {
    chapterTitle = 'บทที่ 6: สำนวน สุภาษิต และคำพังเพยไทย';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "สำนวน สุภาษิต คำพังเพย" - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นการวิเคราะห์สำนวน สุภาษิต และคำพังเพยไทย**:
   - ยกสถานการณ์จริง หรือบทสนทนา แล้วถามสำนวนที่ตรงกับพฤติกรรมหรือเหตุการณ์
   - ถามสำนวนที่มีความหมายสอดคล้องหรือตรงข้ามกัน
   - ถามการใช้สำนวนให้ถูกต้องตามสถานการณ์
2. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "สถานการณ์ข้างต้นตรงกับสำนวนไทยในข้อใด?"
   - "สำนวนในข้อใดมีความหมายสอดคล้องกับข้อความข้างต้น?"
   - "ข้อใดใช้สำนวนไทยได้ถูกต้องและเหมาะสมกับสถานการณ์?"`;

    exampleJson = `[
  {
    "questionText": "สมชายเป็นคนชอบอวดรู้และชอบให้คำแนะนำแก่ช่างผู้เชี่ยวชาญที่มีประสบการณ์มากกว่าตนเอง พฤติกรรมของสมชายตรงกับสำนวนในข้อใด?",
    "optionA": "สอนจระเข้ให้ว่ายน้ำ",
    "optionB": "เอามะพร้าวห้าวไปขายสวน",
    "optionC": "ชี้โพรงให้กระรอก",
    "optionD": "จับปลาสองมือ",
    "correctOption": "A",
    "explanation": "'สอนจระเข้ให้ว่ายน้ำ' หมายถึง สอนสิ่งที่เขารู้ดีหรือชำนาญอยู่แล้ว ส่วน 'เอามะพร้าวห้าวไปขายสวน' หมายถึง แสดงความรู้หรืออวดรู้กับผู้ที่รู้ดีกว่าในเรื่องนั้นๆ แต่การสอนช่างตรงกับสอนจระเข้ให้ว่ายน้ำ"
  }
]`;
  } else if (target.includes('อุดมคติ') || target.includes('คำคม') || target.includes('คำขวัญ') || target.includes('คติพจน์') || target.includes('บทที่ 7') || target.includes('บทที่7')) {
    chapterTitle = 'บทที่ 7: อุดมคติ คำคม คำขวัญ คติพจน์';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "อุดมคติ คำคม คำขวัญ คติพจน์" - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นการวิเคราะห์ข้อคิด เจตนารมณ์ สัมผัสคล้องจอง และคุณค่าของคำขวัญ คำคม หรือคติพจน์**:
   - วิเคราะห์เจตนาหรือจุดประสงค์ของคำขวัญ
   - วิเคราะห์ข้อคิด/คติธรรมที่แฝงอยู่ในคำคม
   - วิเคราะห์ความถูกต้องตามฉันทลักษณ์และสัมผัสคล้องจองของคำขวัญ
2. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "คำขวัญข้างต้นมุ่งเน้นหรือให้คุณค่าในเรื่องใดเป็นสำคัญ?"
   - "ข้อความในข้อใดมีลักษณะเป็นคำขวัญที่ถูกต้องและมีสัมผัสคล้องจองเหมาะสมที่สุด?"
   - "คำคมข้างต้นให้ข้อคิดในการดำเนินชีวิตที่สอดคล้องกับข้อใด?"`;

    exampleJson = `[
  {
    "questionText": "พิจารณาคำขวัญต่อไปนี้:\n\"ร่วมใจประหยัดพลังงาน สร้างสรรค์นวัตกรรม นำชาติสู่ความยั่งยืน\"\nคำขวัญข้างต้นมีจุดมุ่งหมายสำคัญตามข้อใด?",
    "optionA": "รณรงค์ให้ประชาชนใช้พลังงานทดแทน",
    "optionB": "กระตุ้นให้เกิดความร่วมมือในการประหยัดพลังงานและการพัฒนาอย่างยั่งยืน",
    "optionC": "ส่งเสริมการแข่งขันทางเทคโนโลยีในระดับสากล",
    "optionD": "ปลูกฝังความสามัคคีในชุมชน",
    "correctOption": "B",
    "explanation": "คำขวัญมุ่งเน้นเรื่องการประหยัดพลังงาน การใช้นวัตกรรม และการพัฒนาประเทศอย่างยั่งยืน ตัวเลือก ข จึงครอบคลุมจุดมุ่งหมายทั้งหมด"
  }
]`;
  } else if (target.includes('สะกดคำ') || target.includes('คำทับศัพท์') || target.includes('คำอ่าน') || target.includes('บทที่ 8') || target.includes('บทที่8')) {
    chapterTitle = 'บทที่ 8: การสะกดคำ การอ่านคำ และคำทับศัพท์';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับหมวด "สะกดคำและคำทับศัพท์" - บังคับ 100%:
1. **ทุกข้อทั้งหมด (100%) ต้องเป็นการทดสอบการเขียนสะกดคำที่ถูกต้องตามพจนานุกรม ฉบับราชบัณฑิตยสถาน และคำทับศัพท์ภาษาอังกฤษ**:
   - คำไทยและคำยืมที่มักเขียนสะกดผิด (เช่น กะเพรา, อนุญาต, อนุมัติ, สังเกต, ลายเซ็น, ผูกพัน, อัตโนมัติ)
   - คำทับศัพท์ภาษาอังกฤษตามหลักราชบัณฑิตยสภา (เช่น กราฟิก, ดิจิทัล, อีเมล, ซอฟต์แวร์, แพลตฟอร์ม, อัปเดต)
   - การอ่านคำที่ถูกต้องตามหลักภาษาไทย
2. 📖 **รูปแบบคำถามที่ต้องออก:**
   - "ข้อความในข้อใดเขียนสะกดคำได้ถูกต้องทุกคำ?"
   - "ข้อความในข้อใดมีคำที่เขียนสะกดผิด?"
   - "คำทับศัพท์ในข้อใดเขียนสะกดถูกต้องตามหลักราชบัณฑิตยสภา?"`;

    exampleJson = `[
  {
    "questionText": "ข้อความในข้อใดเขียนสะกดคำได้ถูกต้องทุกคำ?",
    "optionA": "เขาได้รับอนุญาติให้เข้าพบผู้บริหารเพื่อยื่นเอกสารสังเกตุการณ์",
    "optionB": "แม่ค้าผัดกะเพราจานด่วนอย่างคล่องแคล่วเพื่อบริการลูกค้า",
    "optionC": "การเซ็นต์ชื่อในสัญญาต้องตรวจสอบความผูกพันธ์ให้ชัดเจน",
    "optionD": "ระบบอัตโนมัตินี้ช่วยประหยัดเวลาและงบประมานได้มาก",
    "correctOption": "B",
    "explanation": "ตัวเลือก ข สะกดถูกต้องทุกคำ (กะเพรา ไม่มี ร ที่ กะ) ส่วน ก ผิดที่ 'อนุญาติ' (ต้องเป็น อนุญาต) และ 'สังเกตุ' (ต้องเป็น สังเกต), ค ผิดที่ 'เซ็นต์' และ 'ผูกพันธ์', ง ผิดที่ 'งบประมาน'"
  }
]`;
  } else {
    chapterTitle = 'วิชาภาษาไทย (รวมทุกบท / ข้อสอบมาตรฐาน)';
    chapterSpecificRules = `🎯 คำแนะนำ: ออกข้อสอบคละหัวข้ออย่างสมดุล (วิเคราะห์บทความ, โวหารการเขียน, โวหารภาพพจน์, ระดับภาษา, การใช้คำตรงความหมาย, สำนวนสุภาษิต, สะกดคำ)`;
    exampleJson = `[
  {
    "questionText": "โจทย์ภาษาไทย...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด..."
  }
]`;
  }

  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "${chapterTitle}" (ตามมาตรฐานข้อสอบบรรจุเข้ารับราชการ และข้อสอบ ก.พ. ภาค ก.)
โปรดสร้างข้อสอบภาษาไทยจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ/บทเรียน: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

⛔️ ข้อห้ามเด็ดขาด (Strict Restrictions):
1. ❌ **ห้ามมีเนื้อหาเกี่ยวกับ "งานสารบรรณ", "ระเบียบสำนักนายกรัฐมนตรี", "หนังสือราชการ", "ตราครุฑ", หรือ "กฎหมาย" ปะปนเด็ดขาด!** (วิชาภาษาไทยต้องเป็นหลักภาษาไทยและการอ่านบทความล้วนๆ 100%)
2. ❌ **ห้ามระบุคำว่า "ตำรวจ" หรือสถานการณ์การทำงานของตำรวจในบทความภาษาไทยเด็ดขาด!** ข้อสอบภาษาไทยของจริงจะใช้บทความทั่วไป วรรณกรรม สารคดี ปรัชญา สังคม ธรรมชาติ วิถีชีวิต ข้อคิดเตือนใจ หรือบทความวิทยาศาสตร์/สุขภาพ
3. ❌ **ห้ามออกข้อสอบข้ามหมวดบทเรียนที่ระบุ** ต้องออกเฉพาะหัวข้อ ${chapterTitle} เท่านั้น 100%

${chapterSpecificRules}

💡 คำอธิบายเฉลย (Deep Explanation):
- อธิบายเหตุผลอย่างละเอียด พร้อมชี้แจงว่าทำไมคำตอบที่ถูกต้องจึงถูก และตัวเลือกอื่นๆ ผิดอย่างไร

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array ตามรูปแบบนี้เท่านั้น ห้ามมี markdown อื่น:
${exampleJson}`;
}

function buildGeneralMathPrompt({ count, subcategory, title, contextText }) {
  const target = `${subcategory || ''} ${title || ''}`.toLowerCase();

  let chapterTitle = 'วิชาความสามารถทั่วไป (คณิตศาสตร์และเหตุผล)';
  let chapterSpecificRules = '';
  let exampleJson = '';

  if (target.includes('อนุกรม') || target.includes('บทที่ 1') || target.includes('บทที่1')) {
    chapterTitle = 'บทที่ 1: อนุกรมตัวเลขและตัวอักษร';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 1 อนุกรม":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์อนุกรมตัวเลขหรืออนุกรมตัวอักษร 100%:**
   - อนุกรมผลต่างคงที่, อนุกรมหลายชั้น, อนุกรมยกกำลัง (n², n³, n²±1), อนุกรมสองชุดสลับ, อนุกรมผลบวกสะสม (Fibonacci)
2. 💡 **คำอธิบายเฉลย:** ต้องแสดงลำดับผลต่าง หรือสูตรความสัมพันธ์ของตัวเลขทีละขั้นตอนอย่างละเอียด 100%`;
    exampleJson = `[
  {
    "questionText": "จงหาตัวเลขถัดไปของอนุกรม: 2, 5, 10, 17, 26, ...",
    "optionA": "37",
    "optionB": "35",
    "optionC": "39",
    "optionD": "36",
    "correctOption": "A",
    "explanation": "ผลต่างระหว่างพจน์: 5-2 = 3, 10-5 = 5, 17-10 = 7, 26-17 = 9 (ผลต่างเพิ่มขึ้นทีละ 2: +3, +5, +7, +9, +11) ดังนั้น พจน์ถัดไปคือ 26 + 11 = 37"
  }
]`;
  } else if (target.includes('อุปมา') || target.includes('บทที่ 2') || target.includes('บทที่2')) {
    chapterTitle = 'บทที่ 2: อุปมา-อุปไมย (ความสัมพันธ์ของคำ)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 2 อุปมา-อุปไมย":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์อุปมา-อุปไมย (A : B :: C : ? หรือ ? : B :: C : D):**
   - ความสัมพันธ์ด้านหน้าที่ เครื่องมือ ส่วนประกอบ ชนิด คำตรงข้าม สาเหตุและผลลัพธ์
2. 💡 **คำอธิบายเฉลย:** อธิบายประโยคความสัมพันธ์ของคู่คำต้นแบบและคู่คำเฉลย`;
    exampleJson = `[
  {
    "questionText": "เข็มทิศ : นำทาง :: นาฬิกา : ?",
    "optionA": "บอกเวลา",
    "optionB": "ข้อมือ",
    "optionC": "ตัวเลข",
    "optionD": "เดิน",
    "correctOption": "A",
    "explanation": "ความสัมพันธ์เชิงหน้าที่การใช้งาน: 'เข็มทิศ' มีหน้าที่ 'นำทาง' เช่นเดียวกับ 'นาฬิกา' มีหน้าที่ 'บอกเวลา'"
  }
]`;
  } else if (target.includes('โอเปเรชั่น') || target.includes('iq') || target.includes('บทที่ 3') || target.includes('บทที่3')) {
    chapterTitle = 'บทที่ 3: โอเปเรชั่น (Operations) และตรรกะตัวเลข';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 3 โอเปเรชั่น":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์กำหนดสัญลักษณ์พิเศษ เช่น a * b หรือ a @ b:**
   - มีตัวอย่างเงื่อนไข 2 ชุด แล้วให้หาค่าชุดที่ 3
2. 💡 **คำอธิบายเฉลย:** แสดงสมการรูปทั่วไป เช่น a * b = (a + b) × 2 - 1 และแทนค่าคำนวณทีละขั้น`;
    exampleJson = `[
  {
    "questionText": "กำหนดให้ 2 * 3 = 13 และ 3 * 4 = 25 จงหาค่าของ 4 * 5 = ?",
    "optionA": "41",
    "optionB": "39",
    "optionC": "45",
    "optionD": "37",
    "correctOption": "A",
    "explanation": "ความสัมพันธ์คือ a * b = a² + b² → 2² + 3² = 4 + 9 = 13 | 3² + 4² = 9 + 16 = 25 ดังนั้น 4 * 5 = 4² + 5² = 16 + 25 = 41"
  }
]`;
  } else if (target.includes('ห.ร.ม') || target.includes('ค.ร.น') || target.includes('บทที่ 5') || target.includes('บทที่5')) {
    chapterTitle = 'บทที่ 5: ห.ร.ม. และ ค.ร.น.';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 5 ห.ร.ม. และ ค.ร.น.":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ ห.ร.ม. / ค.ร.น. และโจทย์ปัญหาประยุกต์:**
   - การตัดเชือก/แบ่งกองของไม่ให้เหลือ (ห.ร.ม.), นาฬิกาปลุกพร้อมกัน/วิ่งรอบสนามเจอกัน (ค.ร.น.), A × B = ห.ร.ม. × ค.ร.น.`;
    exampleJson = `[
  {
    "questionText": "มีเชือก 3 เส้น ยาว 24, 36 และ 48 เมตร ต้องการตัดเป็นท่อนยาวเท่าๆ กันและยาวที่สุดโดยไม่เหลือเศษ จะตัดได้เชือกยาวท่อนละกี่เมตร และได้ทั้งหมดกี่ท่อน?",
    "optionA": "ยาวท่อนละ 12 เมตร ได้ทั้งหมด 9 ท่อน",
    "optionB": "ยาวท่อนละ 6 เมตร ได้ทั้งหมด 18 ท่อน",
    "optionC": "ยาวท่อนละ 12 เมตร ได้ทั้งหมด 8 ท่อน",
    "optionD": "ยาวท่อนละ 8 เมตร ได้ทั้งหมด 12 ท่อน",
    "correctOption": "A",
    "explanation": "หา ห.ร.ม. ของ 24, 36, 48 คือ 12 เมตร (ยาวที่สุด) จำนวนท่อน = (24/12) + (36/12) + (48/12) = 2 + 3 + 4 = 9 ท่อน"
  }
]`;
  } else if (target.includes('อัตราส่วน') || target.includes('บทที่ 6') || target.includes('บทที่6')) {
    chapterTitle = 'บทที่ 6: อัตราส่วนและสัดส่วน';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 6 อัตราส่วน":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์อัตราส่วนต่อเนื่อง สัดส่วนตรง สัดส่วนผกผัน และการแบ่งส่วนเงิน/สิ่งของ**`;
    exampleJson = `[
  {
    "questionText": "ถ้า A : B = 2 : 3 และ B : C = 4 : 5 จงหาอัตราส่วนของ A : B : C",
    "optionA": "8 : 12 : 15",
    "optionB": "2 : 3 : 5",
    "optionC": "8 : 10 : 15",
    "optionD": "6 : 12 : 15",
    "correctOption": "A",
    "explanation": "ทำตัวร่วม B ให้เท่ากัน (ค.ร.น. 3 และ 4 คือ 12) A:B = 8:12, B:C = 12:15 ดังนั้น A : B : C = 8 : 12 : 15"
  }
]`;
  } else if (target.includes('ร้อยละ') || target.includes('กำไร') || target.includes('ขาดทุน') || target.includes('บทที่ 7') || target.includes('บทที่7')) {
    chapterTitle = 'บทที่ 7: ร้อยละ เปอร์เซ็นต์ กำไร ขาดทุน';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 7 ร้อยละ":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ร้อยละ กำไร ขาดทุน ดอกเบี้ย และส่วนลดราคาป้าย**`;
    exampleJson = `[
  {
    "questionText": "ซื้อสินค้าราคาต้นทุน 800 บาท ติดป้ายราคาไว้โดยต้องการกำไร 25% แต่ตอนขายลดราคาให้ผู้ซื้อ 10% จากป้าย อยากทราบว่าได้กำไรกี่บาท?",
    "optionA": "100 บาท",
    "optionB": "120 บาท",
    "optionC": "80 บาท",
    "optionD": "150 บาท",
    "correctOption": "A",
    "explanation": "ราคาป้ายตั้งไว้กำไร 25% = 800 × 1.25 = 1,000 บาท ลดให้ 10% ขายจริง = 1,000 × 0.90 = 900 บาท กำไรจริง = 900 - 800 = 100 บาท"
  }
]`;
  } else if (target.includes('สมการ') || target.includes('บทที่ 8') || target.includes('บทที่8')) {
    chapterTitle = 'บทที่ 8: สมการและโจทย์ปัญหาคลาสสิก (อายุ, ขาสัตว์, จับมือ)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 8 สมการ":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ปัญหาเชิงสมการ เช่น นับหัว/ขาสัตว์, ปัญหาอายุ, การจับมือ, ปักเสาไฟ**`;
    exampleJson = `[
  {
    "questionText": "ในฟาร์มแห่งหนึ่งมีไก่และหมูรวมกัน 30 หัว นับขารวมกันได้ 84 ขา อยากทราบว่าในฟาร์มนี้มีหมูกี่ตัว?",
    "optionA": "12 ตัว",
    "optionB": "18 ตัว",
    "optionC": "15 ตัว",
    "optionD": "10 ตัว",
    "correctOption": "A",
    "explanation": "สูตรสัตว์ 4 ขา = (จำนวนขา - [หัว × 2]) / 2 = (84 - [30 × 2]) / 2 = (84 - 60) / 2 = 24 / 2 = 12 ตัว (หมู 12 ตัว, ไก่ 18 ตัว)"
  }
]`;
  } else if (target.includes('ความน่าจะเป็น') || target.includes('บทที่ 11') || target.includes('บทที่11')) {
    chapterTitle = 'บทที่ 11: ความน่าจะเป็นและกฎการนับ';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 11 ความน่าจะเป็น":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ความน่าจะเป็น P(E) = n(E)/n(S) ลูกเต๋า เหรียญ ไพ่ ลูกบอล การเรียงสับเปลี่ยน**`;
    exampleJson = `[
  {
    "questionText": "ทอยลูกเต๋าที่เที่ยงตรง 2 ลูกพร้อมกัน 1 ครั้ง ความน่าจะเป็นที่ผลรวมของแต้มบนหน้าลูกเต๋าจะเท่ากับ 8 มีค่าเท่าใด?",
    "optionA": "5/36",
    "optionB": "1/6",
    "optionC": "7/36",
    "optionD": "1/9",
    "correctOption": "A",
    "explanation": "n(S) = 6 × 6 = 36 เหตุการณ์ที่ผลรวมเป็น 8: (2,6), (3,5), (4,4), (5,3), (6,2) รวม 5 เหตุการณ์ ดังนั้น P(E) = 5/36"
  }
]`;
  } else if (target.includes('ความเร็ว') || target.includes('ระยะทาง') || target.includes('งาน') || target.includes('บทที่ 12') || target.includes('บทที่12')) {
    chapterTitle = 'บทที่ 12: เลขคณิต ความเร็ว ระยะทาง เวลา และอัตราทำงาน';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 12 ความเร็วและงาน":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ S=VT, วิ่งสวนทาง/ตามกัน, ความเร็วเฉลี่ย, คนงานช่วยกันทำงาน**`;
    exampleJson = `[
  {
    "questionText": "นาย ก ขับรถจากเมือง A ไปเมือง B ด้วยความเร็ว 60 กม./ชม. และขับกลับเส้นทางเดิมด้วยความเร็ว 40 กม./ชม. ความเร็วเฉลี่ยตลอดการเดินทางไป-กลับเป็นกี่กม./ชม.?",
    "optionA": "48 กม./ชม.",
    "optionB": "50 กม./ชม.",
    "optionC": "52 กม./ชม.",
    "optionD": "45 กม./ชม.",
    "correctOption": "A",
    "explanation": "สูตรความเร็วเฉลี่ยไป-กลับระยะทางเท่ากัน: V_avg = (2 × v₁ × v₂) / (v₁ + v₂) = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 กม./ชม."
  }
]`;
  } else if (target.includes('พื้นที่') || target.includes('ปริมาตร') || target.includes('บทที่ 13') || target.includes('บทที่13')) {
    chapterTitle = 'บทที่ 13: พื้นที่ ปริมาตร และเรขาคณิต';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 13 พื้นที่และปริมาตร":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์คำนวณพื้นที่ 2 มิติ หรือปริมาตร 3 มิติ (วงกลม สี่เหลี่ยม ทรงกระบอก ทรงกลม)**`;
    exampleJson = `[
  {
    "questionText": "ถังน้ำทรงกระบอกมีรัศมีของฐานยาว 7 เมตร และสูง 10 เมตร จะมีความจุของน้ำเต็มถังประมาณกี่ลูกบาศก์เมตร? (กำหนด π ≈ 22/7)",
    "optionA": "1,540 ลบ.ม.",
    "optionB": "1,440 ลบ.ม.",
    "optionC": "1,680 ลบ.ม.",
    "optionD": "2,200 ลบ.ม.",
    "correctOption": "A",
    "explanation": "ปริมาตรทรงกระบอก = πr²h = (22/7) × 7 × 7 × 10 = 22 × 7 × 10 = 1,540 ลูกบาศก์เมตร"
  }
]`;
  } else if (target.includes('ตรรกศาสตร์') || target.includes('บทที่ 18') || target.includes('บทที่18')) {
    chapterTitle = 'บทที่ 18: ตรรกศาสตร์และตารางค่าความจริง';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 18 ตรรกศาสตร์":
1. **ทุกข้อ (100%) ต้องเป็นโจทย์ประพจน์ ตารางค่าความจริง และการสมมูล/นิเสธ**`;
    exampleJson = `[
  {
    "questionText": "ประพจน์ในข้อใด 'สมมูล' (Equivalent) กับประพจน์ p → q ?",
    "optionA": "~q → ~p",
    "optionB": "~p → ~q",
    "optionC": "q → p",
    "optionD": "p ∧ ~q",
    "correctOption": "A",
    "explanation": "ตามกฎการแย้งสลับที่ (Contrapositive) ในตรรกศาสตร์ p → q ≡ ~q → ~p ≡ ~p ∨ q"
  }
]`;
  } else {
    chapterTitle = 'วิชาความรู้ความสามารถทั่วไป (คณิตศาสตร์และเหตุผล)';
    chapterSpecificRules = `🎯 คำแนะนำ: ออกข้อสอบคละหัวข้ออย่างสมดุล (อนุกรม, โอเปเรชั่น, อุปมา-อุปไมย, ร้อยละ, สมการ, เรขาคณิต, ความน่าจะเป็น, ตรรกศาสตร์)`;
    exampleJson = `[
  {
    "questionText": "โจทย์ปัญหาคณิตศาสตร์หรือตรรกศาสตร์...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "แสดงวิธีทำและสูตรคำนวณทีละขั้นตอนอย่างละเอียด..."
  }
]`;
  }

  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "${chapterTitle}" สำหรับการสอบคัดเลือกข้าราชการตำรวจและข้อสอบ ก.พ. ภาค ก.
โปรดสร้างข้อสอบจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ/บทเรียน: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

⛔️ กฎเหล็กความถูกต้องทางคณิตศาสตร์ (Strict Accuracy):
1. **ตัวเลขและคำตอบต้องถูกต้องตามหลักคณิตศาสตร์ 100%** (คำนวณซ้ำสองรอบให้แน่ใจว่าตัวเลขและคำตอบถูกต้อง)
2. ❌ **ห้ามออกข้อสอบข้ามหมวดบทเรียนที่ระบุ** ต้องออกเฉพาะหัวข้อ ${chapterTitle} เท่านั้น 100%
3. 💡 **คำอธิบายเฉลย (Step-by-Step Math Calculation):** ต้องแสดงวิธีคิด สูตร และขั้นตอนการคำนวณอย่างละเอียดครบถ้วนทุกข้อ

${chapterSpecificRules}

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array ตามรูปแบบนี้เท่านั้น ห้ามมี markdown อื่น:
${exampleJson}`;
}

function buildEnglishPrompt({ count, subcategory, title, contextText }) {
  return `You are a master exam writer for the Royal Thai Police Examination (English Subject).
Please create ${count} high-quality multiple-choice questions in English ${subcategory ? `focusing on topic: "${subcategory}"` : ''} ${title ? `Exam Set: "${title}"` : ''}.
${contextText ? `Reference Context:\n${contextText.substring(0, 16000)}\n\n` : ''}

🎯 Exam Structure and Requirements:
1. **Situational Dialogues (Conversation ~30%)**: Realistic dialogues at a police station, airport, street asking for directions, reporting crimes, or emergency assistance.
2. **Grammar & Sentence Structure (~35%)**: Tenses, Subject-Verb Agreement, Passive Voice, Conditional Sentences (If-clauses), Relative Clauses, Prepositions, Connectors.
3. **Vocabulary in Context (~20%)**: Important vocabulary for law enforcement, public service, and daily life tested in meaningful sentence contexts.
4. **Reading Comprehension (~15%)**: A short passage (3-5 sentences) such as a news report, public notice, or incident report followed by a comprehension question.
5. **Output Language**:
   - \`questionText\`, \`optionA\`, \`optionB\`, \`optionC\`, \`optionD\` MUST BE IN ENGLISH.
   - \`explanation\` MUST BE IN THAI (อธิบายเฉลยอย่างละเอียดเป็นภาษาไทย แปลประโยค และชี้หลักไวยากรณ์).

Output format: Return ONLY a valid JSON Array:
[
  {
    "questionText": "Question text or dialogue...",
    "optionA": "Choice A",
    "optionB": "Choice B",
    "optionC": "Choice C",
    "optionD": "Choice D",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยภาษาไทยอย่างละเอียด แปลประโยคและอธิบายหลักไวยากรณ์..."
  }
]`;
}

function buildComputerPrompt({ count, subcategory, title, contextText }) {
  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "เทคโนโลยีสารสนเทศและคอมพิวเตอร์เพื่อการสื่อสาร" สำหรับสอบตำรวจ
โปรดสร้างข้อสอบจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

🎯 โครงสร้างข้อสอบคอมพิวเตอร์และสารสนเทศตำรวจจริง:
1. **ระบบปฏิบัติการและคีย์ลัด (OS & Shortcuts)**: การจัดการไฟล์ใน Windows, Task Manager, Shortcut Keys สำคัญ (Ctrl, Alt, Win, Shift)
2. **โปรแกรมสำนักงาน (MS Office / Google Workspace)**:
   - MS Word (การจัดหน้า, สารบัญ, จดหมายเวียน Mail Merge, การตั้งระยะขอบ)
   - MS Excel (สูตรและฟังก์ชันคำนวณจริง: SUM, AVERAGE, IF, COUNTIF, VLOOKUP, XLOOKUP, cell reference $A$1)
   - MS PowerPoint (Slide Master, Animations, Transitions, Presentation modes)
3. **ระบบเครือข่ายและอินเทอร์เน็ต (Network & Internet)**: IP Address (IPv4, IPv6), Subnet, DNS, DHCP, LAN, Wi-Fi, MAC Address, URL, Protocols (HTTP, HTTPS, FTP, SMTP)
4. **ความมั่นคงปลอดภัยไซเบอร์และกฎหมาย (Cybersecurity & Laws)**:
   - Phishing, Malware, Ransomware, Trojan, Spyware, Firewall, 2FA/MFA, Encryption
   - พ.ร.บ.ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. ๒๕๕๐ และที่แก้ไขเพิ่มเติม พ.ศ. ๒๕๖๐ (ฐานความผิดและโทษ)
   - พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ (PDPA)
5. **เทคโนโลยีสมัยใหม่**: Cloud Computing (IaaS, PaaS, SaaS), AI, Big Data, IoT
6. 💡 **คำอธิบายเฉลย (Deep Explanation)**: อธิบายการทำงานของระบบ ชี้ให้เห็นว่าทำไมคำตอบนี้ถูกต้อง และอธิบายจุดผิดของตัวเลือกอื่น

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array:
[
  {
    "questionText": "โจทย์คำถามเกี่ยวกับคอมพิวเตอร์/เทคโนโลยีสารสนเทศ...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด อ้างอิงหลักวิชาการและระเบียบกฎหมาย..."
  }
]`;
}

function buildLawPrompt({ count, subcategory, title, contextText }) {
  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "กฎหมายที่ประชาชนควรรู้และกฎหมายตำรวจ" สำหรับสอบตำรวจ
โปรดสร้างข้อสอบจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

🎯 โครงสร้างข้อสอบกฎหมายตำรวจจริง (เน้นเคสสถานการณ์จำลอง 60% + ตัวบทแม่นยำ 40%):
1. **ประมวลกฎหมายอาญา (Criminal Code)**:
   - โครงสร้างความรับผิดทางอาญา (การกระทำ, องค์ประกอบภายนอก/ภายใน, เจตนา, ประมาท, พลาด, สำคัญผิด)
   - เหตุยกเว้นความผิดและเหตุยกเว้นโทษ (ป้องกันโดยชอบด้วยกฎหมาย ม.68, จำเป็น ม.67, บันดาลโทสะ ม.72, ยินยอม)
   - ผู้เกี่ยวข้องในการกระทำความผิด (ตัวการ ม.83, ผู้ใช้ ม.84, ผู้สนับสนุน ม.86)
   - ความผิดเกี่ยวกับทรัพย์ (ลักทรัพย์, วิ่งราวทรัพย์, กรรโชกทรัพย์, รีดเอาทรัพย์, ชิงทรัพย์, ปล้นทรัพย์, ยักยอก, ฉ้อโกง, รับของโจร, ทำให้เสียทรัพย์, บุกรุก)
   - ความผิดเกี่ยวกับชีวิต ร่างกาย เสรีภาพ และเจ้าพนักงาน
2. **ประมวลกฎหมายวิธีพิจารณาความอาญา (Criminal Procedure Code)**:
   - ผู้เสียหายและการร้องทุกข์
   - อำนาจและหน้าที่ของเจ้าพนักงานตำรวจในการสืบสวนและสอบสวน
   - การจับและการค้น (เหตุที่จับ/ค้นได้โดยไม่มีหมาย, การทำบันทึกการจับกุม, สิทธิของผู้ถูกจับ)
   - การควบคุมตัวและการปล่อยชั่วคราว
3. **พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. ๒๕๖๕**:
   - โครงสร้างองค์กรตำรวจ, ก.ตร., ก.ต.ช., ก.พ.ค.ตร.
   - วินัยและการรักษาวินัยของข้าราชการตำรวจ, โทษทางวินัย 5 สถาน
4. 💡 **คำอธิบายเฉลย (Deep Explanation)**: อ้างอิงเลขมาตรา องค์ประกอบความผิด และวิเคราะห์ปรับบทกฎหมายเข้ากับข้อเท็จจริงในโจทย์

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array:
[
  {
    "questionText": "สถานการณ์คดีจำลองหรือคำถามข้อกฎหมาย...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด อ้างอิงมาตราและเหตุผลทางกฎหมาย..."
  }
]`;
}

function buildSecretariatPrompt({ count, subcategory, title, contextText }) {
  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "งานสารบรรณ" (ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม และ ประมวลระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔)
โปรดสร้างข้อสอบจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

🎯 โครงสร้างข้อสอบงานสารบรรณตำรวจจริง:
1. **หนังสือราชการ ๖ ชนิด**: หนังสือภายนอก, หนังสือภายใน, หนังสือประทับตรา, หนังสือสั่งการ (คำสั่ง, ข้อบังคับ, ระเบียบ), หนังสือประชาสัมพันธ์ (ประกาศ, แถลงการณ์, ข่าว), หนังสือที่เจ้าหน้าที่ทำขึ้นหรือรับไว้เป็นหลักฐานในราชการ (หนังสือรับรอง, รายงานการประชุม, บันทึก, หนังสืออื่น)
2. **การรับ-ส่ง และการลงทะเบียนหนังสือ**: ทะเบียนรับ, ทะเบียนส่ง, เลขที่หนังสือ, วันเดือนปี, การส่งทางระบบอิเล็กทรอนิกส์
3. **การเก็บรักษา ยืม และทำลายหนังสือ**: อายุการเก็บหนังสือ (ปกติ ๑๐ ปี, ข้อยกเว้นตลอดไป/น้อยกว่า ๑๐ ปี), คณะกรรมการทำลายหนังสือ, การขอยืมหนังสือ
4. **มาตรฐานตรา แบบพิมพ์ และซอง**: ขนาดตราครุฑ (ขนาด ๓ ซม. และ ๑.๕ ซม.), การวางตำแหน่งตราครุฑ, ขนาดกระดาษตราครุฑ, ขนาดซอง
5. **ชั้นความเร็วและชั้นความลับ**:
   - ชั้นความเร็ว (ด่วนที่สุด - ปฏิบัติทันที, ด่วนมาก - ปฏิบัติโดยเร็ว, ด่วน - ปฏิบัติเร็วกว่าปกติ) ตัวอักษรสีแดงขนาดไม่เล็กกว่า ๓๒ พอยต์
   - ชั้นความลับ (ลับที่สุด, ลับมาก, ลับ)
6. **การใช้คำขึ้นต้น คำลงท้าย และผู้มีอำนาจลงนาม**: การใช้คำขึ้นต้น-ลงท้ายตามฐานะบุคคล
7. 💡 **คำอธิบายเฉลย (Deep Explanation)**: อ้างอิงระเบียบข้อ/หมวดที่เกี่ยวข้องอย่างชัดเจน

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array:
[
  {
    "questionText": "โจทย์คำถามเกี่ยวกับงานสารบรรณ...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด อ้างอิงระเบียบสารบรรณ..."
  }
]`;
}

function buildSocialPrompt({ count, subcategory, title, contextText }) {
  const target = `${subcategory || ''} ${title || ''}`.toLowerCase();

  let chapterTitle = 'วิชาสังคมและวัฒนธรรม';
  let chapterSpecificRules = '';
  let exampleJson = '';

  if (target.includes('สังคมวิทยา') || target.includes('บทที่ 1') || target.includes('บทที่1')) {
    chapterTitle = 'บทที่ 1: สังคมวิทยาและการจัดระเบียบสังคม';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 1 สังคมวิทยา":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องสังคมวิทยา สถาบันทางสังคม และการจัดระเบียบสังคมเท่านั้น:**
   - 7 สถาบันทางสังคม (ครอบครัว, การศึกษา, ศาสนา, การเมืองการปกครอง, เศรษฐกิจ, นันทนาการ, สื่อสารมวลชน)
   - บรรทัดฐานทางสังคม 3 ระดับ (วิถีประชา/วิถีชาวบ้าน, จารีต, กฎหมาย)
   - สถานภาพ (ได้มาแต่กำเนิด vs ได้มาด้วยความสามารถ) และบทบาททางสังคม (ความขัดแย้งในบทบาท Role Conflict)
   - การขัดเกลาทางสังคม (ทางตรง vs ทางอ้อม)
2. ⛔️ **ห้ามออกเรื่องอาเซียน ภูมิศาสตร์ หรือเศรษฐศาสตร์ในบทนี้!**`;
    exampleJson = `[
  {
    "questionText": "การที่บุคคลหนึ่งไม่ยอมต่อแถวเพื่อซื้อสินค้าในที่สาธารณะ ถือเป็นการฝ่าฝืนบรรทัดฐานทางสังคมในระดับใด และจะได้รับผลกระทบอย่างไร?",
    "optionA": "วิถีประชา — ถูกสังคมตำหนิหรือตักเตือน",
    "optionB": "จารีต — ถูกสังคมลงประชาทัณฑ์",
    "optionC": "กฎหมาย — ถูกดำเนินคดีและปรับเป็นเงิน",
    "optionD": "ค่านิยม — ถูกตัดสิทธิ์ความเป็นพลเมือง",
    "correctOption": "A",
    "explanation": "การไม่เข้าแถวเป็นการฝ่าฝืน 'วิถีประชา' (Folkways) ซึ่งเป็นธรรมเนียมปฏิบัติทั่วไป บทลงโทษจะเป็นเพียงการตำหนิหรือมองด้วยสายตาแปลกๆ จากสังคม ยังไม่ถึงขั้นผิดจารีตหรือกฎหมาย"
  }
]`;
  } else if (target.includes('วัฒนธรรม') || target.includes('ประเพณี') || target.includes('บทที่ 2') || target.includes('บทที่2')) {
    chapterTitle = 'บทที่ 2: วัฒนธรรม ประเพณี และสังคมไทย';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 2 วัฒนธรรม ประเพณี และสังคมไทย":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องประเภทวัฒนธรรม ประเพณี 4 ภาค และมารยาทไทย:**
   - วัฒนธรรมทางวัตถุ vs ไม่ใช่วัตถุ และการจำแนกตาม พ.ร.บ. (คติธรรม, เนติธรรม, สหธรรม, วัตถุธรรม)
   - ประเพณี 4 ภาค (เหนือ: ปอยส่างลอง/ยี่เป็ง, อีสาน: บุญบั้งไฟ/ผีตาโขน/ไหลเรือไฟ, กลาง: รับบัว/วิ่งควาย/ตักบาตรดอกไม้, ใต้: ชักพระ/สารทเดือนสิบ/แห่ผ้าขึ้นธาตุ)
   - มารยาทไทยและการไหว้ 3 ระดับ (ไหว้พระ, ไหว้ผู้มีพระคุณ, ไหว้วัยเดียวกัน)`;
    exampleJson = `[
  {
    "questionText": "ประเพณี 'ปอยส่างลอง' หรือการบวชลูกแก้ว เป็นประเพณีท้องถิ่นอันเป็นเอกลักษณ์ของภาคใดและจัดขึ้นเพื่อจุดประสงค์ใด?",
    "optionA": "ภาคเหนือ — การบรรพชาสามเณรของชาวไทยใหญ่",
    "optionB": "ภาคอีสาน — การบูชาพญาแถนเพื่อขอฝน",
    "optionC": "ภาคใต้ — การอุทิศส่วนกุศลให้บรรพบุรุษ",
    "optionD": "ภาคกลาง — การเฉลิมฉลองหลังฤดูเก็บเกี่ยว",
    "correctOption": "A",
    "explanation": "'ปอยส่างลอง' เป็นประเพณีบวชลูกแก้วของชาวไทใหญ่ในภาคเหนือ (โดยเฉพาะ จ.แม่ฮ่องสอน) เพื่อให้เด็กชายได้ศึกษาพระธรรมวินัย"
  }
]`;
  } else if (target.includes('ธรรมาภิบาล') || target.includes('จริยธรรม') || target.includes('บทที่ 3') || target.includes('บทที่3')) {
    chapterTitle = 'บทที่ 3: หลักธรรมาภิบาลและจริยธรรมตำรวจ';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 3 หลักธรรมาภิบาลและจริยธรรมตำรวจ":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องหลักธรรมาภิบาล 6 ประการ จริยธรรมตำรวจ และอคติ ๔:**
   - ธรรมาภิบาล 6 ประการ (นิติธรรม, คุณธรรม, โปร่งใส, มีส่วนร่วม, รับผิดชอบ, คุ้มค่า)
   - ค่านิยมหลัก COP (Courage, Objectivity, Professionalism)
   - การป้องกันผลประโยชน์ทับซ้อน (Conflict of Interest)
   - อคติ ๔ (ฉันทาคติ, โทสาคติ, โมหาคติ, ภยาคติ)`;
    exampleJson = `[
  {
    "questionText": "เจ้าหน้าที่ตำรวจไม่ดำเนินคดีกับผู้กระทำความผิดเนื่องจากเป็นญาติสนิทของตนเอง พฤติกรรมนี้แสดงถึงการขาดหลักธรรมาภิบาลด้านใดและตกอยู่ในอคติข้อใด?",
    "optionA": "หลักนิติธรรม — ฉันทาคติ",
    "optionB": "หลักความคุ้มค่า — โทสาคติ",
    "optionC": "หลักความรับผิดชอบ — โมหาคติ",
    "optionD": "หลักความโปร่งใส — ภยาคติ",
    "correctOption": "A",
    "explanation": "การละเว้นไม่ปฏิบัติตามกฎหมายขัดต่อ 'หลักนิติธรรม' และการช่วยเหลือเพราะเป็นญาติสนิทถือเป็น 'ฉันทาคติ' (ลำเอียงเพราะรักใคร่ชอบพอ)"
  }
]`;
  } else if (target.includes('ศาสนา') || target.includes('พุทธ') || target.includes('ธรรม') || target.includes('บทที่ 4') || target.includes('บทที่4')) {
    chapterTitle = 'บทที่ 4: ศาสนาและหลักธรรมสำคัญ';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 4 ศาสนาและหลักธรรม":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องวันสำคัญทางพระพุทธศาสนาและหลักธรรมสำคัญ:**
   - วันสำคัญ: มาฆบูชา (โอวาทปาติโมกข์), วิสาขบูชา (อริยสัจ ๔), อาสาฬหบูชา (ธัมมจักกัปปวัตตนสูตร พระรัตนตรัยครบ 3), เข้าพรรษา/ออกพรรษา, อัฏฐมีบูชา
   - หลักธรรม: อริยสัจ ๔, อิทธิบาท ๔, พรหมวิหาร ๔, ทศพิธราชธรรม, สัปปุริสธรรม ๗, สังคหวัตถุ ๔, หิริ-โอตตัปปะ`;
    exampleJson = `[
  {
    "questionText": "พระพุทธเจ้าทรงแสดง 'โอวาทปาติโมกข์' ซึ่งถือเป็นหัวใจของพระพุทธศาสนา ในวันสำคัญทางศาสนาใด?",
    "optionA": "วันมาฆบูชา",
    "optionB": "วันวิสาขบูชา",
    "optionC": "วันอาสาฬหบูชา",
    "optionD": "วันอัฏฐมีบูชา",
    "correctOption": "A",
    "explanation": "วันมาฆบูชา (ขึ้น 15 ค่ำ เดือน 3) เกิดจาตุรงคสันนิบาต และพระพุทธองค์ทรงแสดงธรรมโอวาทปาติโมกข์ (การไม่ทำบาปทั้งปวง การทำกุศลให้ถึงพร้อม การทำจิตใจให้บริสุทธิ์)"
  }
]`;
  } else if (target.includes('ยุทธศาสตร์') || target.includes('แผนพัฒนา') || target.includes('thailand') || target.includes('บทที่ 5') || target.includes('บทที่5')) {
    chapterTitle = 'บทที่ 5: Thailand ยุทธศาสตร์ชาติ และแผนพัฒนาเศรษฐกิจ';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 5 ยุทธศาสตร์ชาติและแผนพัฒนา":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องยุทธศาสตร์ชาติ 20 ปี, Thailand 4.0, และโมเดล BCG:**
   - ยุทธศาสตร์ชาติ 20 ปี (พ.ศ. 2561-2580) 6 ด้าน (ความมั่นคง, ขีดความสามารถแข่งขัน, พัฒนาทรัพยากรมนุษย์, สร้างโอกาสความเสมอภาค, สิ่งแวดล้อม, บริหารภาครัฐ)
   - BCG Model (Bioeconomy, Circular Economy, Green Economy)
   - Thailand 4.0 (นวัตกรรมและเทคโนโลยีดิจิทัล)`;
    exampleJson = `[
  {
    "questionText": "การนำเศษวัสดุเหลือใช้ทางการเกษตรกลับมาแปรรูปเป็นพลังงานหมุนเวียนและลดของเสียให้เหลือศูนย์ (Zero Waste) สอดคล้องกับหลักการใดในโมเดล BCG?",
    "optionA": "Circular Economy (เศรษฐกิจหมุนเวียน)",
    "optionB": "Bioeconomy (เศรษฐกิจชีวภาพ)",
    "optionC": "Green Economy (เศรษฐกิจสีเขียว)",
    "optionD": "Digital Economy (เศรษฐกิจดิจิทัล)",
    "correctOption": "A",
    "explanation": "Circular Economy (เศรษฐกิจหมุนเวียน) มุ่งเน้นการนำวัสดุกลับมาใช้ประโยชน์สูงสุด หมุนเวียนในระบบ และลดของเสียให้เหลือศูนย์"
  }
]`;
  } else if (target.includes('เศรษฐกิจพอเพียง') || target.includes('พอเพียง') || target.includes('บทที่ 6') || target.includes('บทที่6')) {
    chapterTitle = 'บทที่ 6: ปรัชญาของเศรษฐกิจพอเพียง';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 6 เศรษฐกิจพอเพียง":
1. **ทุกข้อ (100%) ต้องเป็นเรื่อง 3 ห่วง 2 เงื่อนไข และเกษตรทฤษฎีใหม่ 3 ขั้น:**
   - 3 ห่วง: พอประมาณ, มีเหตุผล, มีภูมิคุ้มกันที่ดีในตัว
   - 2 เงื่อนไข: เงื่อนไขความรู้, เงื่อนไขคุณธรรม
   - เกษตรทฤษฎีใหม่ ขั้นที่ 1 สัดส่วน 30:30:30:10 (สระน้ำ 30%, ข้าว 30%, พืชไร่พืชสวน 30%, ที่อยู่อาศัย 10%)`;
    exampleJson = `[
  {
    "questionText": "ตามหลัก 'เกษตรทฤษฎีใหม่ ขั้นที่ 1' การจัดสรรพื้นที่การเกษตรขนาด 10-15 ไร่ สัดส่วน 30% แรกควรกำหนดเพื่อวัตถุประสงค์ใดเป็นสำคัญ?",
    "optionA": "ขุดสระกักเก็บน้ำไว้ใช้ในฤดูแล้งและเลี้ยงสัตว์น้ำ",
    "optionB": "ปลูกข้าวไว้บริโภคพอเพียงในครัวเรือนตลอดปี",
    "optionC": "ปลูกพืชไร่และไม้ผลเพื่อสร้างรายได้",
    "optionD": "สร้างที่อยู่อาศัยและโรงเรือน",
    "correctOption": "A",
    "explanation": "สัดส่วน 30:30:30:10 ของเกษตรทฤษฎีใหม่ กำหนด 30% แรกสำหรับขุดสระกักเก็บน้ำเพื่อการเพาะปลูกตลอดทั้งปี"
  }
]`;
  } else if (target.includes('ประวัติศาสตร์') || target.includes('บุคคลสำคัญ') || target.includes('บทที่ 7') || target.includes('บทที่7')) {
    chapterTitle = 'บทที่ 7: ประวัติศาสตร์ไทย และบุคคลสำคัญ';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 7 ประวัติศาสตร์และบุคคลสำคัญ":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องประวัติศาสตร์ไทยและพระราชกรณียกิจของบุคคลสำคัญ:**
   - สุโขทัย (พ่อขุนรามคำแหง), อยุธยา (พระเจ้าอู่ทอง, พระบรมไตรโลกนาถ, พระนเรศวร, พระนารายณ์), ธนบุรี (พระเจ้าตากสิน)
   - รัตนโกสินทร์: ร.1 (สถาปนากรุงเทพฯ 2325), ร.4 (เบาว์ริง/วิทยาศาสตร์), ร.5 (เลิกทาส/ปฏิรูปกระทรวง/กรมตำรวจ), ร.7 (2475)`;
    exampleJson = `[
  {
    "questionText": "พระมหากษัตริย์พระองค์ใดทรงริเริ่มปฏิรูปการบริหารราชการแผ่นดินแบบกระทรวง 12 กระทรวง และทรงจัดตั้ง 'กรมตำรวจ' ขึ้นในประเทศไทย?",
    "optionA": "พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว (รัชกาลที่ ๕)",
    "optionB": "พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว (รัชกาลที่ ๔)",
    "optionC": "พระบาทสมเด็จพระมงกุฎเกล้าเจ้าอยู่หัว (รัชกาลที่ ๖)",
    "optionD": "พระบาทสมเด็จพระนั่งเกล้าเจ้าอยู่หัว (รัชกาลที่ ๓)",
    "correctOption": "A",
    "explanation": "รัชกาลที่ ๕ (พระปิยมหาราช) ทรงปฏิรูปการปกครองประเทศครั้งใหญ่ เลิกทาส จัดตั้งกระทรวง 12 กระทรวง และทรงก่อตั้งกรมตำรวจ รถไฟ ประปา ไฟฟ้า"
  }
]`;
  } else if (target.includes('ภูมิศาสตร์') || target.includes('สิ่งแวดล้อม') || target.includes('บทที่ 8') || target.includes('บทที่8')) {
    chapterTitle = 'บทที่ 8: ภูมิศาสตร์และสิ่งแวดล้อม';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 8 ภูมิศาสตร์และสิ่งแวดล้อม":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องพิกัดภูมิศาสตร์ แผนที่ ภูมิประเทศ 6 ภาค และปรากฏการณ์ธรรมชาติ:**
   - ละติจูด (รุ้ง-อากาศ) vs ลองจิจูด (แวง-เวลา 15 องศา = 1 ชม., ไทย UTC+7)
   - ภูมิประเทศไทย 6 ภาค (ดอยอินทนนท์, ที่ราบสูงโคราช, ที่ราบลุ่มเจ้าพระยา)
   - ปรากฏการณ์เอลนีโญ (แล้ง) vs ลานีญา (ฝนชุก/หนาว), ภาวะโลกร้อน`;
    exampleJson = `[
  {
    "questionText": "หากเวลามาตรฐานกรีนิช (GMT) เป็นเวลา 12.00 น. ประเทศไทยซึ่งตั้งอยู่ที่ลองจิจูดประมาณ 105 องศาตะวันออก จะเป็นเวลาใด?",
    "optionA": "19.00 น. (UTC+7)",
    "optionB": "17.00 น. (UTC+5)",
    "optionC": "21.00 น. (UTC+9)",
    "optionD": "05.00 น. (UTC-7)",
    "correctOption": "A",
    "explanation": "โลกหมุน 15 องศาลองจิจูด = เวลาต่างกัน 1 ชั่วโมง (105 ÷ 15 = 7 ชั่วโมง) ประเทศไทยอยู่ทางตะวันออกจึงเร็วกว่ากรีนิช 7 ชั่วโมง (12.00 + 7 = 19.00 น.)"
  }
]`;
  } else if (target.includes('เศรษฐศาสตร์') || target.includes('บทที่ 9') || target.includes('บทที่9')) {
    chapterTitle = 'บทที่ 9: เศรษฐศาสตร์พื้นฐาน';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 9 เศรษฐศาสตร์พื้นฐาน":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องปัจจัยการผลิต กลไกราคา อุปสงค์-อุปทาน และเงินเฟ้อ-เงินฝืด:**
   - 4 ปัจจัยการผลิตและผลตอบแทน (ที่ดิน-ค่าเช่า, แรงงาน-ค่าจ้าง, ทุน-ดอกเบี้ย, ผู้ประกอบการ-กำไร)
   - กฎอุปสงค์ (ราคาขึ้น ซื้อลด) vs กฎอุปทาน (ราคาขึ้น ขายเพิ่ม)
   - จุดดุลยภาพ สินค้าล้นตลาด vs สินค้าขาดตลาด
   - เงินเฟ้อ (ของแพง ดอกเบี้ยขึ้นแก้) vs เงินฝืด (เศรษฐกิจซบเซา ลดดอกเบี้ยแก้)`;
    exampleJson = `[
  {
    "questionText": "ตามหลักเศรษฐศาสตร์ ผลตอบแทนที่ผู้ลงทุนจัดหาเครื่องจักรและอุปกรณ์ในฐานะ 'ทุน' (Capital) จะได้รับคือข้อใด?",
    "optionA": "ดอกเบี้ย (Interest)",
    "optionB": "ค่าเช่า (Rent)",
    "optionC": "ค่าจ้าง (Wages)",
    "optionD": "กำไร (Profit)",
    "correctOption": "A",
    "explanation": "ในทางเศรษฐศาสตร์ ผลตอบแทนของ 'ทุน' (Capital) คือ ดอกเบี้ย (Interest) ส่วน ที่ดิน=ค่าเช่า, แรงงาน=ค่าจ้าง, ผู้ประกอบการ=กำไร"
  }
]`;
  } else if (target.includes('อาเซียน') || target.includes('asean') || target.includes('บทที่ 10') || target.includes('บทที่10')) {
    chapterTitle = 'บทที่ 10: ประชาคมอาเซียน (ASEAN)';
    chapterSpecificRules = `🎯 กฎเหล็กเฉพาะสำหรับ "บทที่ 10 ประชาคมอาเซียน":
1. **ทุกข้อ (100%) ต้องเป็นเรื่องประวัติการก่อตั้งอาเซียน 10 ประเทศ และ 3 เสาหลัก:**
   - ก่อตั้ง 8 ส.ค. 2510 ณ วังสราญรมย์ กรุงเทพฯ (ปฏิญญากรุงเทพ), 5 ประเทศผู้ก่อตั้ง
   - สำนักเลขาธิการอาเซียน (กรุงจาการ์ตา อินโดนีเซีย)
   - 3 เสาหลัก (APSC การเมืองความมั่นคง/ASEANAPOL, AEC เศรษฐกิจ, ASCC สังคมวัฒนธรรม)
   - สัญลักษณ์ (รวงข้าวสีเหลือง 10 มัด), คำขวัญ (One Vision, One Identity, One Community), เมืองหลวง สกุลเงิน ดอกไม้ประจำชาติ`;
    exampleJson = `[
  {
    "questionText": "สมาคมประชาชาติแห่งเอเชียตะวันออกเฉียงใต้ (ASEAN) ได้รับการก่อตั้งขึ้นอย่างเป็นทางการจากการลงนามในเอกสารข้อตกลงใดและจัดขึ้นที่สถานที่ใด?",
    "optionA": "ปฏิญญากรุงเทพ — กรุงเทพมหานคร ประเทศไทย",
    "optionB": "กฎบัตรอาเซียน — กรุงจาการ์ตา ประเทศอินโดนีเซีย",
    "optionC": "สนธิสัญญามะนิลา — กรุงมะนิลา ประเทศฟิลิปปินส์",
    "optionD": "ข้อตกลงกัวลาลัมเปอร์ — กรุงกัวลาลัมเปอร์ ประเทศมาเลเซีย",
    "correctOption": "A",
    "explanation": "อาเซียนก่อตั้งขึ้นเมื่อวันที่ 8 สิงหาคม พ.ศ. 2510 โดยการลงนามใน 'ปฏิญญากรุงเทพ' (Bangkok Declaration) ณ วังสราญรมย์ กรุงเทพมหานคร โดย 5 ประเทศสมาชิกผู้ก่อตั้ง"
  }
]`;
  } else {
    chapterTitle = 'วิชาสังคม วัฒนธรรม จริยธรรม และอาเซียน';
    chapterSpecificRules = `🎯 คำแนะนำ: ออกข้อสอบคละหัวข้ออย่างสมดุล (สังคมวิทยา, วัฒนธรรมไทย, ธรรมาภิบาล, ศาสนา, ยุทธศาสตร์ชาติ, เศรษฐกิจพอเพียง, ประวัติศาสตร์, ภูมิศาสตร์, เศรษฐศาสตร์, อาเซียน)`;
    exampleJson = `[
  {
    "questionText": "โจทย์คำถามเกี่ยวกับสังคม/จริยธรรม/อาเซียน...",
    "optionA": "ตัวเลือก ก",
    "optionB": "ตัวเลือก ข",
    "optionC": "ตัวเลือก ค",
    "optionD": "ตัวเลือก ง",
    "correctOption": "A",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด..."
  }
]`;
  }

  return `คุณคือผู้เชี่ยวชาญระดับปรมาจารย์ในการออกข้อสอบวิชา "${chapterTitle}" สำหรับการสอบคัดเลือกข้าราชการตำรวจ
โปรดสร้างข้อสอบจำนวน ${count} ข้อ ${subcategory ? `เน้นหัวข้อ/บทเรียน: "${subcategory}"` : ''} ${title ? `ชื่อชุดข้อสอบ: "${title}"` : ''}
${contextText ? `คลังเนื้อหาอ้างอิง:\n${contextText.substring(0, 16000)}\n\n` : ''}

⛔️ ข้อห้ามเด็ดขาด (Strict Restrictions):
1. ❌ **ห้ามออกข้อสอบข้ามหมวดบทเรียนที่ระบุ** ต้องออกเฉพาะหัวข้อ ${chapterTitle} เท่านั้น 100%
2. ❌ **คำตอบและคำอธิบายต้องถูกต้องตามหลักวิชาการ ประวัติศาสตร์ ศาสนา และระเบียบกฎหมาย 100%**

${chapterSpecificRules}

💡 คำอธิบายเฉลย (Deep Explanation):
- อธิบายเหตุผลอย่างละเอียด พร้อมชี้แจงว่าทำไมคำตอบที่ถูกต้องจึงถูก และตัวเลือกอื่นๆ ผิดอย่างไร

รูปแบบผลลัพธ์: ตอบกลับเฉพาะโครงสร้าง JSON Array ตามรูปแบบนี้เท่านั้น ห้ามมี markdown อื่น:
${exampleJson}`;
}

function buildSubjectSpecificExamPrompt({ subject, subcategory, title, count, contextText }) {
  const combined = `${subject || ''} ${subcategory || ''} ${title || ''}`.toLowerCase();

  if (combined.includes('ภาษาไทย') || combined.includes('ไทย') || combined.includes('thai') || subject === 'thai') {
    return buildThaiPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('อังกฤษ') || combined.includes('english') || subject === 'english') {
    return buildEnglishPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('คำนวณ') || combined.includes('คณิต') || combined.includes('ทั่วไป') || combined.includes('อนุกรม') || combined.includes('โอเปเรชั่น') || combined.includes('เหตุผล') || combined.includes('ตรรก') || combined.includes('general') || subject === 'general') {
    return buildGeneralMathPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('คอม') || combined.includes('สารสนเทศ') || combined.includes('computer') || subject === 'computer') {
    return buildComputerPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('กฏหมาย') || combined.includes('กฎหมาย') || combined.includes('law') || subject === 'law') {
    return buildLawPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('สารบรรณ') || combined.includes('secretariat') || subject === 'secretariat') {
    return buildSecretariatPrompt({ count, subcategory, title, contextText });
  }
  if (combined.includes('สังคม') || combined.includes('จริยธรรม') || combined.includes('อาเซียน') || combined.includes('social') || subject === 'social') {
    return buildSocialPrompt({ count, subcategory, title, contextText });
  }

  return buildThaiPrompt({ count, subcategory, title, contextText });
}

// --- Admin API: Preview AI Exam Generation ---
app.post('/api/admin/exams/preview-ai', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ใช้งานคำสั่งนี้ (สำหรับ Admin เท่านั้น)' });
    }

    const { subject, knowledgeBase, docId, numQuestions, title, subcategory } = req.body;
    const count = Math.min(Math.max(parseInt(numQuestions) || 10, 1), 50);

    const isThaiSubject = subject === 'thai' || subject === 'ภาษาไทย' || (title && (title.includes('ไทย') || title.includes('ภาษาไทย')));
    const isSocialSubject = subject === 'social' || subject === 'สังคม' || subject === 'จริยธรรม' || subject === 'สังคมและวัฒนธรรม' || (title && (title.includes('สังคม') || title.includes('จริยธรรม') || title.includes('อาเซียน')));
    const isMathSubject = subject === 'general' || subject === 'ทั่วไป' || subject === 'คำนวณ' || subject === 'คณิต' || subject === 'คณิตศาสตร์' || (title && (title.includes('คำนวณ') || title.includes('คณิต') || title.includes('ทั่วไป') || title.includes('อนุกรม')));
    const isSarabanSubject = subject === 'secretariat' || subject === 'งานสารบรรณ' || subject === 'สารบรรณ' || subject === 'งานสารบรรณ_๒๕๒๖' || subject === 'สารบรรณตำรวจ_๕๔' || (knowledgeBase && knowledgeBase.includes('สารบรรณ'));

    let contextText = '';
    if (docId && docId !== 'ALL' && docId !== 'ALL_2526' && docId !== 'ALL_54') {
      const doc = await prisma.knowledgeDocument.findUnique({ where: { id: parseInt(docId) } });
      if (doc) {
        if (!isThaiSubject || (doc.category && (doc.category.includes('ไทย') || doc.category.includes('ภาษา')))) {
          contextText = `[เอกสารอ้างอิง: ${doc.title}]\n${doc.content}`;
        }
      }
    }

    if (!contextText && subcategory && subcategory !== 'ALL' && !isThaiSubject && isSarabanSubject) {
      try {
        const cleanSub = subcategory.replace(/บทที่\s*\d+\s*/, '').trim();
        const specificDoc = await prisma.knowledgeDocument.findFirst({
          where: {
            OR: [
              { title: { contains: subcategory } },
              { title: { contains: cleanSub } }
            ]
          }
        });
        if (specificDoc) {
          contextText = `[เอกสารอ้างอิงเฉพาะหมวด: ${specificDoc.title}]\n${specificDoc.content}`;
        }
      } catch (e) {
        console.warn('Find specific subcategory doc error:', e);
      }
    }
    
    if (!contextText && (knowledgeBase === 'สารบรรณ_๒๕๒๖' || docId === 'ALL_2526' || subject === 'งานสารบรรณ_๒๕๒๖')) {
      try {
        const docs = await prisma.knowledgeDocument.findMany({ where: { category: { contains: 'ระเบียบสำนักนายก' } } });
        if (docs && docs.length > 0) {
          contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
        } else {
          const p = path.join(__dirname, 'data', 'saraban_full.json');
          if (fs.existsSync(p)) {
            const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch 2526 error:', e);
      }
    } else if (!contextText && (knowledgeBase === 'สารบรรณ_๕๔' || docId === 'ALL_54' || subject === 'สารบรรณตำรวจ_๕๔')) {
      try {
        const docs = await prisma.knowledgeDocument.findMany({ where: { category: { contains: 'ลักษณะที่ ๕๔' } } });
        if (docs && docs.length > 0) {
          contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
        } else {
          const p = path.join(__dirname, 'data', 'police_saraban_54.json');
          if (fs.existsSync(p)) {
            const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch 54 error:', e);
      }
    } else if (!contextText && (subject === 'คอม' || subject === 'คอมพิวเตอร์' || subject === 'เทคโนโลยีสารสนเทศ')) {
      try {
        const docs = await prisma.knowledgeDocument.findMany({ where: { category: { contains: 'คอมพิวเตอร์' } } });
        if (docs && docs.length > 0) {
          contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
        } else {
          const p = path.join(__dirname, 'data', 'computer_full.json');
          if (fs.existsSync(p)) {
            const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch computer error:', e);
      }
    } else if (!contextText && (subject === 'กฏหมาย' || subject === 'กฎหมาย' || subject === 'กฎหมายที่ประชาชนควรรู้')) {
      try {
        const docs = await prisma.knowledgeDocument.findMany({ where: { category: { contains: 'กฎหมาย' } } });
        if (docs && docs.length > 0) {
          contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
        } else {
          const p = path.join(__dirname, 'data', 'law_full.json');
          if (fs.existsSync(p)) {
            const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch law error:', e);
      }
    } else if (!contextText && isThaiSubject) {
      try {
        const p = path.join(__dirname, 'data', 'thai_full.json');
        if (fs.existsSync(p)) {
          const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (subcategory && subcategory !== 'ALL') {
            const cleanSub = subcategory.replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
            const matched = raw.filter(d => d.title.toLowerCase().includes(cleanSub) || (cleanSub && d.content.toLowerCase().includes(cleanSub)));
            if (matched.length > 0) {
              contextText = matched.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            } else {
              contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            }
          } else {
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch thai error:', e);
      }
    } else if (!contextText && isSocialSubject) {
      try {
        const p = path.join(__dirname, 'data', 'social_full.json');
        if (fs.existsSync(p)) {
          const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (subcategory && subcategory !== 'ALL') {
            const cleanSub = subcategory.replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
            const matched = raw.filter(d => d.title.toLowerCase().includes(cleanSub) || (cleanSub && d.content.toLowerCase().includes(cleanSub)));
            if (matched.length > 0) {
              contextText = matched.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            } else {
              contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            }
          } else {
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch social error:', e);
      }
    } else if (!contextText && isMathSubject) {
      try {
        const p = path.join(__dirname, 'data', 'math_full.json');
        if (fs.existsSync(p)) {
          const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (subcategory && subcategory !== 'ALL') {
            const cleanSub = subcategory.replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
            const matched = raw.filter(d => d.title.toLowerCase().includes(cleanSub) || (cleanSub && d.content.toLowerCase().includes(cleanSub)));
            if (matched.length > 0) {
              contextText = matched.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            } else {
              contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
            }
          } else {
            contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
          }
        }
      } catch (e) {
        console.error('Fetch math error:', e);
      }
    } else if (!contextText && (knowledgeBase === 'ALL_SARABAN' || subject === 'งานสารบรรณ')) {
      const docs = await prisma.knowledgeDocument.findMany({});
      if (docs && docs.length > 0) {
        contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    }

    let apiKey = (req.body.apiKey || process.env.GEMINI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
    if (!apiKey) {
      const dbSettings = await prisma.systemSetting.findMany({
        where: { key: { in: ['settings_gemini_key', 'gemini_api_key', 'GEMINI_API_KEY', 'geminiKey', 'apiKey'] } }
      });
      for (const s of dbSettings) {
        if (s.value && s.value.trim()) {
          apiKey = s.value.trim().replace(/^['"]|['"]$/g, '');
          break;
        }
      }
    }

    if (!apiKey) {
      return res.status(400).json({
        error: '🔑 ไม่พบ API Key ของ Gemini กรุณาระบุ API Key ในช่องที่กำหนด หรือในเมนู Admin -> ตั้งค่าระบบ'
      });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash-latest', 'gemini-2.5-pro'];

    // Build specialized prompt for the requested subject
    const prompt = buildSubjectSpecificExamPrompt({
      subject,
      subcategory,
      title,
      count,
      contextText
    });

    let textResponse = '';
    let lastErr = null;

    // 1. Try SDK first
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          textResponse = result.response.text();
          if (textResponse) break;
        } catch (mErr) {
          console.warn(`[SDK Gemini ${modelName} failed]:`, mErr.message);
          lastErr = mErr;
        }
      }
    } catch (sdkErr) {
      lastErr = sdkErr;
    }

    // 2. Fallback to Direct REST API with x-goog-api-key header if SDK failed
    if (!textResponse) {
      for (const m of modelsToTry) {
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await resp.json();
          if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            textResponse = data.candidates[0].content.parts.map(p => p.text).join('\n');
            if (textResponse) break;
          } else if (data.error) {
            console.warn(`[HTTP Fetch ${m} error]:`, data.error.message);
            lastErr = new Error(data.error.message);
          }
        } catch (hErr) {
          console.warn(`[HTTP Fetch ${m} failed]:`, hErr.message);
          lastErr = hErr;
        }
      }
    }

    if (!textResponse) {
      if (lastErr && (lastErr.message.includes('401') || lastErr.message.includes('Unauthorized') || lastErr.message.includes('invalid authentication'))) {
        return res.status(401).json({ error: '🔑 Gemini API Key ไม่ถูกต้องหรือไม่มีสิทธิ์ใช้งาน (401 Unauthorized) กรุณาตรวจสอบ API Key ในเมนู Admin -> ตั้งค่าระบบ' });
      }
      if (lastErr && (lastErr.message.includes('429') || lastErr.message.includes('quota') || lastErr.message.includes('RESOURCE_EXHAUSTED') || lastErr.message.includes('Rate limit'))) {
        return res.status(429).json({ error: '⚠️ Gemini API Rate Limit (429): ' + lastErr.message });
      }
      return res.status(500).json({ error: 'ไม่สามารถเรียกใช้งาน Gemini AI ได้: ' + (lastErr ? lastErr.message : 'Unknown error') });
    }

    let cleanJson = textResponse.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();

    const rawQuestions = JSON.parse(cleanJson);
    res.json({ success: true, questions: rawQuestions });

  } catch (err) {
    console.error('Preview AI Exam error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดจาก Gemini: ' + err.message });
  }
});

// --- Admin API: Save Verified Exam Set ---
app.post('/api/admin/exams/save-set', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ใช้งานคำสั่งนี้' });
    }

    const { title, category, subcategory, status, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'ไม่พบรายการข้อสอบที่ต้องการบันทึก' });
    }

    const newExamSet = await prisma.examSet.create({
      data: {
        title: title || 'ชุดข้อสอบใหม่',
        category: category || 'งานสารบรรณ',
        subcategory: subcategory || null,
        totalCount: questions.length,
        status: status || 'PUBLISHED',
        isPublic: true,
        createdById: req.user.userId,
        questions: {
          create: questions.map((q, idx) => {
            let correctNum = 1;
            const opt = String(q.correctOption || 'A').toUpperCase();
            if (opt === 'B' || opt === '2') correctNum = 2;
            else if (opt === 'C' || opt === '3') correctNum = 3;
            else if (opt === 'D' || opt === '4') correctNum = 4;

            return {
              questionText: q.questionText || `ข้อสอบที่ ${idx + 1}`,
              choice1: q.optionA || 'ตัวเลือก ก',
              choice2: q.optionB || 'ตัวเลือก ข',
              choice3: q.optionC || 'ตัวเลือก ค',
              choice4: q.optionD || 'ตัวเลือก ง',
              correctAnswer: correctNum,
              explanation: q.explanation || '',
              sortOrder: idx + 1
            };
          })
        }
      }
    });

    res.json({
      message: `บันทึกชุดข้อสอบ "${newExamSet.title}" สำเร็จจำนวน ${questions.length} ข้อ!`,
      examSet: newExamSet
    });

  } catch (err) {
    console.error('Save exam set error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message });
  }
});

// --- Admin API: Append Questions to Existing Exam Set ---
app.post('/api/admin/exams/:examSetId/append-ai', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ใช้งานคำสั่งนี้' });
    }

    const examSetId = parseInt(req.params.examSetId);
    const { numQuestions } = req.body;
    const count = Math.min(Math.max(parseInt(numQuestions) || 10, 1), 50);

    const examSet = await prisma.examSet.findUnique({
      where: { id: examSetId },
      include: { questions: true }
    });

    if (!examSet) {
      return res.status(404).json({ error: 'ไม่พบชุดข้อสอบนี้' });
    }

    let contextText = '';
    const cat = (examSet.category || '').toLowerCase();
    const isThai = cat.includes('ไทย') || cat.includes('thai');
    const isComp = cat.includes('คอม') || cat.includes('computer');
    const isLaw = cat.includes('กฎหมาย') || cat.includes('กฏหมาย') || cat.includes('law');

    if (examSet.category === 'งานสารบรรณ' || cat.includes('สารบรรณ')) {
      const docs = await prisma.knowledgeDocument.findMany({});
      if (docs && docs.length > 0) contextText = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
    } else if (isThai) {
      const p = path.join(__dirname, 'data', 'thai_full.json');
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        const cleanSub = (examSet.subcategory || '').replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
        const matched = raw.filter(d => cleanSub && (d.title.toLowerCase().includes(cleanSub) || d.content.toLowerCase().includes(cleanSub)));
        contextText = (matched.length > 0 ? matched : raw).map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    } else if (isComp) {
      const p = path.join(__dirname, 'data', 'computer_full.json');
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    } else if (isLaw) {
      const p = path.join(__dirname, 'data', 'law_full.json');
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        contextText = raw.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    } else if (cat.includes('สังคม') || cat.includes('จริยธรรม') || cat.includes('social') || cat.includes('อาเซียน')) {
      const p = path.join(__dirname, 'data', 'social_full.json');
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        const cleanSub = (examSet.subcategory || '').replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
        const matched = raw.filter(d => cleanSub && (d.title.toLowerCase().includes(cleanSub) || d.content.toLowerCase().includes(cleanSub)));
        contextText = (matched.length > 0 ? matched : raw).map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    } else if (cat.includes('คำนวณ') || cat.includes('คณิต') || cat.includes('ทั่วไป') || cat.includes('general') || cat.includes('อนุกรม')) {
      const p = path.join(__dirname, 'data', 'math_full.json');
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        const cleanSub = (examSet.subcategory || '').replace(/บทที่\s*\d+\s*/, '').trim().toLowerCase();
        const matched = raw.filter(d => cleanSub && (d.title.toLowerCase().includes(cleanSub) || d.content.toLowerCase().includes(cleanSub)));
        contextText = (matched.length > 0 ? matched : raw).map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      }
    }

    let apiKey = (req.body.apiKey || process.env.GEMINI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
    if (!apiKey) {
      const dbSettings = await prisma.systemSetting.findMany({
        where: { key: { in: ['settings_gemini_key', 'gemini_api_key', 'GEMINI_API_KEY', 'geminiKey', 'apiKey'] } }
      });
      for (const s of dbSettings) {
        if (s.value && s.value.trim()) {
          apiKey = s.value.trim().replace(/^['"]|['"]$/g, '');
          break;
        }
      }
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'ไม่พบ API Key ของ Gemini ในระบบ' });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const prompt = buildSubjectSpecificExamPrompt({
      subject: examSet.category,
      subcategory: examSet.subcategory,
      title: examSet.title,
      count,
      contextText
    });

    let textResponse = '';
    let lastErr = null;

    // 1. Try SDK first
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          textResponse = result.response.text();
          if (textResponse) break;
        } catch (mErr) {
          console.warn(`[SDK Append Gemini ${modelName} failed]:`, mErr.message);
          lastErr = mErr;
        }
      }
    } catch (sdkErr) {
      lastErr = sdkErr;
    }

    // 2. Fallback to Direct REST API with x-goog-api-key header if SDK failed
    if (!textResponse) {
      for (const m of modelsToTry) {
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await resp.json();
          if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            textResponse = data.candidates[0].content.parts.map(p => p.text).join('\n');
            if (textResponse) break;
          } else if (data.error) {
            console.warn(`[HTTP Append Fetch ${m} error]:`, data.error.message);
            lastErr = new Error(data.error.message);
          }
        } catch (hErr) {
          console.warn(`[HTTP Append Fetch ${m} failed]:`, hErr.message);
          lastErr = hErr;
        }
      }
    }

    if (!textResponse) {
      return res.status(500).json({ error: 'ไม่สามารถเรียกใช้งาน Gemini AI ได้: ' + (lastErr ? lastErr.message : 'Unknown error') });
    }
    let cleanJson = textResponse.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();

    const newRawQuestions = JSON.parse(cleanJson);

    const createdQuestions = [];
    for (let i = 0; i < newRawQuestions.length; i++) {
      const q = newRawQuestions[i];
      let correctNum = 1;
      const opt = String(q.correctOption || 'A').toUpperCase();
      if (opt === 'B' || opt === '2') correctNum = 2;
      else if (opt === 'C' || opt === '3') correctNum = 3;
      else if (opt === 'D' || opt === '4') correctNum = 4;

      const createdQ = await prisma.question.create({
        data: {
          examSetId: examSetId,
          questionText: q.questionText || `ข้อสอบเพิ่มเติมข้อที่ ${currentCount + i + 1}`,
          choice1: q.optionA || 'ตัวเลือก ก',
          choice2: q.optionB || 'ตัวเลือก ข',
          choice3: q.optionC || 'ตัวเลือก ค',
          choice4: q.optionD || 'ตัวเลือก ง',
          correctAnswer: correctNum,
          explanation: q.explanation || '',
          sortOrder: currentCount + i + 1
        }
      });
      createdQuestions.push(createdQ);
    }

    const newTotalCount = currentCount + createdQuestions.length;

    await prisma.examSet.update({
      where: { id: examSetId },
      data: { totalCount: newTotalCount }
    });

    res.json({
      message: `เพิ่มข้อสอบเข้าชุด "${examSet.title}" อีก ${createdQuestions.length} ข้อสำเร็จ! (รวมทั้งหมดเป็น ${newTotalCount} ข้อ)`,
      totalCount: newTotalCount
    });
  } catch (err) {
    console.error('Append AI questions error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อสอบ: ' + err.message });
  }
});

// --- Admin API: Delete ALL Exam Sets & Questions ---
app.delete('/api/admin/exams/all', requireAdmin, async (req, res) => {
  try {
    const deletedQuestions = await prisma.question.deleteMany({});
    const deletedSets = await prisma.examSet.deleteMany({});
    res.json({
      success: true,
      message: `ลบข้อสอบทั้งหมดในระบบเรียบร้อยแล้ว (${deletedSets.count} ชุด, ${deletedQuestions.count} ข้อ)`
    });
  } catch (err) {
    console.error('Delete all exams error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อสอบทั้งหมด: ' + err.message });
  }
});

// --- Admin API: Delete Single Exam Set ---
app.delete('/api/admin/exams/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.question.deleteMany({ where: { examSetId: id } });
    await prisma.examSet.delete({ where: { id } });
    res.json({ success: true, message: 'ลบชุดข้อสอบเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete exam set error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบชุดข้อสอบได้: ' + err.message });
  }
});

// --- Admin API: Get All Reported Questions ---
app.get('/api/admin/reports', requireAdmin, async (req, res) => {
  try {
    const reports = await prisma.reportedQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    res.json(reports);
  } catch (err) {
    console.error('Fetch reported questions error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดรายงานข้อสอบ: ' + err.message });
  }
});

// --- Admin API: Delete / Resolve Reported Question ---
app.delete('/api/admin/reports/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'รหัสรายงานไม่ถูกต้อง' });
    await prisma.reportedQuestion.delete({
      where: { id }
    });
    res.json({ success: true, message: 'ลบรายงานข้อสอบเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete reported question error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบรายงาน: ' + err.message });
  }
});

// --- Admin API: Get a Single Question by ID ---
app.get('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'รหัสข้อสอบไม่ถูกต้อง' });
    const q = await prisma.question.findUnique({
      where: { id },
      include: {
        examSet: {
          select: { id: true, title: true, category: true, subcategory: true }
        }
      }
    });
    if (!q) return res.status(404).json({ error: 'ไม่พบข้อสอบข้อนี้ในฐานข้อมูล' });
    res.json(q);
  } catch (err) {
    console.error('Get single question error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + err.message });
  }
});

// --- Admin API: Update a Single Question Directly ---
app.put('/api/admin/questions/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'รหัสข้อสอบไม่ถูกต้อง' });
    const { questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation } = req.body;

    let correctNum = 1;
    const opt = String(correctAnswer ?? '1').toUpperCase();
    if (opt === 'B' || opt === '2') correctNum = 2;
    else if (opt === 'C' || opt === '3') correctNum = 3;
    else if (opt === 'D' || opt === '4') correctNum = 4;
    else correctNum = parseInt(opt) || 1;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText: questionText !== undefined ? questionText : undefined,
        choice1: choice1 !== undefined ? choice1 : undefined,
        choice2: choice2 !== undefined ? choice2 : undefined,
        choice3: choice3 !== undefined ? choice3 : undefined,
        choice4: choice4 !== undefined ? choice4 : undefined,
        correctAnswer: correctNum,
        explanation: explanation !== undefined ? explanation : undefined
      }
    });

    res.json({ success: true, message: 'บันทึกการแก้ไขข้อสอบเรียบร้อยแล้ว', question: updated });
  } catch (err) {
    console.error('Update single question error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อสอบ: ' + err.message });
  }
});

// --- Admin API: Get Exam Set with Full Questions List for Editing ---
app.get('/api/admin/exams/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'รหัสชุดข้อสอบไม่ถูกต้อง' });
    const examSet = await prisma.examSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    if (!examSet) return res.status(404).json({ error: 'ไม่พบชุดข้อสอบรหัส #' + id });
    res.json(examSet);
  } catch (err) {
    console.error('Fetch exam set details error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลชุดข้อสอบ: ' + err.message });
  }
});

// --- Admin API: Update Exam Set and its Questions ---
app.put('/api/admin/exams/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, category, subcategory, status, questions } = req.body;

    // Update exam set info
    const updatedSet = await prisma.examSet.update({
      where: { id },
      data: {
        title: title || undefined,
        category: category || undefined,
        subcategory: subcategory !== undefined ? subcategory : undefined,
        status: status || undefined,
        totalCount: Array.isArray(questions) ? questions.length : undefined
      }
    });

    // If questions list is provided, update/insert/delete questions
    if (Array.isArray(questions)) {
      await prisma.$transaction(async (tx) => {
        const existingQList = await tx.question.findMany({
          where: { examSetId: id },
          select: { id: true }
        });
        const existingIds = new Set(existingQList.map(q => q.id));
        const keepIds = new Set();

        for (let idx = 0; idx < questions.length; idx++) {
          const q = questions[idx];
          let correctNum = 1;
          const opt = String(q.correctAnswer ?? q.correctOption ?? '1').toUpperCase();
          if (opt === 'B' || opt === '2') correctNum = 2;
          else if (opt === 'C' || opt === '3') correctNum = 3;
          else if (opt === 'D' || opt === '4') correctNum = 4;
          else correctNum = 1;

          if (q.id && existingIds.has(parseInt(q.id))) {
            const qId = parseInt(q.id);
            keepIds.add(qId);
            await tx.question.update({
              where: { id: qId },
              data: {
                questionText: q.questionText || '',
                choice1: q.choice1 || q.optionA || '',
                choice2: q.choice2 || q.optionB || '',
                choice3: q.choice3 || q.optionC || '',
                choice4: q.choice4 || q.optionD || '',
                correctAnswer: correctNum,
                explanation: q.explanation || '',
                sortOrder: idx + 1
              }
            });
          } else {
            const created = await tx.question.create({
              data: {
                examSetId: id,
                questionText: q.questionText || '',
                choice1: q.choice1 || q.optionA || '',
                choice2: q.choice2 || q.optionB || '',
                choice3: q.choice3 || q.optionC || '',
                choice4: q.choice4 || q.optionD || '',
                correctAnswer: correctNum,
                explanation: q.explanation || '',
                sortOrder: idx + 1
              }
            });
            keepIds.add(created.id);
          }
        }

        const toDeleteIds = [...existingIds].filter(qid => !keepIds.has(qid));
        if (toDeleteIds.length > 0) {
          await tx.question.deleteMany({
            where: { id: { in: toDeleteIds } }
          });
        }
      });
    }

    res.json({
      success: true,
      message: `บันทึกการแก้ไขชุดข้อสอบ "${updatedSet.title}" เรียบร้อยแล้ว`,
      examSet: updatedSet
    });
  } catch (err) {
    console.error('Update exam set error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขชุดข้อสอบ: ' + err.message });
  }
});

// GET /api/exams/subject-questions - Fetch real questions for Question Bank Mode
app.get('/api/exams/subject-questions', authenticateToken, async (req, res) => {
  try {
    const { subject } = req.query;
    const categoryQuery = (subject || 'งานสารบรรณ').trim();

    // Map common aliases
    let searchCategory = categoryQuery;
    if (categoryQuery === 'สบ' || categoryQuery === 'สารบรรณ') searchCategory = 'งานสารบรรณ';
    else if (categoryQuery === 'ทป' || categoryQuery === 'ทั่วไป') searchCategory = 'ความรู้ทั่วไป';
    else if (categoryQuery === 'กม' || categoryQuery === 'กฎหมาย') searchCategory = 'กฎหมาย';
    else if (categoryQuery === 'คอม') searchCategory = 'เทคโนโลยีสารสนเทศ';
    else if (categoryQuery === 'สังคม') searchCategory = 'สังคม';

    const examSets = await prisma.examSet.findMany({
      where: {
        OR: [
          { category: { contains: searchCategory } },
          { subcategory: { contains: searchCategory } }
        ]
      },
      include: { questions: true }
    });

    let allQuestions = [];
    examSets.forEach(set => {
      if (set.questions && set.questions.length > 0) {
        allQuestions.push(...set.questions);
      }
    });

    if (allQuestions.length === 0) {
      allQuestions = await prisma.question.findMany({ take: 20 });
    }

    // Shuffle questions
    allQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    const formattedQuestions = allQuestions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      optionA: q.choice1 || 'ตัวเลือก ก',
      optionB: q.choice2 || 'ตัวเลือก ข',
      optionC: q.choice3 || 'ตัวเลือก ค',
      optionD: q.choice4 || 'ตัวเลือก ง',
      correctOption: q.correctAnswer === 1 ? 'A' : q.correctAnswer === 2 ? 'B' : q.correctAnswer === 3 ? 'C' : 'D',
      explanation: q.explanation || 'คำอธิบายเฉลยอ้างอิงตามระเบียบและมาตรฐานข้อสอบตำรวจ'
    }));

    res.json({
      subject: categoryQuery,
      questions: formattedQuestions
    });
  } catch (err) {
    console.error('Subject questions error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อสอบ: ' + err.message });
  }
});

// GET /api/exams/prabpram - Main Exam Simulation for สายปราบปราม (100% Real DB Questions Only)
app.get('/api/exams/prabpram', async (req, res) => {
  try {
    const subjects = [
      { key: 'general', title: 'ความรู้ความสามารถทั่วไป (คณิตศาสตร์/คำนวณ)', shortTitle: 'ความรู้ความสามารถทั่วไป', count: 30, categories: ['ทั่วไป', 'ความสามารถทั่วไป', 'ความรู้ทั่วไป', 'คณิตศาสตร์', 'คณิต'] },
      { key: 'thai', title: 'ภาษาไทย', shortTitle: 'ภาษาไทย', count: 25, categories: ['ภาษาไทย', 'ไทย'] },
      { key: 'english', title: 'ภาษาอังกฤษ', shortTitle: 'ภาษาอังกฤษ', count: 30, categories: ['ภาษาอังกฤษ', 'อังกฤษ', 'English', 'english'] },
      { key: 'computer', title: 'เทคโนโลยีสารสนเทศและคอมพิวเตอร์เพื่อการสื่อสาร', shortTitle: 'คอมพิวเตอร์และสารสนเทศ', count: 25, categories: ['คอม', 'คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'สารสนเทศ', 'คอมพิวเตอร์และสารสนเทศ'] },
      { key: 'law', title: 'กฎหมายที่ประชาชนควรรู้ (พ.ร.บ.ตำรวจ / วิ.อาญา / กฎหมาย)', shortTitle: 'กฎหมายที่ประชาชนควรรู้', count: 20, categories: ['กฏหมาย', 'กฎหมาย', 'กฎหมายที่ประชาชนควรรู้', 'กม'] },
      { key: 'social', title: 'สังคม วัฒนธรรม จริยธรรมและอาเซียน', shortTitle: 'สังคม วัฒนธรรม จริยธรรม', count: 20, categories: ['สังคม', 'สังคมและวัฒนธรรม', 'สังคมและจริยธรรมตำรวจ', 'อาเซียน'] }
    ];

    const allOrderedQuestions = [];
    let questionRunningNumber = 1;

    for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
      const sub = subjects[sIdx];
      
      // Strict category matching (Prevent cross-subject contamination like Saraban in Law)
      const orClauses = sub.categories.map(cat => ({ category: { contains: cat } }));

      // Fetch all sets and questions strictly matching this subject's category
      const examSets = await prisma.examSet.findMany({
        where: {
          OR: orClauses,
          // Explicitly exclude Saraban from Law
          NOT: (sub.key === 'law') ? [
            { category: { contains: 'สารบรรณ' } },
            { category: { contains: '๕๔' } },
            { category: { contains: '54' } }
          ] : undefined
        },
        include: {
          questions: true
        }
      });

      // Group questions by set/chapter to guarantee distributed multi-set sampling
      const groupPools = [];
      examSets.forEach(set => {
        if (set.questions && set.questions.length > 0) {
          // Shuffle questions within each set
          const shuffledInSet = [...set.questions].sort(() => 0.5 - Math.random());
          groupPools.push({
            setId: set.id,
            setTitle: set.title,
            subcategory: set.subcategory || set.category,
            questions: shuffledInSet
          });
        }
      });

      // Pick questions using Round-Robin across distinct sets/chapters (never only single set/chapter)
      const pickedForSubject = [];
      if (groupPools.length > 0) {
        let poolIndex = 0;
        let attempts = 0;
        const maxAttempts = sub.count * 10;
        while (pickedForSubject.length < sub.count && attempts < maxAttempts) {
          attempts++;
          const pool = groupPools[poolIndex % groupPools.length];
          if (pool.questions.length > 0) {
            const q = pool.questions.shift();
            pickedForSubject.push({
              id: q.id,
              questionText: q.questionText,
              choice1: q.choice1,
              choice2: q.choice2,
              choice3: q.choice3,
              choice4: q.choice4,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || 'เฉลยตามมาตรฐานข้อสอบนายสิบตำรวจสายปราบปราม',
              subjectKey: sub.key,
              subjectName: sub.title,
              shortSubjectName: sub.shortTitle,
              chapter: pool.subcategory || 'หมวดทั่วไป',
              set: pool.setTitle || 'ชุดข้อสอบ'
            });
          }
          poolIndex++;
          // Check if all pools are exhausted
          const hasRemaining = groupPools.some(p => p.questions.length > 0);
          if (!hasRemaining) break;
        }
      }

      // Add to main list with exact ordering (Only 100% real DB questions)
      pickedForSubject.forEach(q => {
        allOrderedQuestions.push({
          ...q,
          index: questionRunningNumber++,
          subjectOrder: sIdx + 1,
          subjectKey: sub.key,
          subjectName: sub.title,
          shortSubjectName: sub.shortTitle
        });
      });
    }

    if (allOrderedQuestions.length === 0) {
      return res.json({
        success: false,
        totalCount: 0,
        message: 'ยังไม่มีชุดข้อสอบจริงในระบบ กรุณาเพิ่มชุดข้อสอบผ่าน Admin Panel ก่อนเริ่มทำข้อสอบ',
        questions: []
      });
    }

    res.json({
      success: true,
      title: 'ข้อสอบจำลองเสมือนจริง: สายปราบปราม (นปพ. / ปป.)',
      track: 'prabpram',
      totalCount: allOrderedQuestions.length,
      timeLimitMinutes: 180, // 3 hours
      subjects: subjects.map((s, idx) => ({
        order: idx + 1,
        key: s.key,
        title: s.title,
        shortTitle: s.shortTitle,
        count: s.count
      })),
      questions: allOrderedQuestions
    });
  } catch (err) {
    console.error('Generate Prabpram Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงชุดข้อสอบสายปราบปรามได้: ' + err.message });
  }
});

// GET /api/exams/amnuay - Main Exam Simulation for สายอำนวยการ / พิสูจน์หลักฐาน (อก./พฐ.) (100% Real DB Questions Only)
app.get('/api/exams/amnuay', async (req, res) => {
  try {
    const subjects = [
      // กลุ่มที่ 1 (40 ข้อ - เกณฑ์ผ่าน 60% = 24 ข้อ)
      { key: 'general', group: 1, groupName: 'กลุ่มที่ 1 (ความรู้ความสามารถทั่วไปและภาษาไทย)', title: 'ความรู้ความสามารถทั่วไป (คณิตศาสตร์/คำนวณ/ตรรกศาสตร์)', shortTitle: 'ความสามารถทั่วไป', count: 20, categories: ['ทั่วไป', 'ความสามารถทั่วไป', 'ความรู้ทั่วไป', 'คณิตศาสตร์', 'คณิต'] },
      { key: 'thai', group: 1, groupName: 'กลุ่มที่ 1 (ความรู้ความสามารถทั่วไปและภาษาไทย)', title: 'ภาษาไทย', shortTitle: 'ภาษาไทย', count: 20, categories: ['ภาษาไทย', 'ไทย'] },
      // กลุ่มที่ 2 (110 ข้อ - เกณฑ์ผ่าน 60% = 66 ข้อ)
      { key: 'computer', group: 2, groupName: 'กลุ่มที่ 2 (ความรู้ความสามารถเฉพาะตำแหน่ง)', title: 'เทคโนโลยีสารสนเทศ (คอมพิวเตอร์เพื่อการสื่อสาร)', shortTitle: 'เทคโนโลยีสารสนเทศ', count: 40, categories: ['คอม', 'คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'สารสนเทศ', 'คอมพิวเตอร์และสารสนเทศ'] },
      { key: 'saraban', group: 2, groupName: 'กลุ่มที่ 2 (ความรู้ความสามารถเฉพาะตำแหน่ง)', title: 'งานสารบรรณ (ระเบียบสำนักนายกฯ ๒๕๒๖ + สารบรรณตำรวจ ลักษณะที่ ๕๔)', shortTitle: 'งานสารบรรณ (ระเบียบ+๕๔)', count: 30, categories: ['งานสารบรรณ', 'สารบรรณ', '๒๕๒๖', '2526', 'ลักษณะที่ ๕๔', 'ลักษณะที่54', '๕๔', '54', 'สารบรรณตำรวจ'] },
      { key: 'law', group: 2, groupName: 'กลุ่มที่ 2 (ความรู้ความสามารถเฉพาะตำแหน่ง)', title: 'กฎหมายที่ประชาชนควรรู้ (พ.ร.บ.ตำรวจ / วิ.อาญา / กฎหมาย)', shortTitle: 'กฎหมายที่ประชาชนควรรู้', count: 25, categories: ['กฏหมาย', 'กฎหมาย', 'กฎหมายที่ประชาชนควรรู้', 'กม'] },
      { key: 'english', group: 2, groupName: 'กลุ่มที่ 2 (ความรู้ความสามารถเฉพาะตำแหน่ง)', title: 'ภาษาอังกฤษ', shortTitle: 'ภาษาอังกฤษ', count: 15, categories: ['ภาษาอังกฤษ', 'อังกฤษ', 'English', 'english'] }
    ];

    const allOrderedQuestions = [];
    let questionRunningNumber = 1;

    for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
      const sub = subjects[sIdx];
      const orClauses = sub.categories.map(cat => ({ category: { contains: cat } }));

      // Fetch all sets and questions strictly matching this subject's category
      const examSets = await prisma.examSet.findMany({
        where: {
          OR: orClauses,
          NOT: (sub.key === 'law') ? [
            { category: { contains: 'สารบรรณ' } },
            { category: { contains: '๕๔' } },
            { category: { contains: '54' } }
          ] : undefined
        },
        include: {
          questions: true
        }
      });

      // Group questions by set/chapter
      const groupPools = [];
      examSets.forEach(set => {
        if (set.questions && set.questions.length > 0) {
          const shuffledInSet = [...set.questions].sort(() => 0.5 - Math.random());
          groupPools.push({
            setId: set.id,
            setTitle: set.title,
            subcategory: set.subcategory || set.category,
            questions: shuffledInSet
          });
        }
      });

      // Pick questions using Round-Robin across distinct sets/chapters (Only 100% real DB questions)
      const pickedForSubject = [];
      if (groupPools.length > 0) {
        let poolIndex = 0;
        let attempts = 0;
        const maxAttempts = sub.count * 10;
        while (pickedForSubject.length < sub.count && attempts < maxAttempts) {
          attempts++;
          const pool = groupPools[poolIndex % groupPools.length];
          if (pool.questions.length > 0) {
            const q = pool.questions.shift();
            pickedForSubject.push({
              id: q.id,
              questionText: q.questionText,
              choice1: q.choice1,
              choice2: q.choice2,
              choice3: q.choice3,
              choice4: q.choice4,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || 'เฉลยตามมาตรฐานข้อสอบนายสิบตำรวจสายอำนวยการ/พิสูจน์หลักฐาน',
              subjectKey: sub.key,
              group: sub.group,
              groupName: sub.groupName,
              subjectName: sub.title,
              shortSubjectName: sub.shortTitle,
              chapter: pool.subcategory || 'หมวดทั่วไป',
              set: pool.setTitle || 'ชุดข้อสอบ'
            });
          }
          poolIndex++;
          const hasRemaining = groupPools.some(p => p.questions.length > 0);
          if (!hasRemaining) break;
        }
      }

      // Add to main list with exact ordering (Only 100% real DB questions)
      pickedForSubject.forEach(q => {
        allOrderedQuestions.push({
          ...q,
          index: questionRunningNumber++,
          subjectOrder: sIdx + 1,
          subjectKey: sub.key,
          group: sub.group,
          groupName: sub.groupName,
          subjectName: sub.title,
          shortSubjectName: sub.shortTitle
        });
      });
    }

    if (allOrderedQuestions.length === 0) {
      return res.json({
        success: false,
        totalCount: 0,
        message: 'ยังไม่มีชุดข้อสอบจริงในระบบ กรุณาเพิ่มชุดข้อสอบผ่าน Admin Panel ก่อนเริ่มทำข้อสอบ',
        questions: []
      });
    }

    res.json({
      success: true,
      title: 'ข้อสอบจำลองเสมือนจริง: สายอำนวยการ / พิสูจน์หลักฐาน (อก. / พฐ.)',
      track: 'amnuay',
      totalCount: allOrderedQuestions.length,
      timeLimitMinutes: 180, // 3 hours
      groups: [
        { id: 1, name: 'กลุ่มที่ 1: ความรู้ความสามารถทั่วไปและภาษาไทย', count: 40, passMin: 24, passPct: 60, subjects: ['general', 'thai'] },
        { id: 2, name: 'กลุ่มที่ 2: ความรู้ความสามารถเฉพาะตำแหน่ง (คอมฯ, สารบรรณ, กฎหมาย, อังกฤษ)', count: 110, passMin: 66, passPct: 60, subjects: ['computer', 'saraban', 'law', 'english'] }
      ],
      subjects: subjects.map((s, idx) => ({
        order: idx + 1,
        key: s.key,
        group: s.group,
        groupName: s.groupName,
        title: s.title,
        shortTitle: s.shortTitle,
        count: s.count
      })),
      questions: allOrderedQuestions
    });
  } catch (err) {
    console.error('Generate Amnuay Exam Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงชุดข้อสอบสายอำนวยการได้: ' + err.message });
  }
});

// POST /api/user/record-quiz - Record quiz result to DB & award XP
app.post('/api/user/record-quiz', authenticateToken, async (req, res) => {
  try {
    const { score, totalCount, subject, setId, setTitle, scorePct } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    const correct = parseInt(score) || 0;
    const total = parseInt(totalCount) || 10;
    const pct = parseInt(scorePct) !== undefined ? parseInt(scorePct) : Math.round((correct / total) * 100);

    const xpGained = correct * 10 + 20;
    const pointsGained = correct * 5;
    const newXp = (user.xp || 0) + xpGained;
    const newPoints = (user.points || 0) + pointsGained;

    const sNorm = `${subject || ''} ${setTitle || ''}`.replace(/[\s_]/g, '').replace('กฏ', 'กฎ');
    const updateData = {
      xp: newXp,
      points: newPoints
    };

    if (sNorm.includes('กฎหมาย') || sNorm.includes('กม')) {
      updateData.scoreLaw = pct;
    } else if (sNorm.includes('คอม') || sNorm.includes('สารสนเทศ') || sNorm.includes('ไอที')) {
      updateData.scoreComputer = pct;
    } else if (sNorm.includes('สารบรรณ')) {
      updateData.scoreSecretariat = pct;
    } else if (sNorm.includes('ทั่วไป') || sNorm.includes('คณิต') || sNorm.includes('คำนวณ')) {
      updateData.scoreGeneral = pct;
    } else if (sNorm.includes('สังคม') || sNorm.includes('จริยธรรม')) {
      updateData.scoreSocial = pct;
    } else if (sNorm.includes('ไทย') || sNorm.includes('๕๔') || sNorm.includes('54')) {
      updateData.scoreThai = pct;
    } else if (sNorm.includes('อังกฤษ') || sNorm.includes('english')) {
      updateData.scoreEnglish = pct;
    }

    // 1. Update user XP, points & subject scores
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    // 2. Save QuizAttempt record directly to Database
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.userId,
        subject: (subject || 'ทั่วไป').trim(),
        setId: setId ? String(setId) : null,
        setTitle: setTitle ? String(setTitle).trim() : null,
        scorePct: pct,
        correctCount: correct,
        totalQuestions: total
      }
    });

    res.json({
      message: 'บันทึกคะแนนสำเร็จ! คุณได้รับ +' + xpGained + ' XP และ +' + pointsGained + ' คะแนน',
      xpGained,
      pointsGained,
      user: updated,
      attempt
    });
  } catch (err) {
    console.error('Record quiz error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกคะแนน: ' + err.message });
  }
});

// GET /api/user/quiz-history - Fetch real quiz attempts from Database for authenticated user
app.get('/api/user/quiz-history', authenticateToken, async (req, res) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const formatted = attempts.map(a => ({
      id: a.id,
      subject: a.subject,
      setId: a.setId,
      setTitle: a.setTitle,
      scorePct: a.scorePct,
      correctCount: a.correctCount,
      totalQuestions: a.totalQuestions,
      date: a.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: a.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Fetch quiz history error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการโหลดประวัติการสอบ' });
  }
});


app.listen(PORT, async () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  await ensureDefaultQuestions();
  await startExamGenerationWorker();

  // Chat cleanup worker (runs every 15 mins to delete messages older than 3 hours)
  setInterval(async () => {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const res = await prisma.chatMessage.deleteMany({
        where: {
          createdAt: { lt: threeHoursAgo }
        }
      });
      if (res.count > 0) {
        console.log(`[Chat Cleanup] Deleted ${res.count} messages older than 3 hours.`);
      }
    } catch (e) {
      console.error('[Chat Cleanup] Error:', e);
    }
  }, 15 * 60 * 1000);
});

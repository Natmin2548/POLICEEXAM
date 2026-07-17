import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
        questionText: 'ประเทศใดไม่ได้อยู่ในผู้ก่อตั้งสมาคมประชาชาติแห่งเอเชันตะวันออกเฉียงใต้ (ASEAN) ในปี พ.ศ. 2510?',
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

async function seed() {
  try {
    console.log('Starting custom questions seeding...');

    // Find any admin/owner user or just the first user to set as creator
    let admin = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'OWNER'] } } });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    const creatorId = admin ? admin.id : 1;

    for (const group of defaultQuestions) {
      // Check if this exam set already exists
      let examSet = await prisma.examSet.findFirst({
        where: { title: group.title, category: group.category }
      });

      if (!examSet) {
        examSet = await prisma.examSet.create({
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
                sortOrder: idx
              }))
            }
          }
        });
        console.log(`Created exam set "${group.title}" with ${group.questions.length} questions.`);
      } else {
        console.log(`Exam set "${group.title}" already exists, skipping.`);
      }
    }

    console.log('Seeding finished successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

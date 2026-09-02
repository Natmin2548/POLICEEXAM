const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

const chaptersData = [
  {
    chapterNum: 1,
    title: 'บทที่ 1 ความรู้พื้นฐานและประวัติคอมพิวเตอร์',
    knowledgeContent: `บทที่ 1 — ความรู้พื้นฐานและประวัติคอมพิวเตอร์
จุดเริ่มต้น: วิชาคอมพิวเตอร์ = การแก้ปัญหาทางคณิตศาสตร์, ต้นกำเนิด: ลูกคิด (Abacus)

บุคคลสำคัญในประวัติศาสตร์คอมพิวเตอร์:
- John Napier: สร้าง Napier's Bones
- William Oughtred: สร้าง Slide Rule
- Blaise Pascal: สร้างเครื่อง Pascaline เครื่องคำนวณผลต่างแบบฟันเฟือง
- Gottfried Leibniz: ค้นพบเลขฐานสอง (Binary number)
- Charles Babbage: คิดค้น Difference Engine ได้รับยกย่องเป็น "บิดาแห่งคอมพิวเตอร์"
- George Boole: คิดค้นระบบตรรกะเปิด-ปิด (Boolean logic)
- John Vincent Atanasoff: สร้างคอมพิวเตอร์ดิจิทัลเครื่องแรก ชื่อ ABC
- Howard Aiken: สร้าง Mark 1 ร่วมกับ IBM ใช้บัตรเจาะรูเป็นสื่อกลาง
- คอมพิวเตอร์ดิจิทัลเครื่องแรกของโลก คือ ENIAC

ยุคของคอมพิวเตอร์:
- ยุคที่ 1: หลอดสุญญากาศและรีเลย์ (Vacuum Tube)
- ยุคที่ 2: ทรานซิสเตอร์ (Transistor)
- ยุคที่ 3: วงจรรวม (Integrated Circuit: IC)
- ยุคที่ 4: ไมโครโปรเซสเซอร์ / CPU (VLSI)
- ยุคที่ 5: ปัญญาประดิษฐ์ (AI: Artificial Intelligence)

ประเภทของคอมพิวเตอร์:
1. แบ่งตามลักษณะข้อมูล:
   - Analog: ประมวลผลข้อมูลแบบต่อเนื่อง ละเอียด
   - Digital: มีประสิทธิภาพ แม่นยำ
   - Hybrid: สลับได้ทั้งสองแบบ
2. แบ่งตามลักษณะการใช้งาน:
   - ทั่วไป (General purpose computer)
   - เฉพาะด้าน (Special purpose computer)
3. แบ่งตามขนาด:
   - Quantum Computer: คำนวณระดับสูงสุด
   - Supercomputer: คำนวณขั้นสูง เช่น พยากรณ์อากาศ, AI
   - Mainframe: ใช้กับธนาคารและหอบังคับการบิน
   - Mini Computer: เซิร์ฟเวอร์ของมหาวิทยาลัย/หน่วยงาน
   - Micro Computer: คอมพิวเตอร์ส่วนตัว, สมาร์ทโฟน
   - Wearable Computer: แบบสวมใส่ได้
   - Embedded Computer: แบบฝังตัว (IoT)

คำศัพท์ประยุกต์คอมพิวเตอร์:
- E-filing: ยื่นภาษีออนไลน์
- ERP: บริหารทรัพยากรองค์กร (Enterprise Resource Planning)
- CAI: คอมพิวเตอร์ช่วยการสอน (Computer-Assisted Instruction)
- MOOC: หลักสูตรออนไลน์สำหรับมหาชน (Massive Open Online Course)
- Blockchain: สัญญาไร้คนกลาง / บัญชีธุรกรรมแบบกระจายศูนย์
- GPS/ESRI: การนำทางด้วยดาวเทียม
- GIS: ระบบสารสนเทศภูมิศาสตร์ (Geographic Information System)`,
    questions: [
      {
        questionText: 'บุคคลใดได้รับการยกย่องให้เป็น "บิดาแห่งคอมพิวเตอร์" จากผลงานการคิดค้น Difference Engine และ Analytical Engine?',
        choice1: 'Charles Babbage',
        choice2: 'John Napier',
        choice3: 'Blaise Pascal',
        choice4: 'George Boole',
        correctAnswer: 1,
        explanation: 'Charles Babbage ได้รับการยกย่องเป็นบิดาแห่งคอมพิวเตอร์จากการออกแบบ Difference Engine และ Analytical Engine'
      },
      {
        questionText: 'คอมพิวเตอร์ยุคที่ 1 (First Generation) ใช้อุปกรณ์เทคโนโลยีหลักชนิดใดในการประมวลผล?',
        choice1: 'ทรานซิสเตอร์ (Transistor)',
        choice2: 'หลอดสุญญากาศ (Vacuum Tube)',
        choice3: 'วงจรรวม (Integrated Circuit: IC)',
        choice4: 'ไมโครโปรเซสเซอร์ (VLSI)',
        correctAnswer: 2,
        explanation: 'คอมพิวเตอร์ยุคที่ 1 ใช้หลอดสุญญากาศ (Vacuum Tube) และรีเลย์เป็นอุปกรณ์หลัก'
      },
      {
        questionText: 'คอมพิวเตอร์ประเภทใดที่นิยมนำมาใช้งานในองค์กรขนาดใหญ่ เช่น ระบบธนาคารและหอบังคับการบิน?',
        choice1: 'Micro Computer',
        choice2: 'Mainframe Computer',
        choice3: 'Mini Computer',
        choice4: 'Wearable Computer',
        correctAnswer: 2,
        explanation: 'Mainframe Computer ออกแบบมาเพื่อรองรับการประมวลผลธุรกรรมจำนวนมหาศาลและความปลอดภัยสูง เช่น ธนาคารและสายการบิน'
      },
      {
        questionText: 'คอมพิวเตอร์ดิจิทัลเครื่องแรกของโลกที่สร้างขึ้นเพื่อใช้งานทั่วไปคือเครื่องใด?',
        choice1: 'ENIAC',
        choice2: 'ABC',
        choice3: 'Mark 1',
        choice4: 'Pascaline',
        correctAnswer: 1,
        explanation: 'ENIAC (Electronic Numerical Integrator and Computer) คือคอมพิวเตอร์ดิจิทัลอิเล็กทรอนิกส์เครื่องแรกของโลก'
      },
      {
        questionText: 'ระบบสารสนเทศภูมิศาสตร์ที่นำข้อมูลแผนที่และพิกัดมาวิเคราะห์เชิงพื้นที่ มีชื่อย่อภาษาอังกฤษว่าอย่างไร?',
        choice1: 'ERP',
        choice2: 'CAI',
        choice3: 'GIS',
        choice4: 'MOOC',
        correctAnswer: 3,
        explanation: 'GIS ย่อมาจาก Geographic Information System คือระบบสารสนเทศภูมิศาสตร์'
      }
    ]
  },
  {
    chapterNum: 2,
    title: 'บทที่ 2 ข้อมูลและสารสนเทศ',
    knowledgeContent: `บทที่ 2 — ข้อมูลและสารสนเทศ
ระบบสารสนเทศ ประกอบด้วย Data และ Information
แนวคิด DIKW Pyramid:
1. Data (ข้อมูลดิบ): ข้อมูลที่มาจากการบันทึก ยังไม่ได้ประมวลผล
2. Information (สารสนเทศ): ข้อมูลที่ผ่านการประมวลผลแล้ว
3. Knowledge (ความรู้): รับรู้ เข้าใจ และนำไปใช้ประโยชน์
4. Intelligence (สติปัญญา): ความฉลาดในการคิดวิเคราะห์
5. Wisdom (ภูมิปัญญา): องค์ความรู้ขั้นสูงสุด ประยุกต์ใช้เพื่อแก้ไขปัญหาได้อย่างยั่งยืน

ประเภทของ Data:
- แบ่งตามแหล่งที่มา:
  * Primary data: ข้อมูลปฐมภูมิ ได้จากการเก็บรวบรวมเองโดยตรง
  * Secondary data: ข้อมูลทุติยภูมิ นำข้อมูลที่ผู้อื่นบันทึกไว้มาใช้งาน
- แบ่งตามการแทนชุดข้อมูล:
  * Numeric data: ตัวเลข นำไปคำนวณได้
  * Character data: ตัวอักษร/อักขระ ไม่สามารถนำไปคำนวณได้
  * Alphanumeric data: ข้อมูลผสม (ตัวเลข + ตัวอักษร)
  * Multimedia data: สื่อผสม ทั้งภาพ เสียง วิดีโอ ข้อความ

วิธีการประมวลผลข้อมูล (Data Processing):
- Calculation (คำนวณ)
- Sorting (เรียงลำดับ)
- Classifying (จัดกลุ่ม)
- Retrieving (ดึงข้อมูล)
- Merging (รวบรวมข้อมูล)
- Summarizing (สรุปผล)
- Report (รายงานผล)
- Record (บันทึก)
- Update (ปรับปรุงข้อมูล)

ประเภทของระบบสารสนเทศ:
- TPS (Transaction Processing System): ระบบประมวลผลรายการประจำวัน
- OAS (Office Automation System): ระบบสำนักงานอัตโนมัติ
- ES (Expert System): ระบบผู้เชี่ยวชาญ
- MIS (Management Information System): ระบบสารสนเทศเพื่อการจัดการสำหรับผู้บริหาร
- DSS (Decision Support System): ระบบสนับสนุนการตัดสินใจ
- GDSS (Group Decision Support System): ระบบสนับสนุนการตัดสินใจแบบกลุ่ม
- EIS (Executive Information System): ระบบสารสนเทศสำหรับผู้บริหารระดับสูง
- KMS (Knowledge Management System): ระบบจัดการความรู้ในองค์กร`,
    questions: [
      {
        questionText: 'ตามลำดับขั้นของพีระมิด DIKW ข้อใดเรียงลำดับจากระดับพื้นฐานที่สุดไปยังระดับสูงสุดได้อย่างถูกต้อง?',
        choice1: 'Data → Information → Knowledge → Wisdom',
        choice2: 'Information → Data → Knowledge → Wisdom',
        choice3: 'Data → Knowledge → Information → Wisdom',
        choice4: 'Knowledge → Data → Information → Wisdom',
        correctAnswer: 1,
        explanation: 'DIKW Pyramid เรียงลำดับจาก Data (ข้อมูล) → Information (สารสนเทศ) → Knowledge (ความรู้) → Intelligence/Wisdom (ภูมิปัญญา)'
      },
      {
        questionText: 'ข้อมูลที่ผู้ใช้งานได้จากการสำรวจ การสังเกต หรือการแจกแบบสอบถามด้วยตนเองโดยตรง จัดเป็นข้อมูลประเภทใด?',
        choice1: 'Secondary data (ข้อมูลทุติยภูมิ)',
        choice2: 'Primary data (ข้อมูลปฐมภูมิ)',
        choice3: 'Alphanumeric data',
        choice4: 'System data',
        correctAnswer: 2,
        explanation: 'Primary data (ข้อมูลปฐมภูมิ) คือข้อมูลที่ผู้ใช้เก็บรวบรวมมาจากแหล่งกำเนิดโดยตรง'
      },
      {
        questionText: 'ระบบสารสนเทศที่ทำหน้าที่บันทึกและประมวลผลข้อมูลธุรกรรมที่เกิดขึ้นประจำวัน เช่น การขายหน้าร้าน หรือการโอนเงิน คือระบบใด?',
        choice1: 'MIS (Management Information System)',
        choice2: 'DSS (Decision Support System)',
        choice3: 'TPS (Transaction Processing System)',
        choice4: 'EIS (Executive Information System)',
        correctAnswer: 3,
        explanation: 'TPS (Transaction Processing System) คือระบบประมวลผลรายการธุรกรรมประจำวันขององค์กร'
      },
      {
        questionText: 'ข้อใดคือตัวอย่างของข้อมูลประเภท Alphanumeric data?',
        choice1: 'ตัวเลขจำนวนเงิน 50,000 บาท',
        choice2: 'ป้ายทะเบียนรถ "กข 1234 กรุงเทพฯ"',
        choice3: 'ไฟล์เพลง MP3 ความยาว 3 นาที',
        choice4: 'รูปถ่ายบัตรประชาชนขนาด 2 นิ้ว',
        correctAnswer: 2,
        explanation: 'Alphanumeric data คือข้อมูลที่ประกอบด้วยทั้งตัวอักษรและตัวเลขผสมกัน เช่น ป้ายทะเบียนรถ หรือรหัสบัตรประชาชน'
      }
    ]
  },
  {
    chapterNum: 3,
    title: 'บทที่ 3 IPOS และหน่วยประมวลผล',
    knowledgeContent: `บทที่ 3 — IPOS และหน่วยประมวลผล
แนวคิด IPOS Cycle:
- I (Input): รับข้อมูลเข้า
- P (Processing): ประมวลผลข้อมูล
- O (Output): แสดงผลลัพธ์
- S (Storage): จัดเก็บข้อมูล

องค์ประกอบของระบบคอมพิวเตอร์ (5 องค์ประกอบ):
1. Hardware: อุปกรณ์ที่จับต้องได้
2. Software: ชุดคำสั่งหรือโปรแกรม
3. Personnel: บุคลากรทางคอมพิวเตอร์
4. Data / Information: ข้อมูลและสารสนเทศ
5. Procedure: ระเบียบปฏิบัติและขั้นตอนการทำงาน

หน่วยประมวลผลกลาง (CPU):
- CU (Control Unit): ควบคุมการทำงานของหน่วยต่างๆ และจังหวะสัญญาณนาฬิกา
- ALU (Arithmetic Logic Unit): คำนวณทางคณิตศาสตร์ (+, -, *, /) และเปรียบเทียบตรรกะ
- Register: หน่วยความจำความเร็วสูงที่สุดในตัว CPU ทำหน้าที่พักข้อมูลชั่วคราว
วงจรการทำงานของ CPU (Machine Cycle):
Fetch (ดึงคำสั่ง) → Decode (ถอดรหัส/ตีความคำสั่งโดย CU) → Execute (ประมวลผลคำสั่งโดย ALU) → Store (บันทึกผลลัพธ์ลง Memory)

GPU (Graphics Processing Unit): คำนวณและประมวลผลการแสดงผลภาพ กราฟิก และ 3D

หน่วยเก็บข้อมูล (Memory):
1. หน่วยความจำหลัก (Main / Primary Memory):
   - RAM (Random Access Memory): ลบเลือนได้เมื่อไฟดับ (Volatile)
     * SRAM: ไม่ต้อง Refresh เร็วกว่า นิยมทำ Cache
     * DRAM: ต้อง Refresh ตลอดเวลา ช้ากว่า นิยมทำ RAM หลัก
   - ROM (Read Only Memory): เก็บข้อมูลถาวร ไม่ดับตามไฟ (Non-volatile) เก็บ BIOS
     * PROM: บันทึกข้อมูลได้ครั้งเดียว ลบไม่ได้
     * EPROM: ลบข้อมูลได้ด้วยแสง UV
     * EEPROM: ลบและแก้ไขข้อมูลได้ด้วยไฟฟ้า
   - CMOS: ชิปสารกึ่งตัวนำเก็บค่าคอนฟิกและเวลาเครื่อง ใช้ไฟจากแบตเตอรี่กระดุม
2. หน่วยความจำสำรอง (Secondary Storage):
   - HDD (Hard Disk Drive): ใช้จานแม่เหล็ก ไม่ดับตามไฟ
   - SSD (Solid State Drive): ใช้ชิป Flash Memory เร็วกว่า HDD
   - CD-R (เขียนได้ครั้งเดียว), CD-RW (เขียนซ้ำได้), DVD

เครื่องพิมพ์ (Printer):
- แบบกระทบ/กระแทก (Impact Printer): Dot Matrix (หัวเข็ม ทำสำเนาได้หลายชั้น เช่น สลิปเงินเดือน), Daisy Wheel, Line Printer
- แบบไม่กระทบ (Non-Impact Printer): Inkjet (พ่นหมึก), Laser (แสงเลเซอร์ แม่นยำ รวดเร็ว), Thermal (กระดาษความร้อน เช่น ใบเสร็จ POS), Plotter (พิมพ์ลายเส้นวิศวกรรม/สถาปัตย์), Multifunction (All-in-One)`,
    questions: [
      {
        questionText: 'ส่วนประกอบใดของ CPU ที่ทำหน้าที่คำนวณทางคณิตศาสตร์และเปรียบเทียบตรรกะทางคอมพิวเตอร์?',
        choice1: 'Control Unit (CU)',
        choice2: 'Arithmetic Logic Unit (ALU)',
        choice3: 'Register',
        choice4: 'Cache Memory',
        correctAnswer: 2,
        explanation: 'ALU (Arithmetic Logic Unit) ทำหน้าที่คำนวณคณิตศาสตร์และเปรียบเทียบตรรกะจริง/เท็จ'
      },
      {
        questionText: 'หน่วยความจำชนิดใดที่ข้อมูลจะสูญหายทันทีเมื่อไม่มีกระแสไฟฟ้าหล่อเลี้ยง (Volatile Memory)?',
        choice1: 'ROM',
        choice2: 'RAM',
        choice3: 'Hard Disk',
        choice4: 'Flash Drive',
        correctAnswer: 2,
        explanation: 'RAM เป็นหน่วยความจำชั่วคราว (Volatile) ที่ข้อมูลจะหายไปเมื่อปิดเครื่องหรือไฟฟ้าดับ'
      },
      {
        questionText: 'เครื่องพิมพ์ชนิดใดที่เหมาะสำหรับการพิมพ์ใบเสร็จหรือสลิปเงินเดือนแบบมีกระดาษคาร์บอนทำสำเนาหลายชั้น?',
        choice1: 'Laser Printer',
        choice2: 'Inkjet Printer',
        choice3: 'Dot Matrix Printer (เครื่องพิมพ์หัวเข็ม)',
        choice4: 'Thermal Printer',
        correctAnswer: 3,
        explanation: 'Dot Matrix Printer ใช้หัวเข็มกระแทกผ่านผ้าหมึก จึงสามารถพิมพ์ทะลุสำเนาคาร์บอนหลายชั้นได้'
      }
    ]
  },
  {
    chapterNum: 4,
    title: 'บทที่ 4 ซอฟต์แวร์',
    knowledgeContent: `บทที่ 4 — ซอฟต์แวร์ (Software)
ความแตกต่าง:
- Hardware: อุปกรณ์ฮาร์ดแวร์ที่จับต้องได้
- Software: โปรแกรม ชุดคำสั่ง หรือข้อมูลที่จับต้องไม่ได้

1. ซอฟต์แวร์ระบบ (System Software):
- ระบบปฏิบัติการ (Operating System: OS): ควบคุมและประสานงานระหว่างฮาร์ดแวร์กับผู้ใช้ เช่น Windows, macOS, Linux, Unix, Android, iOS
- Utility Program (โปรแกรมอรรถประโยชน์): โปรแกรมเสริมช่วยดูแลเครื่อง เช่น Disk Defragmenter, Antivirus, Backup
- ตัวแปลภาษา (Language Translator):
  * Compiler: แปลซอร์สโค้ดทั้งโปรแกรมในคราวเดียว หากมีข้อผิดพลาดจะแสดงรายการทั้งหมด (เช่น C, C++, C#, Java)
  * Interpreter: แปลทีละบรรทัดและทำงานทันที (เช่น Python, PHP, JavaScript)
  * Assembler: แปลภาษาแอสเซมบลีเป็นภาษาเครื่อง
- Driver: โปรแกรมควบคุมอุปกรณ์ฮาร์ดแวร์เฉพาะ เช่น Printer Driver, Sound Driver

2. ซอฟต์แวร์ประยุกต์ (Application Software):
- โปรแกรมเฉพาะด้าน (Special Purpose Software): สร้างขึ้นเพื่องานเฉพาะ เช่น ระบบ ATM, ระบบคิดเงิน POS
- โปรแกรมทั่วไป (General Purpose Software):
  * ฐานข้อมูล (Database): Microsoft Access, MySQL, Oracle, PostgreSQL, SQL Server
  * ประมวลผลคำ (Word Processing): Microsoft Word, Google Docs
  * ตารางคำนวณ (Spreadsheet): Microsoft Excel, Google Sheets
  * นำเสนอ (Presentation): Microsoft PowerPoint, Canva, Keynote
  * กราฟิก/ตกแต่งภาพ: Adobe Photoshop, Illustrator

3. ประเภทซอฟต์แวร์ตามลิขสิทธิ์การใช้งาน:
- Commercial Software: ซอฟต์แวร์เชิงพาณิชย์ ต้องซื้อลิขสิทธิ์
- Shareware: ให้ทดลองใช้งานฟรีแบบจำกัดเวลาหรือคุณสมบัติก่อนตัดสินใจซื้อ
- Freeware: ใช้งานได้ฟรีตลอดไป แต่ห้ามดัดแปลงแก้ไขโค้ด
- Open Source Software: แจกฟรีและเปิดเผย Source Code ให้ผู้อื่นศึกษาและพัฒนาต่อยอดได้ (เช่น Linux, Android, VLC)
- Adware: ให้ใช้ฟรีโดยมีโฆษณาแทรกในโปรแกรม`,
    questions: [
      {
        questionText: 'ตัวแปลภาษาประเภทใดที่ทำหน้าที่อ่านและแปลชุดคำสั่งทีละบรรทัดพร้อมทำงานทันที หากพบข้อผิดพลาดจะหยุดทำงานที่บรรทัดนั้น?',
        choice1: 'Compiler',
        choice2: 'Interpreter',
        choice3: 'Assembler',
        choice4: 'Linker',
        correctAnswer: 2,
        explanation: 'Interpreter แปลและประมวลผลคำสั่งทีละบรรทัด เช่น ภาษา Python หรือ PHP'
      },
      {
        questionText: 'ซอฟต์แวร์ที่อนุญาตให้ผู้ใช้งานนำไปใช้ได้ฟรี และเปิดเผยรหัสต้นฉบับ (Source Code) เพื่อให้นำไปแก้ไขปรับปรุงต่อได้ จัดเป็นซอฟต์แวร์ประเภทใด?',
        choice1: 'Shareware',
        choice2: 'Freeware',
        choice3: 'Open Source Software',
        choice4: 'Commercial Software',
        correctAnswer: 3,
        explanation: 'Open Source Software เป็นซอฟต์แวร์ที่เปิดเผยซอร์สโค้ดให้ทุกคนสามารถนำไปพัฒนาต่อยอดได้อย่างอิสระ'
      }
    ]
  },
  {
    chapterNum: 5,
    title: 'บทที่ 5 ชนิดข้อมูลและรหัสแทนข้อมูล',
    knowledgeContent: `บทที่ 5 — ชนิดข้อมูลและรหัสแทนข้อมูล
ระบบดิจิทัลทำงานด้วยสถานะ 0 (ปิด/Off) และ 1 (เปิด/On)

นามสกุลไฟล์ที่สำคัญ:
- เอกสารและตาราง: .doc/.docx (Word), .xls/.xlsx (Excel), .csv (ตารางขนาดเล็ก), .pdf (เอกสารคงรูปคุณภาพสูง), .ppt/.pptx (PowerPoint)
- ภาพนิ่ง (Image):
  * .jpg/.jpeg: บีบอัดสูง ขนาดเล็ก รองรับ 16 ล้านสี (เหมาะกับภาพถ่าย)
  * .png: รองรับพื้นหลังโปร่งใส (Transparent)
  * .gif: รองรับภาพเคลื่อนไหว (Animation) และสีได้สูงสุด 256 สี
  * .psd: ไฟล์งานของ Photoshop
  * .raw: ไฟล์ภาพดิบจากเซนเซอร์กล้อง ไม่ผ่านการบีบอัด
- วิดีโอ (Video): .mp4, .avi, .mov (QuickTime), .flv
- เสียง (Audio): .mp3, .wav (ไฟล์เสียงไม่บีบอัดของ Windows), .wma

หน่วยวัดความจุข้อมูล (Data Capacity):
8 Bit = 1 Byte
1,024 Byte = 1 KB (Kilobyte)
1,024 KB = 1 MB (Megabyte)
1,024 MB = 1 GB (Gigabyte)
1,024 GB = 1 TB (Terabyte)
1,024 TB = 1 PB (Petabyte)
1,024 PB = 1 EB (Exabyte)

ลำดับโครงสร้างข้อมูล (จากเล็กไปใหญ่):
Bit (0 หรือ 1) → Byte (1 ตัวอักษร) → Field (เขตข้อมูล) → Record (ระเบียน/เรคอร์ด) → File (แฟ้มข้อมูล) → Database (ฐานข้อมูล)

รหัสแทนข้อมูล (Character Code):
- BCD: 4 Bit
- ASCII: 8 Bit (256 ตัวอักษร) นิยมใช้ในคอมพิวเตอร์ยุคแรก
- EBCDIC: 8 Bit พัฒนาโดย IBM สำหรับเครื่องเมนเฟรม
- Unicode: รองรับภาษาทั่วโลก มาตรฐานสากล เช่น UTF-8, UTF-16

บุคลากรทางคอมพิวเตอร์:
- System Analyst (SA): วิเคราะห์และออกแบบระบบงาน
- Programmer: เขียนโปรแกรมตามที่ SA ออกแบบ
- DB Admin (DBA): ผู้ดูแลและจัดการฐานข้อมูล
- Network Admin: ผู้ดูแลระบบเครือข่าย
- User: ผู้ใช้งานระบบ`,
    questions: [
      {
        questionText: 'ข้อใดเรียงลำดับโครงสร้างของข้อมูลจากหน่วยย่อยที่สุดไปยังหน่วยที่ใหญ่ที่สุดได้อย่างถูกต้อง?',
        choice1: 'Bit → Byte → Field → Record → File → Database',
        choice2: 'Byte → Bit → Record → Field → File → Database',
        choice3: 'Bit → Byte → Record → Field → Database → File',
        choice4: 'Field → Record → Byte → Bit → File → Database',
        correctAnswer: 1,
        explanation: 'โครงสร้างข้อมูลเรียงจาก Bit → Byte → Field → Record → File → Database'
      },
      {
        questionText: 'ไฟล์ภาพประเภทใดที่มีคุณสมบัติเด่นคือสามารถแสดง "พื้นหลังโปร่งใส" (Transparent Background) ได้?',
        choice1: '.jpg',
        choice2: '.bmp',
        choice3: '.png',
        choice4: '.raw',
        correctAnswer: 3,
        explanation: '.png (Portable Network Graphics) รองรับการแสดงผลพื้นหลังโปร่งใส'
      }
    ]
  },
  {
    chapterNum: 6,
    title: 'บทที่ 6 Procedure และผังงาน (Flowchart)',
    knowledgeContent: `บทที่ 6 — Procedure และผังงาน (Flowchart)
Procedure: ขั้นตอนการปฏิบัติงานเพื่อให้ได้ผลลัพธ์ตามเป้าหมาย

ผังงาน (Flowchart):
การใช้รูปภาพหรือสัญลักษณ์เรขาคณิตอธิบายลำดับขั้นตอนการทำงาน
- ผังงานระบบ (System Flowchart): แสดงภาพรวมของระบบ
- ผังงานโปรแกรม (Program Flowchart): แสดงรายละเอียดขั้นตอนของโปรแกรม

หลักการเขียนผังงานที่ดี:
- ใช้สัญลักษณ์ตามมาตรฐาน ANSI/ISO
- ทิศทางการทำงานจาก บนลงล่าง (Top to Bottom) และ ซ้ายไปขวา (Left to Right)
- มีจุดเริ่มต้นและจุดสิ้นสุดอย่างละ 1 จุด
- เส้นลูกศรต้องมีหัวลูกศรระบุทิศทางชัดเจน

โครงสร้างการทำงานของผังงาน 3 รูปแบบ:
1. แบบเรียงลำดับ (Sequence): ทำงานทีละขั้นตอนจากบนลงล่าง
2. แบบมีเงื่อนไข/เลือกทำ (Selection / Decision): มีการตัดสินใจเลือกทางเลือก เช่น IF-THEN-ELSE
3. แบบทำซ้ำ (Repetition / Loop): ทำงานซ้ำๆ จนกว่าเงื่อนไขจะเป็นเท็จ เช่น FOR, WHILE

สัญลักษณ์ผังงานที่พบบ่อย:
- Terminator (วงรี/แคปซูล): จุดเริ่มต้น (Start) หรือ จุดสิ้นสุด (End/Stop)
- Process (สี่เหลี่ยมผืนผ้า): การประมวลผล คำนวณ หรือกำหนดค่า
- Decision (สี่เหลี่ยมข้าวหลามตัด): การตัดสินใจ หรือตรวจสอบเงื่อนไข (มีทางออกอย่างน้อย 2 ทาง: ใช่/ไม่ใช่)
- Input / Output (สี่เหลี่ยมด้านขนาน): การรับข้อมูลเข้าหรือแสดงผลโดยไม่ระบุอุปกรณ์
- Manual Input (สี่เหลี่ยมคางหมูด้านตัด): รับข้อมูลทางแป้นพิมพ์
- Display (รูปทรงคล้ายดินสอปลายแหลม): แสดงผลทางหน้าจอภาพ
- Document (สี่เหลี่ยมขอบล่างเป็นคลื่น): แสดงผลออกทางเครื่องพิมพ์ (เอกสาร)
- Connector (วงกลมเล็ก): จุดเชื่อมต่อภายในหน้าเดียวกัน
- Off-page Connector (รูปห้าเหลี่ยมคว่ำ): จุดเชื่อมต่อไปยังหน้าอื่น`,
    questions: [
      {
        questionText: 'สัญลักษณ์รูป "สี่เหลี่ยมข้าวหลามตัด" (Diamond) ในผังงาน (Flowchart) มีความหมายถึงการทำงานข้อใด?',
        choice1: 'จุดเริ่มต้นและจุดสิ้นสุด (Terminator)',
        choice2: 'การประมวลผลหรือคำนวณ (Process)',
        choice3: 'การตัดสินใจหรือตรวจสอบเงื่อนไข (Decision)',
        choice4: 'การรับข้อมูลเข้าทางคีย์บอร์ด (Manual Input)',
        correctAnswer: 3,
        explanation: 'สี่เหลี่ยมข้าวหลามตัด ใช้แทนการตัดสินใจหรือตรวจสอบเงื่อนไข (Decision)'
      },
      {
        questionText: 'สัญลักษณ์ผังงานใดที่ใช้แทนจุดเริ่มต้น (Start) หรือจุดสิ้นสุด (End) ของโปรแกรม?',
        choice1: 'วงรี / แคปซูล (Terminator)',
        choice2: 'สี่เหลี่ยมผืนผ้า (Process)',
        choice3: 'สี่เหลี่ยมด้านขนาน (Input/Output)',
        choice4: 'วงกลม (Connector)',
        correctAnswer: 1,
        explanation: 'สัญลักษณ์วงรีหรือแคปซูล (Terminator) ใช้แทนจุดเริ่มต้นและจุดสิ้นสุด'
      }
    ]
  },
  {
    chapterNum: 7,
    title: 'บทที่ 7 ระบบเครือข่ายคอมพิวเตอร์',
    knowledgeContent: `บทที่ 7 — ระบบเครือข่ายคอมพิวเตอร์ (Computer Network)
องค์ประกอบการสื่อสารข้อมูล (5 องค์ประกอบ):
1. ผู้ส่ง (Sender / Source)
2. ผู้รับ (Receiver / Destination)
3. ข้อมูลข่าวสาร (Data / Message)
4. สื่อกลาง/ช่องทางสื่อสาร (Medium / Channel)
5. โพรโทคอล (Protocol): กฎระเบียบและข้อตกลงในการสื่อสาร

โพรโทคอลที่สำคัญ (Protocols):
- HTTP / HTTPS: รับส่งข้อมูลหน้าเว็บ (HTTPS มีการเข้ารหัสปลอดภัย)
- TCP/IP: โพรโทคอลหลักของเครือข่ายอินเทอร์เน็ต
- SMTP: ส่งอีเมล
- POP3 / IMAP: รับอีเมล
- FTP / SFTP: ถ่ายโอนไฟล์ (SFTP ปลอดภัยกว่า)
- VoIP: สื่อสารเสียงผ่านอินเทอร์เน็ต
- Telnet / SSH: ควบคุมเครื่องระยะไกล (SSH เข้ารหัสปลอดภัย)
- SNMP: บริหารจัดการอุปกรณ์เครือข่าย
- ICMP: ตรวจสอบและวินิจฉัยปัญหาเครือข่าย (เช่น คำสั่ง ping)

สื่อกลางส่งข้อมูล (Transmission Media):
1. สื่อกลางแบบมีสาย (Wired Media):
   - สายคู่บิดเกลียว (Twisted Pair): UTP (ไม่หุ้มฉนวน นิยมใช้มากสุด หัวต่อ RJ-45), STP (มีฟอยล์หุ้มฉนวนกันสัญญาณรบกวน) ระยะไม่เกิน 100 เมตร
   - สายโคแอกเชียล (Coaxial): ทนทาน นิยมใช้กับเคเบิลทีวีและกล้อง CCTV
   - สายใยแก้วนำแสง (Fiber Optic): ส่งข้อมูลด้วยแสง ความเร็วและแบนด์วิดท์สูงสุด ไม่ถูกรบกวนด้วยคลื่นแม่เหล็กไฟฟ้า
2. สื่อกลางแบบไร้สาย (Wireless Media):
   - คลื่นวิทยุ (Radio wave): Wi-Fi (มาตรฐาน IEEE 802.11), Bluetooth (ระยะใกล้ 10 ม.)
   - คลื่นไมโครเวฟ (Microwave): ส่งข้อมูลแนวเส้นสายตา (Line of Sight)
   - ดาวเทียม (Satellite)
   - อินฟราเรด (Infrared): รีโมตคอนโทรล
   - RFID / NFC: สื่อสารระยะใกล้แบบแตะสัมผัส

อุปกรณ์เครือข่าย (Network Devices):
- NIC (Network Interface Card): การ์ดแลน
- Hub: กระจายสัญญาณแบบ Broadcast ไปทุกพอร์ต
- Switch: กระจายสัญญาณแบบเลือกปลายทางตาม MAC Address
- Router: ค้นหาเส้นทางและส่งต่อข้อมูลข้ามเครือข่ายตาม IP Address
- Gateway: แปลงและเชื่อมต่อเครือข่ายที่ใช้โพรโทคอลต่างกัน
- Repeater: ทวนและขยายสัญญาณ
- Modem: แปลงสัญญาณ Analog <-> Digital
- Access Point (AP): กระจายสัญญาณ Wi-Fi

ประเภทเครือข่ายตามระยะทาง:
- PAN (Personal Area Network): เครือข่ายส่วนบุคคล (5-10 ม. เช่น Bluetooth)
- LAN (Local Area Network): เครือข่ายท้องถิ่นในอาคาร/สำนักงาน
- CAN (Campus Area Network): เครือข่ายระดับมหาวิทยาลัย
- MAN (Metropolitan Area Network): เครือข่ายระดับเมือง
- WAN (Wide Area Network): เครือข่ายระดับประเทศ/ทั่วโลก (อินเทอร์เน็ต)

โทโพโลยี (Topology):
- Star: มี Switch/Hub ศูนย์กลาง นิยมใช้มากที่สุด
- Bus: ใช้สายแกนหลักเส้นเดียว (Backbone) ข้อมูลอาจชนกัน
- Ring: เชื่อมต่อเป็นวงแหวน
- Mesh: ทุกจุดเชื่อมต่อถึงกันหมด เสถียรที่สุด แต่ราคาสูงที่สุด`,
    questions: [
      {
        questionText: 'อุปกรณ์เครือข่ายชนิดใดทำหน้าที่เลือกและกำหนดเส้นทางที่เหมาะสมที่สุดในการส่งผ่านข้อมูลระหว่างเครือข่ายโดยอ้างอิงจาก IP Address?',
        choice1: 'Hub',
        choice2: 'Switch',
        choice3: 'Router',
        choice4: 'Repeater',
        correctAnswer: 3,
        explanation: 'Router ทำหน้าที่ค้นหาเส้นทางและส่งต่อแพ็กเก็ตข้อมูลระหว่างเครือข่ายตาม IP Address'
      },
      {
        questionText: 'สื่อกลางในการส่งข้อมูลชนิดใดที่ใช้แสงในการส่งสัญญาณ มีความเร็วสูงสุด และไม่ได้รับผลกระทบจากสัญญาณรบกวนทางแม่เหล็กไฟฟ้า?',
        choice1: 'สาย UTP (Unshielded Twisted Pair)',
        choice2: 'สาย Coaxial',
        choice3: 'สายใยแก้วนำแสง (Fiber Optic)',
        choice4: 'สาย STP (Shielded Twisted Pair)',
        correctAnswer: 3,
        explanation: 'Fiber Optic (สายใยแก้วนำแสง) ส่งข้อมูลด้วยลำแสงจึงมีความเร็วสูงสุดและไม่มีสัญญาณรบกวนทางไฟฟ้า'
      },
      {
        questionText: 'รูปแบบการเชื่อมต่อเครือข่าย (Topology) ชนิดใดที่นิยมใช้งานมากที่สุดในปัจจุบัน โดยมีอุปกรณ์ศูนย์กลาง เช่น Switch หรือ Hub คอยควบคุม?',
        choice1: 'Bus Topology',
        choice2: 'Star Topology (แบบดาว)',
        choice3: 'Ring Topology',
        choice4: 'Mesh Topology',
        correctAnswer: 2,
        explanation: 'Star Topology (แบบดาว) นิยมใช้มากที่สุดเพราะดูแลรักษาง่าย หากสายของเครื่องใดขาดจะไม่กระทบเครื่องอื่น'
      }
    ]
  },
  {
    chapterNum: 8,
    title: 'บทที่ 8 Internet',
    knowledgeContent: `บทที่ 8 — Internet
ISP (Internet Service Provider): ผู้ให้บริการอินเทอร์เน็ต เช่น NT, True, AIS, 3BB

คำศัพท์เกี่ยวกับเว็บไซต์:
- Web Browser: โปรแกรมท่องเว็บ เช่น Chrome, Safari, Edge, Firefox
- Web Server: เครื่องแม่ข่ายที่ให้บริการจัดเก็บและแสดงผลหน้าเว็บ
- Web Page: หน้าเอกสารเว็บแต่ละหน้า
- Web Site: รวมหน้าเว็บเพจทั้งหมดไว้ภายใต้ชื่อโดเมนเดียวกัน
- Home Page: หน้าแรกของเว็บไซต์

IP Address (Internet Protocol Address):
- IPv4: ขนาด 32 บิต แบ่งเป็น 4 ชุดตัวเลข คั่นด้วยจุด (เช่น 192.168.1.1)
  * Class A: 1.0.0.1 - 127.255.255.254 (เครือข่ายขนาดใหญ่มาก)
  * Class B: 128.0.0.1 - 191.255.255.254 (เครือข่ายขนาดกลาง)
  * Class C: 192.0.0.1 - 223.255.255.254 (เครือข่ายขนาดเล็ก นิยมใช้ทั่วไป)
  * Class D: 224.0.0.0 - 239.255.255.255 (Multicast)
  * Class E: 240.0.0.0 - 255.255.255.254 (ทดลอง/สำรอง)
- IPv6: ขนาด 128 บิต เขียนด้วยเลขฐานสิบหก 8 กลุ่ม คั่นด้วยโคลอน (:)

โครงสร้างของ URL (Uniform Resource Locator):
ตัวอย่าง: https://www.royalthaipolice.go.th/index.html
- https:// = Protocol
- www = Sub-domain / Hostname
- royalthaipolice.go.th = Domain Name (แปลงเป็น IP ด้วย DNS Server)
- index.html = Page / File Path

โดเมนเนมระดับบนสุด (Top-Level Domain):
1. โดเมนทั่วไป (gTLD):
   - .com / .co = องค์กรพาณิชย์/ธุรกิจ
   - .net = บริการเครือข่าย
   - .org / .or = องค์กรไม่แสวงหากำไร
   - .edu / .ac = สถาบันการศึกษา
   - .gov / .go = หน่วยงานรัฐบาล
   - .mil / .mi = หน่วยงานทางทหาร
2. โดเมนประจำประเทศ (ccTLD):
   - .th (ไทย), .us (สหรัฐฯ), .uk (อังกฤษ), .jp (ญี่ปุ่น), .cn (จีน), .sg (สิงคโปร์)`,
    questions: [
      {
        questionText: 'หมายเลข IP Address มาตรฐาน IPv4 มีขนาดกี่บิต และแบ่งออกเป็นกี่ชุด?',
        choice1: '32 บิต แบ่งเป็น 4 ชุด',
        choice2: '64 บิต แบ่งเป็น 8 ชุด',
        choice3: '128 บิต แบ่งเป็น 8 ชุด',
        choice4: '16 บิต แบ่งเป็น 2 ชุด',
        correctAnswer: 1,
        explanation: 'IPv4 มีขนาด 32 บิต แบ่งเป็น 4 ชุด (ชุดละ 8 บิต) คั่นด้วยจุด เช่น 192.168.1.1'
      },
      {
        questionText: 'ชื่อโดเมนระดับบนสุด (Top-Level Domain) ที่ลงท้ายด้วย ".go.th" มีความหมายถึงองค์กรประเภทใดในประเทศไทย?',
        choice1: 'สถาบันการศึกษาในไทย',
        choice2: 'หน่วยงานของรัฐบาลไทย',
        choice3: 'องค์กรธุรกิจเอกชนในไทย',
        choice4: 'องค์กรไม่แสวงผลกำไรในไทย',
        correctAnswer: 2,
        explanation: '.go.th ย่อมาจาก Government Thailand ใช้สำหรับหน่วยงานราชการของประเทศไทย'
      }
    ]
  },
  {
    chapterNum: 9,
    title: 'บทที่ 9 E-commerce',
    knowledgeContent: `บทที่ 9 — E-commerce (พาณิชย์อิเล็กทรอนิกส์)
การทำธุรกรรม ซื้อขาย แลกเปลี่ยนสินค้าและบริการผ่านระบบอิเล็กทรอนิกส์

รูปแบบความสัมพันธ์ทางธุรกิจใน E-commerce:
- B2B (Business to Business): ธุรกิจกับธุรกิจ เช่น โรงงานขายส่งให้ร้านค้าส่ง
- B2C (Business to Consumer): ธุรกิจกับผู้บริโภค เช่น Shopee, Lazada, ร้านค้าออนไลน์ขายให้ลูกค้าทั่วไป
- C2C (Consumer to Consumer): ผู้บริโภคกับผู้บริโภค เช่น การขายของมือสองใน Facebook Marketplace, Kaidee
- B2G (Business to Government): ธุรกิจกับภาครัฐ เช่น การจัดซื้อจัดจ้างภาครัฐ (e-GP)
- G2C (Government to Citizen/Consumer): ภาครัฐกับประชาชน เช่น ระบบยื่นภาษีออนไลน์ (e-Revenue), ชำระค่าน้ำค่าไฟ
- G2G (Government to Government): ภาครัฐกับภาครัฐ เช่น การเชื่อมโยงข้อมูลระหว่างสำนักงานตำรวจแห่งชาติกับกรมการขนส่งทางบก

บริการรูปแบบ E-Service อื่นๆ:
- E-Payment: การชำระเงินอิเล็กทรอนิกส์ (PromptPay, บัตรเครดิต)
- E-Wallet: กระเป๋าเงินอิเล็กทรอนิกส์ (TrueMoney, ShopeePay)
- E-Tax / E-Tax Invoice: ใบกำกับภาษีอิเล็กทรอนิกส์
- E-Receipt: ใบเสร็จรับเงินอิเล็กทรอนิกส์
- E-Tracking: ระบบติดตามสถานะพัสดุ
- E-Document / E-Saraban: ระบบหนังสือและเอกสารอิเล็กทรอนิกส์`,
    questions: [
      {
        questionText: 'การที่ประชาชนทั่วไปนำสิ่งของเครื่องใช้มือสองของตนเองมาโพสต์ขายให้กับประชาชนคนอื่นบนแพลตฟอร์มออนไลน์ จัดเป็นรูปแบบ E-commerce ข้อใด?',
        choice1: 'B2C (Business to Consumer)',
        choice2: 'B2B (Business to Business)',
        choice3: 'C2C (Consumer to Consumer)',
        choice4: 'G2C (Government to Citizen)',
        correctAnswer: 3,
        explanation: 'C2C (Consumer to Consumer) คือการซื้อขายแลกเปลี่ยนระหว่างผู้บริโภคกับผู้บริโภคโดยตรง'
      },
      {
        questionText: 'ระบบจัดซื้อจัดจ้างภาครัฐด้วยอิเล็กทรอนิกส์ (e-GP) ที่เปิดให้บริษัทเอกชนเข้าประมูลงาน จัดเป็นความสัมพันธ์ประเภทใด?',
        choice1: 'B2G (Business to Government)',
        choice2: 'C2C (Consumer to Consumer)',
        choice3: 'G2C (Government to Citizen)',
        choice4: 'B2C (Business to Consumer)',
        correctAnswer: 1,
        explanation: 'B2G คือการทำธุรกรรมหรือประมูลงานระหว่างภาคธุรกิจกับภาครัฐ'
      }
    ]
  },
  {
    chapterNum: 10,
    title: 'บทที่ 10 ความปลอดภัยของคอมพิวเตอร์',
    knowledgeContent: `บทที่ 10 — ความปลอดภัยของคอมพิวเตอร์ (Computer Security)
มัลแวร์ (Malware - Malicious Software):
- Worm (หนอนอินเทอร์เน็ต): แพร่กระจายตัวเองข้ามเครือข่ายได้อย่างรวดเร็วโดยไม่ต้องอาศัยการเปิดไฟล์ ทำให้ระบบทำงานช้าและกินแบนด์วิดท์
- Trojan Horse (ม้าโทรจัน): แฝงตัวมาในรูปแบบโปรแกรมที่มีประโยชน์ หลอกล่อให้ผู้ใช้ติดตั้ง เพื่อเปิดช่องทางขโมยข้อมูลลับ
- Ransomware (มัลแวร์เรียกค่าไถ่): เข้ารหัสไฟล์ในเครื่องและเรียกเงินเพื่อแลกกับคีย์ถอดรหัส
- Spyware: แอบสอดแนมและบันทึกพฤติกรรมการใช้งาน เช่น รหัสผ่าน
- Adware: โปรแกรมโฆษณารบกวน
- Phishing: การหลอกลวงผ่านอีเมลหรือหน้าเว็บปลอมเพื่อลวงเอาข้อมูลส่วนตัว
- Pharming: การเปลี่ยนเส้นทาง DNS ไปยังหน้าเว็บปลอม
- DDoS (Distributed Denial of Service): การระดมยิงคำขอเข้าเครื่องเซิร์ฟเวอร์จนระบบล่มใช้งานไม่ได้
- Rootkit: แฝงตัวควบคุมเครื่องในระดับลึก ซ่อนตัวจาก Antivirus
- Deepfake: เทคโนโลยี AI ปลอมแปลงใบหน้าและเสียงให้เหมือนบุคคลจริง

ประเภทของผู้กระทำผิด/แฮกเกอร์:
- White Hat Hacker: แฮกเกอร์หมวกขาว ทดสอบเจาะระบบเพื่อหาช่องโหว่และป้องกัน
- Black Hat Hacker / Cracker: แฮกเกอร์หมวกดำ ผู้บุกรุกที่มีเจตนาร้าย ขโมยหรือทำลายข้อมูล
- Script Kiddies: มือใหม่ที่ใช้เครื่องมือสำเร็จรูปของผู้อื่นในการโจมตี

แนวทางความปลอดภัย:
- VPN (Virtual Private Network): อุโมงค์ส่งข้อมูลเข้ารหัสผ่านเครือข่ายสาธารณะ
- 2FA / MFA (Two-Factor Authentication): ยืนยันตัวตน 2 ขั้นตอน (เช่น Password + OTP)
- Firewall: กำแพงไฟตรวจจับและกรองข้อมูลเข้า-ออกเครือข่าย
- Encryption: การแปลงข้อความธรรมดา (Plaintext) เป็นข้อความเข้ารหัส (Ciphertext)
- E2EE (End-to-End Encryption): การเข้ารหัสข้อมูลต้นทางถึงปลายทาง`,
    questions: [
      {
        questionText: 'มัลแวร์ชนิดใดที่ทำการ "เข้ารหัสไฟล์ข้อมูล" ทั้งหมดในคอมพิวเตอร์ของผู้เสียหาย และเรียกร้องเงินค่าไถ่เพื่อแลกกับรหัสปลดล็อก?',
        choice1: 'Spyware',
        choice2: 'Trojan Horse',
        choice3: 'Ransomware',
        choice4: 'Adware',
        correctAnswer: 3,
        explanation: 'Ransomware (มัลแวร์เรียกค่าไถ่) เข้ารหัสข้อมูลและขู่กรรโชกทรัพย์เพื่อแลกกับคีย์ถอดรหัส'
      },
      {
        questionText: 'การที่ผู้ไม่หวังดีส่งอีเมลหรือ SMS แอบอ้างเป็นธนาคารแล้วแนบลิงก์ให้กดเข้าไปกรอกรหัสผ่าน จัดเป็นภัยคุกคามประเภทใด?',
        choice1: 'Phishing (ฟิชชิง)',
        choice2: 'DDoS Attack',
        choice3: 'Worm',
        choice4: 'Rootkit',
        correctAnswer: 1,
        explanation: 'Phishing คือเทคนิควิศวกรรมสังคมที่หลอกลวงให้เหยื่อหลงเชื่อเพื่อกรอกข้อมูลลับส่วนตัว'
      }
    ]
  },
  {
    chapterNum: 11,
    title: 'บทที่ 11 Social Media และ Cloud',
    knowledgeContent: `บทที่ 11 — Social Media และ Cloud
ประเภทของสื่อ:
- สื่อสิ่งพิมพ์ (Print Media), สื่ออิเล็กทรอนิกส์ (Electronic Media), สื่อออนไลน์ (Online Media)
- สื่อโสต (Audio), สื่อทัศน์ (Visual), สื่อโสตทัศน์ (Audio Visual)
- สื่อสารมวลชน (Mass Media), สื่อเฉพาะกิจ (Specialized Media)

ประเภทของ Social Media:
1. Social Network: เชื่อมโยงเครือข่ายสังคม เช่น Facebook, LinkedIn
2. Media Network: แพลตฟอร์มแชร์วิดีโอ/รูปภาพ เช่น YouTube, Instagram, Pinterest
3. Discussions Forum: ตั้งกระทู้แลกเปลี่ยนความคิดเห็น เช่น Pantip, Reddit
4. Reviews: รีวิวสินค้าและบริการ เช่น Wongnai, TripAdvisor
5. Microblogging: โพสต์ข้อความสั้น เช่น X (Twitter), Threads
6. Livestreaming & Short Video: ถ่ายทอดสดและวิดีโอสั้น เช่น TikTok, Twitch
7. Social Commerce: ซื้อขายผ่านโซเชียล

เทคโนโลยีเสมือนจริง:
- VR (Virtual Reality): จำลองโลกเสมือนจริง 100% ผ่านแว่นตา VR
- AR (Augmented Reality): นำวัตถุดิจิทัลเสมือนซ้อนทับบนโลกความจริง (เช่น Pokemon GO, Filter IG)

บริการประมวลผลแบบคลาวด์ (Cloud Computing):
- รูปแบบคลาวด์:
  * Private Cloud: คลาวด์ส่วนตัวเฉพาะองค์กร
  * Public Cloud: คลาวด์สาธารณะ (เช่น Google Drive, AWS, Azure)
  * Hybrid Cloud: ผสมผสานระหว่าง Private และ Public Cloud
- รูปแบบการให้บริการ:
  * IaaS (Infrastructure as a Service): ให้บริการโครงสร้างพื้นฐาน เช่น เครื่อง Server เสมือน, Storage
  * PaaS (Platform as a Service): ให้บริการแพลตฟอร์มสำหรับนักพัฒนาโปรแกรม
  * SaaS (Software as a Service): ให้บริการซอฟต์แวร์พร้อมใช้งานผ่านเว็บ เช่น Gmail, Office 365, Canva

คีย์ลัด Google Chrome:
- Ctrl + N: เปิดหน้าต่างใหม่
- Ctrl + Shift + N: เปิดหน้าต่างไม่ระบุตัวตน (Incognito)
- Ctrl + T: เปิดแท็บใหม่
- Ctrl + W: ปิดแท็บปัจจุบัน
- Ctrl + Shift + T: เปิดแท็บที่เพิ่งปิดล่าสุดกลับคืนมา`,
    questions: [
      {
        questionText: 'บริการคลาวด์ที่ให้ผู้ใช้งานสามารถเข้าใช้งานโปรแกรมสำเร็จรูปผ่านเว็บเบราว์เซอร์ได้ทันที เช่น Gmail หรือ Microsoft 365 จัดเป็นบริการประเภทใด?',
        choice1: 'IaaS (Infrastructure as a Service)',
        choice2: 'PaaS (Platform as a Service)',
        choice3: 'SaaS (Software as a Service)',
        choice4: 'DaaS (Data as a Service)',
        correctAnswer: 3,
        explanation: 'SaaS (Software as a Service) คือบริการซอฟต์แวร์พร้อมใช้งานผ่านระบบคลาวด์โดยไม่ต้องติดตั้งบนเครื่อง'
      },
      {
        questionText: 'ในโปรแกรม Google Chrome คีย์ลัดใดใช้สำหรับเปิดหน้าต่างท่องเว็บแบบ "ไม่ระบุตัวตน" (Incognito Mode)?',
        choice1: 'Ctrl + T',
        choice2: 'Ctrl + N',
        choice3: 'Ctrl + Shift + N',
        choice4: 'Ctrl + Shift + T',
        correctAnswer: 3,
        explanation: 'Ctrl + Shift + N คือคีย์ลัดเปิด New Incognito Window ใน Google Chrome'
      }
    ]
  },
  {
    chapterNum: 12,
    title: 'บทที่ 12 Microsoft Word',
    knowledgeContent: `บทที่ 12 — Microsoft Word (โปรแกรมประมวลผลคำ)
- ชื่อไฟล์เริ่มต้นเมื่อเปิดโปรแกรม: Document1
- องค์ประกอบหลัก: Ribbon, Ruler (ไม้บรรทัด), Status Bar (แถบสถานะ), View Shortcut, Title Bar

แท็บบน Ribbon:
- Home: จัดรูปแบบฟอนต์ ขนาด สี ย่อหน้า ระยะห่าง จัดกึ่งกลาง ชิดซ้าย ชิดขวา
- Insert: แทรกรูปภาพ ตาราง ชาร์ต รูปร่าง หมายเลขหน้า สัญลักษณ์
- Design: ปรับแต่งธีม ลายน้ำ สีพื้นหลังหน้ากระดาษ ขอบหน้ากระดาษ
- Layout: ตั้งค่าหน้ากระดาษ (Margin ขอบกระดาษ, Orientation แนวตั้ง/แนวนอน, Size ขนาดกระดาษ, Column)
- References: สารบัญ เชิงอรรถ ดัชนี การอ้างอิง
- Mailings: การสร้างจดหมายเวียน (Mail Merge) และซองจดหมาย
- Review: ตรวจการสะกดคำ การแปลภาษา การนับคำ การติดตามการแก้ไข (Track Changes)
- View: มุมมองเอกสาร ย่อ/ขยาย แสดงไม้บรรทัดและเส้นตาราง

คีย์ลัดสำคัญใน Microsoft Word:
- Ctrl + N: สร้างเอกสารใหม่
- Ctrl + O: เปิดเอกสาร
- Ctrl + S: บันทึกเอกสาร
- Ctrl + P: พิมพ์เอกสาร
- Ctrl + Z: ยกเลิกคำสั่งล่าสุด (Undo)
- Ctrl + Y: ทำซ้ำคำสั่งล่าสุด (Redo)
- Ctrl + B: ตัวหนา (Bold)
- Ctrl + I: ตัวเอียง (Italic)
- Ctrl + U: ขีดเส้นใต้ (Underline)
- Ctrl + A: เลือกข้อความทั้งหมด
- Ctrl + C / Ctrl + X / Ctrl + V: คัดลอก / ตัด / วาง
- Ctrl + F: ค้นหาข้อความ (Find)
- Ctrl + H: ค้นหาและแทนที่ข้อความ (Replace)
- Ctrl + E: จัดกึ่งกลาง (Center)
- Ctrl + L: จัดชิดซ้าย (Align Left)
- Ctrl + R: จัดชิดขวา (Align Right)
- Ctrl + J: จัดเต็มแนวชิดขอบสองด้าน (Justify)
- Ctrl + Enter: ขึ้นหน้าใหม่ทันที (Page Break)`,
    questions: [
      {
        questionText: 'ในโปรแกรม Microsoft Word คีย์ลัดใดใช้สำหรับการ "ค้นหาและแทนที่ข้อความ" (Find and Replace)?',
        choice1: 'Ctrl + F',
        choice2: 'Ctrl + H',
        choice3: 'Ctrl + R',
        choice4: 'Ctrl + K',
        correctAnswer: 2,
        explanation: 'Ctrl + H ใช้เปิดหน้าต่าง Replace (ค้นหาและแทนที่) ส่วน Ctrl + F ใช้ค้นหาข้อความ'
      },
      {
        questionText: 'หากต้องการบังคับให้เอกสารตัดขึ้นหน้าใหม่ทันที (Page Break) ใน Microsoft Word ต้องกดคีย์ลัดใด?',
        choice1: 'Shift + Enter',
        choice2: 'Ctrl + Enter',
        choice3: 'Alt + Enter',
        choice4: 'Tab + Enter',
        correctAnswer: 2,
        explanation: 'Ctrl + Enter คือคำสั่งแทรกตัวแบ่งหน้า (Page Break) เพื่อขึ้นหน้ากระดาษใหม่ทันที'
      }
    ]
  },
  {
    chapterNum: 13,
    title: 'บทที่ 13 Microsoft Excel',
    knowledgeContent: `บทที่ 13 — Microsoft Excel (โปรแกรมตารางคำนวณ)
- ชื่อไฟล์เริ่มต้น: Book1
- หน่วยจัดเก็บข้อมูลหลัก: Cell (จุดตัดระหว่าง Row แถว กับ Column คอลัมน์ เช่น A1, B2)
- Worksheet คือแผ่นงาน 1 แผ่น, Workbook คือสมุดงานที่รวมหลาย Worksheet

สูตรและฟังก์ชันพื้นฐาน:
- =SUM(ช่วง): รวมผลบวกตัวเลข
- =AVERAGE(ช่วง): หาค่าเฉลี่ย
- =MAX(ช่วง) / =MIN(ช่วง): หาค่าสูงสุด / ต่ำสุด
- =COUNT(ช่วง): นับจำนวนเซลล์ที่มีเฉพาะ "ตัวเลข"
- =COUNTA(ช่วง): นับจำนวนเซลล์ที่ "ไม่ว่าง" (มีข้อมูลทั้งตัวเลขและตัวอักษร)
- =IF(เงื่อนไข, จริง, เท็จ): ตรวจสอบเงื่อนไข
- =VLOOKUP(ค่าที่ค้นหา, ตาราง, ลำดับคอลัมน์, รูปแบบ): ค้นหาข้อมูลในตารางแนวตั้ง
- =CONCATENATE() หรือเครื่องหมาย &: เชื่อมข้อความเข้าด้วยกัน

คีย์ลัดที่ใช้บ่อย:
- F2: แก้ไขข้อมูลในเซลล์ที่เลือก
- F4: ล็อกตำแหน่งเซลล์ในสูตร ใส่เครื่องหมาย $ (Absolute Reference เช่น $A$1) / ทำซ้ำคำสั่งล่าสุด
- Alt + =: ใส่สูตร AutoSum รวมผลบวกอัตโนมัติ
- Ctrl + 1: เปิดหน้าต่างจัดรูปแบบเซลล์ (Format Cells)
- Ctrl + ; : ใส่วันที่ปัจจุบัน
- Ctrl + Shift + ; : ใส่เวลาปัจจุบัน
- Ctrl + Space: เลือกทั้งคอลัมน์
- Shift + Space: เลือกทั้งแถว

ค่า Error ที่พบบ่อยใน Excel:
- #DIV/0! : มีการหารด้วยศูนย์ หรือหารด้วยเซลล์ว่าง
- #N/A : ไม่พบข้อมูลที่ค้นหา (เช่น ในสูตร VLOOKUP)
- #NAME? : พิมพ์ชื่อฟังก์ชันผิด หรือสูตรอ้างอิงชื่อที่ไม่มีอยู่
- #NULL! : อ้างอิงช่วงเซลล์ผิดรูปแบบ (ใช้เว้นวรรคผิด)
- #NUM! : ตัวเลขในสูตรไม่ถูกต้อง หรือเกินขีดจำกัดที่คำนวณได้
- #REF! : เซลล์ที่สูตรอ้างอิงถูกลบไปแล้ว (Invalid Cell Reference)
- #VALUE! : ชนิดข้อมูลผิดพลาด เช่น นำตัวอักษรมาบวกกับตัวเลข
- #SPILL! : ผลลัพธ์แบบ Dynamic Array มีเซลล์อื่นขวางทางอยู่ทำให้กระจายค่าไม่ได้
- ##### : คอลัมน์แคบเกินไปที่จะแสดงตัวเลขหรือวันที่ (ไม่ใช่ Error ของสูตร แค่ขยายคอลัมน์ก็หาย)`,
    questions: [
      {
        questionText: 'ในโปรแกรม Microsoft Excel หากพิมพ์สูตรคำนวณแล้วปรากฏข้อผิดพลาดเป็น "#DIV/0!" เกิดจากสาเหตุใด?',
        choice1: 'พิมพ์ชื่อฟังก์ชันผิด',
        choice2: 'เกิดการหารด้วยศูนย์ (0) หรือหารด้วยเซลล์ที่ว่างเปล่า',
        choice3: 'เซลล์ที่อ้างอิงถูกลบทิ้งไปแล้ว',
        choice4: 'คอลัมน์แคบเกินไปจนแสดงผลไม่ได้',
        correctAnswer: 2,
        explanation: '#DIV/0! เกิดจากการที่ตัวหารมีค่าเป็น 0 หรือเซลล์ที่นำมาเป็นตัวหารไม่มีข้อมูล'
      },
      {
        questionText: 'ใน Excel ฟังก์ชันใดใช้สำหรับนับจำนวนเซลล์ที่มีข้อมูลทั้งหมดโดยไม่เว้นว่าจะเป็นตัวเลขหรือข้อความ (นับเซลล์ที่ไม่ว่าง)?',
        choice1: 'COUNT()',
        choice2: 'COUNTA()',
        choice3: 'COUNTIF()',
        choice4: 'SUM()',
        correctAnswer: 2,
        explanation: 'COUNTA() นับเซลล์ที่มีข้อมูลทั้งหมดที่ไม่ว่าง ส่วน COUNT() นับเฉพาะเซลล์ที่มีค่าเป็นตัวเลขเท่านั้น'
      },
      {
        questionText: 'คีย์ลัดใดใน Excel ที่ใช้สำหรับ "ล็อกตำแหน่งเซลล์" (ใส่เครื่องหมาย $) เพื่อไม่ให้ตำแหน่งเซลล์เลื่อนเมื่อคัดลอกสูตร?',
        choice1: 'F2',
        choice2: 'F4',
        choice3: 'F9',
        choice4: 'F12',
        correctAnswer: 2,
        explanation: 'F4 ใช้สำหรับสลับการล็อกตำแหน่งเซลล์แบบ Absolute Reference เช่น $A$1'
      }
    ]
  },
  {
    chapterNum: 14,
    title: 'บทที่ 14 PowerPoint (คำสั่งลัด)',
    knowledgeContent: `บทที่ 14 — PowerPoint (โปรแกรมนำเสนองาน)
- ชื่อไฟล์เริ่มต้นเมื่อเปิดโปรแกรม: Presentation1
- องค์ประกอบหลัก: Ribbon, Slide Pane (แถบสไลด์ย่อ), Slide Area, Status Bar, Notes Pane

คีย์ลัดสำคัญระหว่างการนำเสนอสไลด์ (Slide Show):
- F5: เริ่มนำเสนอสไลด์ตั้งแต่สไลด์แรกสุด
- Shift + F5: เริ่มนำเสนอสไลด์จากสไลด์ปัจจุบันที่เลือกอยู่
- Esc: ออกจากการนำเสนอสไลด์
- Home: ข้ามไปสไลด์แรกสุด
- End: ข้ามไปสไลด์สุดท้าย
- B: แสดงหน้าจอเป็นสีดำว่างเปล่า (Black screen)
- W: แสดงหน้าจอเป็นสีขาวว่างเปล่า (White screen)
- Ctrl + P: เปลี่ยนตัวชี้เมาส์เป็น "ปากกา" สำหรับขีดเขียน
- Ctrl + L: เปลี่ยนตัวชี้เมาส์เป็น "พอยน์เตอร์เลเซอร์"
- Ctrl + E: เปลี่ยนตัวชี้เมาส์เป็น "ยางลบ"
- Ctrl + A: เปลี่ยนตัวชี้เมาส์กลับเป็น "ลูกศรปกติ"
- Alt + P: เล่นหรือหยุดเล่นสื่อ (Play / Pause Media)
- Alt + Up / Alt + Down: เพิ่ม / ลดระดับเสียง`,
    questions: [
      {
        questionText: 'ในโปรแกรม Microsoft PowerPoint หากต้องการเริ่มฉายสไลด์โชว์โดยเริ่มจาก "สไลด์ปัจจุบันที่กำลังเลือกอยู่" ต้องกดปุ่มคีย์ลัดใด?',
        choice1: 'F5',
        choice2: 'Shift + F5',
        choice3: 'Ctrl + F5',
        choice4: 'Alt + F5',
        correctAnswer: 2,
        explanation: 'Shift + F5 เริ่มฉายจากสไลด์ปัจจุบัน ส่วน F5 เริ่มฉายตั้งแต่สไลด์แรกสุด'
      },
      {
        questionText: 'ขณะกำลังนำเสนอสไลด์ใน PowerPoint หากต้องการเปลี่ยนเคอร์เซอร์เมาส์ให้กลายเป็น "ปากกา" เพื่อเขียนอธิบายบนหน้าจอ ต้องกดคีย์ลัดใด?',
        choice1: 'Ctrl + P',
        choice2: 'Ctrl + L',
        choice3: 'Ctrl + E',
        choice4: 'Ctrl + B',
        correctAnswer: 1,
        explanation: 'Ctrl + P เปลี่ยนเคอร์เซอร์เป็นปากกา (Pen), Ctrl + L เป็นเลเซอร์, Ctrl + E เป็นยางลบ'
      }
    ]
  }
];

async function seedComputerKnowledgeAndExams() {
  console.log('--- Starting Computer Subject Seed (14 Chapters) ---');

  // Find admin user or default user to associate exam sets with
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  if (!adminUser) {
    console.log('No user found, creating default system admin');
    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@policeexam.com',
        password: 'hashed_admin_pwd',
        role: 'ADMIN',
        fullName: 'ผู้ดูแลระบบ POLICE EXAM'
      }
    });
  }

  // 1. Seed Knowledge Documents
  console.log('1. Seeding KnowledgeDocument entries...');
  for (const item of chaptersData) {
    const existingDoc = await prisma.knowledgeDocument.findFirst({
      where: {
        title: item.title,
        category: 'คอมพิวเตอร์และสารสนเทศ'
      }
    });

    if (existingDoc) {
      await prisma.knowledgeDocument.update({
        where: { id: existingDoc.id },
        data: {
          content: item.knowledgeContent
        }
      });
      console.log(`Updated KnowledgeDoc: ${item.title}`);
    } else {
      await prisma.knowledgeDocument.create({
        data: {
          title: item.title,
          category: 'คอมพิวเตอร์และสารสนเทศ',
          content: item.knowledgeContent
        }
      });
      console.log(`Created KnowledgeDoc: ${item.title}`);
    }
  }

  // 2. Seed ExamSets and Questions in Database
  console.log('\n2. Seeding ExamSet and Question entries in Database...');
  for (const item of chaptersData) {
    const setTitle = `แบบทดสอบเทคโนโลยีสารสนเทศ: ${item.title}`;
    const subcategoryName = item.title;

    let examSet = await prisma.examSet.findFirst({
      where: {
        title: setTitle,
        category: 'คอม'
      }
    });

    if (!examSet) {
      examSet = await prisma.examSet.create({
        data: {
          title: setTitle,
          category: 'คอม',
          subcategory: subcategoryName,
          totalCount: item.questions.length,
          isPublic: true,
          status: 'COMPLETED',
          createdById: adminUser.id
        }
      });
      console.log(`Created ExamSet: ${setTitle} (ID: ${examSet.id})`);
    } else {
      // Update metadata
      await prisma.examSet.update({
        where: { id: examSet.id },
        data: {
          subcategory: subcategoryName,
          totalCount: item.questions.length
        }
      });
      // Clear old questions to avoid duplicates
      await prisma.question.deleteMany({
        where: { examSetId: examSet.id }
      });
      console.log(`Refreshed ExamSet: ${setTitle} (ID: ${examSet.id})`);
    }

    // Insert questions
    for (let i = 0; i < item.questions.length; i++) {
      const q = item.questions[i];
      await prisma.question.create({
        data: {
          examSetId: examSet.id,
          questionText: q.questionText,
          choice1: q.choice1,
          choice2: q.choice2,
          choice3: q.choice3,
          choice4: q.choice4,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sortOrder: i + 1
        }
      });
    }
    console.log(`  -> Inserted ${item.questions.length} questions for ${item.title}`);
  }

  console.log('\n--- Finished Seeding All 14 Computer Chapters Successfully! ---');
}

seedComputerKnowledgeAndExams()
  .catch(err => {
    console.error('Seed Error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

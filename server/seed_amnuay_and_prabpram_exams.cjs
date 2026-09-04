const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockData = [
  // ========================================================
  // 1. ความสามารถทั่วไป (คณิตศาสตร์ / ตรรกะ / คำนวณ)
  // ========================================================
  {
    category: 'ทั่วไป',
    subcategory: 'อนุกรมและมิติสัมพันธ์ตัวเลข',
    title: 'แบบทดสอบความสามารถทั่วไป: อนุกรมและมิติสัมพันธ์ตัวเลข (ชุดที่ 1)',
    questions: [
      { questionText: 'อนุกรม 2, 5, 10, 17, 26, ... ตัวเลขถัดไปคือข้อใด?', choice1: '35', choice2: '37', choice3: '39', choice4: '41', correctAnswer: 2, explanation: 'ผลต่างเป็นเลขคี่ +3, +5, +7, +9, +11 ดังนั้น 26 + 11 = 37' },
      { questionText: 'อนุกรม 3, 6, 12, 24, 48, ... ตัวเลขถัดไปคือข้อใด?', choice1: '72', choice2: '84', choice3: '96', choice4: '108', correctAnswer: 3, explanation: 'คูณด้วย 2 ตลอด: 48 x 2 = 96' },
      { questionText: 'อนุกรม 1, 4, 9, 16, 25, ... ตัวเลขถัดไปคือข้อใด?', choice1: '30', choice2: '36', choice3: '40', choice4: '49', correctAnswer: 2, explanation: 'เลขยกกำลังสอง: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2 = 36' },
      { questionText: 'อนุกรม 80, 40, 20, 10, ... ตัวเลขถัดไปคือข้อใด?', choice1: '0', choice2: '2.5', choice3: '5', choice4: '7.5', correctAnswer: 3, explanation: 'หารด้วย 2 ตลอด: 10 / 2 = 5' },
      { questionText: 'อนุกรม 1, 1, 2, 3, 5, 8, 13, ... ตัวเลขถัดไปคือข้อใด?', choice1: '18', choice2: '20', choice3: '21', choice4: '24', correctAnswer: 3, explanation: 'อนุกรมฟีโบนักชี (สองตัวหน้าบวกกัน): 8 + 13 = 21' },
      { questionText: 'อนุกรม 5, 11, 23, 47, ... ตัวเลขถัดไปคือข้อใด?', choice1: '91', choice2: '93', choice3: '95', choice4: '97', correctAnswer: 3, explanation: '(x 2) + 1: (47 x 2) + 1 = 95' },
      { questionText: 'อนุกรม 100, 98, 94, 88, 80, ... ตัวเลขถัดไปคือข้อใด?', choice1: '70', choice2: '72', choice3: '68', choice4: '66', correctAnswer: 1, explanation: 'ผลต่างลดลงทีละคู่ -2, -4, -6, -8, -10 -> 80 - 10 = 70' },
      { questionText: 'อนุกรม 2, 3, 5, 7, 11, 13, ... ตัวเลขถัดไปคือข้อใด?', choice1: '15', choice2: '17', choice3: '19', choice4: '21', correctAnswer: 2, explanation: 'จำนวนเฉพาะเรียงลำดับ ตัวถัดจาก 13 คือ 17' },
      { questionText: 'อนุกรม 4, 9, 19, 39, ... ตัวเลขถัดไปคือข้อใด?', choice1: '69', choice2: '79', choice3: '89', choice4: '99', correctAnswer: 2, explanation: '(x 2) + 1: 4x2+1=9, 9x2+1=19, 19x2+1=39, 39x2+1=79' },
      { questionText: 'อนุกรม 7, 14, 28, 56, ... ตัวเลขถัดไปคือข้อใด?', choice1: '98', choice2: '102', choice3: '112', choice4: '120', correctAnswer: 3, explanation: 'คูณด้วย 2 ตลอด: 56 x 2 = 112' }
    ]
  },
  {
    category: 'ทั่วไป',
    subcategory: 'ร้อยละ กำไรขาดทุน และโจทย์คำนวณ',
    title: 'แบบทดสอบความสามารถทั่วไป: ร้อยละ กำไรขาดทุน และโจทย์คำนวณ (ชุดที่ 1)',
    questions: [
      { questionText: 'สินค้าติดราคาไว้ 2,500 บาท ลดราคา 20% ผู้ซื้อจะต้องจ่ายเงินกี่บาท?', choice1: '1,800 บาท', choice2: '1,900 บาท', choice3: '2,000 บาท', choice4: '2,100 บาท', correctAnswer: 3, explanation: 'ลด 20% ของ 2,500 = 500 บาท; จ่าย 2,500 - 500 = 2,000 บาท' },
      { questionText: 'ซื้อเสื้อมา 400 บาท ขายไป 500 บาท ได้กำไรร้อยละเท่าใด?', choice1: 'ร้อยละ 15', choice2: 'ร้อยละ 20', choice3: 'ร้อยละ 25', choice4: 'ร้อยละ 30', correctAnswer: 3, explanation: 'กำไร 100 บาท คิดเป็น (100 / 400) x 100 = 25%' },
      { questionText: 'นักเรียนห้องหนึ่งมี 50 คน เป็นผู้ชาย 30 คน คิดเป็นผู้ชายร้อยละเท่าใด?', choice1: 'ร้อยละ 50', choice2: 'ร้อยละ 55', choice3: 'ร้อยละ 60', choice4: 'ร้อยละ 65', correctAnswer: 3, explanation: '(30 / 50) x 100 = 60%' },
      { questionText: 'เงินต้น 10,000 บาท อัตราดอกเบี้ย 5% ต่อปี ฝากครบ 2 ปี ได้ดอกเบี้ยรวมเท่าใด (แบบธรรมดา)?', choice1: '500 บาท', choice2: '1,000 บาท', choice3: '1,500 บาท', choice4: '2,000 บาท', correctAnswer: 2, explanation: 'ปีละ 500 บาท 2 ปี รวม 1,000 บาท' },
      { questionText: 'ขายโทรศัพท์ราคา 8,000 บาท ขาดทุน 20% อยากทราบว่าราคาทุนคือเท่าใด?', choice1: '9,500 บาท', choice2: '10,000 บาท', choice3: '10,500 บาท', choice4: '11,000 บาท', correctAnswer: 2, explanation: 'ราคาขาย 80% = 8,000 -> ทุน 100% = 10,000 บาท' },
      { questionText: 'พ่อมีเงิน 1,200 บาท แบ่งให้ลูก 3 คนในอัตราส่วน 1 : 2 : 3 คนที่ได้มากที่สุดได้กี่บาท?', choice1: '400 บาท', choice2: '500 บาท', choice3: '600 บาท', choice4: '700 บาท', correctAnswer: 3, explanation: 'รวม 6 ส่วน ส่วนละ 200 บาท; คนที่ได้มากสุด 3 ส่วน = 600 บาท' },
      { questionText: 'ทำงาน 6 คน เสร็จใน 4 วัน ถ้ามีคน 8 คน จะทำงานชิ้นเดียวกันเสร็จในกี่วัน?', choice1: '2 วัน', choice2: '3 วัน', choice3: '3.5 วัน', choice4: '5 วัน', correctAnswer: 2, explanation: 'แรงงานผกผัน: 6 x 4 = 8 x D -> D = 24 / 8 = 3 วัน' },
      { questionText: 'ซื้อปากกามา 1 โหล ราคา 120 บาท ขายไปด้ามละ 12 บาท ได้กำไรทั้งหมดกี่บาท?', choice1: '12 บาท', choice2: '24 บาท', choice3: '36 บาท', choice4: '48 บาท', correctAnswer: 2, explanation: '1 โหล 12 ด้าม ขายได้ 144 บาท; กำไร 144 - 120 = 24 บาท' },
      { questionText: 'ค่าเฉลี่ยของคะแนนสอบ 4 วิชา คือ 75 คะแนน ถ้ารวมวิชาที่ 5 เข้าไปทำให้ค่าเฉลี่ยกลายเป็น 78 วิชาที่ 5 ได้กี่คะแนน?', choice1: '80', choice2: '85', choice3: '90', choice4: '95', correctAnswer: 3, explanation: 'รวมเดิม 4x75 = 300; รวมใหม่ 5x78 = 390 -> วิชาที่ 5 ได้ 390 - 300 = 90' },
      { questionText: 'รถยนต์วิ่งด้วยความเร็ว 80 กม./ชม. เป็นเวลา 3 ชั่วโมง 30 นาที จะได้ระยะทางเท่าใด?', choice1: '240 กม.', choice2: '260 กม.', choice3: '280 กม.', choice4: '300 กม.', correctAnswer: 3, explanation: '80 x 3.5 = 280 กิโลเมตร' }
    ]
  },
  {
    category: 'ทั่วไป',
    subcategory: 'ตรรกศาสตร์และเงื่อนไขภาษา / สัญลักษณ์',
    title: 'แบบทดสอบความสามารถทั่วไป: ตรรกศาสตร์และเงื่อนไขภาษา (ชุดที่ 1)',
    questions: [
      { questionText: 'ถ้า A > B และ B = C ข้อใดถูกต้องที่สุด?', choice1: 'A = C', choice2: 'A > C', choice3: 'A < C', choice4: 'สรุปไม่ได้', correctAnswer: 2, explanation: 'แทนค่า B ด้วย C ได้ A > C ทันที' },
      { questionText: 'เงื่อนไข: "นกทุกตัวบินได้ และ นกกระจอกเทศเป็นนก" ข้อใดสรุปได้ถูกต้องตามหลักตรรกะของโจทย์?', choice1: 'นกกระจอกเทศบินได้', choice2: 'นกกระจอกเทศบินไม่ได้', choice3: 'นกทุกตัวคือนกกระจอกเทศ', choice4: 'สรุปไม่ได้', correctAnswer: 1, explanation: 'ตามสมมุติฐานที่ให้ นกทุกตัวบินได้ -> นกกระจอกเทศเป็นนก -> นกกระจอกเทศบินได้' },
      { questionText: 'ถ้า วันนี้ฝนตก แล้ว ถนนจะเปียก ข้อใดสมมูลกับข้อความนี้?', choice1: 'ถ้าถนนไม่เปียก แล้ว วันนี้ฝนไม่ตก', choice2: 'ถ้าถนนเปียก แล้ว วันนี้ฝนตก', choice3: 'วันนี้ฝนไม่ตก ถนนจึงไม่เปียก', choice4: 'ถนนเปียกเพราะน้ำท่วม', correctAnswer: 1, explanation: 'ประพจน์สมมูล p -> q สมมูลกับ ~q -> ~p' },
      { questionText: 'เงื่อนไข: ก สูงกว่า ข แต่เตี้ยกว่า ค ข้อใดถูกต้อง?', choice1: 'ค สูงที่สุด', choice2: 'ก สูงที่สุด', choice3: 'ข สูงที่สุด', choice4: 'ค เตี้ยที่สุด', correctAnswer: 1, explanation: 'ค > ก > ข ดังนั้น ค สูงที่สุด' },
      { questionText: 'กำหนดให้: A >= B > C และ C = D ข้อสรุป "A > D" จริงหรือไม่?', choice1: 'จริง', choice2: 'ไม่จริง', choice3: 'แน่ชัดไม่ได้', choice4: 'ข้อสรุปผิด', correctAnswer: 1, explanation: 'A >= B > C = D ส่งผลให้ A > D แน่นอน จริง 100%' },
      { questionText: 'กำหนดให้: X < Y และ Y <= Z ข้อสรุป "X < Z" จริงหรือไม่?', choice1: 'จริง', choice2: 'ไม่จริง', choice3: 'แน่ชัดไม่ได้', choice4: 'สรุปไม่ได้', correctAnswer: 1, explanation: 'X < Y <= Z ดังนั้น X < Z เป็นจริงแน่นอน' },
      { questionText: 'คนขยันทุกคนสอบผ่าน นายแดงสอบผ่าน สรุปว่านายแดงเป็นคนขยัน ข้อสรุปนี้สมเหตุสมผลหรือไม่?', choice1: 'สมเหตุสมผล', choice2: 'ไม่สมเหตุสมผล', choice3: 'เป็นจริงเสมอ', choice4: 'สรุปได้ถูกต้อง', correctAnswer: 2, explanation: 'ไม่สมเหตุสมผล เพราะคนไม่ขยันก็อาจสอบผ่านได้' },
      { questionText: 'ถ้า 2A = 4B และ B = 3 แล้ว A มีค่าเท่าใด?', choice1: '3', choice2: '6', choice3: '9', choice4: '12', correctAnswer: 2, explanation: '4B = 12 -> 2A = 12 -> A = 6' },
      { questionText: 'นายดำอายุมากกว่านายขาว 3 ปี นายขาวอายุน้อยกว่านายเขียว 2 ปี ใครอายุน้อยที่สุด?', choice1: 'นายดำ', choice2: 'นายขาว', choice3: 'นายเขียว', choice4: 'อายุเท่ากัน', correctAnswer: 2, explanation: 'นายขาวอายุน้อยกว่าทั้งดำและเขียว ดังนั้นนายขาวน้อยที่สุด' },
      { questionText: 'ถ้า p เป็นจริง และ q เป็นเท็จ แล้วข้อความ "p และ q" (p ^ q) มีค่าความจริงเป็นอย่างไร?', choice1: 'จริง', choice2: 'เท็จ', choice3: 'จริงบางกรณี', choice4: 'สรุปไม่ได้', correctAnswer: 2, explanation: 'ตัวเชื่อม "และ" จะเป็นจริงเมื่อทั้งคู่จริงเท่านั้น ดังนั้นกรณีนี้เป็นเท็จ' }
    ]
  },

  // ========================================================
  // 2. ภาษาไทย (การใช้คำ / การสะกด / จับใจความ)
  // ========================================================
  {
    category: 'ภาษาไทย',
    subcategory: 'การใช้คำ ความหมาย และคำราชาศัพท์',
    title: 'แบบทดสอบภาษาไทย: การใช้คำ ความหมาย และคำราชาศัพท์ (ชุดที่ 1)',
    questions: [
      { questionText: 'คำราชาศัพท์สำหรับคำว่า "กิน" ของพระมหากษัตริย์คือข้อใด?', choice1: 'เสวย', choice2: 'ฉัน', choice3: 'รับประทาน', choice4: 'บริโภค', correctAnswer: 1, explanation: 'เสวย เป็นคำราชาศัพท์ใช้กับพระมหากษัตริย์และพระบรมวงศานุวงศ์' },
      { questionText: 'คำราชาศัพท์คำว่า "พระเนตร" หมายถึงอวัยวะส่วนใด?', choice1: 'หู', choice2: 'ตา', choice3: 'จมูก', choice4: 'ปาก', correctAnswer: 2, explanation: 'พระเนตร หมายถึง ดวงตา' },
      { questionText: 'คำราชาศัพท์คำว่า "พระหัตถ์" หมายถึงอวัยวะส่วนใด?', choice1: 'มือ', choice2: 'เท้า', choice3: 'แขน', choice4: 'ขา', correctAnswer: 1, explanation: 'พระหัตถ์ หมายถึง มือ' },
      { questionText: 'คำว่า "อาพาธ" ใช้สำหรับบุคคลในข้อใด?', choice1: 'พระมหากษัตริย์', choice2: 'พระภิกษุสงฆ์', choice3: 'ขุนนาง', choice4: 'บุคคลทั่วไป', correctAnswer: 2, explanation: 'อาพาธ หมายถึง ป่วย ใช้สำหรับพระภิกษุสงฆ์' },
      { questionText: 'ข้อใดใช้คำลักษณนามไม่ถูกต้อง?', choice1: 'ช้างป่า 2 ตัว', choice2: 'ช้างบ้าน 2 เชือก', choice3: 'ช้างหลวง 2 ช้าง', choice4: 'พระภิกษุ 2 คน', correctAnswer: 4, explanation: 'พระภิกษุสงฆ์ต้องใช้ลักษณนามว่า "รูป" ไม่ใช่ "คน"' },
      { questionText: 'คำว่า "มรณภาพ" ใช้สำหรับบุคคลในข้อใด?', choice1: 'พระมหากษัตริย์', choice2: 'พระภิกษุสงฆ์', choice3: 'สามเณร', choice4: 'คนทั่วไป', correctAnswer: 2, explanation: 'มรณภาพ หมายถึง ตาย ใช้สำหรับพระสงฆ์' },
      { questionText: 'คำว่า "พระราชสาส์น" หมายถึงหนังสือของใคร?', choice1: 'พระมหากษัตริย์ถึงพระมหากษัตริย์หรือประมุขต่างประเทศ', choice2: 'พระบรมวงศานุวงศ์', choice3: 'นายกรัฐมนตรี', choice4: 'สมเด็จพระสังฆราช', correctAnswer: 1, explanation: 'พระราชสาส์น ใช้สำหรับหนังสือทางการทูตระหว่างพระมหากษัตริย์/ประมุข' },
      { questionText: 'คำราชาศัพท์สำหรับคำว่า "นอน" ของพระมหากษัตริย์คือข้อใด?', choice1: 'บรรทม', choice2: 'จำวัด', choice3: 'จำศีล', choice4: 'นิทรา', correctAnswer: 1, explanation: 'บรรทม หมายถึง นอน ใช้สำหรับกษัตริย์' },
      { questionText: 'คำว่า "ภัตตาหาร" หมายถึงสิ่งใดของพระสงฆ์?', choice1: 'อาหาร', choice2: 'เครื่องนุ่งห่ม', choice3: 'ที่อยู่อาศัย', choice4: 'ยารักษาโรค', correctAnswer: 1, explanation: 'ภัตตาหาร หมายถึง อาหารของพระสงฆ์' },
      { questionText: 'คำราชาศัพท์ "สวรรคต" ใช้กับบุคคลใด?', choice1: 'พระมหากษัตริย์และพระราชินี', choice2: 'หม่อมเจ้า', choice3: 'พระองค์เจ้า', choice4: 'สามัญชน', correctAnswer: 1, explanation: 'สวรรคต ใช้กับพระมหากษัตริย์ พระราชินี' }
    ]
  },
  {
    category: 'ภาษาไทย',
    subcategory: 'การสะกดคำ การแต่งประโยค และสำนวนไทย',
    title: 'แบบทดสอบภาษาไทย: การสะกดคำ การแต่งประโยค และสำนวนไทย (ชุดที่ 1)',
    questions: [
      { questionText: 'ข้อใดสะกดคำได้ถูกต้องทุกคำ?', choice1: 'กะเพรา, อนุญาต, สังเกต', choice2: 'กระเพรา, อนุญาติ, สังเกตุ', choice3: 'กะเพรา, อนุญาติ, สังเกตุ', choice4: 'กระเพรา, อนุญาต, สังเกต', correctAnswer: 1, explanation: 'กะเพรา อนุญาต สังเกต สะกดถูกต้องตามพจนานุกรมราชบัณฑิตฯ' },
      { questionText: 'สำนวน "ชี้โพรงให้กระรอก" มีความหมายตรงกับข้อใด?', choice1: 'บอกลู่ทางให้คนทำผิดหรือหาประโยชน์', choice2: 'ช่วยเหลือคนยากจน', choice3: 'สอนคนที่มีความรู้อยู่แล้ว', choice4: 'เตือนสติคนใจร้อน', correctAnswer: 1, explanation: 'ชี้โพรงให้กระรอก คือการชี้ช่องทางให้ผู้อื่นทำสิ่งที่ไม่ดีหรือหาผลประโยชน์' },
      { questionText: 'สำนวน "ขี่ช้างจับตั๊กแตน" หมายถึงข้อใด?', choice1: 'ลงทุนมากแต่ได้ผลประโยชน์น้อย', choice2: 'ทำสิ่งที่เป็นไปไม่ได้', choice3: 'จับสัตว์ใหญ่ได้ง่าย', choice4: 'การเดินทางไกล', correctAnswer: 1, explanation: 'ลงทุนมากแต่ผลตอบแทนที่ได้ไม่คุ้มค่า' },
      { questionText: 'ข้อใดเป็นประโยคความรวม (อเนกรรถประโยค)?', choice1: 'ฉันชอบอ่านหนังสือแต่น้องชอบดูโทรทัศน์', choice2: 'คุณครูสอนนักเรียนที่ตั้งใจ', choice3: 'ฝนตกหนักมากเมื่อคืนนี้', choice4: 'เขาเป็นคนดีของสังคม', correctAnswer: 1, explanation: 'มีสันธาน "แต่" เชื่อมสองประโยคเข้าด้วยกัน' },
      { questionText: 'คำในข้อใดเขียนตัวสะกดผิด?', choice1: 'โอกาส', choice2: 'อากาศ', choice3: 'ปรากฏ', choice4: 'รสชาด', correctAnswer: 4, explanation: 'รสชาติ ต้องสะกดด้วย ติ (รสชาติ) ไม่ใช่ ด' },
      { questionText: 'คำว่า "กาลเทศะ" หมายถึงข้อใด?', choice1: 'เวลาและสถานที่อันเหมาะสม', choice2: 'ฤดูกาลและธรรมชาติ', choice3: 'ประเพณีและวัฒนธรรม', choice4: 'การแต่งกายที่หรูหรา', correctAnswer: 1, explanation: 'กาล (เวลา) + เทศะ (สถานที่) คือ ความเหมาะสมตามเวลาและสถานที่' },
      { questionText: 'สำนวน "จับปลาสองมือ" หมายถึงข้อใด?', choice1: 'ทำสองอย่างพร้อมกันจนอาจไม่สำเร็จทั้งคู่', choice2: 'มีความสามารถสูง', choice3: 'จับสัตว์น้ำเก่ง', choice4: 'ร่วมมือกันทำงาน', correctAnswer: 1, explanation: 'มุ่งหวังสองสิ่งพร้อมกันจนอาจล้มเหลวทั้งสองอย่าง' },
      { questionText: 'ข้อใดใช้คำว่า "สัมมนา" ได้ถูกต้อง?', choice1: 'เข้าร่วมการสัมมนาทางวิชาการ', choice2: 'ไปซื้อของที่สัมมนา', choice3: 'รับประทานอาหารสัมมนา', choice4: 'ทำความสะอาดสัมมนา', correctAnswer: 1, explanation: 'สัมมนา หมายถึง การประชุมเพื่อแลกเปลี่ยนความรู้' },
      { questionText: 'คำว่า "บำเหน็จ" หมายถึงข้อใด?', choice1: 'เงินตอบแทนที่จ่ายครั้งเดียวเมื่อออกจากงาน', choice2: 'เงินเดือนประจำ', choice3: 'เงินกู้ยืม', choice4: 'เงินบริจาค', correctAnswer: 1, explanation: 'บำเหน็จ คือ เงินก้อนที่จ่ายครั้งเดียวเมื่อพ้นจากราชการ/งาน' },
      { questionText: 'สำนวน "งมเข็มในมหาสมุทร" หมายถึงข้อใด?', choice1: 'ค้นหาสิ่งที่หายากในที่กว้างใหญ่มาก', choice2: 'ว่ายน้ำเก่ง', choice3: 'ทำของมีค่าตกน้ำ', choice4: 'ประหยัดอดออม', correctAnswer: 1, explanation: 'การค้นหาสิ่งที่ยากยิ่งจะพบ' }
    ]
  },

  // ========================================================
  // 3. ภาษาอังกฤษ (English)
  // ========================================================
  {
    category: 'ภาษาอังกฤษ',
    subcategory: 'Vocabulary (คำศัพท์ตำรวจและทั่วไป)',
    title: 'แบบทดสอบภาษาอังกฤษ: Police & General Vocabulary (ชุดที่ 1)',
    questions: [
      { questionText: 'The police officer asked the driver to ______ his driving license.', choice1: 'show', choice2: 'showing', choice3: 'shown', choice4: 'shows', correctAnswer: 1, explanation: 'After "asked ... to", use base verb (show).' },
      { questionText: 'What is the synonym of the word "INVESTIGATE"?', choice1: 'Examine', choice2: 'Ignore', choice3: 'Destroy', choice4: 'Forget', correctAnswer: 1, explanation: 'Investigate แปลว่า สืบสวน ตรวจสอบ ตรงกับ Examine.' },
      { questionText: 'The antonym (opposite meaning) of "GUILTY" is ______.', choice1: 'Innocent', choice2: 'Criminal', choice3: 'Suspect', choice4: 'Victim', correctAnswer: 1, explanation: 'Guilty (มีความผิด) ตรงข้ามกับ Innocent (บริสุทธิ์).' },
      { questionText: 'A person who sees a crime happen is called a ______.', choice1: 'Witness', choice2: 'Judge', choice3: 'Lawyer', choice4: 'Thief', correctAnswer: 1, explanation: 'Witness หมายถึง พยานผู้เห็นเหตุการณ์.' },
      { questionText: 'The police found important ______ at the crime scene.', choice1: 'evidence', choice2: 'garbage', choice3: 'recipe', choice4: 'ticket', correctAnswer: 1, explanation: 'Evidence หมายถึง หลักฐาน.' },
      { questionText: 'The word "SUSPECT" means a person who is ______.', choice1: 'believed to have committed a crime', choice2: 'injured in an accident', choice3: 'working in a court', choice4: 'visiting the city', correctAnswer: 1, explanation: 'Suspect หมายถึง ผู้ต้องสงสัย.' },
      { questionText: 'The police caught the thief and put him under ______.', choice1: 'arrest', choice2: 'vacation', choice3: 'entertainment', choice4: 'holiday', correctAnswer: 1, explanation: 'Under arrest หมายถึง อยู่ภายใต้การจับกุม.' },
      { questionText: 'What does "EMERGENCY" mean?', choice1: 'A serious, unexpected situation needing immediate action', choice2: 'A planned party', choice3: 'A regular daily routine', choice4: 'A long holiday', correctAnswer: 1, explanation: 'Emergency หมายถึง เหตุฉุกเฉิน.' },
      { questionText: 'The victim reported the ______ to the police station immediately.', choice1: 'incident', choice2: 'celebration', choice3: 'shopping', choice4: 'recipe', correctAnswer: 1, explanation: 'Incident หมายถึง เหตุการณ์/เรื่องราวที่เกิดขึ้น.' },
      { questionText: 'The word "PENALTY" is closest in meaning to ______.', choice1: 'Punishment', choice2: 'Reward', choice3: 'Gift', choice4: 'Bonus', correctAnswer: 1, explanation: 'Penalty หมายถึง บทลงโทษ ตรงกับ Punishment.' }
    ]
  },
  {
    category: 'ภาษาอังกฤษ',
    subcategory: 'Grammar & Structure (ไวยากรณ์และโครงสร้าง)',
    title: 'แบบทดสอบภาษาอังกฤษ: Grammar & Structure (ชุดที่ 1)',
    questions: [
      { questionText: 'Which sentence is grammatically correct?', choice1: 'He don\'t like coffee.', choice2: 'He doesn\'t like coffee.', choice3: 'He not like coffee.', choice4: 'He doesn\'t likes coffee.', correctAnswer: 2, explanation: 'ประธาน He ใช้กริยาช่วย doesn\'t + V.inf (like).' },
      { questionText: 'If it rains tomorrow, we ______ the outdoor training.', choice1: 'cancel', choice2: 'will cancel', choice3: 'canceled', choice4: 'would cancel', correctAnswer: 2, explanation: 'First Conditional: If + Present Simple, will + V.inf.' },
      { questionText: 'She has been working as a police officer ______ five years.', choice1: 'for', choice2: 'since', choice3: 'during', choice4: 'while', correctAnswer: 1, explanation: 'ใช้ "for" กับช่วงระยะเวลา (for five years).' },
      { questionText: 'Neither of the two suspects ______ the truth.', choice1: 'is telling', choice2: 'are telling', choice3: 'were telling', choice4: 'have told', correctAnswer: 1, explanation: 'Neither of + plural noun ใช้กริยาเอกพจน์ (is telling).' },
      { questionText: 'The suspect ______ by the police last night.', choice1: 'was arrested', choice2: 'arrested', choice3: 'is arresting', choice4: 'has arrested', correctAnswer: 1, explanation: 'Passive voice ในอดีต (Past Simple): was + V.3 (was arrested).' },
      { questionText: 'You ______ wear a seatbelt while driving. It is the law.', choice1: 'must', choice2: 'might', choice3: 'could', choice4: 'would', correctAnswer: 1, explanation: 'Must ใช้กับกฎหมายหรือข้อบังคับที่จำเป็นต้องทำ.' },
      { questionText: 'He asked me where I ______ yesterday.', choice1: 'went', choice2: 'go', choice3: 'had gone', choice4: 'going', correctAnswer: 3, explanation: 'Reported speech: Past Simple เปลี่ยนเป็น Past Perfect (had gone).' },
      { questionText: 'There are ______ cars parked in the restricted area.', choice1: 'many', choice2: 'much', choice3: 'a little', choice4: 'any', correctAnswer: 1, explanation: 'Cars เป็นคำนามนับได้พหูพจน์ ใช้ many.' },
      { questionText: 'Please remain seated until the plane ______ completely.', choice1: 'stops', choice2: 'will stop', choice3: 'stopped', choice4: 'stopping', correctAnswer: 1, explanation: 'Time clause หลัง until ใช้ Present Simple (stops).' },
      { questionText: 'She is the officer ______ solved the difficult case.', choice1: 'who', choice2: 'which', choice3: 'whom', choice4: 'whose', correctAnswer: 1, explanation: 'ใช้ Relative pronoun "who" แทนบุคคลที่เป็นประธาน (the officer who solved).' }
    ]
  },

  // ========================================================
  // 4. สังคม วัฒนธรรม และอาเซียน (social)
  // ========================================================
  {
    category: 'สังคม',
    subcategory: 'ประชาคมอาเซียน (AEC)',
    title: 'แบบทดสอบสังคม: ประชาคมอาเซียน (AEC) (ชุดที่ 1)',
    questions: [
      { questionText: 'สมาคมประชาชาติแห่งเอเชียตะวันออกเฉียงใต้ (ASEAN) ก่อตั้งขึ้นเมื่อใด?', choice1: '8 สิงหาคม 2510', choice2: '1 มกราคม 2520', choice3: '5 ธันวาคม 2530', choice4: '14 กุมภาพันธ์ 2540', correctAnswer: 1, explanation: 'อาเซียนก่อตั้งขึ้นโดยปฏิญญากรุงเทพฯ เมื่อวันที่ 8 สิงหาคม พ.ศ. 2510' },
      { questionText: 'ประเทศใดเป็นหนึ่งใน 5 ประเทศผู้ก่อตั้งอาเซียน?', choice1: 'ไทย', choice2: 'เวียดนาม', choice3: 'ลาว', choice4: 'กัมพูชา', correctAnswer: 1, explanation: '5 ประเทศผู้ก่อตั้งคือ ไทย อินโดนีเซีย มาเลเซีย ฟิลิปปินส์ และสิงคโปร์' },
      { questionText: 'สำนักงานเลขาธิการอาเซียน (ASEAN Secretariat) ตั้งอยู่ที่เมืองใด?', choice1: 'กรุงเทพฯ ประเทศไทย', choice2: 'จาการ์ตา ประเทศอินโดนีเซีย', choice3: 'กัวลาลัมเปอร์ ประเทศมาเลเซีย', choice4: 'สิงคโปร์', correctAnswer: 2, explanation: 'สำนักงานใหญ่เลขาธิการอาเซียนตั้งอยู่ที่กรุงจาการ์ตา ประเทศอินโดนีเซีย' },
      { questionText: 'คำขวัญของอาเซียนคือข้อใด?', choice1: 'One Vision, One Identity, One Community', choice2: 'Together We Can', choice3: 'Peace and Prosperity', choice4: 'Unity in Diversity', correctAnswer: 1, explanation: 'คำขวัญอาเซียนคือ "หนึ่งวิสัยทัศน์ หนึ่งเอกลักษณ์ หนึ่งประชาคม"' },
      { questionText: 'สัญลักษณ์ของอาเซียนคือรูปรวงข้าวสีเหลืองกี่ต้นมัดรวมกัน?', choice1: '5 ต้น', choice2: '8 ต้น', choice3: '10 ต้น', choice4: '12 ต้น', correctAnswer: 3, explanation: 'รวงข้าวสีเหลือง 10 ต้น หมายถึง 10 ประเทศสมาชิกอาเซียน' },
      { questionText: 'ภาษาทางการที่ใช้ในการทำงานของอาเซียนคือภาษาใด?', choice1: 'ภาษาอังกฤษ', choice2: 'ภาษาบาฮาซา', choice3: 'ภาษาไทย', choice4: 'ภาษาจีน', correctAnswer: 1, explanation: 'ตามกฎบัตรอาเซียน ข้อ 34 กำหนดให้ภาษาอังกฤษเป็นภาษาทางการ' },
      { questionText: 'เสาหลักของประชาคมอาเซียนประกอบด้วยกี่เสาหลัก?', choice1: '2 เสาหลัก', choice2: '3 เสาหลัก', choice3: '4 เสาหลัก', choice4: '5 เสาหลัก', correctAnswer: 2, explanation: '3 เสาหลัก: การเมืองความมั่นคง (APSC), เศรษฐกิจ (AEC), และสังคมวัฒนธรรม (ASCC)' },
      { questionText: 'ประเทศสมาชิกอาเซียนล่าสุด (ลำดับที่ 10) ที่เข้าเป็นสมาชิกคือประเทศใด?', choice1: 'กัมพูชา', choice2: 'ลาว', choice3: 'เมียนมา', choice4: 'เวียดนาม', correctAnswer: 1, explanation: 'กัมพูชาเข้าเป็นสมาชิกลำดับที่ 10 ในปี พ.ศ. 2542' },
      { questionText: 'วันอาเซียน (ASEAN Day) ตรงกับวันที่เท่าใดของทุกปี?', choice1: '8 สิงหาคม', choice2: '1 มกราคม', choice3: '5 ธันวาคม', choice4: '13 เมษายน', correctAnswer: 1, explanation: 'วันที่ 8 สิงหาคมของทุกปีเป็นวันอาเซียน' },
      { questionText: 'เพลงประจำอาเซียนมีชื่อว่าอะไร?', choice1: 'The ASEAN Way', choice2: 'ASEAN Spirit', choice3: 'One ASEAN', choice4: 'Song of Peace', correctAnswer: 1, explanation: 'เพลงประจำอาเซียนคือ The ASEAN Way' }
    ]
  }
];

async function seedData() {
  console.log('Seeding exam sets and questions for amnuay & prabpram tracks...');
  
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminId = adminUser ? adminUser.id : 31;

  for (const setInfo of mockData) {
    let existingSet = await prisma.examSet.findFirst({
      where: { title: setInfo.title }
    });

    if (!existingSet) {
      existingSet = await prisma.examSet.create({
        data: {
          title: setInfo.title,
          category: setInfo.category,
          subcategory: setInfo.subcategory,
          totalCount: setInfo.questions.length,
          isPublic: true,
          status: 'COMPLETED',
          createdById: adminId
        }
      });
      console.log(`Created exam set: ${setInfo.title} (ID: ${existingSet.id})`);
    }

    const qCount = await prisma.question.count({ where: { examSetId: existingSet.id } });
    if (qCount === 0) {
      await prisma.question.createMany({
        data: setInfo.questions.map((q, idx) => ({
          examSetId: existingSet.id,
          questionText: q.questionText,
          choice1: q.choice1,
          choice2: q.choice2,
          choice3: q.choice3,
          choice4: q.choice4,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          sortOrder: idx + 1
        }))
      });
      console.log(`Inserted ${setInfo.questions.length} questions for set ID ${existingSet.id}`);
    }
  }

  console.log('Seeding completed successfully!');
}

seedData().catch(console.error).finally(() => prisma.$disconnect());

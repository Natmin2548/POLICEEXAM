const fs = require('fs');

// 1. Update admin.html
let html = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/admin.html', 'utf8');

const sidebarMenuHTML = `
      <div class="menu-item" onclick="switchAdminTab('users')">
        <span>👥</span> ผู้ใช้งาน
      </div>
      <div class="menu-item" onclick="switchAdminTab('knowledge')">
        <span>📚</span> AI คลังความรู้
      </div>
`;
if (!html.includes("switchAdminTab('knowledge')")) {
  html = html.replace(
    `<div class="menu-item" onclick="switchAdminTab('users')">\n        <span>👥</span> ผู้ใช้งาน\n      </div>`,
    sidebarMenuHTML
  );
}

const knowledgeTabHTML = `
      <!-- KNOWLEDGE BASE VIEW -->
      <div id="tab-knowledge" class="admin-tab-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2>📚 AI คลังความรู้ (Knowledge Base)</h2>
          <button class="btn-primary" onclick="openAddKnowledgeModal()" style="padding: 10px 20px;">+ เพิ่มเนื้อหาใหม่</button>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <p style="color: #64748B; font-size: 14px; margin-bottom: 20px;">คุณสามารถเพิ่มเนื้อหา (Text) และสั่งให้ AI (Gemini) สร้างข้อสอบอัตโนมัติจากเนื้อหาเหล่านั้นได้</p>
          
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                <th style="padding: 12px;">ID</th>
                <th style="padding: 12px;">ชื่อเอกสาร</th>
                <th style="padding: 12px;">หมวดหมู่</th>
                <th style="padding: 12px;">วันที่เพิ่ม</th>
                <th style="padding: 12px;">จัดการ</th>
              </tr>
            </thead>
            <tbody id="knowledgeTableBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
`;

if (!html.includes('id="tab-knowledge"')) {
  html = html.replace(
    '<!-- USERS VIEW -->',
    knowledgeTabHTML + '\n      <!-- USERS VIEW -->'
  );
}

const modalsHTML = `
  <!-- Add Knowledge Modal -->
  <div class="modal-overlay" id="addKnowledgeModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); align-items: center; justify-content: center; z-index: 100;">
    <div class="modal-card" style="background: white; max-width: 600px; width: 90%; padding: 24px; border-radius: 20px;">
      <h3 style="font-size: 18px; margin-bottom: 16px;">เพิ่มเนื้อหาคลังความรู้ใหม่</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="txtKnowledgeTitle" placeholder="ชื่อเอกสาร (เช่น พ.ร.บ.ตำรวจแห่งชาติ หมวด 1)" style="padding: 8px; border-radius: 8px; border: 1px solid #CBD5E1;">
        <input type="text" id="txtKnowledgeCategory" placeholder="หมวดหมู่ (เช่น กฎหมาย)" style="padding: 8px; border-radius: 8px; border: 1px solid #CBD5E1;">
        <textarea id="txtKnowledgeContent" placeholder="วางเนื้อหา (Text) ที่ต้องการให้ AI อ่านเพื่อออกข้อสอบ..." style="padding: 8px; border-radius: 8px; border: 1px solid #CBD5E1; height: 200px; resize: none;"></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button onclick="document.getElementById('addKnowledgeModal').style.display='none'" style="background: none; border: none; cursor: pointer; color: #64748B;">ยกเลิก</button>
        <button class="btn-primary" onclick="submitKnowledge()" style="padding: 8px 16px;">บันทึกเนื้อหา</button>
      </div>
    </div>
  </div>

  <!-- Generate AI Exam Modal -->
  <div class="modal-overlay" id="generateAiExamModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); align-items: center; justify-content: center; z-index: 100;">
    <div class="modal-card" style="background: white; max-width: 400px; width: 90%; padding: 24px; border-radius: 20px;">
      <h3 style="font-size: 18px; margin-bottom: 16px;">🤖 สั่ง AI สร้างข้อสอบ</h3>
      <p style="font-size: 13px; color: #64748B; margin-bottom: 16px;">AI จะอ่านเอกสารนี้และสร้างข้อสอบปรนัย (4 ตัวเลือก) ให้โดยอัตโนมัติ</p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="hidden" id="hdnGenerateDocId">
        <div>
          <label style="font-size: 13px;">ชื่อชุดข้อสอบ (จะถูกบันทึกเป็นชุดข้อสอบใหม่):</label>
          <input type="text" id="txtGenerateTitle" placeholder="เช่น แบบทดสอบกฎหมาย AI" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #CBD5E1;">
        </div>
        <div>
          <label style="font-size: 13px;">จำนวนข้อที่ต้องการ (แนะนำ 5-20 ข้อ):</label>
          <input type="number" id="numGenerateCount" value="10" min="1" max="50" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #CBD5E1;">
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button onclick="document.getElementById('generateAiExamModal').style.display='none'" style="background: none; border: none; cursor: pointer; color: #64748B;" id="btnCancelGenerate">ยกเลิก</button>
        <button class="btn-primary" onclick="submitAiGenerate()" id="btnSubmitGenerate" style="padding: 8px 16px; background-color: #8B5CF6;">✨ สร้างข้อสอบด้วย AI</button>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="addKnowledgeModal"')) {
  html = html.replace('</body>', modalsHTML + '\n</body>');
}

fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/admin.html', html);
console.log('admin.html updated');

// 2. Update admin.js
let js = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/admin.js', 'utf8');

const jsToAdd = `
// ==========================================
// KNOWLEDGE BASE (AI GENERATOR)
// ==========================================

async function loadKnowledgeDocs() {
  try {
    const res = await fetch(\`\${API_BASE}/api/admin/knowledge\`, {
      headers: { 'Authorization': \`Bearer \${adminAuthToken}\` }
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge docs');
    const docs = await res.json();
    
    const tbody = document.getElementById('knowledgeTableBody');
    if (!tbody) return;
    
    let html = '';
    docs.forEach(d => {
      const dateStr = new Date(d.createdAt).toLocaleString('th-TH');
      html += \`
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px;">\${d.id}</td>
          <td style="padding: 12px; font-weight: 500;">\${d.title}</td>
          <td style="padding: 12px;">\${d.category}</td>
          <td style="padding: 12px;">\${dateStr}</td>
          <td style="padding: 12px; display: flex; gap: 8px;">
            <button onclick="openAiGenerateModal(\${d.id}, '\${d.title}')" style="background: #8B5CF6; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">✨ ให้ AI ออกข้อสอบ</button>
            <button onclick="deleteKnowledgeDoc(\${d.id})" style="background: #EF4444; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">ลบ</button>
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html || '<tr><td colspan="5" style="text-align:center; padding: 20px;">ยังไม่มีข้อมูลคลังความรู้</td></tr>';
  } catch (err) {
    console.error(err);
  }
}

window.openAddKnowledgeModal = function() {
  document.getElementById('txtKnowledgeTitle').value = '';
  document.getElementById('txtKnowledgeCategory').value = '';
  document.getElementById('txtKnowledgeContent').value = '';
  document.getElementById('addKnowledgeModal').style.display = 'flex';
};

window.submitKnowledge = async function() {
  const title = document.getElementById('txtKnowledgeTitle').value.trim();
  const category = document.getElementById('txtKnowledgeCategory').value.trim();
  const content = document.getElementById('txtKnowledgeContent').value.trim();
  
  if (!title || !content) return alert('กรุณากรอกชื่อและเนื้อหาเอกสาร');
  
  try {
    const res = await fetch(\`\${API_BASE}/api/admin/knowledge\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${adminAuthToken}\`
      },
      body: JSON.stringify({ title, category, content })
    });
    
    if (res.ok) {
      document.getElementById('addKnowledgeModal').style.display = 'none';
      loadKnowledgeDocs();
    } else {
      alert('Failed to save document');
    }
  } catch (err) {
    alert(err.message);
  }
};

window.deleteKnowledgeDoc = async function(id) {
  if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
  try {
    const res = await fetch(\`\${API_BASE}/api/admin/knowledge/\${id}\`, {
      method: 'DELETE',
      headers: { 'Authorization': \`Bearer \${adminAuthToken}\` }
    });
    if (res.ok) loadKnowledgeDocs();
  } catch (err) {
    alert(err.message);
  }
};

window.openAiGenerateModal = function(id, title) {
  document.getElementById('hdnGenerateDocId').value = id;
  document.getElementById('txtGenerateTitle').value = \`แบบทดสอบ: \${title}\`;
  document.getElementById('numGenerateCount').value = 10;
  document.getElementById('generateAiExamModal').style.display = 'flex';
};

window.submitAiGenerate = async function() {
  const id = document.getElementById('hdnGenerateDocId').value;
  const examTitle = document.getElementById('txtGenerateTitle').value;
  const questionCount = parseInt(document.getElementById('numGenerateCount').value);
  
  const btnSubmit = document.getElementById('btnSubmitGenerate');
  const btnCancel = document.getElementById('btnCancelGenerate');
  
  btnSubmit.disabled = true;
  btnCancel.disabled = true;
  btnSubmit.textContent = '⏳ กำลังให้ AI ประมวลผลและสร้างข้อสอบ... (อาจใช้เวลา 10-30 วินาที)';
  
  try {
    const res = await fetch(\`\${API_BASE}/api/admin/knowledge/\${id}/generate\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${adminAuthToken}\`
      },
      body: JSON.stringify({ examTitle, questionCount })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate');
    
    alert(\`✨ สร้างข้อสอบสำเร็จแล้ว! จำนวน \${data.count} ข้อ ไปดูได้ที่แท็บ 'จัดการข้อสอบ'\`);
    document.getElementById('generateAiExamModal').style.display = 'none';
    loadExamsList(); // refresh exams list
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btnSubmit.disabled = false;
    btnCancel.disabled = false;
    btnSubmit.textContent = '✨ สร้างข้อสอบด้วย AI';
  }
};
`;

if (!js.includes('loadKnowledgeDocs()')) {
  js += '\n' + jsToAdd;
  
  // Also add loadKnowledgeDocs() to switchAdminTab
  js = js.replace(
    "if (tabId === 'exams') loadExamsList();",
    "if (tabId === 'exams') loadExamsList();\n  if (tabId === 'knowledge') loadKnowledgeDocs();"
  );
  
  fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/home/js/admin.js', js);
  console.log('admin.js updated');
}

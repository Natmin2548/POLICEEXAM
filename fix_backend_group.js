const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', 'utf8');

const apiToAdd = `
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
`;

if (!code.includes("app.put('/api/community/groups/:groupId', authenticateToken")) {
    code = code.replace(
        "app.post('/api/community/groups', authenticateToken",
        apiToAdd + "\napp.post('/api/community/groups', authenticateToken"
    );
    fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', code);
    console.log('Backend group update API added successfully');
} else {
    console.log('API already exists');
}

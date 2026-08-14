const fs = require('fs');
let code = fs.readFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', 'utf8');

// 1. Update group creation to set role = 'ADMIN'
const createGroupTarget = `
      // Add creator as member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: req.user.userId,
          status: 'ACCEPTED'
        }
      });
`;
const createGroupReplacement = `
      // Add creator as member (ADMIN)
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: req.user.userId,
          status: 'ACCEPTED',
          role: 'ADMIN'
        }
      });
`;
if (code.includes('userId: req.user.userId,\n          status: \'ACCEPTED\'')) {
    code = code.replace(/userId:\s*req\.user\.userId,\s*status:\s*'ACCEPTED'/g, 'userId: req.user.userId,\n          status: \'ACCEPTED\',\n          role: \'ADMIN\'');
}

// 2. Add member management APIs before app.get('/api/community/groups/:id/chat'
const apisToAdd = `
// Get members of a group
app.get('/api/community/groups/:groupId/members', authenticateToken, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId, status: 'ACCEPTED' },
      include: {
        user: { select: { id: true, username: true, fullName: true, faceImage: true } }
      }
    });
    res.json(members);
  } catch (err) {
    console.error('Fetch group members error:', err);
    res.status(500).json({ error: 'ไม่สามารถโหลดรายชื่อสมาชิกได้' });
  }
});

// Update member role (Promote to Admin / Demote)
app.put('/api/community/groups/:groupId/members/:userId/role', authenticateToken, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const targetUserId = parseInt(req.params.userId);
  const { role } = req.body; // 'ADMIN' or 'MEMBER'

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
  }

  try {
    // Check if current user is ADMIN or CREATOR
    const currentMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.userId } },
      include: { group: true }
    });

    if (!currentMember || (currentMember.role !== 'ADMIN' && currentMember.group.createdById !== req.user.userId)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์จัดการแอดมินกลุ่มนี้' });
    }

    if (currentMember.group.createdById === targetUserId) {
        return res.status(400).json({ error: 'ไม่สามารถเปลี่ยนสถานะของผู้สร้างกลุ่มได้' });
    }

    const updated = await prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data: { role }
    });
    res.json(updated);
  } catch (err) {
    console.error('Update group member role error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตบทบาทได้' });
  }
});

// Kick member
app.delete('/api/community/groups/:groupId/members/:userId', authenticateToken, async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const targetUserId = parseInt(req.params.userId);

  try {
    // Check if current user is ADMIN or CREATOR
    const currentMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.user.userId } },
      include: { group: true }
    });

    if (!currentMember || (currentMember.role !== 'ADMIN' && currentMember.group.createdById !== req.user.userId)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เตะสมาชิกกลุ่มนี้' });
    }

    if (currentMember.group.createdById === targetUserId) {
      return res.status(400).json({ error: 'ไม่สามารถเตะผู้สร้างกลุ่มได้' });
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } }
    });
    res.json({ success: true, message: 'ลบสมาชิกเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Kick group member error:', err);
    res.status(500).json({ error: 'ไม่สามารถลบสมาชิกได้' });
  }
});
`;

if (!code.includes('/api/community/groups/:groupId/members/:userId/role')) {
    code = code.replace(
        "app.get('/api/community/groups/:id/chat', authenticateToken, async (req, res) => {",
        apisToAdd + "\napp.get('/api/community/groups/:id/chat', authenticateToken, async (req, res) => {"
    );
    fs.writeFileSync('c:/Users/minam/OneDrive/เดสก์ท็อป/ฤ/server/index.js', code);
    console.log('Backend APIs updated successfully');
} else {
    console.log('APIs already exist');
}

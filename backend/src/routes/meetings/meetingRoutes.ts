import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// Helper to check membership
const checkWorkspaceAccess = async (workspaceId: string, userId: string): Promise<boolean> => {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return !!member;
};

// @route   POST /api/meetings
// @desc    Create/schedule a meeting inside a workspace
router.post('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { workspaceId, title } = req.body;
  const userId = req.user?.id;

  if (!workspaceId) {
     res.status(400).json({ message: 'workspaceId is required' });
     return;
  }

  try {
     const isMember = await checkWorkspaceAccess(workspaceId, userId!);
     if (!isMember) {
        res.status(403).json({ message: 'Access denied to creating meetings' });
        return;
     }

     const meeting = await prisma.meeting.create({
       data: {
         workspaceId,
         hostId: userId!,
         title: title || 'Sync Meeting',
         isActive: true,
       },
       include: {
         host: {
           select: {
             id: true,
             name: true,
             email: true,
             avatarUrl: true,
           },
         },
       },
     });

     res.status(201).json(meeting);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/meetings/:id
// @desc    Get meeting session details
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!meeting) {
      res.status(404).json({ message: 'Meeting session not found' });
      return;
    }

    // Verify workspace membership
    const isMember = await checkWorkspaceAccess(meeting.workspaceId, userId!);
    if (!isMember) {
      res.status(403).json({ message: 'Access denied to this meeting content' });
      return;
    }

    res.json(meeting);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/meetings/:id/end
// @desc    End active meeting session
router.post('/:id/end', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      res.status(404).json({ message: 'Meeting session not found' });
      return;
    }

    // Validate that the host (or workspace owners/admins) is ending the meeting
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: meeting.workspaceId,
          userId: userId!,
        },
      },
    });

    if (!membership) {
       res.status(403).json({ message: 'Access denied' });
       return;
    }

    const isHost = meeting.hostId === userId;
    const isManager = membership.role === 'OWNER' || membership.role === 'ADMIN';

    if (!isHost && !isManager) {
      res.status(403).json({ message: 'Only the meeting host or workspace admins can end meetings' });
      return;
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

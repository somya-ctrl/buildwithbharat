import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { MemberRole } from '@prisma/client';

const router = Router();

// @route   POST /api/workspaces
// @desc    Create a workspace
router.post('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name || !userId) {
    res.status(400).json({ message: 'Workspace name is required' });
    return;
  }

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const ws = await tx.workspace.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      // 2. Add creator as OWNER member
      await tx.workspaceMember.create({
        data: {
          workspaceId: ws.id,
          userId,
          role: MemberRole.OWNER,
        },
      });

      // 3. Create a default root folder for files
      await tx.file.create({
        data: {
          workspaceId: ws.id,
          name: 'src',
          isFolder: true,
          createdById: userId,
        },
      });

      return ws;
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces
// @desc    Get all workspaces where client is a member
router.get('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const workspaces = memberships.map((m) => m.workspace);
    res.json(workspaces);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces/:id
// @desc    Get details of a workspace
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    // Verify client is member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
    });

    if (!member) {
      res.status(403).json({ message: 'Access denied: not a member of this workspace' });
      return;
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    res.json(workspace);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/workspaces/:id
// @desc    Rename a workspace
router.patch('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name } = req.body;
  const userId = req.user?.id;

  try {
    // Only owner or admin can rename
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
    });

    if (!member || (member.role !== MemberRole.OWNER && member.role !== MemberRole.ADMIN)) {
      res.status(403).json({ message: 'Only owners or admins can rename the workspace' });
      return;
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/workspaces/:id
// @desc    Delete a workspace
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    // Only owner can delete the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    if (workspace.ownerId !== userId) {
      res.status(403).json({ message: 'Only the owner can delete this workspace' });
      return;
    }

    await prisma.workspace.delete({
      where: { id },
    });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/workspaces/:id/invite
// @desc    Invite a member to workspace by email
router.post('/:id/invite', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { email } = req.body;
  const userId = req.user?.id;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  try {
    // Check if the current user is a member (only members can invite)
    const inviter = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!inviter) {
      res.status(403).json({ message: 'Access denied: not a member of this workspace' });
      return;
    }

    // Find the user to invite
    const invitee = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!invitee) {
      res.status(404).json({ message: 'User not found with this email' });
      return;
    }

    // Check if already member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      res.status(400).json({ message: 'User is already a member of this workspace' });
      return;
    }

    // Add to workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: invitee.id,
        role: MemberRole.MEMBER,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create a Notification for invitee
    await prisma.notification.create({
      data: {
        userId: invitee.id,
        text: `You have been added to the workspace "${(inviter as any).workspace.name}" by ${req.user?.name}.`,
      },
    });

    res.status(201).json(newMember);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces/:id/members
// @desc    Get all members of a workspace
router.get('/:id/members', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    // Check if user is a member
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/workspaces/:id/members/:memberId
// @desc    Remove a member from the workspace (memberId can be User.id or WorkspaceMember.id)
router.delete('/:id/members/:memberId', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const memberId = req.params.memberId as string;
  const userId = req.user?.id;

  try {
    // Find workspace membership of current user
    const currentUserMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
    });

    if (!currentUserMember) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Try finding the member record to delete. Support memberId being Either user's ID or workspace member ID.
    const memberToDelete = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        OR: [
          { id: memberId },
          { userId: memberId },
        ],
      },
    });

    if (!memberToDelete) {
      res.status(404).json({ message: 'Member not found in workspace' });
      return;
    }

    // Ownership logic: owner cannot be removed this way.
    if (memberToDelete.role === MemberRole.OWNER) {
      res.status(400).json({ message: 'Workspace Owner cannot be removed. Delete the workspace instead.' });
      return;
    }

    // Permission checks:
    // 1. Owner or Admin can delete anyone (except Owner)
    // 2. A user can remove themselves (leave workspace)
    const isSelfRemove = memberToDelete.userId === userId;
    const isManager = currentUserMember.role === MemberRole.OWNER || currentUserMember.role === MemberRole.ADMIN;

    if (!isSelfRemove && !isManager) {
      res.status(403).json({ message: 'Permission denied to remove this member' });
      return;
    }

    await prisma.workspaceMember.delete({
      where: { id: memberToDelete.id },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces/:id/messages
// @desc    Get chat message history for a workspace
router.get('/:id/messages', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    // Check if user is a member
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId: userId!,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ message: 'Access denied: not a member of this workspace' });
      return;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

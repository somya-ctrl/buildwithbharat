import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// @route   GET /api/users/search
// @desc    Search for users to invite or collaborate with
router.get('/search', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query || query.trim() === '') {
    res.json([]);
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        NOT: {
          id: req.user?.id, // exclude self
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        workspaceMembers: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/users/profile
// @desc    Update user profile
router.patch('/profile', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, avatarUrl, password } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

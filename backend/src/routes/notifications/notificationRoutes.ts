import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/notifications/read
// @desc    Mark notifications as read (either specific array of IDs or all of them)
router.patch('/read', protect, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { ids } = req.body; // Expect an array of string notification IDs (optional)

  try {
    const queryConditions: any = { userId };

    if (ids && Array.isArray(ids) && ids.length > 0) {
      queryConditions.id = { in: ids };
    }

    const updated = await prisma.notification.updateMany({
      where: queryConditions,
      data: { isRead: true },
    });

    res.json({
      message: 'Notifications marked as read successfully',
      count: updated.count,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

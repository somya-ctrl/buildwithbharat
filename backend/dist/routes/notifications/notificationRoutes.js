"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
router.get('/', authMiddleware_1.protect, async (req, res) => {
    const userId = req.user?.id;
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   PATCH /api/notifications/read
// @desc    Mark notifications as read (either specific array of IDs or all of them)
router.patch('/read', authMiddleware_1.protect, async (req, res) => {
    const userId = req.user?.id;
    const { ids } = req.body; // Expect an array of string notification IDs (optional)
    try {
        const queryConditions = { userId };
        if (ids && Array.isArray(ids) && ids.length > 0) {
            queryConditions.id = { in: ids };
        }
        const updated = await prisma_1.default.notification.updateMany({
            where: queryConditions,
            data: { isRead: true },
        });
        res.json({
            message: 'Notifications marked as read successfully',
            count: updated.count,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;

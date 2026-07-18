"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Helper to check membership
const checkWorkspaceAccess = async (workspaceId, userId) => {
    const member = await prisma_1.default.workspaceMember.findUnique({
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
router.post('/', authMiddleware_1.protect, async (req, res) => {
    const { workspaceId, title } = req.body;
    const userId = req.user?.id;
    if (!workspaceId) {
        res.status(400).json({ message: 'workspaceId is required' });
        return;
    }
    try {
        const isMember = await checkWorkspaceAccess(workspaceId, userId);
        if (!isMember) {
            res.status(403).json({ message: 'Access denied to creating meetings' });
            return;
        }
        const meeting = await prisma_1.default.meeting.create({
            data: {
                workspaceId,
                hostId: userId,
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/meetings/:id
// @desc    Get meeting session details
router.get('/:id', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        const meeting = await prisma_1.default.meeting.findUnique({
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
        const isMember = await checkWorkspaceAccess(meeting.workspaceId, userId);
        if (!isMember) {
            res.status(403).json({ message: 'Access denied to this meeting content' });
            return;
        }
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   POST /api/meetings/:id/end
// @desc    End active meeting session
router.post('/:id/end', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id },
        });
        if (!meeting) {
            res.status(404).json({ message: 'Meeting session not found' });
            return;
        }
        // Validate that the host (or workspace owners/admins) is ending the meeting
        const membership = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: meeting.workspaceId,
                    userId: userId,
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
        const updated = await prisma_1.default.meeting.update({
            where: { id },
            data: {
                isActive: false,
                endedAt: new Date(),
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;

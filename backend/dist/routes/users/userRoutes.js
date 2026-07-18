"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// @route   GET /api/users/search
// @desc    Search for users to invite or collaborate with
router.get('/search', authMiddleware_1.protect, async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === '') {
        res.json([]);
        return;
    }
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/users/:id
// @desc    Get user profile by ID
router.get('/:id', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   PATCH /api/users/profile
// @desc    Update user profile
router.patch('/profile', authMiddleware_1.protect, async (req, res) => {
    const { name, avatarUrl, password } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const updateData = {};
        if (name)
            updateData.name = name;
        if (avatarUrl)
            updateData.avatarUrl = avatarUrl;
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(password, salt);
        }
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;

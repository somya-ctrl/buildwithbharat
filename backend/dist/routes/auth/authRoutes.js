"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Generate Token
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'hackathon_secret_key_123';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
};
// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: 'Name, email, and password are required' });
        return;
    }
    try {
        // Check if user exists
        const userExists = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        const token = generateToken({ id: user.id });
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({
            user,
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = generateToken({ id: user.id });
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', authMiddleware_1.protect, async (req, res) => {
    res.json({ user: req.user });
});
// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie
router.post('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
});
exports.default = router;

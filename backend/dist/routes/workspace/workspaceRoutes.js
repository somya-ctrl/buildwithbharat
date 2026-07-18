"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// @route   POST /api/workspaces
// @desc    Create a workspace
router.post('/', authMiddleware_1.protect, async (req, res) => {
    const { name } = req.body;
    const userId = req.user?.id;
    if (!name || !userId) {
        res.status(400).json({ message: 'Workspace name is required' });
        return;
    }
    try {
        const workspace = await prisma_1.default.$transaction(async (tx) => {
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
                    role: client_1.MemberRole.OWNER,
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/workspaces
// @desc    Get all workspaces where client is a member
router.get('/', authMiddleware_1.protect, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const memberships = await prisma_1.default.workspaceMember.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/workspaces/:id
// @desc    Get details of a workspace
router.get('/:id', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        // Verify client is member
        const member = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
                },
            },
        });
        if (!member) {
            res.status(403).json({ message: 'Access denied: not a member of this workspace' });
            return;
        }
        const workspace = await prisma_1.default.workspace.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   PATCH /api/workspaces/:id
// @desc    Rename a workspace
router.patch('/:id', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    const userId = req.user?.id;
    try {
        // Only owner or admin can rename
        const member = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
                },
            },
        });
        if (!member || (member.role !== client_1.MemberRole.OWNER && member.role !== client_1.MemberRole.ADMIN)) {
            res.status(403).json({ message: 'Only owners or admins can rename the workspace' });
            return;
        }
        const updated = await prisma_1.default.workspace.update({
            where: { id },
            data: { name },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   DELETE /api/workspaces/:id
// @desc    Delete a workspace
router.delete('/:id', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        // Only owner can delete the workspace
        const workspace = await prisma_1.default.workspace.findUnique({
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
        await prisma_1.default.workspace.delete({
            where: { id },
        });
        res.json({ message: 'Workspace deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   POST /api/workspaces/:id/invite
// @desc    Invite a member to workspace by email
router.post('/:id/invite', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const { email } = req.body;
    const userId = req.user?.id;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        // Check if the current user is a member (only members can invite)
        const inviter = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
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
        const invitee = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!invitee) {
            res.status(404).json({ message: 'User not found with this email' });
            return;
        }
        // Check if already member
        const existingMember = await prisma_1.default.workspaceMember.findUnique({
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
        const newMember = await prisma_1.default.workspaceMember.create({
            data: {
                workspaceId: id,
                userId: invitee.id,
                role: client_1.MemberRole.MEMBER,
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
        await prisma_1.default.notification.create({
            data: {
                userId: invitee.id,
                text: `You have been added to the workspace "${inviter.workspace.name}" by ${req.user?.name}.`,
            },
        });
        res.status(201).json(newMember);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/workspaces/:id/members
// @desc    Get all members of a workspace
router.get('/:id/members', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        // Check if user is a member
        const isMember = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
                },
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        const members = await prisma_1.default.workspaceMember.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   DELETE /api/workspaces/:id/members/:memberId
// @desc    Remove a member from the workspace (memberId can be User.id or WorkspaceMember.id)
router.delete('/:id/members/:memberId', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user?.id;
    try {
        // Find workspace membership of current user
        const currentUserMember = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
                },
            },
        });
        if (!currentUserMember) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Try finding the member record to delete. Support memberId being Either user's ID or workspace member ID.
        const memberToDelete = await prisma_1.default.workspaceMember.findFirst({
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
        if (memberToDelete.role === client_1.MemberRole.OWNER) {
            res.status(400).json({ message: 'Workspace Owner cannot be removed. Delete the workspace instead.' });
            return;
        }
        // Permission checks:
        // 1. Owner or Admin can delete anyone (except Owner)
        // 2. A user can remove themselves (leave workspace)
        const isSelfRemove = memberToDelete.userId === userId;
        const isManager = currentUserMember.role === client_1.MemberRole.OWNER || currentUserMember.role === client_1.MemberRole.ADMIN;
        if (!isSelfRemove && !isManager) {
            res.status(403).json({ message: 'Permission denied to remove this member' });
            return;
        }
        await prisma_1.default.workspaceMember.delete({
            where: { id: memberToDelete.id },
        });
        res.json({ message: 'Member removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// @route   GET /api/workspaces/:id/messages
// @desc    Get chat message history for a workspace
router.get('/:id/messages', authMiddleware_1.protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user?.id;
    try {
        // Check if user is a member
        const isMember = await prisma_1.default.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: userId,
                },
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Access denied: not a member of this workspace' });
            return;
        }
        const messages = await prisma_1.default.chatMessage.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.default = router;

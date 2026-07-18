import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { protect, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// Middleware to verify user has access to a workspace
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

// Middleware to verify user has access to a file's workspace
const checkFileAccess = async (fileId: string, userId: string): Promise<any | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });
  if (!file) return null;

  const accessible = await checkWorkspaceAccess(file.workspaceId, userId);
  return accessible ? file : null;
};

// @route   GET /api/workspaces/:id/files
// @desc    Get all files in a workspace
// Used in Express routing by merging workspace routes, but we can declare it here as `/workspace/:id`
router.get('/workspace/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const workspaceId = req.params.id as string;
  const userId = req.user?.id;

  try {
    const isMember = await checkWorkspaceAccess(workspaceId, userId!);
    if (!isMember) {
      res.status(403).json({ message: 'Access denied to workspace files' });
      return;
    }

    const files = await prisma.file.findMany({
      where: { workspaceId },
      orderBy: [
        { isFolder: 'desc' },
        { name: 'asc' },
      ],
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/files
// @desc    Create a file or folder
router.post('/', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { workspaceId, name, parentId, isFolder } = req.body;
  const userId = req.user?.id;

  if (!workspaceId || !name) {
    res.status(400).json({ message: 'workspaceId and name are required' });
    return;
  }

  try {
    const isMember = await checkWorkspaceAccess(workspaceId, userId!);
    if (!isMember) {
      res.status(403).json({ message: 'Access denied: not a member of this workspace' });
      return;
    }

    // Verify parent is a folder and is in the same workspace (if parentId exists)
    if (parentId) {
      const parent = await prisma.file.findUnique({
        where: { id: parentId },
      });

      if (!parent || !parent.isFolder || parent.workspaceId !== workspaceId) {
        res.status(400).json({ message: 'Invalid parent folder' });
        return;
      }
    }

    const file = await prisma.$transaction(async (tx) => {
      const newFile = await tx.file.create({
        data: {
          workspaceId,
          name,
          parentId: parentId || null,
          isFolder: !!isFolder,
          createdById: userId!,
          content: '',
        },
      });

      // Log initial version if it is a file (not folder)
      if (!isFolder) {
        await tx.fileVersion.create({
          data: {
            fileId: newFile.id,
            content: '',
            versionNumber: 1,
            updatedById: userId!,
          },
        });
      }

      return newFile;
    });

    res.status(201).json(file);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/files/:id
// @desc    Rename a file or folder
router.patch('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name) {
    res.status(400).json({ message: 'Name is required to rename' });
    return;
  }

  try {
    const file = await checkFileAccess(id, userId!);
    if (!file) {
      res.status(403).json({ message: 'File not found or access denied' });
      return;
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { name },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file or folder
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    const file = await checkFileAccess(id, userId!);
    if (!file) {
      res.status(403).json({ message: 'File not found or access denied' });
      return;
    }

    // Cascade delete is handled by database when deleting because we configured onDelete: Cascade in schema!
    await prisma.file.delete({
      where: { id },
    });

    res.json({ message: 'File/folder deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/files/:id/content
// @desc    Get file content
router.get('/:id/content', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = req.user?.id;

  try {
    const file = await checkFileAccess(id, userId!);
    if (!file) {
      res.status(403).json({ message: 'File not found or access denied' });
      return;
    }

    if (file.isFolder) {
      res.status(400).json({ message: 'Cannot retrieve content of a folder' });
      return;
    }

    res.json({
      id: file.id,
      name: file.name,
      content: file.content,
      updatedAt: file.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/files/:id/content
// @desc    Save/overwrite file content
router.put('/:id/content', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { content } = req.body;
  const userId = req.user?.id;

  if (content === undefined) {
    res.status(400).json({ message: 'Content is required' });
    return;
  }

  try {
    const file = await checkFileAccess(id, userId!);
    if (!file) {
      res.status(403).json({ message: 'File not found or access denied' });
      return;
    }

    if (file.isFolder) {
      res.status(400).json({ message: 'Cannot write content to a folder' });
      return;
    }

    const updatedFile = await prisma.$transaction(async (tx) => {
      // 1. Update file content
      const updated = await tx.file.update({
        where: { id },
        data: { content },
      });

      // 2. Get highest version number
      const latestVersion = await tx.fileVersion.findFirst({
        where: { fileId: id },
        orderBy: { versionNumber: 'desc' },
      });

      const nextVersionNum = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // 3. Save new version history
      await tx.fileVersion.create({
        data: {
          fileId: id,
          content,
          versionNumber: nextVersionNum,
          updatedById: userId!,
        },
      });

      return updated;
    });

    res.json({
      id: updatedFile.id,
      name: updatedFile.name,
      content: updatedFile.content,
      updatedAt: updatedFile.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

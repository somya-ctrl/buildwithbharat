import { Server, Socket } from 'socket.io';
import prisma from '../lib/prisma';

// Simple in-memory user track map for presence, in case Redis is not used/active
const activeUsers = new Map<string, { socketId: string; userId: string; name: string; avatarUrl?: string | null }>();

export const initSocketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Map connection info
    let currentUserId: string | null = null;
    let currentWorkspaceId: string | null = null;
    let currentFileId: string | null = null;
    let userName: string = 'Anonymous';
    let userAvatar: string | null = null;

    // ==========================================
    // PRESENCE / JOIN WORKSPACE EVENTS
    // ==========================================
    socket.on('workspace:join', async (data: { workspaceId: string; userId: string; name: string; avatarUrl?: string | null }) => {
      const { workspaceId, userId, name, avatarUrl } = data;
      
      currentUserId = userId;
      currentWorkspaceId = workspaceId;
      userName = name;
      userAvatar = avatarUrl || null;

      // Join room
      socket.join(`workspace:${workspaceId}`);
      console.log(`User ${name} joined workspace workspace:${workspaceId}`);

      // Track online status
      activeUsers.set(userId, {
        socketId: socket.id,
        userId,
        name,
        avatarUrl,
      });

      // Broadcast user is online
      io.to(`workspace:${workspaceId}`).emit('user:online', {
        userId,
        name,
        avatarUrl,
        workspaceId,
      });

      // Send list of all currently active users in workspace
      const onlineTeammates = Array.from(activeUsers.values());
      socket.emit('workspace:active-users', onlineTeammates);
    });

    socket.on('workspace:leave', () => {
      if (currentWorkspaceId && currentUserId) {
        socket.leave(`workspace:${currentWorkspaceId}`);
        io.to(`workspace:${currentWorkspaceId}`).emit('user:offline', {
          userId: currentUserId,
        });
        console.log(`User ${currentUserId} left workspace:${currentWorkspaceId}`);
      }
    });

    // ==========================================
    // EDITOR COLLABORATION EVENTS
    // ==========================================
    socket.on('editor:join', (data: { fileId: string; user: { id: string; name: string; avatarUrl?: string | null } }) => {
      const { fileId, user } = data;
      currentFileId = fileId;
      
      socket.join(`editor:${fileId}`);
      console.log(`User ${user.name} joined editor:${fileId}`);

      // Notify others in file editor room
      socket.to(`editor:${fileId}`).emit('editor:user-joined', {
        userId: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    });

    socket.on('editor:leave', (data: { fileId: string; userId: string }) => {
      const { fileId, userId } = data;
      socket.leave(`editor:${fileId}`);
      socket.to(`editor:${fileId}`).emit('editor:user-left', { userId });
      if (currentFileId === fileId) {
        currentFileId = null;
      }
    });

    socket.on('editor:cursor', (data: { fileId: string; cursor: { line: number; ch: number }; user: { id: string; name: string; color?: string } }) => {
      const { fileId, cursor, user } = data;
      // Broadcast cursor movements to everyone else in this file's editor room
      socket.to(`editor:${fileId}`).emit('editor:cursor', {
        userId: user.id,
        name: user.name,
        color: user.color || '#3b82f6',
        cursor,
      });
    });

    socket.on('editor:update', (data: { fileId: string; changes: any; content?: string }) => {
      const { fileId, changes, content } = data;
      // Broadcast doc structure modifications to other clients in editor room
      socket.to(`editor:${fileId}`).emit('editor:update', {
        changes,
        content,
      });
    });

    socket.on('editor:save', (data: { fileId: string; userId: string }) => {
      const { fileId, userId } = data;
      socket.to(`editor:${fileId}`).emit('editor:save', { fileId, userId });
    });

    socket.on('editor:typing', (data: { fileId: string; userId: string; isTyping: boolean }) => {
      const { fileId, userId, isTyping } = data;
      socket.to(`editor:${fileId}`).emit('editor:typing', {
        userId,
        isTyping,
      });
    });

    // ==========================================
    // CHAT SYSTEM EVENTS
    // ==========================================
    socket.on('chat:send', async (data: { workspaceId: string; senderId: string; text: string }) => {
      const { workspaceId, senderId, text } = data;

      if (!workspaceId || !senderId || !text) return;

      try {
        // Save to database
        const message = await prisma.chatMessage.create({
          data: {
            workspaceId,
            senderId,
            text,
          },
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

        // Broadcast message to everyone else in the workspace (sender already
        // shows it optimistically on their own screen)
        socket.to(`workspace:${workspaceId}`).emit('chat:receive', message);
      } catch (err) {
        console.error('Error saving chat message to db via socket:', err);
      }
    });

    socket.on('chat:typing', (data: { workspaceId: string; userId: string; name: string; isTyping: boolean }) => {
      const { workspaceId, userId, name, isTyping } = data;
      socket.to(`workspace:${workspaceId}`).emit('chat:typing', {
        userId,
        name,
        isTyping,
      });
    });

    // ==========================================
    // FILES UPDATES LIVE EVENTS
    // ==========================================
    socket.on('file:create', (data: { workspaceId: string; file: any }) => {
      const { workspaceId, file } = data;
      socket.to(`workspace:${workspaceId}`).emit('file:created', file);
    });

    socket.on('file:update', (data: { workspaceId: string; file: any }) => {
      const { workspaceId, file } = data;
      socket.to(`workspace:${workspaceId}`).emit('file:updated', file);
    });

    socket.on('file:delete', (data: { workspaceId: string; fileId: string }) => {
      const { workspaceId, fileId } = data;
      socket.to(`workspace:${workspaceId}`).emit('file:deleted', fileId);
    });

    // ==========================================
    // WEBRTC VIDEO CALL SIGNALING
    // ==========================================
    socket.on('call:join', (data: { meetingId: string; userId: string; name: string }) => {
      const { meetingId, userId, name } = data;
      socket.join(`call:${meetingId}`);
      console.log(`User ${name} joint call:${meetingId}`);
      
      socket.to(`call:${meetingId}`).emit('call:joined', { userId, name });
    });

    socket.on('call:leave', (data: { meetingId: string; userId: string }) => {
      const { meetingId, userId } = data;
      socket.leave(`call:${meetingId}`);
      socket.to(`call:${meetingId}`).emit('call:left', { userId });
    });

    socket.on('call:offer', (data: { meetingId: string; offer: any; to: string; from: string }) => {
      const { meetingId, offer, to, from } = data;
      socket.to(`call:${meetingId}`).emit('call:offer', { offer, to, from });
    });

    socket.on('call:answer', (data: { meetingId: string; answer: any; to: string; from: string }) => {
      const { meetingId, answer, to, from } = data;
      socket.to(`call:${meetingId}`).emit('call:answer', { answer, to, from });
    });

    socket.on('call:iceCandidate', (data: { meetingId: string; candidate: any; to: string; from: string }) => {
      const { meetingId, candidate, to, from } = data;
      socket.to(`call:${meetingId}`).emit('call:iceCandidate', { candidate, to, from });
    });

    // Screen shares
    socket.on('screen:start', (data: { workspaceId: string; userId: string; streamId: string }) => {
      const { workspaceId, userId, streamId } = data;
      socket.to(`workspace:${workspaceId}`).emit('screen:started', { userId, streamId });
    });

    socket.on('screen:stop', (data: { workspaceId: string; userId: string }) => {
      const { workspaceId, userId } = data;
      socket.to(`workspace:${workspaceId}`).emit('screen:stopped', { userId });
    });

    // ==========================================
    // AI RESPONSE STREAM SIGNALING
    // ==========================================
    socket.on('ai:chat', async (data: { workspaceId: string; prompt: string; code?: string }) => {
      const { workspaceId, prompt, code } = data;
      
      // Simulate real-time streaming response
      socket.emit('ai:stream-start');
      
      const responseText = `Here is standard optimization advice for your code.\n1. Utilize React components rendering patterns.\n2. Ensure proper dependency declarations in hooks.\n3. Make database requests parallel if separate schema metrics.`;
      
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        socket.emit('ai:stream-chunk', words[i] + ' ');
      }
      
      socket.emit('ai:stream-end', { fullText: responseText });
    });

    // ==========================================
    // DISCOVERY DISCONNECTS
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      if (currentUserId) {
        activeUsers.delete(currentUserId);
        
        if (currentWorkspaceId) {
          io.to(`workspace:${currentWorkspaceId}`).emit('user:offline', {
            userId: currentUserId,
          });
        }
      }

      if (currentFileId) {
        socket.to(`editor:${currentFileId}`).emit('editor:user-left', {
          userId: currentUserId,
        });
      }
    });
  });
};

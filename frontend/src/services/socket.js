import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
      })

      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket.id)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason)
      })

      this.socket.on('connect_error', (err) => {
        console.error('Socket.IO connect_error:', err.message)
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected() {
    return !!this.socket?.connected
  }

  onConnect(callback) {
    this.connect()
    this.socket.on('connect', callback)
  }

  offConnect(callback) {
    if (this.socket) {
      this.socket.off('connect', callback)
    }
  }

  onDisconnect(callback) {
    this.connect()
    this.socket.on('disconnect', callback)
  }

  offDisconnect(callback) {
    if (this.socket) {
      this.socket.off('disconnect', callback)
    }
  }

  // Workspace Presence
  joinWorkspace(payload) {
    this.connect()
    this.socket.emit('workspace:join', payload)
  }

  leaveWorkspace(payload) {
    if (this.socket) {
      this.socket.emit('workspace:leave', payload)
    }
  }

  onActiveUsers(callback) {
    if (this.socket) {
      this.socket.on('workspace:active-users', callback)
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user:online', callback)
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user:offline', callback)
    }
  }

  // Chat Real-time
  sendChatMessage(payload) {
    this.connect()
    this.socket.emit('chat:send', payload)
  }

  sendChatTyping(payload) {
    if (this.socket) {
      this.socket.emit('chat:typing', payload)
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('chat:receive', callback)
    }
  }

  offReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off('chat:receive', callback)
    }
  }

  onChatTyping(callback) {
    if (this.socket) {
      this.socket.on('chat:typing', callback)
    }
  }

  // Collaborative Editor
  joinEditor(payload) {
    this.connect()
    this.socket.emit('editor:join', payload)
  }

  leaveEditor(payload) {
    if (this.socket) {
      this.socket.emit('editor:leave', payload)
    }
  }

  sendEditorUpdate(payload) {
    if (this.socket) {
      this.socket.emit('editor:update', payload)
    }
  }

  onEditorUpdate(callback) {
    if (this.socket) {
      this.socket.on('editor:update', callback)
    }
  }

  offEditorUpdate(callback) {
    if (this.socket) {
      this.socket.off('editor:update', callback)
    }
  }

  onEditorUserJoined(callback) {
    if (this.socket) {
      this.socket.on('editor:user-joined', callback)
    }
  }

  onEditorUserLeft(callback) {
    if (this.socket) {
      this.socket.on('editor:user-left', callback)
    }
  }

  offEditorUserJoined(callback) {
    if (this.socket) {
      this.socket.off('editor:user-joined', callback)
    }
  }

  offEditorUserLeft(callback) {
    if (this.socket) {
      this.socket.off('editor:user-left', callback)
    }
  }

  offAll() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export const socketService = new SocketService()
export default socketService

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

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected')
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

  offAll() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export const socketService = new SocketService()
export default socketService

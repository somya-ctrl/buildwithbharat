import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to automatically attach authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codexa_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle common errors like 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto cleanup on unauthorized
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.patch('/users/profile', data),
  search: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
}

export const workspaceAPI = {
  create: (data) => api.post('/workspaces', data),
  list: () => api.get('/workspaces'),
  getDetails: (id) => api.get(`/workspaces/${id}`),
  rename: (id, name) => api.patch(`/workspaces/${id}`, { name }),
  delete: (id) => api.delete(`/workspaces/${id}`),
  invite: (id, email) => api.post(`/workspaces/${id}/invite`, { email }),
  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  removeMember: (id, memberId) => api.delete(`/workspaces/${id}/members/${memberId}`),
}

export const fileAPI = {
  listWorkspaceFiles: (workspaceId) => api.get(`/files/workspace/${workspaceId}`),
  create: (data) => api.post('/files', data),
  rename: (id, name) => api.patch(`/files/${id}`, { name }),
  delete: (id) => api.delete(`/files/${id}`),
  getContent: (id) => api.get(`/files/${id}/content`),
  saveContent: (id, content) => api.put(`/files/${id}/content`, { content }),
}

export const chatAPI = {
  getMessages: (workspaceId) => api.get(`/workspaces/${workspaceId}/messages`),
}

export const aiAPI = {
  chat: (prompt, code = '') => api.post('/ai/chat', { prompt, code }),
  explain: (code) => api.post('/ai/explain', { code }),
  debug: (code, error = '') => api.post('/ai/debug', { code, error }),
  generate: (prompt) => api.post('/ai/generate', { prompt }),
}

export const meetingAPI = {
  create: (workspaceId, title) => api.post('/meetings', { workspaceId, title }),
  getDetails: (id) => api.get(`/meetings/${id}`),
  end: (id) => api.post(`/meetings/${id}/end`),
}

export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (ids) => api.patch('/notifications/read', ids ? { ids } : {}),
}

export default api

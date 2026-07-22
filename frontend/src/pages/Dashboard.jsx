import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  workspaceAPI,
  fileAPI,
  chatAPI,
  aiAPI,
  meetingAPI,
} from '../services/api.js'
import socketService from '../services/socket.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('workspaces')

  // Workspaces state
  const [workspaces, setWorkspaces] = useState([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)

  // Modals state
  const [showCreateWsModal, setShowCreateWsModal] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [isCreatingWs, setIsCreatingWs] = useState(false)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteFeedback, setInviteFeedback] = useState('')

  // Files state
  const [files, setFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [isSavingFile, setIsSavingFile] = useState(false)
  const [showCreateFileModal, setShowCreateFileModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [isNewFolder, setIsNewFolder] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)

  // AI Assistant state
  const [aiMode, setAiMode] = useState('chat') // 'chat' | 'explain' | 'debug' | 'generate'
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiCode, setAiCode] = useState('')
  const [aiErrorInput, setAiErrorInput] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Meetings state
  const [meetings, setMeetings] = useState([])
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [activeMeeting, setActiveMeeting] = useState(null)

  // Profile Settings state
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl || '')
  const [profileMsg, setProfileMsg] = useState('')
  const { updateProfile } = useAuth()

  // Load Workspaces on mount
  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    setLoadingWorkspaces(true)
    try {
      const res = await workspaceAPI.list()
      const list = res.data || []
      setWorkspaces(list)
      if (list.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(list[0])
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err)
    } finally {
      setLoadingWorkspaces(false)
    }
  }

  // Load files & chat when selectedWorkspace changes
  useEffect(() => {
    if (selectedWorkspace?.id) {
      loadFiles(selectedWorkspace.id)
      loadChat(selectedWorkspace.id)

      // Connect Socket for presence & real-time chat
      if (user?.id) {
        socketService.joinWorkspace({
          workspaceId: selectedWorkspace.id,
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        })
      }

      const handleReceiveMsg = (msg) => {
        setChatMessages((prev) => [...prev, msg])
      }

      socketService.onReceiveMessage(handleReceiveMsg)

      return () => {
        socketService.leaveWorkspace({ workspaceId: selectedWorkspace.id })
      }
    }
  }, [selectedWorkspace?.id, user?.id])

  const loadFiles = async (wsId) => {
    setLoadingFiles(true)
    try {
      const res = await fileAPI.listWorkspaceFiles(wsId)
      setFiles(res.data || [])
      setSelectedFile(null)
      setFileContent('')
    } catch (err) {
      console.error('Error loading files:', err)
    } finally {
      setLoadingFiles(false)
    }
  }

  const loadChat = async (wsId) => {
    setLoadingChat(true)
    try {
      const res = await chatAPI.getMessages(wsId)
      setChatMessages(res.data || [])
    } catch (err) {
      console.error('Error loading chat:', err)
    } finally {
      setLoadingChat(false)
    }
  }

  // Create Workspace action
  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    setIsCreatingWs(true)
    try {
      const res = await workspaceAPI.create({ name: newWsName.trim() })
      const newWs = res.data
      setWorkspaces((prev) => [newWs, ...prev])
      setSelectedWorkspace(newWs)
      setNewWsName('')
      setShowCreateWsModal(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create workspace')
    } finally {
      setIsCreatingWs(false)
    }
  }

  // Invite Member action
  const handleInviteMember = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !selectedWorkspace) return
    setIsInviting(true)
    setInviteFeedback('')
    try {
      await workspaceAPI.invite(selectedWorkspace.id, inviteEmail.trim())
      setInviteFeedback('Member invited successfully!')
      setInviteEmail('')
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteFeedback('')
      }, 1500)
    } catch (err) {
      setInviteFeedback(
        err.response?.data?.message || 'Failed to invite member'
      )
    } finally {
      setIsInviting(false)
    }
  }

  // File Select & Load Content
  const handleSelectFile = async (file) => {
    setSelectedFile(file)
    if (file.isFolder) return
    try {
      const res = await fileAPI.getContent(file.id)
      setFileContent(res.data?.content || '')
    } catch (err) {
      console.error('Error loading file content:', err)
    }
  }

  // Save File Content
  const handleSaveFile = async () => {
    if (!selectedFile) return
    setIsSavingFile(true)
    try {
      await fileAPI.saveContent(selectedFile.id, fileContent)
      alert('File saved successfully!')
    } catch (err) {
      alert('Failed to save file')
    } finally {
      setIsSavingFile(false)
    }
  }

  // Create File action
  const handleCreateFile = async (e) => {
    e.preventDefault()
    if (!newFileName.trim() || !selectedWorkspace) return
    try {
      const res = await fileAPI.create({
        workspaceId: selectedWorkspace.id,
        name: newFileName.trim(),
        isFolder: isNewFolder,
      })
      setFiles((prev) => [...prev, res.data])
      setNewFileName('')
      setShowCreateFileModal(false)
    } catch (err) {
      alert('Failed to create file')
    }
  }

  // Send Chat message
  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedWorkspace || !user) return
    socketService.sendChatMessage({
      workspaceId: selectedWorkspace.id,
      senderId: user.id,
      text: chatInput.trim(),
    })
    setChatInput('')
  }

  // AI Assistant submit
  const handleAiSubmit = async (e) => {
    e.preventDefault()
    setIsAiLoading(true)
    setAiResponse('')
    try {
      let res
      if (aiMode === 'chat') {
        res = await aiAPI.chat(aiPrompt, aiCode)
      } else if (aiMode === 'explain') {
        res = await aiAPI.explain(aiCode)
      } else if (aiMode === 'debug') {
        res = await aiAPI.debug(aiCode, aiErrorInput)
      } else if (aiMode === 'generate') {
        res = await aiAPI.generate(aiPrompt)
      }
      setAiResponse(res?.data?.response || 'No response generated.')
    } catch (err) {
      setAiResponse('AI processing error. Please try again.')
    } finally {
      setIsAiLoading(false)
    }
  }

  // Create Meeting
  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    if (!meetingTitle.trim() || !selectedWorkspace) return
    try {
      const res = await meetingAPI.create(
        selectedWorkspace.id,
        meetingTitle.trim()
      )
      setActiveMeeting(res.data)
      setMeetings((prev) => [res.data, ...prev])
      setShowMeetingModal(false)
      setMeetingTitle('')
    } catch (err) {
      alert('Failed to create meeting session')
    }
  }

  // Update Profile Settings
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    const result = await updateProfile({
      name: profileName,
      avatarUrl: profileAvatar,
    })
    if (result.success) {
      setProfileMsg('Profile updated successfully!')
    } else {
      setProfileMsg(result.error || 'Update failed')
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/20">
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-margin-page pb-24 lg:ml-[240px] lg:pb-margin-page">
          <div className="mx-auto max-w-container-max space-y-stack-lg">
            {/* Header / Workspace Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  Welcome back, {user?.name || 'Developer'}
                </h1>
                <p className="font-body-md text-secondary">
                  Active Workspace:{' '}
                  <span className="font-semibold text-primary">
                    {selectedWorkspace?.name || 'No workspace selected'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {workspaces.length > 0 && (
                  <select
                    value={selectedWorkspace?.id || ''}
                    onChange={(e) => {
                      const ws = workspaces.find((w) => w.id === e.target.value)
                      if (ws) setSelectedWorkspace(ws)
                    }}
                    className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {workspaces.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setShowCreateWsModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-label-md font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">
                    add
                  </span>
                  <span>New Workspace</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: WORKSPACES */}
            {activeTab === 'workspaces' && (
              <div className="space-y-stack-lg">
                {/* Action Cards */}
                <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    onClick={() => setShowCreateWsModal(true)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-primary/20 bg-primary-container p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-surface/20 p-3 text-white">
                        <span className="material-symbols-outlined text-2xl">
                          add_circle
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-white/40 transition-colors group-hover:text-white">
                        arrow_forward
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-headline-md text-headline-md font-bold text-white">
                        Create Workspace
                      </h3>
                      <p className="mt-1 font-body-md text-white/80">
                        Launch a new team environment with full database sync.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowInviteModal(true)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-secondary-container p-3 text-primary">
                        <span className="material-symbols-outlined text-2xl">
                          group_add
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-secondary/40 transition-colors group-hover:text-primary">
                        arrow_forward
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                        Invite Collaborators
                      </h3>
                      <p className="mt-1 font-body-md text-secondary">
                        Add teammates to active workspace via email invite.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowMeetingModal(true)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-tertiary-container/30 p-3 text-tertiary">
                        <span className="material-symbols-outlined text-2xl">
                          video_call
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-secondary/40 transition-colors group-hover:text-tertiary">
                        arrow_forward
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                        Start Video Meeting
                      </h3>
                      <p className="mt-1 font-body-md text-secondary">
                        Create real-time WebRTC session for code review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workspaces Grid */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                      Your Workspaces ({workspaces.length})
                    </h2>
                  </div>

                  {loadingWorkspaces ? (
                    <div className="flex py-12 justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : workspaces.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-outline">
                        folder_open
                      </span>
                      <h3 className="mt-2 font-headline-sm text-lg font-bold">
                        No Workspaces Found
                      </h3>
                      <p className="mt-1 text-sm text-secondary">
                        Create your first workspace to start collaborating.
                      </p>
                      <button
                        onClick={() => setShowCreateWsModal(true)}
                        className="mt-4 rounded-xl bg-primary px-4 py-2 font-label-md font-bold text-white"
                      >
                        Create Workspace
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
                      {workspaces.map((ws) => (
                        <div
                          key={ws.id}
                          onClick={() => setSelectedWorkspace(ws)}
                          className={`cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-md ${
                            selectedWorkspace?.id === ws.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50'
                          }`}
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-primary">
                              <span className="material-symbols-outlined">
                                terminal
                              </span>
                            </div>
                            {selectedWorkspace?.id === ws.id && (
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                Active
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                            {ws.name}
                          </h3>
                          <p className="mt-1 text-xs text-secondary">
                            Created:{' '}
                            {new Date(ws.createdAt).toLocaleDateString()}
                          </p>
                          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-3">
                            <span className="text-xs text-outline">
                              {ws.members?.length || 1} Member(s)
                            </span>
                            <span className="material-symbols-outlined text-sm text-primary">
                              arrow_forward
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: FILES */}
            {activeTab === 'files' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* File List / Explorer */}
                <div className="lg:col-span-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      Explorer
                    </h3>
                    <button
                      onClick={() => setShowCreateFileModal(true)}
                      className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 font-label-md text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      <span>New File</span>
                    </button>
                  </div>

                  {loadingFiles ? (
                    <div className="py-8 text-center text-xs text-secondary">
                      Loading files...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="py-8 text-center text-xs text-secondary">
                      No files in this workspace yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => handleSelectFile(file)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                            selectedFile?.id === file.id
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'hover:bg-surface-container-high text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-secondary">
                              {file.isFolder ? 'folder' : 'description'}
                            </span>
                            <span>{file.name}</span>
                          </div>
                          {!file.isFolder && (
                            <span className="text-[10px] text-outline">
                              Code
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editor View */}
                <div className="lg:col-span-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm flex flex-col min-h-[450px]">
                  {selectedFile ? (
                    <>
                      <div className="mb-3 flex items-center justify-between border-b border-outline-variant pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">
                            {selectedFile.isFolder ? 'folder' : 'code'}
                          </span>
                          <h4 className="font-headline-sm font-bold">
                            {selectedFile.name}
                          </h4>
                        </div>
                        {!selectedFile.isFolder && (
                          <button
                            onClick={handleSaveFile}
                            disabled={isSavingFile}
                            className="flex items-center gap-1 rounded-xl bg-primary px-4 py-1.5 font-label-md text-xs font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">
                              save
                            </span>
                            <span>{isSavingFile ? 'Saving...' : 'Save'}</span>
                          </button>
                        )}
                      </div>

                      {selectedFile.isFolder ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-secondary">
                          This is a folder. Select a code file to view/edit content.
                        </div>
                      ) : (
                        <textarea
                          value={fileContent}
                          onChange={(e) => setFileContent(e.target.value)}
                          placeholder="Type code here..."
                          className="flex-1 w-full font-mono text-sm bg-surface-container-low p-4 rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[350px]"
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-secondary">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">
                        code_off
                      </span>
                      <p className="font-body-md">
                        Select a file from the explorer to view or edit code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: CHAT */}
            {activeTab === 'chat' && (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm flex flex-col h-[550px]">
                <div className="mb-4 border-b border-outline-variant pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      Team Live Chat
                    </h3>
                    <p className="text-xs text-secondary">
                      Workspace: {selectedWorkspace?.name}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Socket.IO Connected
                  </span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-surface-container-low rounded-xl mb-4">
                  {loadingChat ? (
                    <p className="text-center text-xs text-secondary py-4">
                      Loading messages...
                    </p>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-center text-xs text-secondary py-8">
                      No messages yet. Send the first message to your team!
                    </p>
                  ) : (
                    chatMessages.map((msg, i) => {
                      const isMe = msg.senderId === user?.id
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex flex-col ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[10px] text-secondary mb-0.5 px-1">
                            {msg.sender?.name || 'Teammate'}
                          </span>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-primary px-5 py-3 font-label-md font-bold text-white shadow-sm hover:bg-primary/90 active:scale-95"
                  >
                    <span>Send</span>
                    <span className="material-symbols-outlined text-sm">
                      send
                    </span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT 4: AI ASSISTANT */}
            {activeTab === 'ai' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* AI Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                    <h3 className="font-headline-sm font-bold text-on-surface mb-3">
                      AI Capabilities
                    </h3>

                    <div className="flex gap-2 mb-4">
                      {['chat', 'explain', 'debug', 'generate'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setAiMode(mode)}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                            aiMode === mode
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleAiSubmit} className="space-y-3">
                      {(aiMode === 'chat' || aiMode === 'generate') && (
                        <div>
                          <label className="block text-xs font-semibold text-secondary mb-1">
                            Prompt
                          </label>
                          <textarea
                            rows={3}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={
                              aiMode === 'generate'
                                ? 'Describe what code you want to generate...'
                                : 'Ask AI anything about your project...'
                            }
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                      )}

                      {(aiMode === 'chat' || aiMode === 'explain' || aiMode === 'debug') && (
                        <div>
                          <label className="block text-xs font-semibold text-secondary mb-1">
                            Code Snippet
                          </label>
                          <textarea
                            rows={4}
                            value={aiCode}
                            onChange={(e) => setAiCode(e.target.value)}
                            placeholder="Paste your code snippet here..."
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      )}

                      {aiMode === 'debug' && (
                        <div>
                          <label className="block text-xs font-semibold text-secondary mb-1">
                            Error Log / Message
                          </label>
                          <input
                            type="text"
                            value={aiErrorInput}
                            onChange={(e) => setAiErrorInput(e.target.value)}
                            placeholder="e.g. TypeError: Cannot read property of null"
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAiLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                      >
                        {isAiLoading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">
                              auto_awesome
                            </span>
                            <span>Run AI Action</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* AI Response Output */}
                <div className="lg:col-span-7 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm flex flex-col">
                  <h3 className="font-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      smart_toy
                    </span>
                    <span>AI Analysis & Output</span>
                  </h3>

                  <div className="flex-1 bg-surface-container-low rounded-xl p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap min-h-[300px]">
                    {isAiLoading ? (
                      <div className="flex h-full items-center justify-center text-secondary">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>Generating AI response...</span>
                        </div>
                      </div>
                    ) : aiResponse ? (
                      aiResponse
                    ) : (
                      <div className="flex h-full items-center justify-center text-outline text-xs text-center">
                        Select an AI capability on the left and submit your query.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <h3 className="font-headline-md font-bold text-on-surface mb-4">
                  Account Settings
                </h3>

                {profileMsg && (
                  <div className="mb-4 rounded-xl bg-primary/10 p-3 text-xs font-semibold text-primary">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-6 py-2.5 font-label-md font-bold text-white shadow-sm hover:bg-primary/90 active:scale-95"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateWsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
            <h3 className="font-headline-md font-bold text-on-surface mb-2">
              Create New Workspace
            </h3>
            <p className="text-xs text-secondary mb-4">
              Enter a title for your collaborative environment.
            </p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <input
                type="text"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="e.g. quantum-engine"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                required
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWsModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWs}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreatingWs ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
            <h3 className="font-headline-md font-bold text-on-surface mb-2">
              Invite Collaborator
            </h3>
            <p className="text-xs text-secondary mb-4">
              Invite teammates to workspace:{' '}
              <span className="font-semibold text-primary">
                {selectedWorkspace?.name}
              </span>
            </p>

            {inviteFeedback && (
              <div className="mb-4 rounded-xl bg-primary/10 p-3 text-xs font-semibold text-primary">
                {inviteFeedback}
              </div>
            )}

            <form onSubmit={handleInviteMember} className="space-y-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                required
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FILE MODAL */}
      {showCreateFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
            <h3 className="font-headline-md font-bold text-on-surface mb-2">
              Create New File or Folder
            </h3>
            <form onSubmit={handleCreateFile} className="space-y-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. index.ts or src"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                required
                autoFocus
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFolderCheckbox"
                  checked={isNewFolder}
                  onChange={(e) => setIsNewFolder(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isFolderCheckbox"
                  className="text-xs font-semibold text-secondary"
                >
                  Is Folder
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFileModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
            <h3 className="font-headline-md font-bold text-on-surface mb-2">
              Start Video Call Session
            </h3>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Sprint Architecture Review"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary/20"
                required
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
                >
                  Launch Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

# 🚀 Workspace Hackathon Backend Integration Guide

This guide documents the REST APIs and Socket.IO real-time channels implemented in the Node.js + Express + Prisma + PostgreSQL backend.

---

## 🛠️ Getting Started

### 1. Environment Config (`.env`)
Create a `.env` in the `backend/` directory like this:
```env
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildwithbharat?schema=public"
JWT_SECRET="hackathon_super_secret_double_jwt_token_key_991823"
FRONTEND_URL="http://localhost:5173"
# REDIS_URL="redis://127.0.0.1:6379" # Optional (falls back to memory)
# GEMINI_API_KEY="your-gemini-key"   # Optional (falls back to smart simulated responses)
```

### 2. Commands
* Install dependencies (if cloning): `npm install`
* Generate Prisma Client: `npm run prisma:generate`
* Run database migrations: `npm run prisma:migrate`
* Start Dev Server (with hot rebuilds): `npm run dev`
* Build production app: `npm run build`
* Start production build: `npm run start`

---

## 🔐 Authentication APIs

### 1. User Signup
* **Endpoint**: `POST /api/auth/signup`
* **Request Options**: `Content-Type: application/json`
* **Request Payload**:
```json
{
  "name": "Somya",
  "email": "abc@gmail.com",
  "password": "mySecurePassword"
}
```
* **Success Response (201 Created)**:
```json
{
  "user": {
    "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "name": "Somya",
    "email": "abc@gmail.com",
    "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=Somya",
    "createdAt": "2026-07-18T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Note**: Sets an `httpOnly` cookie named `token` automatically; you can also send this token explicitly via `Authorization: Bearer <token>` in subsequent requests.

---

### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Request Payload**:
```json
{
  "email": "abc@gmail.com",
  "password": "mySecurePassword"
}
```
* **Success Response (200 OK)**:
```json
{
  "user": {
    "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "name": "Somya",
    "email": "abc@gmail.com",
    "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=Somya",
    "createdAt": "2026-07-18T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Current User Profile
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "user": {
    "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "name": "Somya",
    "email": "abc@gmail.com",
    "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=Somya"
  }
}
```

---

### 4. Logout Session
* **Endpoint**: `POST /api/auth/logout`
* **Success Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## 👤 User & Teammate APIs

### 1. Get User Profile Details
* **Endpoint**: `GET /api/users/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
  "name": "Somya",
  "email": "abc@gmail.com",
  "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=Somya",
  "workspaceMembers": [
    {
      "id": "member-uuid",
      "workspaceId": "ws-uuid",
      "userId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
      "role": "MEMBER",
      "joinedAt": "2026-07-18T05:00:00.000Z",
      "workspace": {
        "id": "ws-uuid",
        "name": "Hackathon Team"
      }
    }
  ]
}
```

---

### 2. Update User Profile Settings
* **Endpoint**: `PATCH /api/users/profile`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload** (any parameters are optional):
```json
{
  "name": "Somya Dev",
  "avatarUrl": "https://custom-avatar-url.com/img.jpg",
  "password": "brandNewSecurePassword"
}
```
* **Success Response (200 OK)**:
```json
{
  "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
  "name": "Somya Dev",
  "email": "abc@gmail.com",
  "avatarUrl": "https://custom-avatar-url.com/img.jpg",
  "createdAt": "2026-07-18T12:00:00.000Z"
}
```

---

### 3. Search Teammates
* **Endpoint**: `GET /api/users/search?q=som`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "name": "Somya Dev",
    "email": "abc@gmail.com",
    "avatarUrl": "https://custom-avatar-url.com/img.jpg"
  }
]
```

---

## 🏢 Workspace APIs

### 1. Create Workspace
* **Endpoint**: `POST /api/workspaces`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "name": "Hackathon Team"
}
```
* **Success Response (201 Created)**:
```json
{
  "id": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "name": "Hackathon Team",
  "ownerId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
  "createdAt": "2026-07-18T12:05:00.000Z",
  "updatedAt": "2026-07-18T12:05:00.000Z"
}
```

---

### 2. List My Workspaces
* **Endpoint**: `GET /api/workspaces`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "w1110000-cbb2-1234-bc23-7fa345dbf211",
    "name": "Hackathon Team",
    "ownerId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "createdAt": "2026-07-18T12:05:00.000Z",
    "updatedAt": "2026-07-18T12:05:00.000Z",
    "members": [
      {
        "id": "member-uuid",
        "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
        "userId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
        "role": "OWNER",
        "joinedAt": "2026-07-18T12:05:00.000Z",
        "user": {
          "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
          "name": "Somya Dev",
          "avatarUrl": "https://custom-avatar-url.com/img.jpg"
        }
      }
    ]
  }
]
```

---

### 3. Workspace Details
* **Endpoint**: `GET /api/workspaces/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "name": "Hackathon Team",
  "ownerId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
  "createdAt": "2026-07-18T12:05:00.000Z",
  "updatedAt": "2026-07-18T12:05:00.000Z",
  "owner": {
    "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
    "name": "Somya Dev",
    "email": "abc@gmail.com",
    "avatarUrl": "https://custom-avatar-url.com/img.jpg"
  },
  "members": [
    {
      "id": "member-uuid",
      "userId": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
      "role": "OWNER",
      "joinedAt": "2026-07-18T12:05:00.000Z",
      "user": {
        "id": "e0b686d1-db53-48df-b4a1-8d26456fa38d",
        "name": "Somya Dev",
        "email": "abc@gmail.com",
        "avatarUrl": "https://custom-avatar-url.com/img.jpg"
      }
    }
  ]
}
```

---

### 4. Rename Workspace
* **Endpoint**: `PATCH /api/workspaces/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "name": "Brand New Hackathon Title"
}
```
* **Success Response (200 OK)**:
```json
{
  "id": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "name": "Brand New Hackathon Title",
  "ownerId": "e0b686d1-db53-48df-b4a1-8d26456fa38d"
}
```

---

### 5. Delete Workspace
* **Endpoint**: `DELETE /api/workspaces/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "message": "Workspace deleted successfully"
}
```

---

### 6. Invite Members by Email
* **Endpoint**: `POST /api/workspaces/:id/invite`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "email": "teammate@gmail.com"
}
```
* **Success Response (201 Created)**:
```json
{
  "id": "new-workspace-member-uuid",
  "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "userId": "teammate-uuid",
  "role": "MEMBER",
  "joinedAt": "2026-07-18T13:00:00.000Z",
  "user": {
    "id": "teammate-uuid",
    "name": "Alex Teammate",
    "email": "teammate@gmail.com",
    "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=Alex"
  }
}
```

---

### 7. List Workspace Members
* **Endpoint**: `GET /api/workspaces/:id/members`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "member-uuid-1",
    "workspaceId": "workspace-1",
    "userId": "user-1",
    "role": "OWNER",
    "user": { "id": "user-1", "name": "Somya", "email": "abc@gmail.com", "avatarUrl": "..." }
  }
]
```

---

### 8. Remove or Leave Workspace Member
* **Endpoint**: `DELETE /api/workspaces/:id/members/:memberId`
* **Headers**: `Authorization: Bearer <token>`
* **Description**: `memberId` can be either the `WorkspaceMember.id` OR the `User.id` (helps for simple frontend bindings).
* **Success Response (200 OK)**:
```json
{
  "message": "Member removed successfully"
}
```

---

## 📂 File Management APIs

### 1. List Workspace Files
* **Endpoint**: `GET /api/files/workspace/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)** (returns directories and files for tree rendering):
```json
[
  {
    "id": "file-123a",
    "workspaceId": "ws-uuid",
    "name": "src",
    "isFolder": true,
    "parentId": null,
    "content": "",
    "createdById": "user-1",
    "createdAt": "2026-07-18T12:05:00.000Z"
  },
  {
    "id": "file-123b",
    "workspaceId": "ws-uuid",
    "name": "index.js",
    "isFolder": false,
    "parentId": "file-123a",
    "content": "console.log('hello');",
    "createdById": "user-1",
    "createdAt": "2026-07-18T12:10:00.000Z"
  }
]
```

---

### 2. Create File or Folder
* **Endpoint**: `POST /api/files`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "name": "App.tsx",
  "parentId": "file-123a", 
  "isFolder": false
}
```
* **Success Response (201 Created)**:
```json
{
  "id": "file-new-uuid",
  "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "name": "App.tsx",
  "parentId": "file-123a",
  "isFolder": false,
  "content": "",
  "createdById": "user-uuid"
}
```

---

### 3. Rename File/Folder
* **Endpoint**: `PATCH /api/files/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "name": "MainComponent.tsx"
}
```
* **Success Response (200 OK)**:
```json
{
  "id": "file-new-uuid",
  "name": "MainComponent.tsx",
  "updatedAt": "2026-07-18T12:45:00.000Z"
}
```

---

### 4. Delete File/Folder
* **Endpoint**: `DELETE /api/files/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "message": "File/folder deleted successfully"
}
```

---

### 5. Get Code File Content
* **Endpoint**: `GET /api/files/:id/content`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "file-uuid",
  "name": "App.tsx",
  "content": "import React from 'react';\n\nexport default function App() {\n  return <div>Hello</div>;\n}",
  "updatedAt": "2026-07-18T12:00:00.000Z"
}
```

---

### 6. Save Code/Content (Create New Version)
* **Endpoint**: `PUT /api/files/:id/content`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "content": "import React from 'react';\n\nexport default function App() {\n  return <div className=\"p-4\">Hi Teammates!</div>;\n}"
}
```
* **Success Response (200 OK)**:
```json
{
  "id": "file-uuid",
  "name": "App.tsx",
  "content": "import React from 'react';\n\nexport default function App() {\n  return <div className=\"p-4\">Hi Teammates!</div>;\n}",
  "updatedAt": "2026-07-18T13:00:00.000Z"
}
```
* **System Action**: Automatically stores a historical version in the `FileVersion` database table.

---

## 💬 Chat API

### 1. View Chat History
* **Endpoint**: `GET /api/workspaces/:id/messages`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "message-uuid",
    "workspaceId": "ws-uuid",
    "senderId": "user-uuid",
    "text": "Hey team, how is the dashboard UI coming along?",
    "createdAt": "2026-07-18T12:30:00.000Z",
    "sender": {
      "id": "user-uuid",
      "name": "Somya Dev",
      "email": "abc@gmail.com",
      "avatarUrl": "https://custom-avatar-url.com/img.jpg"
    }
  }
]
```

---

## 🤖 AI Assistance APIs

### 1. Interactive AI Chat
* **Endpoint**: `POST /api/ai/chat`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "prompt": "How can I optimize this callback loop?",
  "code": "const items = data.map(x => calculate(x));"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "Here is an optimized way to resolve memory blocks in mapping tasks..."
}
```

---

### 2. Auto-Explain Code Block
* **Endpoint**: `POST /api/ai/explain`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "code": "const express = require('express');\nconst app = express();"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "This code initializes a new Express application instance which handles..."
}
```

---

### 3. Debug Code Snippet
* **Endpoint**: `POST /api/ai/debug`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "code": "let itemObj = null;\nconsole.log(itemObj.name);",
  "error": "TypeError: Cannot read properties of null (reading 'name')"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "The error occurs because you try to access property 'name' of 'itemObj' while it is null..."
}
```

---

### 4. Code Generation
* **Endpoint**: `POST /api/ai/generate`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "prompt": "write a utility that validates an email in javascript using regex"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "```javascript\nfunction validateEmail(email) {\n  const re = /^\\S+@\\S+\\.\\S+$/;\n  return re.test(email);\n}\n```"
}
```

---

## 🎥 Meeting Sync APIs

### 1. Create a Call Session
* **Endpoint**: `POST /api/meetings`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload**:
```json
{
  "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "title": "Hackathon Demo Review Meeting"
}
```
* **Success Response (201 Created)**:
```json
{
  "id": "meeting-uuid-32a",
  "workspaceId": "w1110000-cbb2-1234-bc23-7fa345dbf211",
  "hostId": "user-uuid",
  "title": "Hackathon Demo Review Meeting",
  "isActive": true,
  "createdAt": "2026-07-18T13:10:00.000Z",
  "host": {
    "id": "user-uuid",
    "name": "Somya Dev"
  }
}
```

---

### 2. Get Meeting Session Details
* **Endpoint**: `GET /api/meetings/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "meeting-uuid-32a",
  "title": "Hackathon Demo Review Meeting",
  "isActive": true,
  "hostId": "user-uuid"
}
```

---

### 3. Stop/End Meeting
* **Endpoint**: `POST /api/meetings/:id/end`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "id": "meeting-uuid-32a",
  "isActive": false,
  "endedAt": "2026-07-18T13:40:00.000Z"
}
```

---

## 🔔 Notifications APIs

### 1. Get My Alerts
* **Endpoint**: `GET /api/notifications`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "notif-uuid",
    "userId": "user-uuid",
    "text": "You have been added to the workspace \"Hackathon Team\" by Somya.",
    "isRead": false,
    "createdAt": "2026-07-18T13:00:00.000Z"
  }
]
```

---

### 2. Mark Alerts as Read
* **Endpoint**: `PATCH /api/notifications/read`
* **Headers**: `Authorization: Bearer <token>`
* **Request Payload** (Optional - if omitted, marks ALL user's notifications as read):
```json
{
  "ids": ["notif-uuid"]
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Notifications marked as read successfully",
  "count": 1
}
```

---

## 🔌 Socket.IO Real-time Channels

Connect your frontend Socket.io client to the root address (e.g. `http://localhost:5001`).

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
```

### 1. Workspace Event Listeners

#### Join Workspace Presence
Send as soon as users open a workspace. We broadcast status and populate online users.
* **Emit event**: `workspace:join`
* **Payload**:
```json
{
  "workspaceId": "workspace-1122",
  "userId": "user-3344",
  "name": "Somya Dev",
  "avatarUrl": "https://avatar-host.com/img.svg"
}
```
* **Receive Active Users List (Client-Only Response)**:
  - **Event**: `workspace:active-users`
  - **Arguments**: Array of current online users e.g. `[{ userId, name, avatarUrl, socketId }]`
* **Receive Online notification (Broadcast)**:
  - **Event**: `user:online`
  - **Arguments**: `{ userId, name, avatarUrl, workspaceId }`

#### Leave Workspace Presence
* **Emit event**: `workspace:leave`
* **Receive Offline notification (Broadcast)**:
  - **Event**: `user:offline`
  - **Arguments**: `{ userId }`

---

### 2. Editor Peer Code Collaboration

#### Join File Collaborative Editor
* **Emit event**: `editor:join`
* **Payload**:
```json
{
  "fileId": "file-uuid-abc",
  "user": {
    "id": "user-uuid",
    "name": "Somya Dev",
    "avatarUrl": "..."
  }
}
```
* **Receive peer joins alert**: `editor:user-joined` (tells others someone entered, e.g. `{ userId, name, avatarUrl }`)
* **Receive peer leaves alert**: `editor:user-left` (tells others someone closed file, e.g. `{ userId }`)

#### Collaborative Cursors
Send cursor coordinate updates as users click/move around key lines.
* **Emit event**: `editor:cursor`
* **Payload**:
```json
{
  "fileId": "file-uuid-abc",
  "cursor": { "line": 24, "ch": 15 },
  "user": {
    "id": "user-uuid",
    "name": "Somya Dev",
    "color": "#e11d48"
  }
}
```
* **Receive peer cursor movements**:
  - **Event**: `editor:cursor`
  - **Arguments**: `{ userId, name, color, cursor: { line, ch } }`

#### Live Key Press / Document Updates
Broadcast edits as typing occurs inside the text editor window.
* **Emit event**: `editor:update`
* **Payload**:
```json
{
  "fileId": "file-uuid-abc",
  "changes": { "text": ["const val = 42;"], "from": { "line": 4, "ch": 0 }, "to": { "line": 4, "ch": 16 } },
  "content": "complete file source code..." // Optional complete fallback string
}
```
* **Receive peer code logs**:
  - **Event**: `editor:update`
  - **Arguments**: `{ changes, content }`

#### File Saved Notification
* **Emit event**: `editor:save` -> Payload: `{ fileId, userId }`
* **Receive broadcast**: `editor:save` -> Args: `{ fileId, userId }`

#### Editor Typing Alerts
* **Emit event**: `editor:typing` -> Payload: `{ fileId, userId, isTyping: true }`
* **Receive broadcast**: `editor:typing` -> Args: `{ userId, isTyping }`

---

### 3. Workspace Chat Messaging

#### Send Chat Message
* **Emit event**: `chat:send`
* **Payload**:
```json
{
  "workspaceId": "ws-uuid-abc",
  "senderId": "user-uuid-xyz",
  "text": "Hi team! Let's get to work."
}
```
* **Receive New messages (Broadcast)**:
  - **Event**: `chat:receive`
  - **Arguments**: Full ChatMessage object (including `id`, `text`, `createdAt`, and `sender` models profile).

#### Live Chat Typing Alerts
* **Emit event**: `chat:typing`
* **Payload**:
```json
{
  "workspaceId": "ws-uuid-abc",
  "userId": "user-uuid",
  "name": "Somya Dev",
  "isTyping": true
}
```
* **Receive broadcast**:
  - **Event**: `chat:typing`
  - **Arguments**: `{ userId, name, isTyping }`

---

### 4. File-Tree Synchronization Events
If files are created/modified on REST APIs, you can broadcast notification signals on Socket to sync UI instantly.
* **Events to emit/receive on changes**:
  - `file:create` -> Payload: `{ workspaceId, file: { id, name, isFolder, parentId } }`
  - `file:update` -> Payload: `{ workspaceId, file: { id, name } }`
  - `file:delete` -> Payload: `{ workspaceId, fileId }`
* **Receive events**: `file:created`, `file:updated`, `file:deleted`

---

### 5. WebRTC Video Call Signaling
Events to exchange RTCPeerConnection offers, answers, and candidates between clients for live meetings.

* **RTC Join/Leave Room**:
  - Join: Emit `call:join` with `{ meetingId, userId, name }`
  - Leave: Emit `call:leave` with `{ meetingId, userId }`
  - Listen: peer joins -> `call:joined` (`{ userId, name }`); peer leaves -> `call:left` (`{ userId }`)
* **RTC Offer Connection**:
  - Emit: `call:offer` with `{ meetingId, offer, to, from }`
  - Listen: `call:offer` receive `{ offer, to, from }`
* **RTC Answer Connection**:
  - Emit: `call:answer` with `{ meetingId, answer, to, from }`
  - Listen: `call:answer` receive `{ answer, to, from }`
* **RTC ICE Candidates**:
  - Emit: `call:iceCandidate` with `{ meetingId, candidate, to, from }`
  - Listen: `call:iceCandidate` receive `{ candidate, to, from }`

#### Screen Sharing Status Updates
* **Emit events**:
  - Start share: `screen:start` with `{ workspaceId, userId, streamId }`
  - Stop share: `screen:stop` with `{ workspaceId, userId }`
* **Listen events**:
  - Broadcast starts: `screen:started` with `{ userId, streamId }`
  - Broadcast stops: `screen:stopped` with `{ userId }`

---

### 6. AI Stream Responses
To broadcast streaming generative code outputs word-by-word into chat or collaborative windows.
* **Emit Event**: `ai:chat` -> Payload: `{ workspaceId, prompt, code }`
* **Receive Event Outputs**:
  - Stream Initiated: `ai:stream-start`
  - Stream content chunk: `ai:stream-chunk` -> yields content token (e.g. `"optimization "`)
  - Stream Finished: `ai:stream-end` -> yields `{ fullText }`

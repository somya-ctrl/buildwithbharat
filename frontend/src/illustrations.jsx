const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const UI_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

export function CodeAssistantIllustration() {
  return (
    <svg viewBox="0 0 400 510" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="glow1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bot1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="soft1" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="14"
            floodColor="#1e293b"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <circle cx="230" cy="200" r="150" fill="url(#glow1)" />

      {/* editor window */}
      <g transform="rotate(-7 165 230)" filter="url(#soft1)">
        <rect
          x="35"
          y="130"
          width="260"
          height="200"
          rx="14"
          fill="#ffffff"
          stroke="#e2e8f0"
        />
        <circle cx="58" cy="152" r="4" fill="#fca5a5" />
        <circle cx="72" cy="152" r="4" fill="#fde68a" />
        <circle cx="86" cy="152" r="4" fill="#86efac" />

        <text
          x="52"
          y="178"
          fontFamily={CODE_FONT}
          fontSize="9"
          fill="#94a3b8"
        >
          import AI from &apos;codexa&apos;
        </text>
        <text
          x="52"
          y="196"
          fontFamily={CODE_FONT}
          fontSize="9"
          fontWeight="600"
          fill="#3b82f6"
        >
          function reviewPR(diff) {'{'}
        </text>
        <text
          x="66"
          y="214"
          fontFamily={CODE_FONT}
          fontSize="9"
          fill="#0f172a"
        >
          const ok = AI.scan(diff)
        </text>
        <text
          x="66"
          y="232"
          fontFamily={CODE_FONT}
          fontSize="9"
          fill="#64748b"
        >
          return ok.length === 0
        </text>
        <text
          x="52"
          y="250"
          fontFamily={CODE_FONT}
          fontSize="9"
          fontWeight="600"
          fill="#3b82f6"
        >
          {'}'}
        </text>
        <text
          x="52"
          y="278"
          fontFamily={CODE_FONT}
          fontSize="9"
          fill="#94a3b8"
        >
          export default reviewPR
        </text>
      </g>

      {/* chat / assistant panel */}
      <g transform="rotate(4 300 300)" filter="url(#soft1)">
        <rect
          x="185"
          y="185"
          width="185"
          height="235"
          rx="18"
          fill="#ffffff"
          fillOpacity="0.92"
          stroke="#dbeafe"
        />

        {/* bot avatar */}
        <circle cx="277" cy="222" r="20" fill="url(#bot1)" />
        <path
          d="M269 222a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"
          fill="#ffffff"
          fillOpacity="0.9"
        />
        <path
          d="M258 205l4 4M296 205l-4 4M258 240l4-4M296 240l-4-4"
          stroke="#bfdbfe"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* message bubble - incoming */}
        <rect x="200" y="254" width="130" height="34" rx="10" fill="#eff6ff" />
        <text
          x="212"
          y="267"
          fontFamily={UI_FONT}
          fontSize="8.5"
          fill="#1e40af"
        >
          Suggest code
        </text>
        <text
          x="212"
          y="279"
          fontFamily={UI_FONT}
          fontSize="8.5"
          fill="#1e40af"
        >
          improvements
        </text>

        {/* message bubble - outgoing */}
        <rect x="228" y="298" width="127" height="26" rx="10" fill="#2563eb" />
        <text
          x="240"
          y="315"
          fontFamily={UI_FONT}
          fontSize="8.5"
          fill="#ffffff"
        >
          Generate a function
        </text>

        {/* code snippet block */}
        <rect x="200" y="336" width="155" height="54" rx="8" fill="#0f172a" />
        <text x="212" y="352" fontFamily={CODE_FONT} fontSize="8" fill="#38bdf8">
          function fix(code) {'{'}
        </text>
        <text x="222" y="366" fontFamily={CODE_FONT} fontSize="8" fill="#e2e8f0">
          return format(code)
        </text>
        <text x="212" y="380" fontFamily={CODE_FONT} fontSize="8" fill="#38bdf8">
          {'}'}
        </text>

        {/* input bar */}
        <rect x="200" y="400" width="155" height="22" rx="11" fill="#f1f5f9" />
        <text
          x="212"
          y="415"
          fontFamily={UI_FONT}
          fontSize="8"
          fill="#94a3b8"
        >
          Type a message...
        </text>
        <circle cx="337" cy="411" r="9" fill="#2563eb" />
        <path d="M334 411l4-3v6z" fill="#ffffff" />
      </g>

      {/* sparkles */}
      <path d="M300 165l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#93c5fd" />
      <path d="M330 190l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#bfdbfe" />
    </svg>
  )
}

export function TeamCollabIllustration() {
  return (
    <svg viewBox="0 0 400 510" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="platform" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="avatarA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="avatarB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#1e293b"
            floodOpacity="0.1"
          />
        </filter>
      </defs>

      {/* isometric platform */}
      <g filter="url(#soft2)">
        <polygon
          points="200,300 320,355 200,410 80,355"
          fill="url(#platform)"
          stroke="#bfdbfe"
        />
        <polygon points="200,300 320,355 320,365 200,310" fill="#c7ddfd" />
        <polygon points="80,355 200,410 200,420 80,365" fill="#dbeafe" />
      </g>

      {/* central code window */}
      <g transform="translate(140 130)" filter="url(#soft2)">
        <rect
          x="0"
          y="0"
          width="120"
          height="150"
          rx="10"
          fill="#ffffff"
          stroke="#dbeafe"
        />
        <circle cx="14" cy="16" r="3" fill="#93c5fd" />
        <circle cx="24" cy="16" r="3" fill="#bfdbfe" />

        <text x="14" y="40" fontFamily={CODE_FONT} fontSize="8" fill="#3b82f6">
          const team = [
        </text>
        <text x="22" y="54" fontFamily={CODE_FONT} fontSize="8" fill="#0f172a">
          &apos;Ava&apos;, &apos;Ken&apos;,
        </text>
        <text x="22" y="68" fontFamily={CODE_FONT} fontSize="8" fill="#0f172a">
          &apos;Lee&apos;
        </text>
        <text x="14" y="82" fontFamily={CODE_FONT} fontSize="8" fill="#3b82f6">
          ]
        </text>
        <text x="14" y="102" fontFamily={CODE_FONT} fontSize="8" fill="#64748b">
          sync(team)
        </text>

        <rect x="24" y="-14" width="72" height="20" rx="6" fill="#2563eb" />
        <text
          x="60"
          y="0"
          textAnchor="middle"
          fontSize="9"
          fill="#ffffff"
          fontFamily={CODE_FONT}
        >
          team.js
        </text>
      </g>

      {/* people (abstracted glass figures) */}
      {[
        { x: 90, y: 300, fill: 'url(#avatarA)' },
        { x: 310, y: 300, fill: 'url(#avatarB)' },
        { x: 110, y: 400, fill: 'url(#avatarB)' },
        { x: 290, y: 400, fill: 'url(#avatarA)' },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle cx="0" cy="-42" r="12" fill={p.fill} />
          <rect
            x="-16"
            y="-28"
            width="32"
            height="42"
            rx="12"
            fill={p.fill}
            opacity="0.9"
          />
          <rect
            x="-22"
            y="-6"
            width="20"
            height="12"
            rx="3"
            fill="#e2e8f0"
            stroke="#cbd5e1"
          />
        </g>
      ))}

      {/* floating avatar photos */}
      <circle cx="55" cy="215" r="26" fill="url(#avatarA)" />
      <circle cx="55" cy="215" r="20" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="345" cy="215" r="26" fill="url(#avatarB)" />
      <circle cx="345" cy="215" r="20" fill="#ffffff" fillOpacity="0.25" />

      {/* connectors */}
      <path
        d="M70 235 C 80 260, 85 275, 90 290"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeDasharray="1 6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M330 235 C 320 260, 315 275, 310 290"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeDasharray="1 6"
        strokeLinecap="round"
        fill="none"
      />

      {/* floating icon badges */}
      <g transform="translate(300 150)">
        <rect width="42" height="30" rx="8" fill="#ffffff" stroke="#dbeafe" />
        <path d="M8 8h26v12H16l-4 4v-4H8z" fill="#93c5fd" />
      </g>
      <g transform="translate(60 400)">
        <rect width="34" height="28" rx="6" fill="#ffffff" stroke="#dbeafe" />
        <path
          d="M6 8h10l3 3h9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"
          fill="#bfdbfe"
        />
      </g>
      <g transform="translate(305 400)">
        <rect width="28" height="34" rx="4" fill="#ffffff" stroke="#dbeafe" />
        <rect x="6" y="8" width="16" height="3" rx="1.5" fill="#93c5fd" />
        <rect x="6" y="15" width="16" height="3" rx="1.5" fill="#bfdbfe" />
        <rect x="6" y="22" width="10" height="3" rx="1.5" fill="#bfdbfe" />
      </g>
    </svg>
  )
}

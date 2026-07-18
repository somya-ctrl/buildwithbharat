const NAV_ITEMS = [
  { label: 'Workspaces', icon: 'grid_view', active: true },
  { label: 'Files', icon: 'folder_open' },
  { label: 'Chat', icon: 'chat_bubble' },
  { label: 'AI Assistant', icon: 'smart_toy' },
  { label: 'Settings', icon: 'settings' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-64px)] w-[240px] flex-col border-r border-outline-variant bg-surface-container-low py-stack-md lg:flex">
      <div className="mb-stack-lg px-6">
        <div className="mb-1 flex items-center gap-stack-sm">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            dataset
          </span>
          <h2 className="font-headline-sm text-headline-sm font-black text-primary">
            Codexa
          </h2>
        </div>
        <p className="font-label-md text-label-md text-secondary">
          AI Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-stack-sm px-4 py-2 font-label-md text-label-md transition-all active:scale-95 ${
              item.active
                ? 'border-l-2 border-primary bg-secondary-container text-on-secondary-container'
                : 'text-secondary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto border-t border-outline-variant px-2 pt-stack-md">
        <a
          href="#"
          className="flex items-center gap-stack-sm px-4 py-2 font-label-md text-label-md text-secondary transition-all hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  )
}

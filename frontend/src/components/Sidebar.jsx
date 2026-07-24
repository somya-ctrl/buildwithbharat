const NAV_ITEMS = [
  { id: 'workspaces', label: 'Workspaces', icon: 'grid_view' },
  { id: 'files', label: 'Files', icon: 'folder_open' },
  { id: 'chat', label: 'Chat', icon: 'chat_bubble' },
  { id: 'ai', label: 'AI Assistant', icon: 'smart_toy' },
  { id: 'friends', label: 'Friends', icon: 'people' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ activeTab = 'workspaces', onTabChange }) {
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
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className={`flex w-full items-center gap-stack-sm rounded-lg px-4 py-2 font-label-md text-label-md transition-all active:scale-95 ${
                isActive
                  ? 'border-l-4 border-primary bg-secondary-container font-bold text-on-secondary-container shadow-sm'
                  : 'text-secondary hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant px-2 pt-stack-md">
        <button
          onClick={() => onTabChange && onTabChange('settings')}
          className="flex w-full items-center gap-stack-sm rounded-lg px-4 py-2 font-label-md text-label-md text-secondary transition-all hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </button>
      </div>
    </aside>
  )
}

const MOBILE_NAV_ITEMS = [
  { label: 'Workspaces', icon: 'grid_view', active: true },
  { label: 'Chat', icon: 'chat_bubble' },
  { label: 'AI', icon: 'smart_toy' },
  { label: 'Settings', icon: 'settings' },
]

export default function Footer() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-surface-variant bg-surface px-4 md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`flex flex-col items-center gap-1 ${
            item.active ? 'text-primary' : 'text-secondary'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {item.icon}
          </span>
          <span className={`text-[10px] ${item.active ? 'font-bold' : ''}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

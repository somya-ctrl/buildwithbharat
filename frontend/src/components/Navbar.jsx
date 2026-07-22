import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { notificationAPI, userAPI } from '../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Fetch notifications on load & click
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.list()
      if (Array.isArray(res.data)) {
        setNotifications(res.data)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark notifications read:', err)
    }
  }

  // Teammate search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await userAPI.search(searchQuery)
        setSearchResults(res.data || [])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const avatarUrl =
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user?.name || 'User'
    )}`

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-surface-variant bg-surface px-margin-page shadow-sm">
      <div className="flex items-center gap-stack-md">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          Codexa
        </h1>
        <nav className="ml-stack-lg hidden gap-stack-md md:flex">
          <span className="border-b-2 border-primary px-2 py-1 font-body-md text-body-md font-bold text-primary">
            Dashboard
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-stack-md">
        {/* Teammate Search */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search teammates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className={`rounded-lg border border-outline-variant bg-surface-container-low py-1.5 pl-9 pr-4 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary ${
              searchFocused ? 'w-80' : 'w-64'
            }`}
          />

          {/* Search Dropdown */}
          {searchFocused && searchQuery.trim() !== '' && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-lg">
              <p className="px-3 py-1 font-label-md text-xs text-secondary">
                Search Results
              </p>
              {isSearching ? (
                <p className="px-3 py-2 text-xs text-outline">Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-container-high"
                  >
                    <img
                      src={
                        u.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                      }
                      alt={u.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-body-md text-sm font-semibold">
                        {u.name}
                      </p>
                      <p className="font-label-md text-xs text-secondary">
                        {u.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-outline">No users found.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfileMenu(false)
              }}
              className="relative rounded-full p-2 text-secondary transition-colors hover:bg-surface-container-high active:opacity-80"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between border-b border-outline-variant pb-2">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="font-label-md text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-lg p-2.5 transition-colors ${
                          n.isRead ? 'bg-transparent' : 'bg-primary/5'
                        }`}
                      >
                        <p className="font-body-md text-xs text-on-surface">
                          {n.text}
                        </p>
                        <span className="mt-1 block font-label-md text-[10px] text-outline">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-xs text-secondary">
                      No notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 rounded-full border border-outline-variant p-0.5 transition-all hover:ring-2 hover:ring-primary/20"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant">
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User avatar'}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-xl">
                <div className="border-b border-outline-variant px-3 py-2">
                  <p className="font-body-md text-sm font-bold text-on-surface">
                    {user?.name || 'Developer'}
                  </p>
                  <p className="truncate font-label-md text-xs text-secondary">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-label-md text-sm text-error transition-colors hover:bg-error-container/20"
                >
                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

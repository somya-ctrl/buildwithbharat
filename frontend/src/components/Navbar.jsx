import { useState } from 'react'

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-surface-variant bg-surface px-margin-page shadow-sm">
      <div className="flex items-center gap-stack-md">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          Codexa
        </h1>
        <nav className="ml-stack-lg hidden gap-stack-md md:flex">
          <a
            href="#"
            className="border-b-2 border-primary px-2 py-1 font-body-md text-body-md font-bold text-primary"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="rounded px-2 py-1 font-body-md text-body-md text-secondary transition-colors hover:bg-surface-container-high"
          >
            Projects
          </a>
          <a
            href="#"
            className="rounded px-2 py-1 font-body-md text-body-md text-secondary transition-colors hover:bg-surface-container-high"
          >
            Team
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-stack-md">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`rounded-lg border border-outline-variant bg-surface-container-low py-1.5 pl-9 pr-4 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary ${
              searchFocused ? 'w-80' : 'w-64'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-container-high active:opacity-80"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-container-high active:opacity-80"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="ml-2 h-8 w-8 overflow-hidden rounded-full border border-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDKEQDu1ECqXEun018Aw5SDOvGx9W0mlbl0wSpH12oDwRCadugsFr3oDAgPG4Tyn-hNKl-BiB_GqIQA-8rc9BGolu3wvZnJERbQ0WaPd8SW_zeqZhONqFQz5Uf-jiVdnnQHXKhKFANNqrw90zvrVWxfvsVbk0C69Clx5QYzZW0MFIY5jGZmxS1_ep77t-r97T74nhn9b7HkgonFf1L9Qls8dKt9nFwqJCNh3tYwMMOuGRouQEslmQld9ufR7q5ajil7joweUHdZFJj"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

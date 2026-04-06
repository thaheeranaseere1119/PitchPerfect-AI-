import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ darkMode, toggleDark }) {
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-900/40 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5z"/>
              <path d="M3.5 11a1 1 0 012 0 6.5 6.5 0 0013 0 1 1 0 012 0 8.5 8.5 0 01-8 8.47V22h3a1 1 0 010 2H8a1 1 0 010-2h3v-2.53A8.5 8.5 0 013.5 11z"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">PitchPerfect AI</span>
        </Link>

        <div className="flex items-center gap-4">
          {location.pathname === '/' && (
            <Link to="/record" id="nav-start-btn"
              className="px-5 py-2 rounded-lg text-sm font-semibold
                         bg-gradient-to-r from-brand-600 to-accent-600
                         hover:from-brand-500 hover:to-accent-500
                         text-white transition-all duration-200 active:scale-95">
              Start Recording
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            onClick={toggleDark}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 flex items-center justify-center text-slate-400 hover:text-slate-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a1 1 0 011 1v1a1 1 0 01-2 0V4a1 1 0 011-1zm0 15a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm9-8a1 1 0 010 2h-1a1 1 0 010-2h1zM4 11a1 1 0 010 2H3a1 1 0 010-2h1zm14.95-6.364a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm-12.728 12.02a1 1 0 010 1.413l-.707.707a1 1 0 01-1.414-1.413l.707-.707a1 1 0 011.414 0zm12.728.001a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zm-12.728-12.02a1 1 0 01-1.414 0l-.707-.707A1 1 0 015.515 3.51l.707.707a1 1 0 010 1.414zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.25 12a9.25 9.25 0 01-12.99 8.44 1 1 0 01.21-1.93A7.25 7.25 0 0017.5 9.23a1 1 0 011.92-.26A9.23 9.23 0 0121.25 12z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

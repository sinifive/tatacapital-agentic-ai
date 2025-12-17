import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ onLoginClick, onApplyClick, isLoggedIn, userName, onLogout, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState('en')

  const navLinks = [
    { label: 'Loans for You', href: '#loans-personal', action: 'loans-personal' },
    { label: 'Loans for Business', href: '#loans-business', action: 'loans-business' },
    { label: 'Offers', href: '#offers', action: 'offers' },
    { label: 'My Applications', href: '#my-applications', action: 'my-applications', requiresLogin: true },
    { label: 'Apply', href: '#apply', action: 'apply' },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  const handleLanguageChange = (code) => {
    setLanguage(code)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-tata-blue focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <header className="bg-tata-blue text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header content */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <a
                href="/"
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue rounded px-2 py-1"
                aria-label="Tata Capital Home"
              >
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-bold text-tata-blue text-sm">
                  TC
                </div>
                <span className="hidden sm:block font-bold text-lg">TATA CAPITAL</span>
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-8 ml-8"
              aria-label="Main Navigation"
              role="navigation"
            >
            {navLinks.map((link, idx) => {
              // Skip login-required links if not logged in
              if (link.requiresLogin && !isLoggedIn) {
                return null
              }
              
              return (
                <motion.a
                  key={idx}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    if (link.action === 'apply') {
                      onApplyClick()
                    } else if (onNavigate) {
                      onNavigate(link.action)
                    }
                  }}
                  className="text-sm font-medium relative group focus:outline-none focus:ring-2 focus:ring-tata-yellow rounded px-2 py-1 cursor-pointer"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  aria-label={link.label}
                >
                  {link.label}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-tata-yellow group-hover:w-full transition-all"
                    layoutId={`underline-${idx}`}
                  />
                </motion.a>
              )
            })}
            </nav>

            {/* Right side - Language toggle, Login, Apply (desktop) */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Language Dropdown */}
              <div className="relative group">
                <button
                  className="text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-tata-yellow"
                  aria-label={`Current language: ${languages.find(l => l.code === language)?.name}`}
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  {language.toUpperCase()}
                </button>
                <motion.div
                  className="absolute right-0 mt-2 w-32 bg-white text-slate-800 rounded shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        language === lang.code
                          ? 'bg-tata-blue text-white font-semibold'
                          : 'hover:bg-gray-100'
                      } focus:outline-none focus:ring-2 focus:ring-tata-blue`}
                      aria-label={lang.name}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Auth Buttons */}
              {!isLoggedIn ? (
                <>
                  <motion.button
                    onClick={onLoginClick}
                    className="hidden sm:block bg-white text-tata-blue px-3 sm:px-4 py-2 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue"
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Login to your account"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={onApplyClick}
                    className="bg-tata-yellow text-slate-900 px-3 sm:px-4 py-2 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-tata-blue"
                    whileHover={{ backgroundColor: '#ffd700' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Apply now for a loan"
                  >
                    Apply Now
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm truncate max-w-[120px]">
                    Hi, <span className="font-semibold">{userName}</span>
                  </span>
                  <motion.button
                    onClick={onLogout}
                    className="bg-white text-tata-blue px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue"
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Logout from your account"
                  >
                    Logout
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-tata-yellow"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                id="mobile-menu"
                className="lg:hidden bg-tata-blue border-t border-blue-400 py-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                aria-label="Mobile Navigation"
              >
                <div className="space-y-2 px-2">
                  {/* Mobile Nav Links */}
                  {navLinks.map((link, idx) => {
                    // Skip login-required links if not logged in
                    if (link.requiresLogin && !isLoggedIn) {
                      return null
                    }
                    
                    return (
                      <motion.a
                        key={idx}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault()
                          if (link.action === 'apply') {
                            onApplyClick()
                          } else if (onNavigate) {
                            onNavigate(link.action)
                          }
                          handleNavClick()
                        }}
                        className="block px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue transition-colors cursor-pointer"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {link.label}
                      </motion.a>
                    )
                  })}

                  {/* Mobile Language Toggle */}
                  <div className="px-4 py-2 border-t border-blue-400 mt-4 pt-4">
                    <p className="text-xs font-semibold mb-2 opacity-75">Language</p>
                    <div className="flex gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                            language === lang.code
                              ? 'bg-tata-yellow text-slate-900'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } focus:outline-none focus:ring-2 focus:ring-tata-yellow`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Auth */}
                  <div className="px-4 py-2 border-t border-blue-400 mt-4 pt-4 space-y-2">
                    {!isLoggedIn ? (
                      <>
                        <motion.button
                          onClick={() => {
                            onLoginClick()
                            handleNavClick()
                          }}
                          className="w-full bg-white text-tata-blue px-4 py-2 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue"
                          whileTap={{ scale: 0.95 }}
                        >
                          Login
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            onApplyClick()
                            handleNavClick()
                          }}
                          className="w-full bg-tata-yellow text-slate-900 px-4 py-2 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-tata-blue"
                          whileTap={{ scale: 0.95 }}
                        >
                          Apply Now
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => {
                          onLogout()
                          handleNavClick()
                        }}
                        className="w-full bg-white text-tata-blue px-4 py-2 rounded font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 focus:ring-offset-tata-blue"
                        whileTap={{ scale: 0.95 }}
                      >
                        Logout
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}

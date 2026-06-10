import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Menu, X, Library, LayoutDashboard, LogOut, Upload, ChevronDown, Sparkles, MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isReaderPage = location.pathname.startsWith('/read/');
  if (isReaderPage) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: 'rgba(8,8,8,0.95)', borderColor: '#1a1a1a' }}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
              <BookOpen size={16} style={{ color: '#f97316' }} />
            </div>
            <span className="font-display text-xl text-white tracking-tight">ReadSphere</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/browse', label: 'Browse' },
              { to: '/ai-summary', label: 'AI Summary' },
              { to: '/chat-pdf', label: 'Chat PDF' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  color: isActive(to) ? '#f97316' : '#aaa',
                  background: isActive(to) ? 'rgba(249,115,22,0.1)' : 'transparent',
                }}>
                {label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/publisher/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: isActive('/publisher/dashboard') ? '#f97316' : '#aaa', background: isActive('/publisher/dashboard') ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                  Dashboard
                </Link>
                <Link to="/publisher/books"
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: isActive('/publisher/books') ? '#f97316' : '#aaa', background: isActive('/publisher/books') ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                  My Books
                </Link>
              </>
            )}
            {user && (
              <Link to="/library"
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ color: isActive('/library') ? '#f97316' : '#aaa', background: isActive('/library') ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                Library
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/browse')} className="p-2 rounded-lg transition-colors"
              style={{ color: '#666' }}>
              <Search size={18} />
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#ddd' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl overflow-hidden z-50"
                    style={{ background: '#111', border: '1px solid #222' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #222' }}>
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs truncate" style={{ color: '#666' }}>{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs capitalize"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>{user.role}</span>
                    </div>
                    <div className="py-1">
                      <DropdownItem icon={LayoutDashboard} label="Dashboard" to="/publisher/dashboard" close={() => setDropdownOpen(false)} />
<DropdownItem icon={Upload} label="Upload Book" to="/publisher/upload" close={() => setDropdownOpen(false)} />
                      <DropdownItem icon={Library} label="My Library" to="/library" close={() => setDropdownOpen(false)} />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#ef4444' }}>
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login" className="btn-ghost py-2 px-4 text-sm">Sign in</Link>
                <Link to="/auth/register"
                  className="py-2 px-4 rounded-lg text-sm font-semibold text-black transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#aaa' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-1" style={{ borderTop: '1px solid #1a1a1a' }}>
            {[
              { to: '/browse', label: 'Browse', icon: Search },
              { to: '/ai-summary', label: 'AI Summary', icon: Sparkles },
              { to: '/chat-pdf', label: 'Chat PDF', icon: MessageSquare },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  color: isActive(to) ? '#f97316' : '#aaa',
                  background: isActive(to) ? 'rgba(249,115,22,0.1)' : 'transparent',
                }}>
                <Icon size={16} /> {label}
              </Link>
            ))}

            {user && (
              <Link to="/library" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ color: isActive('/library') ? '#f97316' : '#aaa', background: isActive('/library') ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                <Library size={16} /> Library
              </Link>
            )}

            {user && (
              <>
                <Link to="/publisher/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: '#aaa' }}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/publisher/upload" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: '#aaa' }}>
                  <Upload size={16} /> Upload Book
                </Link>
              </>
            )}

            <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '8px', paddingTop: '8px' }}>
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{user.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors"
                    style={{ color: '#ef4444' }}>
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link to="/auth/login" onClick={() => setMenuOpen(false)}
                    className="btn-ghost flex-1 text-center py-2.5 text-sm">Sign in</Link>
                  <Link to="/auth/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-black"
                    style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropdownItem({ icon: Icon, label, to, close }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => { navigate(to); close(); }}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
      style={{ color: '#ccc' }}
      onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <Icon size={15} /> {label}
    </button>
  );
}
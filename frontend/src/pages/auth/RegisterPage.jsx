import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, PenLine, BookMarked } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/common/Toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuthStore();
  const toast = useToast();

  const [role, setRole] = useState(searchParams.get('role') === 'publisher' ? 'publisher' : 'reader');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.show('Password must be at least 6 characters', 'warning'); return; }
    const result = await register(form.name, form.email, form.password, role);
    if (result.success) {
      toast.show('Account created! Please verify your email.', 'success');
      navigate('/auth/verify', { state: { userId: result.userId } });
    } else {
      toast.show(result.error, 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16"
      style={{ background: '#0d0d0d' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05 }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 rounded-2xl" style={{ background: '#111', border: '1px solid #1f1f1f' }}>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
              <BookOpen size={22} style={{ color: '#f97316' }} />
            </div>
          </div>

          <h1 className="font-display text-3xl text-white text-center mb-2">Create account</h1>
          <p className="text-sm text-center mb-8" style={{ color: '#666' }}>Join ReadSphere and start your journey</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'reader', icon: BookMarked, label: 'I want to read', desc: 'Discover & read books' },
              { value: 'publisher', icon: PenLine, label: 'I want to publish', desc: 'Upload & share your books' },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  border: role === value ? '1px solid rgba(249,115,22,0.4)' : '1px solid #222',
                  background: role === value ? 'rgba(249,115,22,0.08)' : '#0d0d0d',
                }}>
                <Icon size={20} className="mb-2" style={{ color: role === value ? '#f97316' : '#444' }} />
                <p className="text-sm font-semibold" style={{ color: role === value ? '#fff' : '#666' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#888' }}>Full Name</label>
              <input type="text" placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#0d0d0d', border: '1px solid #222', color: '#ddd' }}
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
                onBlur={e => e.target.style.borderColor = '#222'}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required autoFocus />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#888' }}>Email</label>
              <input type="email" placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#0d0d0d', border: '1px solid #222', color: '#ddd' }}
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
                onBlur={e => e.target.style.borderColor = '#222'}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#888' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#0d0d0d', border: '1px solid #222', color: '#ddd' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
                  onBlur={e => e.target.style.borderColor = '#222'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#555' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
{/* Divider */}
<div className="flex items-center gap-3 my-6">
  <div className="flex-1 h-px" style={{ background: '#222' }} />
  <span className="text-xs" style={{ color: '#555' }}>or</span>
  <div className="flex-1 h-px" style={{ background: '#222' }} />
</div>

{/* Google Register Button */}
<a href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}>
  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
  Continue with Google
</a>
          <p className="text-sm text-center mt-6" style={{ color: '#555' }}>
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold transition-colors" style={{ color: '#f97316' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
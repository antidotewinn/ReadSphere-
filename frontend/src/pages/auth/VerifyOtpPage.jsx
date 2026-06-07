import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/common/Toast';
import api from '../../utils/api';

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, isLoading } = useAuthStore();
  const toast = useToast();

  const userId = location.state?.userId;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/auth/register');
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d !== '')) handleVerify(next.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      handleVerify(text);
    }
  };

  const handleVerify = async (otp) => {
    const result = await verifyOtp(userId, otp);
    if (result.success) {
      toast.show('Email verified! Welcome to ReadSphere.', 'success');
      navigate(result.user.role === 'publisher' ? '/publisher/dashboard' : '/');
    } else {
      toast.show(result.error, 'error');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.show('New OTP sent to your email.', 'info');
      setCountdown(60);
    } catch (_) { toast.show('Could not resend OTP.', 'error'); }
    setResending(false);
  };

  const submitManually = () => {
    const otp = digits.join('');
    if (otp.length === 6) handleVerify(otp);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-gold" />
          </div>
        </div>

        <h1 className="font-display text-3xl text-white mb-2">Check your email</h1>
        <p className="text-ink-400 text-sm mb-10 leading-relaxed">
          We sent a 6-digit code to your email address. Enter it below to verify your account.
        </p>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-mono font-medium rounded-xl border transition-all
                bg-ink-800 text-white focus:outline-none
                ${d ? 'border-gold/50 text-gold' : 'border-ink-700 focus:border-gold/40'}`}
            />
          ))}
        </div>

        <button
          onClick={submitManually}
          disabled={digits.some(d => !d) || isLoading}
          className="btn-primary w-full py-3 text-base mb-4 disabled:opacity-60"
        >
          {isLoading ? 'Verifying…' : 'Verify email'}
        </button>

        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="text-sm text-ink-500 hover:text-ink-300 disabled:text-ink-700 transition-colors"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

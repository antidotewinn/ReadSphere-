import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function GoogleSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleGoogleSuccess = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userId = searchParams.get('userId');

      if (!accessToken || !refreshToken) {
        navigate('/auth/login?error=google_failed');
        return;
      }

      try {
        // Store tokens
        const stored = { state: { accessToken, refreshToken } };
        localStorage.setItem('readsphere-auth', JSON.stringify(stored));

        // Get user data
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Set auth state
        // Set auth state
        setAuth(res.data.user, accessToken, refreshToken);

        // Redirect based on role
        if (res.data.user.role === 'publisher') {
          navigate('/publisher/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Google auth error:', err.response?.status, err.response?.data, err.message);
        navigate('/auth/login?error=google_failed');
      }
    };

    handleGoogleSuccess();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: '#f97316', borderTopColor: 'transparent' }} />
        <p className="text-white text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
}
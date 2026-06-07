import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import AISummaryPage from './pages/AISummaryPage';
import ChatPDFPage from './pages/ChatPDFPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ReaderPage from './pages/ReaderPage';
import LibraryPage from './pages/LibraryPage';
import PublisherDashboardPage from './pages/publisher/PublisherDashboardPage';
import UploadBookPage from './pages/publisher/UploadBookPage';
import ManageBooksPage from './pages/publisher/ManageBooksPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/auth/login" replace />;
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  if (accessToken) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <div className="min-h-screen bg-ink-950">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/ai-summary" element={<AISummaryPage />} />
          <Route path="/chat-pdf" element={<ChatPDFPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />

          {/* Auth */}
          <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/auth/verify" element={<VerifyOtpPage />} />

          {/* Reader */}
          <Route path="/read/:id" element={<ProtectedRoute><ReaderPage /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />

          {/* Publisher */}
          <Route path="/publisher/dashboard" element={<ProtectedRoute requiredRole="publisher"><PublisherDashboardPage /></ProtectedRoute>} />
          <Route path="/publisher/upload" element={<ProtectedRoute requiredRole="publisher"><UploadBookPage /></ProtectedRoute>} />
          <Route path="/publisher/books" element={<ProtectedRoute requiredRole="publisher"><ManageBooksPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

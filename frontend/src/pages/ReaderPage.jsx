import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, BookmarkCheck,
  Moon, Sun, RotateCcw, Home, Loader
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../utils/api';
import { useToast } from '../components/common/Toast';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [pageInput, setPageInput] = useState('1');
  const [error, setError] = useState('');

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Get signed URL
        const urlRes = await api.get(`/books/${id}/read`);
const signedUrl = urlRes.data.url;

        // Get book title
        const bookRes = await api.get(`/books/${id}`);
        setBookTitle(bookRes.data.data.title);

        // Get reading progress
        const progressRes = await api.get(`/reader/progress/${id}`);
        const prog = progressRes.data.data;
        setBookmarks(prog.bookmarks || []);
        const startPage = prog.currentPage || 1;

        // Load PDF
        console.log('Loading PDF from URL:', signedUrl);
        const pdfDoc = await pdfjsLib.getDocument({ 
  url: signedUrl, 
  withCredentials: false,
  cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
  cMapPacked: true,
}).promise;

        pdfRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(startPage);
        setPageInput(String(startPage));
        setLoading(false);
      } catch (err) {
          setError('Could not load this book. Please try again.');
        setLoading(false);
      }
    };
    loadPdf();
  }, [id]);

  // Render page
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfRef.current || !canvasRef.current) return;
    setPageLoading(true);

    // Cancel previous render
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) {}
    }

    try {
      const page = await pdfRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport,
        background: darkMode ? '#1a1a1a' : '#ffffff',
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') console.error(err);
    }
    setPageLoading(false);
  }, [scale, darkMode]);

  useEffect(() => {
    if (!loading) renderPage(currentPage);
  }, [currentPage, scale, darkMode, loading]);

  // Save progress (debounced)
  useEffect(() => {
    if (loading || totalPages === 0) return;
    const t = setTimeout(() => {
      api.put(`/reader/progress/${id}`, { currentPage, bookmarks }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [currentPage, bookmarks, loading]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, totalPages, scale]);

  const goNext = () => { if (currentPage < totalPages) { const p = currentPage + 1; setCurrentPage(p); setPageInput(String(p)); } };
  const goPrev = () => { if (currentPage > 1) { const p = currentPage - 1; setCurrentPage(p); setPageInput(String(p)); } };
  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.6));

  const toggleBookmark = () => {
    setBookmarks(prev => {
      if (prev.includes(currentPage)) return prev.filter(b => b !== currentPage);
      return [...prev, currentPage].sort((a, b) => a - b);
    });
  };

  const isBookmarked = bookmarks.includes(currentPage);

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const p = parseInt(pageInput);
      if (p >= 1 && p <= totalPages) { setCurrentPage(p); }
      else setPageInput(String(currentPage));
    }
  };

  // Prevent right-click on canvas
  const preventContextMenu = (e) => e.preventDefault();

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="text-center">
        <p className="text-ink-300 text-lg mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-ghost">Go back</button>
          <Link to={`/book/${id}`} className="btn-primary">View book page</Link>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <div className="text-center">
        <Loader size={32} className="text-gold animate-spin mx-auto mb-4" />
        <p className="text-ink-400 text-sm">Loading your book…</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col select-none ${darkMode ? 'bg-[#111]' : 'bg-[#f5f0e8]'}`}
      onContextMenu={preventContextMenu}>

      {/* Top bar */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b ${
        darkMode ? 'bg-ink-950/95 border-ink-800' : 'bg-white/95 border-gray-200'
      } backdrop-blur-md`}>
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/library')} className={`flex items-center gap-1.5 text-sm transition-colors ${darkMode ? 'text-ink-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            <Home size={15} /> Library
          </button>
          <span className={`text-xs ${darkMode ? 'text-ink-600' : 'text-gray-300'}`}>|</span>
          <span className={`text-sm truncate max-w-[180px] md:max-w-xs font-display ${darkMode ? 'text-ink-200' : 'text-gray-700'}`}>{bookTitle}</span>
        </div>

        {/* Center — page nav */}
        <div className="flex items-center gap-1.5">
          <button onClick={goPrev} disabled={currentPage <= 1} className={`p-1.5 rounded transition-colors disabled:opacity-30 ${darkMode ? 'text-ink-400 hover:text-white hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={handlePageInput}
              min={1}
              max={totalPages}
              className={`w-12 text-center text-sm rounded px-1 py-0.5 border focus:outline-none focus:ring-1 focus:ring-gold/40 ${
                darkMode ? 'bg-ink-800 border-ink-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            />
            <span className={`text-xs ${darkMode ? 'text-ink-500' : 'text-gray-400'}`}>/ {totalPages}</span>
          </div>
          <button onClick={goNext} disabled={currentPage >= totalPages} className={`p-1.5 rounded transition-colors disabled:opacity-30 ${darkMode ? 'text-ink-400 hover:text-white hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-1">
          <IconBtn icon={ZoomOut} onClick={zoomOut} dark={darkMode} disabled={scale <= 0.6} title="Zoom out (-)" />
          <span className={`text-xs font-mono w-10 text-center ${darkMode ? 'text-ink-400' : 'text-gray-500'}`}>{Math.round(scale * 100)}%</span>
          <IconBtn icon={ZoomIn} onClick={zoomIn} dark={darkMode} disabled={scale >= 3} title="Zoom in (+)" />
          <IconBtn icon={RotateCcw} onClick={() => setScale(1.2)} dark={darkMode} title="Reset zoom" />
          <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-ink-700' : 'bg-gray-200'}`} />
          <IconBtn icon={isBookmarked ? BookmarkCheck : Bookmark} onClick={toggleBookmark} dark={darkMode}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
            active={isBookmarked} />
          <IconBtn icon={darkMode ? Sun : Moon} onClick={() => setDarkMode(!darkMode)} dark={darkMode} title="Toggle theme" />
        </div>
      </header>

      {/* Canvas area */}
      <main className="flex-1 flex flex-col items-center overflow-auto py-6 px-4 bg-gray-200">
        {/* Bookmarks bar */}
        {bookmarks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 max-w-3xl w-full">
            {bookmarks.map(b => (
              <button key={b} onClick={() => { setCurrentPage(b); setPageInput(String(b)); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  b === currentPage
                    ? 'bg-gold/20 border-gold/40 text-gold'
                    : darkMode ? 'border-ink-700 text-ink-400 hover:border-ink-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                p.{b}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          {pageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 rounded-lg"
              style={{ background: darkMode ? 'rgba(17,17,17,0.7)' : 'rgba(245,240,232,0.7)' }}>
              <Loader size={24} className="text-gold animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl max-w-full"
            style={{ display: 'block' }}
          />
        </div>
      </main>

      {/* Bottom progress bar */}
      <div className={`h-1 ${darkMode ? 'bg-ink-800' : 'bg-gray-200'}`}>
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, dark, disabled, title, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
        active
          ? 'text-gold'
          : dark ? 'text-ink-400 hover:text-white hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

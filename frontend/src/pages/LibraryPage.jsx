import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Bookmark } from 'lucide-react';
import api from '../utils/api';
import { BookGridSkeleton } from '../components/common/Skeleton';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/books?limit=100&sort=newest')
      .then(res => setBooks(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Faded background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.05 }} />
      </div>

      <div className="page-container py-12 relative z-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>Your Collection</p>
          <h1 className="font-display text-4xl text-white mb-2">My Library</h1>
          <p className="text-sm" style={{ color: '#666' }}>{books.length} {books.length === 1 ? 'book' : 'books'} available</p>
        </div>

        {loading ? <BookGridSkeleton count={8} /> : books.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid #1f1f1f' }}>
              <BookOpen size={32} style={{ color: '#333' }} />
            </div>
            <p className="text-lg mb-2" style={{ color: '#aaa' }}>Your library is empty</p>
            <p className="text-sm mb-6" style={{ color: '#555' }}>Browse books and start reading</p>
            <Link to="/browse"
              className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map(book => (
              <LibraryBookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryBookCard({ book }) {
  const navigate = useNavigate();
  const progress = book.progress || { currentPage: 0, bookmarks: [] };
  const pct = book.pageCount > 0 ? Math.round(((progress.currentPage || 0) / book.pageCount) * 100) : 0;
  const hasBookmarks = progress.bookmarks?.length > 0;

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ background: '#111', border: '1px solid #1f1f1f' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}
      onClick={() => navigate(`/read/${book._id}`)}>

      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: '#1a1a1a' }}>
        {book.coverImage?.url ? (
          <img src={book.coverImage.url} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl" style={{ color: '#333' }}>{book.title?.charAt(0)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <button className="px-4 py-2 rounded-full text-xs font-semibold text-black flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
            <BookOpen size={12} />
            {progress.currentPage > 1 ? 'Continue' : 'Start Reading'}
          </button>
        </div>

        {hasBookmarks && (
          <div className="absolute top-2 right-2">
            <Bookmark size={14} style={{ color: '#f97316', fill: '#f97316' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-1">{book.title}</h3>
        <p className="text-xs mb-2 truncate" style={{ color: '#555' }}>{book.author}</p>

        {/* Progress */}
        <div className="mt-auto">
          {progress.currentPage > 1 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock size={10} style={{ color: '#555' }} />
              <span className="text-[10px]" style={{ color: '#555' }}>p.{progress.currentPage} · {pct}%</span>
            </div>
          )}
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(pct, progress.currentPage > 1 ? 3 : 0)}%`, background: 'linear-gradient(90deg, #f97316, #f0c060)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
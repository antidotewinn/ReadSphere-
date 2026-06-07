import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Send, BookOpen, Star } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function ManageBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/publisher/books')
      .then(res => setBooks(res.data.data))
      .catch(() => toast.show('Could not load books', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async (id) => {
    setPublishing(id);
    try {
      await api.put(`/publisher/books/${id}/publish`);
      setBooks(bs => bs.map(b => b._id === id ? { ...b, status: 'published' } : b));
      toast.show('Book published!', 'success');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Could not publish', 'error');
    }
    setPublishing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/publisher/books/${id}`);
      setBooks(bs => bs.filter(b => b._id !== id));
      toast.show('Book deleted', 'info');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Could not delete', 'error');
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
      </div>

      <div className="page-container py-10 relative z-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>Publisher</p>
            <h1 className="font-display text-3xl text-white">My Books</h1>
          </div>
          <Link to="/publisher/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
            <Plus size={16} /> New Book
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#111' }} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid #1f1f1f' }}>
              <BookOpen size={32} style={{ color: '#333' }} />
            </div>
            <p className="text-lg mb-2" style={{ color: '#aaa' }}>No books yet</p>
            <Link to="/publisher/upload"
              className="inline-flex mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
              Upload your first book
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map(book => (
              <div key={book._id} className="p-4 rounded-2xl flex items-start gap-4 transition-all"
                style={{ background: '#111', border: '1px solid #1f1f1f' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}>

                {/* Cover */}
                <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0"
                  style={{ background: '#1a1a1a' }}>
                  {book.coverImage?.url ? (
                    <img src={book.coverImage.url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display" style={{ color: '#444' }}>{book.title?.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-white text-sm font-semibold truncate">{book.title}</h3>
                    <StatusBadge status={book.status} />
                  </div>
                  <p className="text-xs mb-2 capitalize" style={{ color: '#666' }}>
                    by {book.author} · {book.category}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: '#555' }}>
                    <span className="flex items-center gap-1">
                      <Star size={10} style={{ color: '#f97316' }} />
                      {book.ratings?.average?.toFixed(1) || '—'} ({book.ratings?.count || 0})
                    </span>
                    <span>{book.salesCount || 0} sales</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {book.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(book._id)}
                      disabled={publishing === book._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black disabled:opacity-60 transition-all"
                      style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                      <Send size={12} /> {publishing === book._id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                  {book.status === 'published' && (
                    <Link to={`/book/${book._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa' }}>
                      <BookOpen size={12} /> View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(book._id)}
                    disabled={deleting === book._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    <Trash2 size={12} /> {deleting === book._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: { background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid #222' },
    published: { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' },
    suspended: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  };
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
      style={styles[status] || styles.draft}>
      {status}
    </span>
  );
}
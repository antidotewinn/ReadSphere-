import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, BookOpen } from 'lucide-react';
import api from '../utils/api';
import BookCard from '../components/common/BookCard';
import { BookGridSkeleton } from '../components/common/Skeleton';

const CATEGORIES = ['all','fiction','non-fiction','science','technology','history','biography','self-help','romance','thriller','fantasy','children','other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'all') params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', page);
      params.set('limit', 18);

      const res = await api.get(`/books?${params.toString()}`);
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch (_) {}
    setLoading(false);
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Faded background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-10 rounded-full"
          style={{ background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="page-container py-10 relative z-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>Explore</p>
          <h1 className="font-display text-4xl text-white mb-2">Browse Books</h1>
          <p className="text-sm" style={{ color: '#666' }}>{pagination.total} books available</p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
            <input
              type="text"
              placeholder="Search by title, author..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: '#111', border: '1px solid #222', color: '#ddd' }}
              value={search}
              onChange={e => setParam('search', e.target.value)}
            />
            {search && (
              <button onClick={() => setParam('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#666' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#111', border: '1px solid #222', color: '#ddd', minWidth: '160px' }}
            value={sort}
            onChange={e => setParam('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filtersOpen ? 'rgba(249,115,22,0.1)' : '#111',
              border: filtersOpen ? '1px solid rgba(249,115,22,0.3)' : '1px solid #222',
              color: filtersOpen ? '#f97316' : '#aaa'
            }}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="p-4 mb-6 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>Min price (₹)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111', border: '1px solid #222', color: '#ddd' }}
                placeholder="0" value={minPrice} onChange={e => setParam('minPrice', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>Max price (₹)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111', border: '1px solid #222', color: '#ddd' }}
                placeholder="Any" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: '#111', border: '1px solid #222', color: '#aaa' }}>
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setParam('category', cat === 'all' ? '' : cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
              style={{
                background: (cat === 'all' && category === 'all') || cat === category ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                border: (cat === 'all' && category === 'all') || cat === category ? '1px solid rgba(249,115,22,0.4)' : '1px solid #333',
                color: (cat === 'all' && category === 'all') || cat === category ? '#f97316' : '#bbb',
                fontWeight: '600',
              }}
              onMouseEnter={e => { if (!((cat === 'all' && category === 'all') || cat === category)) { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}}
              onMouseLeave={e => { if (!((cat === 'all' && category === 'all') || cat === category)) { e.currentTarget.style.color = '#bbb'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}>
              {cat === 'all' ? 'All categories' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? <BookGridSkeleton count={18} /> : books.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={48} className="mx-auto mb-4" style={{ color: '#333' }} />
            <p className="text-lg mb-2" style={{ color: '#aaa' }}>No books found</p>
            <p className="text-sm" style={{ color: '#555' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            <button
              disabled={page <= 1}
              onClick={() => setParam('page', page - 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: '#111', border: '1px solid #222', color: '#aaa' }}>
              Previous
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setParam('page', p)}
                className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: p === page ? 'linear-gradient(135deg, #f97316, #f0c060)' : '#111',
                  border: p === page ? 'none' : '1px solid #222',
                  color: p === page ? '#000' : '#aaa',
                }}>
                {p}
              </button>
            ))}
            <button
              disabled={page >= pagination.pages}
              onClick={() => setParam('page', page + 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: '#111', border: '1px solid #222', color: '#aaa' }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
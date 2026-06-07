import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, IndianRupee, BookOpen, Shield, ChevronLeft, User, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/common/Toast';
import { TextSkeleton } from '../components/common/Skeleton';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setBook(bookRes.data.data);
        setReviews(reviewRes.data.data);
      } catch (_) { navigate('/browse'); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) { navigate('/auth/login'); return; }
    setPurchasing(true);
    try {
      const res = await api.post('/payment/create-order', { bookId: id });
      if (res.data.free) {
        toast.show('Book added to your library!', 'success');
        setBook(b => ({ ...b, hasPurchased: true }));
        return;
      }
      // Razorpay checkout
      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'ReadSphere',
        description: res.data.book.title,
        image: res.data.book.coverImage,
        order_id: res.data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', response);
            toast.show('Purchase successful! Book added to your library.', 'success');
            setBook(b => ({ ...b, hasPurchased: true }));
          } catch (_) {
            toast.show('Payment verification failed. Contact support.', 'error');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#f0c060' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.show(err.response?.data?.message || 'Purchase failed', 'error');
    }
    setPurchasing(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/${id}`, reviewForm);
      setReviews(prev => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.show('Review submitted!', 'success');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Could not submit review', 'error');
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="aspect-[2/3] skeleton rounded-xl" />
        <div className="md:col-span-2 space-y-4 pt-4">
          <div className="skeleton h-8 rounded w-3/4" />
          <div className="skeleton h-5 rounded w-1/3" />
          <TextSkeleton lines={5} className="mt-6" />
        </div>
      </div>
    </div>
  );

  if (!book) return null;

  return (
    <div className="page-container py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-ink-400 hover:text-white text-sm mb-8 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-ink-800 shadow-2xl">
            {book.coverImage?.url ? (
              <img src={book.coverImage.url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-6xl text-ink-600">{book.title?.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-ink-700 text-ink-300 capitalize">{book.category}</span>
            {book.isFeatured && <span className="badge bg-gold/15 text-gold">Featured</span>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-white font-normal leading-tight mb-2">{book.title}</h1>
          <p className="text-ink-400 mb-1">by <span className="text-ink-200">{book.author}</span></p>
          {book.publisher && (
            <p className="text-ink-500 text-sm mb-4">Published by <span className="text-ink-300">{book.publisher.name}</span></p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(book.ratings?.average || 0) ? 'text-gold fill-gold' : 'text-ink-700'} />
              ))}
            </div>
            <span className="text-ink-300 text-sm">{book.ratings?.average?.toFixed(1) || '–'}</span>
            <span className="text-ink-600 text-sm">({book.ratings?.count || 0} reviews)</span>
          </div>

          <p className="text-ink-300 leading-relaxed mb-8">{book.description}</p>

          {/* Price + CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-3xl font-medium text-white flex items-center gap-1">
              {book.price === 0 ? (
                <span className="text-emerald-400">Free</span>
              ) : (
                <><IndianRupee size={22} />{book.price}</>
              )}
            </div>
            <Link to={`/read/${book._id}`} className="btn-primary flex items-center gap-2 text-base px-8 py-3">
  <BookOpen size={18} /> Read now
</Link>
          </div>

          {/* Content protection notice */}
          <div className="flex items-center gap-2 mt-4 text-ink-500 text-xs">
            <Shield size={13} />
            <span>Secure in-app reading only — no PDF download</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-ink-800 pt-12">
        <h2 className="section-title mb-8 flex items-center gap-2">
          <MessageSquare size={24} className="text-ink-500" /> Reviews
        </h2>

        {/* Review form */}
        {user && book.hasPurchased && (
          <form onSubmit={submitReview} className="card p-6 mb-8">
            <h3 className="text-white font-medium mb-4">Write a review</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                  <Star size={24} className={s <= reviewForm.rating ? 'text-gold fill-gold' : 'text-ink-700 hover:text-ink-500'} />
                </button>
              ))}
            </div>
            <input className="input mb-3" placeholder="Review title (optional)" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="input mb-4 h-24 resize-none" placeholder="Share your thoughts…" value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
            <button type="submit" disabled={submittingReview} className="btn-primary disabled:opacity-60">
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-ink-500 text-sm py-6">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-medium">
                      {review.reviewer?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{review.reviewer?.name}</p>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={s <= review.rating ? 'text-gold fill-gold' : 'text-ink-700'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-ink-600 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.title && <p className="text-white text-sm font-medium mb-1">{review.title}</p>}
                {review.comment && <p className="text-ink-300 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}

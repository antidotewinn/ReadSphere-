import { Link } from 'react-router-dom';
import { Star, IndianRupee } from 'lucide-react';

export default function BookCard({ book, compact = false }) {
  if (!book) return null;

  return (
    <Link
      to={`/book/${book._id}`}
      className="group flex flex-col bg-ink-800 border border-ink-700 rounded-xl overflow-hidden hover:border-ink-500 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover */}
      <div className={`relative overflow-hidden bg-ink-700 ${compact ? 'aspect-[2/3]' : 'aspect-[3/4]'}`}>
        {book.coverImage?.url ? (
          <img
            src={book.coverImage.url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-700 to-ink-600">
            <span className="font-display text-4xl text-ink-500">{book.title?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {book.price === 0 && (
          <span className="absolute top-2 left-2 badge bg-emerald-900/80 text-emerald-300 text-[10px]">Free</span>
        )}
        {book.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-gold/20 text-gold text-[10px]">Featured</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug mb-1">{book.title}</h3>
        <p className="text-ink-400 text-xs mb-2 truncate">{book.author}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-gold fill-gold" />
            <span className="text-ink-300 text-xs">{book.ratings?.average?.toFixed(1) || '–'}</span>
            {!compact && (
              <span className="text-ink-600 text-xs">({book.ratings?.count || 0})</span>
            )}
          </div>
          <div className="flex items-center text-gold text-sm font-medium">
            {book.price === 0 ? (
              <span className="text-emerald-400 text-xs font-medium">Free</span>
            ) : (
              <>
                <IndianRupee size={12} />
                <span>{book.price}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

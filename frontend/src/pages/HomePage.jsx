import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Shield, Zap, Sparkles, MessageSquare, Upload } from 'lucide-react';
import api from '../utils/api';
import BookCard from '../components/common/BookCard';
import { BookGridSkeleton } from '../components/common/Skeleton';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [featRes, recRes] = await Promise.all([
          api.get('/books/featured'),
          api.get('/books?sort=newest&limit=12'),
        ]);
        setFeatured(featRes.data.data);
        setRecent(recRes.data.data);
      } catch (_) {}
      setLoading(false);
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #f97316 0%, #dc2626 40%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute -right-40 bottom-20 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #f0c060 0%, #f97316 50%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 60%)', filter: 'blur(60px)' }} />
        </div>

        {/* Grid pattern overlay */}
       

        <div className="page-container relative z-10 py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
              <Sparkles size={11} />
              AI-Powered eBook Platform
            </div>

            {/* Heading */}
       <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.1] tracking-tight mb-6">
  Read Smarter.<br />
  <span className="italic" style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
    Learn Faster.
  </span>
</h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: '#999' }}>
              ReadSphere is an AI-powered eBook platform where you can upload, read, summarize, and chat with any PDF — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => navigate('/browse')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-black transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                Browse Books <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/ai-summary')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                <Sparkles size={16} /> Try AI Summary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        <div className="page-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: 'Read Anywhere', desc: 'Dark mode, bookmarks, zoom — a beautiful reading experience.' },
              { icon: Sparkles, title: 'AI Summary', desc: 'Upload any PDF and get instant AI-generated summaries.' },
              { icon: MessageSquare, title: 'Chat with PDF', desc: 'Ask questions about any document and get instant AI answers.' },
              { icon: Upload, title: 'Publish Books', desc: 'Upload your own eBooks and share them with the world.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <Icon size={18} style={{ color: '#f97316' }} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: '#f97316' }}>Powered by Groq AI</p>
            <h2 className="font-display text-4xl text-white mb-3">AI Features</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: '#666' }}>Upload any PDF and let AI do the heavy lifting for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
              style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
              onClick={() => navigate('/ai-summary')}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <Sparkles size={22} style={{ color: '#f97316' }} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Summary</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#666' }}>
                Upload any PDF and instantly get short summary, detailed summary and key points generated by AI.
              </p>
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#f97316' }}>
                Try it now <ArrowRight size={14} />
              </div>
            </div>

            <div className="p-8 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
              style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
              onClick={() => navigate('/chat-pdf')}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <MessageSquare size={22} style={{ color: '#f97316' }} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Chat with PDF</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#666' }}>
                Ask any question about your PDF and get instant, accurate answers powered by Groq AI.
              </p>
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#f97316' }}>
                Try it now <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      {(loading || featured.length > 0) && (
        <section className="py-16" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>Handpicked</p>
                <h2 className="font-display text-3xl text-white">Featured Books</h2>
              </div>
              <Link to="/browse" className="text-sm flex items-center gap-1 transition-colors hover:text-white" style={{ color: '#666' }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? <BookGridSkeleton count={6} /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {featured.map(book => <BookCard key={book._id} book={book} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recently Added */}
      <section className="py-16" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>New Arrivals</p>
              <h2 className="font-display text-3xl text-white">Recently Added</h2>
            </div>
            <Link to="/browse?sort=newest" className="text-sm flex items-center gap-1 transition-colors hover:text-white" style={{ color: '#666' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? <BookGridSkeleton count={12} /> : recent.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: '#333' }} />
              <p className="text-sm mb-4" style={{ color: '#666' }}>No books yet. Be the first to publish!</p>
              <Link to="/auth/register" className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-black"
                style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                Start Publishing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recent.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28">
        <div className="page-container">
          <div className="relative rounded-3xl p-16 text-center overflow-hidden"
            style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}>
            {/* Glow */}
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, #f97316 0%, transparent 60%)', filter: 'blur(40px)' }} />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: '#f97316' }}>Get Started</p>
              <h2 className="font-display text-4xl md:text-6xl text-white mb-4">
                Start your reading journey
              </h2>
              <p className="mb-8 max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#666' }}>
                Join ReadSphere today. Upload your books, read for free, and use AI to learn faster than ever before.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/auth/register"
                  className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold text-black transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link to="/browse"
                  className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
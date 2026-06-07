import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Users, Upload, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

export default function PublisherDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/publisher/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.05 }} />
      </div>

      <div className="page-container py-10 relative z-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: '#f97316' }}>Publisher</p>
            <h1 className="font-display text-3xl text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm mt-1" style={{ color: '#666' }}>Here's how your books are performing</p>
          </div>
          <Link to="/publisher/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
            <Upload size={16} /> Upload Book
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: TrendingUp, label: 'Total Sales', value: loading ? '...' : stats.totalSales || 0, color: '#22c55e' },
            { icon: BookOpen, label: 'Total Books', value: loading ? '...' : stats.totalBooks || 0, color: '#3b82f6' },
            { icon: Users, label: 'Published', value: loading ? '...' : stats.publishedBooks || 0, color: '#a855f7' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="p-5 rounded-2xl transition-all"
              style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xs mb-1 font-medium" style={{ color: '#666' }}>{label}</p>
              <p className="text-white text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top books */}
          <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Top Performing Books</h2>
              <Link to="/publisher/books"
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: '#f97316' }}>
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
                ))}
              </div>
            ) : !data?.topBooks?.length ? (
              <div className="text-center py-12">
                <BookOpen size={32} className="mx-auto mb-3" style={{ color: '#333' }} />
                <p className="text-sm" style={{ color: '#555' }}>No sales yet. Upload your first book!</p>
                <Link to="/publisher/upload"
                  className="inline-flex mt-4 px-5 py-2 rounded-full text-sm font-semibold text-black"
                  style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
                  Upload Book
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topBooks.map((item, i) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 rounded-xl transition-all"
                    style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                    <span className="text-sm w-5 text-center font-mono" style={{ color: '#555' }}>{i + 1}</span>
                    {item.book?.coverImage?.url && (
                      <img src={item.book.coverImage.url} alt="" className="w-10 h-14 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.book?.title}</p>
                      <p className="text-xs" style={{ color: '#555' }}>{item.sales} sales</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#f97316' }}>₹{item.revenue?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="p-6 rounded-2xl" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <h2 className="text-white font-semibold mb-5">Recent Orders</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
                ))}
              </div>
            ) : !data?.recentOrders?.length ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: '#555' }}>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.slice(0, 8).map(order => (
                  <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg transition-all"
                    style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316' }}>
                      {order.buyer?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{order.buyer?.name}</p>
                      <p className="text-[10px] truncate" style={{ color: '#555' }}>{order.book?.title}</p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>₹{order.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
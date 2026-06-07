import { useState } from 'react';
import { Sparkles, Upload, FileText, X } from 'lucide-react';
import api from '../utils/api';

export default function AISummaryPage() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) return setError('Please select a PDF file');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await api.post('/ai/summary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Faded background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] opacity-8 rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.05 }} />
      </div>

      <div className="page-container py-12 relative z-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316' }}>
            <Sparkles size={11} /> Powered by Groq AI
          </div>
          <h1 className="font-display text-4xl text-white mb-2">AI Book Summary</h1>
          <p className="text-sm" style={{ color: '#666' }}>Upload any PDF and get an AI-generated summary instantly</p>
        </div>

        <div className="max-w-2xl">
          {/* File Upload Card */}
          <div className="p-6 rounded-2xl mb-6" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#888' }}>
              Upload PDF
            </label>

            {/* Drop zone */}
            <label className="flex flex-col items-center justify-center w-full py-10 rounded-xl cursor-pointer transition-all"
              style={{ background: '#0d0d0d', border: '2px dashed #2a2a2a' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <FileText size={20} style={{ color: '#f97316' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-xs" style={{ color: '#666' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); setFile(null); setSummary(''); }}
                    className="ml-4 p-1 rounded-full transition-colors"
                    style={{ color: '#666' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <Upload size={22} style={{ color: '#f97316' }} />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Click to upload PDF</p>
                  <p className="text-xs" style={{ color: '#555' }}>Only text-based PDFs supported</p>
                </>
              )}
            </label>

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={16} className="animate-spin" /> Generating Summary...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={16} /> Generate AI Summary
                </span>
              )}
            </button>
          </div>

          {/* Summary Output */}
          {summary && (
            <div className="p-6 rounded-2xl" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <Sparkles size={16} style={{ color: '#f97316' }} />
                </div>
                <h2 className="text-white font-semibold">AI Summary</h2>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#bbb' }}>
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
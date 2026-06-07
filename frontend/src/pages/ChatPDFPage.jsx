import { useState } from 'react';
import { MessageSquare, Upload, FileText, X, Send } from 'lucide-react';
import api from '../utils/api';

export default function ChatPDFPage() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessages([]);
    setError('');
    setPdfText('');

    if (selectedFile) {
      setExtracting(true);
      try {
        const formData = new FormData();
        formData.append('pdf', selectedFile);
        const res = await api.post('/ai/extract', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPdfText(res.data.text);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not extract text from PDF');
      }
      setExtracting(false);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    if (!pdfText) return setError('Please upload a PDF first');

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question, pdfText });
      const aiMessage = { role: 'ai', content: res.data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Faded background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.06 }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.05 }} />
      </div>

      <div className="page-container py-12 relative z-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316' }}>
            <MessageSquare size={11} /> Powered by Groq AI
          </div>
          <h1 className="font-display text-4xl text-white mb-2">Chat with PDF</h1>
          <p className="text-sm" style={{ color: '#666' }}>Upload a PDF and ask any question about it</p>
        </div>

        <div className="max-w-3xl">

          {/* File Upload Card */}
          <div className="p-6 rounded-2xl mb-6" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#888' }}>
              Upload PDF
            </label>

            <label className="flex flex-col items-center justify-center w-full py-8 rounded-xl cursor-pointer transition-all"
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
                    {extracting && <p className="text-xs" style={{ color: '#f97316' }}>Extracting text...</p>}
                    {!extracting && pdfText && <p className="text-xs" style={{ color: '#22c55e' }}>✅ Ready to chat!</p>}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); setFile(null); setPdfText(''); setMessages([]); }}
                    className="ml-4 p-1 rounded-full" style={{ color: '#666' }}>
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

            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {error}
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="p-6 rounded-2xl mb-4 min-h-64 max-h-96 overflow-y-auto"
            style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid #222' }}>
                  <MessageSquare size={22} style={{ color: '#444' }} />
                </div>
                <p className="text-sm" style={{ color: '#555' }}>Upload a PDF and start asking questions! 💬</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm"
                      style={{
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #f97316, #f0c060)' : '#1a1a1a',
                        color: msg.role === 'user' ? '#000' : '#ccc',
                        fontWeight: msg.role === 'user' ? '500' : '400',
                        border: msg.role === 'ai' ? '1px solid #222' : 'none',
                      }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl text-sm"
                      style={{ background: '#1a1a1a', border: '1px solid #222', color: '#666' }}>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={pdfText ? "Ask a question about your PDF..." : "Upload a PDF first..."}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#111', border: '1px solid #1f1f1f', color: '#ddd' }}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!pdfText || loading}
            />
            <button
              onClick={handleSend}
              disabled={!pdfText || loading || !question.trim()}
              className="px-5 py-3 rounded-xl font-semibold text-black transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #f0c060)' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
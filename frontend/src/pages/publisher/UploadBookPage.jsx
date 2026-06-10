import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image, X, Eye, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';

const CATEGORIES = ['fiction','non-fiction','science','technology','history','biography','self-help','romance','thriller','fantasy','children','other'];

export default function UploadBookPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const coverInputRef = useRef();
  const pdfInputRef = useRef();

  const [form, setForm] = useState({ title: '', author: '', description: '', price: '0', category: 'other', tags: '', language: 'English' });
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.show('Cover image must be under 5MB', 'warning'); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.show('Only PDF files are allowed', 'warning'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.show('PDF must be under 50MB', 'warning'); return; }
    setPdfFile(file);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!coverFile) { toast.show('Please select a cover image', 'warning'); return; }
    if (!pdfFile) { toast.show('Please select a PDF file', 'warning'); return; }
    if (!form.title) { toast.show('Please enter a title', 'warning'); return; }
    if (!form.author) { toast.show('Please enter an author name', 'warning'); return; }
    if (!form.description) { toast.show('Please enter a description', 'warning'); return; }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append('coverImage', coverFile);
    formData.append('pdfFile', pdfFile);

    try {
      await api.post('/publisher/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.show('Book uploaded successfully!', 'success');
      navigate('/publisher/books');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Upload failed', 'error');
    }
    setUploading(false);
  };

  // Preview Modal
  if (showPreview) {
    return (
      <div className="page-container py-10 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setShowPreview(false)} className="btn-ghost flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Edit
            </button>
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-1">Preview</p>
              <h1 className="section-title">Book Preview</h1>
            </div>
          </div>

          {/* Preview Card */}
          <div className="card p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover - Full Wrap Auto Adjust */}
              <div className="flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden shadow-2xl"
                  style={{ width: '200px', aspectRatio: '2/3' }}>
                  <img
                    src={coverPreview}
                    alt="Book cover"
                    className="w-full h-full object-cover object-center"
                    style={{ display: 'block' }}
                  />
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20" />
                </div>
                <p className="text-ink-500 text-xs text-center mt-2">Cover Preview</p>
              </div>

              {/* Book Details */}
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-gold text-xs uppercase tracking-widest capitalize">{form.category}</span>
                </div>
                <h2 className="text-white text-2xl font-bold mb-1">{form.title}</h2>
                <p className="text-ink-400 text-sm mb-4">by {form.author}</p>
                <p className="text-ink-300 text-sm leading-relaxed mb-6">{form.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-ink-800 rounded-lg p-3">
                    <p className="text-ink-500 text-xs mb-1">Price</p>
                    <p className="text-white font-semibold">
                      {form.price === '0' || form.price === '' ? 'Free' : `₹${form.price}`}
                    </p>
                  </div>
                  <div className="bg-ink-800 rounded-lg p-3">
                    <p className="text-ink-500 text-xs mb-1">Language</p>
                    <p className="text-white font-semibold">{form.language}</p>
                  </div>
                  <div className="bg-ink-800 rounded-lg p-3">
                    <p className="text-ink-500 text-xs mb-1">PDF File</p>
                    <p className="text-white font-semibold text-xs truncate">{pdfFile?.name}</p>
                  </div>
                  <div className="bg-ink-800 rounded-lg p-3">
                    <p className="text-ink-500 text-xs mb-1">File Size</p>
                    <p className="text-white font-semibold">{pdfFile ? (pdfFile.size / (1024 * 1024)).toFixed(1) + ' MB' : '-'}</p>
                  </div>
                </div>

                {form.tags && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-ink-800 rounded-full text-ink-300 text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="card p-4 mb-6">
              <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setShowPreview(false)} className="btn-ghost flex items-center gap-2">
              <ArrowLeft size={16} /> Edit Book
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              <Upload size={16} />
              {uploading ? `Uploading ${uploadProgress}%...` : 'Publish Book'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-gold text-xs uppercase tracking-widest mb-1">Publisher</p>
          <h1 className="section-title">Upload new book</h1>
        </div>

        <form onSubmit={handlePreview} className="space-y-6">
          {/* File uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover image */}
            <div>
              <label className="label">Cover image *</label>
<p className="text-xs mb-2" style={{ color: '#666' }}>
  📐 Recommended ratio: <span style={{ color: '#f97316' }}>2:3</span> (e.g. 400×600px, 600×900px, 800×1200px)
</p>
              <div
                onClick={() => coverInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${
                  coverFile ? 'border-gold/40' : 'border-ink-700 hover:border-ink-500'
                }`}
                style={{ aspectRatio: '2/3' }}
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover object-center" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(''); }}
                      className="absolute top-2 right-2 bg-ink-950/80 text-white rounded-full p-1 hover:bg-red-900/80 transition-colors">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-500">
                    <Image size={32} className="mb-2" />
                    <p className="text-sm">Click to upload cover</p>
                    <p className="text-xs mt-1">JPG, PNG, WebP · max 5MB</p>
                  </div>
                )}
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
            </div>

            {/* Book details */}
            <div className="space-y-4">
              <div>
                <label className="label">Book title *</label>
                <input className="input" placeholder="The Great Adventure" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Author name *</label>
                <input className="input" placeholder="Author full name" value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required />
              </div>
              
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <input className="input" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-32 resize-none" placeholder="Tell readers what this book is about…"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" placeholder="adventure, mystery, thriller" value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          {/* PDF upload */}
          <div>
            <label className="label">PDF file *</label>
            <div
              onClick={() => pdfInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors flex items-center gap-4 ${
                pdfFile ? 'border-gold/40 bg-gold/5' : 'border-ink-700 hover:border-ink-500'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${pdfFile ? 'bg-gold/10' : 'bg-ink-700'}`}>
                <FileText size={22} className={pdfFile ? 'text-gold' : 'text-ink-500'} />
              </div>
              <div className="flex-1 min-w-0">
                {pdfFile ? (
                  <>
                    <p className="text-white text-sm font-medium truncate">{pdfFile.name}</p>
                    <p className="text-ink-400 text-xs">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </>
                ) : (
                  <>
                    <p className="text-ink-300 text-sm">Click to select PDF</p>
                    <p className="text-ink-600 text-xs">Max 50MB</p>
                  </>
                )}
              </div>
              {pdfFile && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                  className="text-ink-500 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
            <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdf} className="hidden" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/publisher/books')} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Eye size={16} /> Preview Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
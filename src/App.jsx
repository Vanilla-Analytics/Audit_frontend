
import React from 'react';
import { useState } from 'react';
import axios from 'axios';


function App() {
  const [form, setForm] = useState({ name: '', email: '', url: '' });
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('url', form.url);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/submit/`, formData);
      setPdfUrl(res.data.pdf_url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="card-title">Website Audit</h1>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">Website URL</label>
            <input
              id="url"
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Generate PDF'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        {pdfUrl && (
          <div className="download-section">
            <a href={pdfUrl} className="download-link" target="_blank" rel="noopener noreferrer">
               Download Your PDF Report
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
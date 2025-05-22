
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [form, setForm] = useState({ name: '', email: '', url: '' });
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, section: '' });
  const [sectionsDone, setSectionsDone] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProgress({ percent: 0, section: '' });
    setSectionsDone([]);

    const sessionId = crypto.randomUUID();
    const payload = {
      name: form.name,
      email: form.email,
      url: form.url,
      session_id: sessionId
    };

    const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/progress/${sessionId}`);
    eventSource.onmessage = (e) => {

      try {


        const data = JSON.parse(e.data);
        setProgress({ percent: data.percent, section: data.section });
        setSectionsDone((prev) => [...new Set([...prev, data.section])]); // avoid duplicates
        if (data.percent >= 100) eventSource.close();
      } catch (err) {
        console.error("SSE parsing error:", err);
      }
    };
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/submit`, payload);
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

        {isLoading && (
          <div className="progress-container">
            <p>Processing: {progress.section.replace(/_/g, ' ').toUpperCase()} ({progress.percent}%)</p>
            <progress value={progress.percent} max="100" />
            <ul>
              {sectionsDone.map((sec, idx) => (
                <li key={idx}>✅ {sec.replace(/_/g, ' ').toUpperCase()}</li>
              ))}
            </ul>
          </div>
        )}

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

import { useState } from 'react';
import { Download, Share2, Copy, FileJson, Package, Loader2 } from 'lucide-react';

const ExportView = ({ activeProject }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isJsonExporting, setIsJsonExporting] = useState(false);

  if (!activeProject) {
    return (
      <div className="view-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <h2 style={{color: 'var(--text-secondary)'}}>Please select a project to view export options.</h2>
      </div>
    );
  }

  const handleZipDownload = () => {
    setIsZipping(true);
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${activeProject}/export/zip`;
    setTimeout(() => setIsZipping(false), 2000);
  };

  const handleJsonExport = async () => {
    setIsJsonExporting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${activeProject}/assets`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject}_data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export JSON.');
    } finally {
      setIsJsonExporting(false);
    }
  };

  const handleShareLink = async () => {
    setIsSharing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${activeProject}/export/share`);
      const data = await res.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        alert('Shareable link copied to clipboard!');
      } else {
        alert('Failed to generate link.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while generating link.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Export Options: {activeProject}</h1>
        <p>Export your project data, assets, or code directly to your local machine.</p>
      </div>

      <div className="suggestion-cards export-cards-container">
        <div className="suggestion-card export-card">
          <Package size={32} color="var(--accent-purple)" />
          <h3>Download as ZIP</h3>
          <p>Export all generated assets (images, videos, audio, 3d) in a single compressed file.</p>
          <button className="primary-btn export-btn" onClick={handleZipDownload} disabled={isZipping}>
            {isZipping ? <Loader2 size={16} className="spin" /> : <Download size={16} />} 
            {isZipping ? 'Preparing ZIP...' : 'Export ZIP'}
          </button>
        </div>

        <div className="suggestion-card export-card">
          <FileJson size={32} color="var(--accent-purple)" />
          <h3>Export JSON Data</h3>
          <p>Download the raw prompt metadata and chat history for this project.</p>
          <button className="primary-btn export-btn" onClick={handleJsonExport} disabled={isJsonExporting}>
            {isJsonExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />} 
            {isJsonExporting ? 'Exporting JSON...' : 'Export JSON'}
          </button>
        </div>

        <div className="suggestion-card export-card">
          <Share2 size={32} color="var(--accent-purple)" />
          <h3>Shareable Link</h3>
          <p>Generate a public presigned URL to share your project with others.</p>
          <button className="primary-btn export-btn" onClick={handleShareLink} disabled={isSharing}>
            {isSharing ? <Loader2 size={16} className="spin" /> : <Copy size={16} />} 
            {isSharing ? 'Generating Link...' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportView;

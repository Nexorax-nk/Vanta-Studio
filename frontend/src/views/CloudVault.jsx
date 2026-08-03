import { useState, useEffect } from 'react';
import { Database, Cloud, HardDrive, RefreshCw } from 'lucide-react';

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp * 1000)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
};

const CloudVault = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vault/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching vault stats:", err));
  }, []);

  if (!stats) {
    return (
      <div className="view-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading Vault Stats...</span>
        </div>
      </div>
    );
  }

  const maxStorage = 10 * 1024 * 1024 * 1024; // 10 GB limit for UI demo
  const percentUsed = Math.min(100, (stats.storage_used / maxStorage) * 100);
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Cloud Vault</h1>
        <p>Backblaze integration. Everything automatically synced.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <Database size={24} color="var(--accent-blue)"/>
          <h3>Storage Used</h3>
          <h2>{formatBytes(stats.storage_used)} <span className="storage-limit">/ 10 GB</span></h2>
          <div className="progress-bar"><div className="progress-fill" style={{width: `${percentUsed}%`}}></div></div>
        </div>
        
        <div className="dash-card">
          <HardDrive size={24} color="var(--accent-purple)"/>
          <h3>Projects Synced</h3>
          <h2>{stats.projects_count} Active</h2>
        </div>
        
        <div className="dash-card">
          <RefreshCw size={24} color="#10b981"/>
          <h3>Backup Status</h3>
          <h2>Up to date</h2>
          <p className="subtext">Last sync: {stats.recent_uploads.length > 0 ? formatTimeAgo(stats.recent_uploads[0].last_modified) : 'Just now'}</p>
        </div>
      </div>

      <div className="vault-section">
        <h3>Recent Uploads</h3>
        <ul className="upload-list">
          {stats.recent_uploads.length > 0 ? stats.recent_uploads.map((file, idx) => (
            <li key={idx}><span>{file.name}</span> <span className="size">{formatBytes(file.size)}</span></li>
          )) : (
            <li><span className="empty-state-text">No uploads yet.</span></li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CloudVault;

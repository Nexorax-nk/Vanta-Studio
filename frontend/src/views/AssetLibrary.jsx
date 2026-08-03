import { useState, useEffect } from 'react';
import { Download, Image as ImageIcon, Video, Music, Box, Star, Clock, Search } from 'lucide-react';

const AssetLibrary = ({ activeProject }) => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const url = activeProject 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${activeProject}/assets`
      : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/assets`;
      
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.assets) {
          setAssets(data.assets);
        }
      })
      .catch(err => console.error("Error fetching assets:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>{activeProject ? `${activeProject} Assets` : 'Asset Library & Search'}</h1>
        <p>Search and manage all your generated media securely.</p>
      </div>

      <div className="search-bar-large">
        <Search size={20} color="var(--text-secondary)" />
        <input type="text" placeholder="Search anything (e.g. cyberpunk, logo, poster...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      
      <div className="category-filters">
        <button className={activeFilter === 'image' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === 'image' ? 'all' : 'image')}><ImageIcon size={14}/> Images</button>
        <button className={activeFilter === 'video' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === 'video' ? 'all' : 'video')}><Video size={14}/> Videos</button>
        <button className={activeFilter === 'audio' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === 'audio' ? 'all' : 'audio')}><Music size={14}/> Audio</button>
        <button className={activeFilter === '3d' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === '3d' ? 'all' : '3d')}><Box size={14}/> 3D</button>
        <button className={activeFilter === 'favorites' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === 'favorites' ? 'all' : 'favorites')}><Star size={14}/> Favorites</button>
        <button className={activeFilter === 'recent' ? 'active' : ''} onClick={() => setActiveFilter(activeFilter === 'recent' ? 'all' : 'recent')}><Clock size={14}/> Recent</button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading Assets...</span>
        </div>
      ) : (
        <div className="asset-grid">
          {assets.filter(asset => {
            const matchesSearch = asset.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  asset.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            
            if (activeFilter === 'all') return true;
            if (activeFilter === 'recent') {
              const oneWeekAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
              return asset.created_at >= oneWeekAgo;
            }
            if (activeFilter === 'favorites') return false; // Placeholder logic
            
            return asset.media_type === activeFilter;
          }).map((asset, idx) => (
            <div key={idx} className="asset-card">
              <div className="asset-preview">
                 <span className="asset-type-badge">{asset.media_type || 'image'}</span>
                 {asset.media_type === 'image' && <img src={asset.media_url} alt="preview" className="asset-preview-img" />}
              </div>
              <div className="asset-info">
                <h3 className="asset-title">{asset.project_name || 'Uncategorized'} Asset</h3>
                <p className="prompt-text" title={asset.prompt}>{asset.prompt || 'Generated from template'}</p>
                <div className="asset-meta">
                  <span className="version-tag">{asset.created_at ? new Date(asset.created_at * 1000).toLocaleDateString() : 'v1.0'}</span>
                  <a href={asset.media_url} target="_blank" rel="noopener noreferrer" className="download-btn"><Download size={14}/></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetLibrary;

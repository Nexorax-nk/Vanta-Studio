import { Search, Compass, Zap } from 'lucide-react';

const UniversalSearch = () => {
  return (
    <div className="view-container">
      <div className="search-hero">
        <h1>Universal Search</h1>
        <div className="search-bar-large">
          <Search size={20} color="var(--text-secondary)" />
          <input type="text" placeholder="Search anything (e.g. cyberpunk, logo, poster...)" />
        </div>
        
        <div className="search-suggestions">
          <span>cyberpunk</span>
          <span>logo</span>
          <span>poster</span>
          <span>video</span>
          <span>podcast</span>
          <span>last week</span>
        </div>
      </div>

      <div className="search-split">
        <div className="search-section">
          <h3><Compass size={16}/> Search Categories</h3>
          <ul>
            <li>Assets</li>
            <li>Prompts</li>
            <li>Metadata</li>
            <li>Projects</li>
          </ul>
        </div>
        
        <div className="search-section">
          <h3><Zap size={16}/> AI Model Hub</h3>
          <div className="model-cards">
            <div className="model-card">
              <h4>Flux</h4>
              <p>Advanced image generation</p>
            </div>
            <div className="model-card">
              <h4>GPT Image</h4>
              <p>Prompt refinement & vision</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;

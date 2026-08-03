import { Share, DownloadCloud, Image as ImageIcon, Video, Music, Box, Archive, FileJson } from 'lucide-react';

const ExportCenter = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Export Center</h1>
        <p>Export your generated assets and share workflows.</p>
      </div>

      <div className="export-grid">
        <div className="export-btn"><ImageIcon size={18}/> PNG</div>
        <div className="export-btn"><ImageIcon size={18}/> SVG</div>
        <div className="export-btn"><Video size={18}/> MP4</div>
        <div className="export-btn"><Music size={18}/> WAV</div>
        <div className="export-btn"><Box size={18}/> GLB</div>
        <div className="export-btn"><Archive size={18}/> ZIP</div>
        <div className="export-btn"><FileJson size={18}/> JSON</div>
        <div className="export-btn primary"><Share size={18}/> Share Link</div>
      </div>

      <div className="view-header" style={{marginTop: '48px'}}>
        <h1>Templates</h1>
        <p>One-click workflows for specific platforms.</p>
      </div>

      <div className="template-grid">
        <div className="template-card">YouTube Shorts</div>
        <div className="template-card">Instagram Reel</div>
        <div className="template-card">Podcast</div>
        <div className="template-card">Brand Launch</div>
        <div className="template-card">Game Assets</div>
        <div className="template-card">Product Ads</div>
        <div className="template-card">Presentation</div>
      </div>
    </div>
  );
};

export default ExportCenter;

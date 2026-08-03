import { useState } from 'react';
import { Search, Video, Image as ImageIcon, Box, Target, Briefcase, Play, Users, Layers, LayoutTemplate } from 'lucide-react';

const templates = [
  {
    category: 'Video & Social Media',
    items: [
      { name: 'YouTube Shorts', desc: 'End-to-end workflow for viral short-form content. Includes intro templates, auto-captions, and pacing guides.', uses: '14k Uses', steps: '5 Steps', icon: <Video size={24} color="#3b82f6"/>, glow: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
      { name: 'Instagram Reel', desc: 'Optimized vertical video formats with trending audio sync layers and text animations.', uses: '22k Uses', steps: '4 Steps', icon: <Play size={24} color="#a855f7"/>, glow: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)' },
      { name: 'Podcast Episode', desc: 'Audio leveling, multi-cam switching, and lower-thirds for professional podcast delivery.', uses: '8k Uses', steps: '7 Steps', icon: <Users size={24} color="#10b981"/>, glow: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
    ]
  },
  {
    category: 'Marketing & Brand',
    items: [
      { name: 'Brand Launch', desc: 'Comprehensive package including logo sting, typography guidelines, and brand colors.', uses: '5k Uses', steps: '8 Steps', icon: <Target size={24} color="#f59e0b"/>, glow: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
      { name: 'Product Ads', desc: 'High-conversion ad templates tailored for Facebook and TikTok with clear CTA layers.', uses: '18k Uses', steps: '3 Steps', icon: <Briefcase size={24} color="#ec4899"/>, glow: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' },
      { name: 'Presentation', desc: 'Sleek, animated slide decks with modern glassmorphism charts and graphics.', uses: '9k Uses', steps: '10 Steps', icon: <LayoutTemplate size={24} color="#6366f1"/>, glow: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
    ]
  },
  {
    category: 'Assets & Design',
    items: [
      { name: 'Game Assets', desc: 'Sprite sheets, 3D texture pipelines, and particle effect starter templates.', uses: '3k Uses', steps: '4 Steps', icon: <Box size={24} color="#14b8a6"/>, glow: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.3)' },
      { name: '3D Mockups', desc: 'Photorealistic device and packaging mockups for your UI/UX designs.', uses: '12k Uses', steps: '2 Steps', icon: <Layers size={24} color="#f43f5e"/>, glow: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' },
      { name: 'Image Editing', desc: 'Batch processing, color grading LUTs, and standard portrait retouching.', uses: '31k Uses', steps: '3 Steps', icon: <ImageIcon size={24} color="#8b5cf6"/>, glow: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' },
    ]
  }
];

const TemplatesView = ({ setActiveProject, setActiveTab }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUseTemplate = async (templateName) => {
    setIsCreating(true);
    setLoadingTemplate(templateName);
    
    // Create a new project for this template
    const projectName = `${templateName} ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" }).replace(/:/g, '')}`;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName })
      });
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('project-created', { detail: projectName }));
      
      // Pass a pre-filled prompt to the chat via localStorage
      localStorage.setItem('templatePrompt', `I want to create a ${templateName}. Please generate the initial assets for this workflow.`);
      
      if (setActiveProject) setActiveProject(projectName);
      if (setActiveTab) setActiveTab('project');
    } catch (err) {
      console.error("Error creating template project:", err);
      alert('Failed to launch template.');
    } finally {
      setIsCreating(false);
      setLoadingTemplate(null);
    }
  };
  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '1040px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '80px' }}>
        
        <div className="search-hero" style={{ width: '100%', maxWidth: '640px', marginBottom: '24px', marginTop: '32px' }}>
          <h1 className="projects-hero-title">Workflow Templates</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
            One-click workflows and starter packs for specific platforms and formats.
          </p>
          <div className="project-search-input">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search templates (e.g., YouTube, Ad)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {templates.map((section, idx) => {
          const filteredItems = section.items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (filteredItems.length === 0) return null;
          
          return (
            <div key={idx} style={{ width: '100%', padding: '0 24px' }}>
              <h2 className="template-category-header">{section.category}</h2>
              <div className="premium-template-grid">
                {filteredItems.map((item, itemIdx) => (
                <div key={itemIdx} className="premium-template-card">
                  <div className="premium-template-icon-wrapper" style={{ background: item.glow, borderColor: item.border }}>
                    {item.icon}
                  </div>
                  <div className="premium-template-title">{item.name}</div>
                  <div className="premium-template-desc">{item.desc}</div>
                  
                  <div className="premium-template-meta">
                    <span>{item.uses}</span>
                    <span>{item.steps}</span>
                  </div>

                  <button 
                    className="use-template-btn" 
                    onClick={() => handleUseTemplate(item.name)}
                    disabled={isCreating}
                  >
                    {loadingTemplate === item.name ? 'Launching...' : 'Use Template'}
                  </button>
                </div>
              ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesView;

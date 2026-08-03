import { useState, useEffect } from 'react';
import { Folder, MoreHorizontal, Image as ImageIcon, Video, Box, Music, Clock, Search, ArrowRight } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';

const ProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          setProjects(data.projects);
        }
      })
      .catch(err => console.error("Error fetching projects:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const submitNewProject = async (name) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.name) {
        setProjects([data, ...projects]);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div className="search-hero" style={{ width: '100%', maxWidth: '640px', marginBottom: '48px', marginTop: '32px' }}>
          <h1 className="projects-hero-title">All Projects</h1>
          <div className="project-search-input">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button className="primary-btn" onClick={handleNewProject} style={{ padding: '8px 16px', fontSize: '13px' }}>New Project</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Loading Projects...</span>
          </div>
        ) : (
          <div className="project-list">
            {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((project, idx) => (
              <div key={idx} className="project-list-row">
                <div className="project-list-left">
                  <div className="project-icon-wrapper-sm">
                    <Folder size={20} />
                  </div>
                  <span className="project-list-title">{project.name}</span>
                </div>
                <div className="project-list-right">
                  <span className="project-list-meta" style={{ width: '80px' }}>{project.assets_count || 0} Assets</span>
                  <span className="project-list-meta" style={{display: 'flex', alignItems: 'center', gap: '6px', width: '120px'}}>
                    <Clock size={12}/> {project.created_at ? new Date(project.created_at * 1000).toLocaleDateString() : 'Just now'}
                  </span>
                  <button className="project-action-btn">
                    Open <ArrowRight size={14} />
                  </button>
                  <MoreHorizontal size={20} color="var(--text-secondary)" style={{cursor: 'pointer', marginLeft: '8px'}} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={submitNewProject} 
      />
    </div>
  );
};

export default ProjectsView;

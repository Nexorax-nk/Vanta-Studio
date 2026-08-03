import { useState, useEffect } from 'react';
import { 
  ChevronDown, PlusCircle, Search, Settings, Database, 
  Library, MessageSquare, LayoutTemplate, Folder,
  Image as ImageIcon, Video, Music, Box, Zap, Share, Info, 
  ChevronRight, PanelLeft, User, LogOut, HelpCircle, Store
} from 'lucide-react';
import ProjectModal from './ProjectModal';

const Sidebar = ({ isOpen, activeTab, setActiveTab, activeProject, setActiveProject, toggleSidebar }) => {
  const [expandedProject, setExpandedProject] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          setRecentProjects(data.projects.map(p => p.name));
        }
      })
      .catch(err => console.error("Error fetching projects:", err))
      .finally(() => setIsLoading(false));

    const handleProjectCreated = (e) => {
      const name = e.detail;
      setRecentProjects(prev => {
        if (!prev.includes(name)) {
          return [name, ...prev];
        }
        return prev;
      });
    };
    window.addEventListener('project-created', handleProjectCreated);
    return () => window.removeEventListener('project-created', handleProjectCreated);
  }, []);

  const handleNav = (tab, projectName = null) => {
    setActiveTab(tab);
    if (projectName) {
      setExpandedProject(expandedProject === projectName ? null : projectName);
      setActiveProject(projectName);
    } else {
      setActiveProject(null);
    }
  };

  const handleNewChat = () => {
    setIsModalOpen(true);
  };

  const submitNewProject = async (name) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (!recentProjects.includes(name)) {
        setRecentProjects([name, ...recentProjects]);
      }
      handleNav('project', name);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const renderTree = (projectName) => {
    if (expandedProject !== projectName) return null;
    
    return (
      <div className="sidebar-tree" style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '12px', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', marginBottom: '8px' }}>
        <div className="tree-item" onClick={() => { setActiveProject(projectName); setActiveTab('project'); }} style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px'}}><MessageSquare size={14}/> Chat</div>
        <div className="tree-item" onClick={() => { setActiveProject(projectName); setActiveTab('assets'); }} style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px'}}><Library size={14}/> Assets</div>
        <div className="tree-item" onClick={() => { setActiveProject(projectName); setActiveTab('export'); }} style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px'}}><Share size={14}/> Exports</div>
      </div>
    );
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span style={{color: '#fff'}}>Vanta</span> <span style={{color: '#a855f7'}}>Studio</span> <ChevronDown size={14} color="var(--text-secondary)" style={{marginLeft: '4px'}} />
          </div>
          <div className="sidebar-icons" style={{display: 'flex', gap: '12px'}}>
            <PanelLeft size={16} onClick={toggleSidebar} style={{cursor: 'pointer'}} />
            <Search size={16} onClick={() => handleNav('assets')} style={{cursor: 'pointer'}} />
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="new-chat-btn" onClick={handleNewChat}>
            <MessageSquare size={16} color="#a855f7" />
            <span style={{color: '#fff', fontSize: '14px'}}>New Chat</span>
          </div>
          
          <div className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => handleNav('assets')}>
            <Library size={16} className={activeTab === 'assets' ? 'active-icon' : ''} />
            <span>Asset Library</span>
          </div>
          <div className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => handleNav('projects')}>
            <Folder size={16} className={activeTab === 'projects' ? 'active-icon' : ''} />
            <span>Projects</span>
          </div>
          <div className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => handleNav('templates')}>
            <LayoutTemplate size={16} className={activeTab === 'templates' ? 'active-icon' : ''} />
            <span>Templates</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title" style={{color: 'var(--accent-purple-text)'}}>CLOUD VAULT</div>
          <div className={`project-card ${activeTab === 'cloud' ? 'active' : ''}`} onClick={() => handleNav('cloud')} style={{cursor: 'pointer', background: 'rgba(15, 15, 15, 0.8)'}}>
            <div className="project-name">
              <Database size={16} color="var(--accent-purple)" />
              <span style={{color: 'var(--text-primary)'}}>Backblaze Storage</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-purple-text)' }}>
            <span>RECENT PROJECTS</span>
            <PlusCircle size={14} style={{cursor: 'pointer', color: 'var(--text-secondary)'}} onClick={handleNewChat} />
          </div>
          
          {isLoading ? (
            <div className="loading-container" style={{ minHeight: '100px', transform: 'scale(0.6)', gap: '8px' }}>
              <div className="spinner"></div>
              <span className="loading-text" style={{ fontSize: '12px' }}>Loading...</span>
            </div>
          ) : (
            recentProjects.map((project, idx) => (
              <div key={idx}>
                <div className={`recent-item ${expandedProject === project ? 'active-bg' : ''}`} onClick={() => handleNav('project', project)}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {expandedProject === project ? <ChevronDown size={14} color="var(--text-secondary)" /> : <ChevronRight size={14} color="var(--text-secondary)" />}
                    <span className="recent-text" style={{color: 'var(--text-primary)'}}>{project}</span>
                  </div>
                  {idx < 2 && <div className="status-dot" style={{backgroundColor: 'var(--accent-purple)'}}></div>}
                </div>
                {renderTree(project)}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer" style={{position: 'relative'}}>
          {isProfileMenuOpen && (
            <div className="profile-popup-menu">
              <div className="popup-header">
                <div className="avatar sm" style={{width: '24px', height: '24px', fontSize: '10px'}}>VS</div>
                <div className="popup-user-info">
                  <span className="popup-name">Vanta Studio</span>
                  <span className="popup-sub">Main Workspace</span>
                </div>
                <ChevronRight size={14} color="var(--text-secondary)" style={{marginLeft: 'auto'}} />
              </div>
              <div className="popup-divider"></div>
              <div className="popup-item" onClick={() => { handleNav('settings'); setIsProfileMenuOpen(false); }}>
                <User size={14} color="var(--text-secondary)" /> <span>Profile</span>
              </div>
              <div className="popup-item" onClick={() => { handleNav('settings'); setIsProfileMenuOpen(false); }}>
                <Settings size={14} color="var(--text-secondary)" /> <span>Settings</span>
              </div>
              <div className="popup-divider"></div>
              <div className="popup-item" onClick={() => setIsProfileMenuOpen(false)}>
                <HelpCircle size={14} color="var(--text-secondary)" /> <span>Help</span>
                <ChevronRight size={14} color="var(--text-secondary)" style={{marginLeft: 'auto'}} />
              </div>
            </div>
          )}
          <div 
            className="user-profile-trigger" 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              backgroundColor: isProfileMenuOpen ? 'var(--bg-surface)' : 'transparent', 
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div className="avatar" style={{width: '28px', height: '28px', fontSize: '11px'}}>VS</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                <span style={{fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)'}}>Vanta Studio</span>
                <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>Main Workspace</span>
              </div>
            </div>
            <Store size={14} color="var(--text-secondary)" />
          </div>
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={submitNewProject} 
      />
    </div>
  );
};

export default Sidebar;

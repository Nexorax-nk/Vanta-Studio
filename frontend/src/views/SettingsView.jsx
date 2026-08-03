import { useState, useEffect } from 'react';
import { Key, HardDrive, Moon, Save, CheckCircle2, Loader2 } from 'lucide-react';

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('theme');
  const [theme, setTheme] = useState('dark');
  const [keys, setKeys] = useState({ openai: '', anthropic: '', backblazeId: '', backblazeKey: '' });
  const [saved, setSaved] = useState(false);
  const [vaultStats, setVaultStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'storage' && !vaultStats) {
      setLoadingStats(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vault/stats`)
        .then(res => res.json())
        .then(data => {
          setVaultStats(data);
          setLoadingStats(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingStats(false);
        });
    }
  }, [activeTab, vaultStats]);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'theme', icon: Moon, label: 'Theme', desc: 'Toggle between Dark, Light, and System themes.' },
    { id: 'api', icon: Key, label: 'API Keys', desc: 'Manage OpenAI, Anthropic, and Backblaze keys.' },
    { id: 'storage', icon: HardDrive, label: 'Storage', desc: 'Manage local cache and cloud sync settings.' },
  ];

  return (
    <div className="view-container settings-layout">
      <div className="settings-sidebar">
        <div className="view-header" style={{marginBottom: '20px', paddingBottom: 0, borderBottom: 'none'}}>
          <h1>Settings</h1>
        </div>
        <div className="settings-tabs">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <div className="tab-text">
                <h4>{tab.label}</h4>
                <p>{tab.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-content">
        {activeTab === 'api' && (
          <div className="settings-section fade-in">
            <h2>API Integrations</h2>
            <p>Connect your own provider keys for generation and cloud storage.</p>
            
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                value={keys.openai}
                onChange={e => setKeys({...keys, openai: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Anthropic API Key</label>
              <input 
                type="password" 
                placeholder="sk-ant-..." 
                value={keys.anthropic}
                onChange={e => setKeys({...keys, anthropic: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Backblaze B2 Key ID</label>
              <input 
                type="text" 
                placeholder="Key ID" 
                value={keys.backblazeId}
                onChange={e => setKeys({...keys, backblazeId: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Backblaze B2 Application Key</label>
              <input 
                type="password" 
                placeholder="Application Key" 
                value={keys.backblazeKey}
                onChange={e => setKeys({...keys, backblazeKey: e.target.value})}
              />
            </div>
            
            <button className="primary-btn" onClick={handleSave} style={{marginTop: '20px'}}>
              {saved ? <CheckCircle2 size={16}/> : <Save size={16}/>}
              {saved ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        )}
        
        {activeTab === 'theme' && (
          <div className="settings-section fade-in">
            <h2>Theme Preferences</h2>
            <p>Choose how Vanta Studio looks.</p>
            
            <div className="theme-options">
              <div className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                <div className="theme-preview dark"></div>
                <span>Dark Mode</span>
              </div>
              <div className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                <div className="theme-preview light"></div>
                <span>Light Mode</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="settings-section fade-in">
            <h2>Storage & Cloud Sync</h2>
            <p>Manage your Backblaze B2 storage integration and local cache.</p>
            
            {loadingStats ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                <Loader2 size={16} className="spin" /> Loading storage stats...
              </div>
            ) : vaultStats ? (
              <div className="storage-stats-container" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div className="stat-card" style={{background: 'var(--bg-base)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{marginTop: 0, fontSize: '14px', color: 'var(--text-secondary)'}}>Cloud Storage Used (B2)</h3>
                  <div style={{fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', margin: '8px 0'}}>{formatBytes(vaultStats.storage_used)}</div>
                  <p style={{margin: 0, fontSize: '12px', color: 'var(--text-secondary)'}}>Across {vaultStats.projects_count} projects</p>
                </div>
                
                <div className="recent-uploads-card" style={{background: 'var(--bg-base)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{marginTop: 0, fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px'}}>Recent Uploads</h3>
                  {vaultStats.recent_uploads && vaultStats.recent_uploads.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {vaultStats.recent_uploads.map((file, idx) => (
                        <li key={idx} style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px'}}>
                          <span style={{color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%'}}>{file.name}</span>
                          <span style={{color: 'var(--text-secondary)'}}>{formatBytes(file.size)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{margin: 0, fontSize: '13px', color: 'var(--text-secondary)'}}>No recent uploads.</p>
                  )}
                </div>
                
                <button className="primary-btn" onClick={() => alert('Cache cleared!')} style={{alignSelf: 'flex-start', marginTop: '8px'}}>
                  Clear Local Cache
                </button>
              </div>
            ) : (
              <p style={{color: 'var(--text-secondary)'}}>Failed to load storage stats.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;

import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PING_INTERVAL_MS = 9 * 60 * 1000; // ping every 9 minutes to prevent Render sleep (15min timeout)

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeProject, setActiveProject] = useState(null);
  const [serverToast, setServerToast] = useState(null); // null | 'waking' | 'ready'

  const pingServer = useCallback(async (showToast = false) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        if (showToast) {
          setServerToast('ready');
          setTimeout(() => setServerToast(null), 3000);
        }
      }
    } catch {
      // server likely cold-starting — show waking toast
      if (showToast) setServerToast('waking');
    }
  }, []);

  useEffect(() => {
    // On mount: check if server is awake, show toast if cold
    pingServer(true);

    // Keep server alive every 9 minutes
    const interval = setInterval(() => pingServer(false), PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pingServer]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      {/* Server warm-up toast */}
      {serverToast === 'waking' && (
        <div className="server-toast server-toast--waking">
          <span className="server-toast__icon">⚡</span>
          <div>
            <div className="server-toast__title">Warming up server…</div>
            <div className="server-toast__sub">Free tier cold start — ready in ~30s</div>
          </div>
          <div className="server-toast__spinner" />
        </div>
      )}
      {serverToast === 'ready' && (
        <div className="server-toast server-toast--ready">
          <span className="server-toast__icon">✅</span>
          <div>
            <div className="server-toast__title">Server is live!</div>
            <div className="server-toast__sub">Vanta Studio is ready to generate</div>
          </div>
        </div>
      )}

      <div className="app-body">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          toggleSidebar={toggleSidebar} 
        />
        <MainArea 
          activeTab={activeTab} 
          activeProject={activeProject} 
          setActiveProject={setActiveProject}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;

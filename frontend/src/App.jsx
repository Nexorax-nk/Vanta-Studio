import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import './index.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeProject, setActiveProject] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
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

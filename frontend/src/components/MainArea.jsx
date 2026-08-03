import ProjectChat from '../views/ProjectChat';
import AssetLibrary from '../views/AssetLibrary';
import ProjectsView from '../views/ProjectsView';
import TemplatesView from '../views/TemplatesView';
import CloudVault from '../views/CloudVault';
import SettingsView from '../views/SettingsView';
import ExportView from '../views/ExportView';

const MainArea = ({ activeTab, activeProject, setActiveProject, setActiveTab }) => {
  const renderView = () => {
    switch (activeTab) {
      case 'new_chat':
      case 'project':
        return <ProjectChat activeProject={activeProject} setActiveProject={setActiveProject} setActiveTab={setActiveTab} />;
      case 'assets':
        return <AssetLibrary activeProject={activeProject} />;
      case 'export':
        return <ExportView activeProject={activeProject} />;
      case 'projects':
        return <ProjectsView />;
      case 'templates':
        return <TemplatesView setActiveProject={setActiveProject} setActiveTab={setActiveTab} />;
      case 'cloud':
        return <CloudVault />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ProjectChat activeProject={activeProject} setActiveProject={setActiveProject} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="main-area">
      <div key={`${activeTab}-${activeProject || 'none'}`} className="page-transition">
        {renderView()}
      </div>
    </div>
  );
};

export default MainArea;

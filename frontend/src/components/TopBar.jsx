import { Minus, Square, X, PanelLeft, ArrowLeft, ArrowRight } from 'lucide-react';

const TopBar = ({ toggleSidebar }) => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="top-bar-actions">
          <PanelLeft size={16} onClick={toggleSidebar} className="action-icon" />
          <ArrowLeft size={16} className="action-icon disabled" />
          <ArrowRight size={16} className="action-icon disabled" />
        </div>
        <div className="top-bar-menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>
      </div>
      <div className="window-controls">
        <span><Minus size={14} /></span>
        <span><Square size={12} /></span>
        <span><X size={14} /></span>
      </div>
    </div>
  );
};

export default TopBar;

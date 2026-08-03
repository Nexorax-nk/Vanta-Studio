import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSubmit(projectName.trim());
      onClose();
    }
  };

  return (
    <div className="project-modal-overlay">
      <div className="project-modal-content">
        <button onClick={onClose} className="project-modal-close">
          <X size={20} />
        </button>
        
        <div>
          <h2 className="project-modal-title">Create New Project</h2>
          <p className="project-modal-desc">
            Give your project a unique name to start generating and organizing assets.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="project-modal-input"
            placeholder="e.g. Cyberpunk City Assets"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            autoFocus
          />
          <div className="project-modal-actions">
            <button type="button" onClick={onClose} className="modal-btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={!projectName.trim()} className="modal-btn-create">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

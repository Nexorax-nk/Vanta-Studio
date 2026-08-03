import { Zap, Activity } from 'lucide-react';

const WorkflowBuilder = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Workflow Builder</h1>
        <p>The Hero Feature. Drag and connect blocks to build creative workflows.</p>
      </div>
      
      <div className="canvas-area">
        {/* Mock Canvas */}
        <div className="canvas-block block-input">
          <span>Source Media</span>
        </div>
        <div className="canvas-connector"></div>
        <div className="canvas-block block-process">
          <Zap size={16} color="var(--accent-purple)" />
          <span>Genblaze AI Upscale</span>
        </div>
        <div className="canvas-connector"></div>
        <div className="canvas-block block-output">
          <span>Final Export</span>
        </div>
        
        <div className="canvas-watermark">
          <Activity size={48} />
          <span>Genblaze Node Canvas</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;

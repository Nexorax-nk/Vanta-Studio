import { Folder, Monitor, GitBranch, Plus, CheckCircle2, ChevronDown, Mic, ArrowUp } from 'lucide-react';

const ChatInput = () => {
  return (
    <div className="chat-input-wrapper">
      <div className="context-pills">
        <div className="context-pill" style={{borderRadius: '12px 12px 0 0', backgroundColor: '#242424'}}>
          <Folder size={12} /> ODYSSEY
        </div>
        <div className="context-pill" style={{borderRadius: '12px', background: 'transparent'}}>
          <Monitor size={12} /> Local
        </div>
        <div className="context-pill" style={{borderRadius: '12px', background: 'transparent'}}>
          <GitBranch size={12} /> main
        </div>
      </div>

      <div className="chat-input-container">
        <div className="chat-input-row">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Do anything"
          />
        </div>
        
        <div className="chat-controls-bottom">
          <div className="chat-controls-left">
            <button><Plus size={16} /></button>
            <button><CheckCircle2 size={16} /> Approve for me</button>
          </div>
          
          <div className="chat-controls-right">
            <div className="model-selector">
              5.6 Terra Medium <ChevronDown size={14} />
            </div>
            <Mic size={16} style={{cursor: 'pointer'}} />
            <button className="submit-btn">
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

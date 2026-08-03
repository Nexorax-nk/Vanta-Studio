import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Paperclip, User, Music, Box, Sparkles, ArrowRight, Video, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Share, Play, Pause } from 'lucide-react';

const CustomAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="custom-audio-player">
      <button onClick={togglePlay} className="audio-play-btn">
        {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
      </button>
      <div className="audio-waveform">
        {[...Array(24)].map((_, i) => (
          <div key={i} className={`wave-bar ${isPlaying ? 'playing' : ''}`} style={{animationDelay: `${(i % 5) * 0.15}s`, height: `${Math.random() * 40 + 20}%`}}></div>
        ))}
      </div>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
    </div>
  );
};

const ProjectChat = ({ activeProject, setActiveProject, setActiveTab }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isAutoCreating = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const templatePrompt = localStorage.getItem('templatePrompt');
    if (templatePrompt) {
      setPrompt(templatePrompt);
      localStorage.removeItem('templatePrompt');
    }
  }, []);

  useEffect(() => {
    if (activeProject) {
      if (isAutoCreating.current) {
        isAutoCreating.current = false;
        return;
      }
      setIsLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${activeProject}/assets`)
        .then(res => res.json())
        .then(data => {
          if (data.assets) {
            const loadedMessages = [];
            data.assets.forEach(asset => {
              loadedMessages.push({ role: 'user', content: asset.prompt || 'Generated from template', type: asset.media_type });
              loadedMessages.push({ role: 'ai', media_url: asset.media_url, media_type: asset.media_type });
            });
            setMessages(loadedMessages);
          }
        })
        .catch(err => console.error("Error loading project assets:", err))
        .finally(() => setIsLoading(false));
    } else {
      setMessages([]);
    }
  }, [activeProject]);

  const handleSend = async (customPrompt, customType) => {
    const text = customPrompt || prompt;
    const type = customType || mediaType;
    if (!text.trim() || isGenerating) return;

    let targetProject = activeProject;
    
    // Auto-create a project if none is active
    if (!targetProject) {
      isAutoCreating.current = true;
      // Create a short name based on the prompt or timestamp
      const shortPrompt = text.split(' ').slice(0, 3).join(' ');
      targetProject = `${shortPrompt}... ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" }).replace(/:/g, '')}`;
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: targetProject })
        });
        
        // Dispatch event for Sidebar to pick up
        window.dispatchEvent(new CustomEvent('project-created', { detail: targetProject }));
        
        if (setActiveProject) setActiveProject(targetProject);
        if (setActiveTab) setActiveTab('project');
      } catch (err) {
        console.error("Error auto-creating project:", err);
        targetProject = "Uncategorized";
      }
    }

    const newMessages = [...messages, { role: 'user', content: text, type }];
    setMessages(newMessages);
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: text, 
          media_type: type,
          project_name: targetProject 
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', media_url: data.media_url, media_type: type }]);
      } else {
        setMessages(prev => [...prev, { role: 'error', content: data.detail || 'Failed to generate asset.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: 'Network error communicating with backend.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMedia = (msg) => {
    let content = null;
    if (msg.media_type === 'image') content = <img src={msg.media_url} alt="Generated" className="generated-media img" />;
    else if (msg.media_type === 'video') content = <video src={msg.media_url} controls autoPlay loop className="generated-media video" />;
    else if (msg.media_type === 'audio') content = <CustomAudioPlayer src={msg.media_url} />;
    else if (msg.media_type === '3d') {
      content = (
        <div className="generated-media glb-container">
          <Box size={32} color="var(--accent-purple)" />
          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-primary)'}}>Download 3D Model (.glb)</a>
        </div>
      );
    }

    if (!content) return null;

    return (
      <div className="ai-media-container">
        <div className="media-wrapper">
          {content}
          {msg.media_type === 'image' && (
            <>
              <button className="media-btn-edit">Edit</button>
              <button className="media-btn-share"><Share size={14}/></button>
            </>
          )}
        </div>
        <div className="ai-media-actions">
          <button className="ai-action-icon"><Copy size={16}/></button>
          <button className="ai-action-icon"><ThumbsUp size={16}/></button>
          <button className="ai-action-icon"><ThumbsDown size={16}/></button>
          <button className="ai-action-icon"><MoreHorizontal size={16}/></button>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading History...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="chat-welcome-screen">
          {/* Pure radial glow — no ring, no border */}
          <div className="welcome-glow" />

          <div className="welcome-content">
            <h1 className="vanta-title">
              Vanta Studio <Sparkles className="sparkle-icon" size={26} />
            </h1>
            <p className="vanta-subtitle">What should we build today?</p>

            <div className="suggestion-cards">
              <div className="suggestion-card" onClick={() => handleSend("A cyberpunk street kid in neon lit alley...", "image")}>
                <div className="card-icon-wrapper">
                  <User size={20} color="var(--accent-purple)" />
                </div>
                <div className="card-content">
                  <h3>Generate Character</h3>
                  <p>A cyberpunk street kid in neon lit alley...</p>
                </div>
                <ArrowRight size={16} className="card-arrow" />
              </div>

              <div className="suggestion-card" onClick={() => handleSend("Fast paced synthwave loop for action scene...", "audio")}>
                <div className="card-icon-wrapper">
                  <Music size={20} color="var(--accent-purple)" />
                </div>
                <div className="card-content">
                  <h3>Audio Track</h3>
                  <p>Fast paced synthwave loop for action scene...</p>
                </div>
                <ArrowRight size={16} className="card-arrow" />
              </div>

              <div className="suggestion-card" onClick={() => handleSend("Low poly space marine helmet...", "3d")}>
                <div className="card-icon-wrapper">
                  <Box size={20} color="var(--accent-purple)" />
                </div>
                <div className="card-content">
                  <h3>3D Asset</h3>
                  <p>Low poly space marine helmet...</p>
                </div>
                <ArrowRight size={16} className="card-arrow" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.role === 'user' && msg.content}
                {msg.role === 'error' && <span style={{color: '#ff4d4d'}}>{msg.content}</span>}
                {msg.role === 'ai' && renderMedia(msg)}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="message-row ai">
              <div className="message-bubble loading-skeleton">
                <div className="skeleton-media-box">
                  <div className="skeleton-glow"></div>
                  <Sparkles className="skeleton-icon" size={28} />
                  <span>Synthesizing {mediaType}...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="chat-input-wrapper">
        <div className="media-type-selector">
          <button className={mediaType === 'image' ? 'active' : ''} onClick={() => setMediaType('image')}><ImageIcon size={13}/> Image</button>
          <button className={mediaType === 'video' ? 'active' : ''} onClick={() => setMediaType('video')}><Video size={13}/> Video</button>
          <button className={mediaType === 'audio' ? 'active' : ''} onClick={() => setMediaType('audio')}><Music size={13}/> Audio</button>
          <button className={mediaType === '3d' ? 'active' : ''} onClick={() => setMediaType('3d')}><Box size={13}/> 3D</button>
        </div>

        <div className="chat-input-box pill-shape">
          <button className="icon-btn"><Paperclip size={18}/></button>
          <input
            type="text"
            placeholder="Describe what you want to create (e.g. Generate an image of...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isGenerating}
          />
          <div className="chat-input-actions">
            <button className="icon-btn"><Mic size={18}/></button>
            <button className="submit-btn purple-btn" onClick={() => handleSend()} disabled={isGenerating}>
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
        <div className="chat-footer-text">
          Vanta Studio AI can make mistakes. Check generated assets carefully.
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;

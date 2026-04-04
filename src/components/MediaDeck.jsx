import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function MediaDeck({ audioData }) {
  const { theme } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('QUEUE'); // QUEUE, LIBRARY, PLAYLISTS
  const [playlist, setPlaylist] = useState([]);
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const fileInputRef = useRef(null);

  // Fallback if the master sync hasn't arrived
  const status = audioData || { track: 'Establishing link...', state: 'stopped', volume: '100%' };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/media/playlist');
      const data = await res.json();
      if (data.status === 'success') setPlaylist(data.playlist);
    } catch (e) { console.error("Queue fetch failed", e); }
  };

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/media/library');
      const data = await res.json();
      if (data.status === 'success') setLibrary(data.library);
    } catch (e) { console.error("Library fetch failed", e); }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/media/playlists');
      const data = await res.json();
      if (data.status === 'success') setPlaylists(data.playlists);
    } catch (e) { console.error("Playlists fetch failed", e); }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchQueue();
      fetchLibrary();
      fetchPlaylists();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && activeTab === 'QUEUE') fetchQueue();
  }, [status.track]);

  const togglePlay = async () => {
    await fetch('/api/media/toggle', { method: 'POST' });
  };

  const nextTrack = async () => {
    await fetch('/api/media/next', { method: 'POST' });
  };

  const playIndex = async (idx) => {
    await fetch('/api/media/play_index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: idx })
    });
  };

  const addToQueue = async (filename) => {
    try {
      await fetch('/api/media/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      fetchQueue();
    } catch (e) { console.error("Add to queue failed", e); }
  };

  const clearQueue = async () => {
    try {
      await fetch('/api/media/queue/clear', { method: 'POST' });
      fetchQueue();
    } catch (e) { console.error("Clear queue failed", e); }
  };

  const loadPlaylist = async (name) => {
    try {
      await fetch('/api/media/playlists/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      fetchQueue();
      setActiveTab('QUEUE');
    } catch (e) { console.error("Load playlist failed", e); }
  };

  const savePlaylist = async () => {
    if (!newPlaylistName) return;
    try {
      await fetch('/api/media/playlists/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName })
      });
      setNewPlaylistName('');
      fetchPlaylists();
    } catch (e) { console.error("Save playlist failed", e); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      await fetchLibrary();
      await fetchQueue();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const btnClass = theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : '';
  const btnStyle = theme !== 'fallout' && theme !== 'material' && theme !== '90s'
      ? { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' }
      : {};

  const renderCompactPanel = () => {
    if (theme === 'cli') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>root@mainframe:~# mpc status</span>
            <button onClick={() => setIsModalOpen(true)} style={{ color: '#ffff55', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
              [ MEDIA_CENTER ]
            </button>
          </div>
          <div style={{ color: '#c0c0c0', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {status.track && status.track !== 'Establishing link...' ? status.track : 'EOF: No audio stream detected.'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '8px', marginBottom: '8px' }}>
            <span style={{ color: status.state === 'playing' ? '#00ff00' : '#ffff55', fontWeight: 'bold' }}>
                [{status.state ? status.state.toUpperCase() : 'STOPPED'}]
            </span>
            <span style={{ color: '#888' }}>
                VOL: <span style={{ color: '#00ff00' }}>{status.volume}</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button onClick={togglePlay} style={{ color: status.state === 'playing' ? '#ff5555' : '#00ff00', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
              {status.state === 'playing' ? '[ PAUSE ]' : '[ PLAY ]'}
            </button>
            <button onClick={nextTrack} style={{ color: '#c0c0c0', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
              [ NEXT ]
            </button>
          </div>
        </div>
      );
    }

    if (theme === 'y2k') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>AUDIO_UPLINK</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>[{status.state.toUpperCase()}]</span>
          </div>
          <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>
            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '5px' }}>CURRENT_STREAM:</div>
            <div style={{ color: '#fff', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '10px', paddingLeft: '8px' }}>
              {status.track}
            </div>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={togglePlay} style={{ background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                  [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
                </button>
                <button onClick={nextTrack} style={{ background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                  [ SKIP ]
                </button>
              </div>
              <button onClick={() => setIsModalOpen(true)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                [ MEDIA_CENTER ]
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={theme === '90s' ? { border: '2px solid inset', padding: '10px' } : {}}>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: status.state === 'playing' ? 'var(--accent)' : 'inherit', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
            &gt; STATUS: {status.state.toUpperCase()}
          </div>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>
            {status.track}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={togglePlay} className={btnClass} style={btnStyle}>
            [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
          </button>
          <button onClick={nextTrack} className={btnClass} style={btnStyle}>
            [ SKIP ]
          </button>
          <button onClick={() => setIsModalOpen(true)} className={btnClass} style={{ ...btnStyle, marginLeft: 'auto' }}>
            [ {theme === '90s' ? 'Media Center' : theme === 'fallout' ? 'TERMINAL_ACCESS' : 'MEDIA_CENTER'} ]
          </button>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: theme === 'material' ? 'blur(10px)' : 'none'
    };

    let modalBoxStyle = {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '80vh',
      padding: '20px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--panel)',
      color: 'var(--text)',
      border: 'var(--panel-border)',
      position: 'relative'
    };

    if (theme === 'cli') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: '#000',
        border: '1px dashed var(--accent)',
        borderRadius: 0,
        fontFamily: 'var(--font)'
      };
    } else if (theme === '90s') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: '#c0c0c0',
        border: '2px solid #fff',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        borderRadius: 0,
        color: '#000',
        padding: '4px'
      };
    } else if (theme === 'y2k') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: 'rgba(10, 20, 40, 0.95)',
        border: '1px solid #2a4b66',
        borderRadius: 0,
        color: '#7bbcd5',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)'
      };
    } else if (theme === 'cyberpunk') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: 'rgba(5, 5, 20, 0.9)',
        border: '2px solid var(--accent)',
        clipPath: 'polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
        boxShadow: '0 0 30px var(--accent)'
      };
    } else if (theme === 'fallout') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: '#000',
        border: '2px solid #00ff00',
        color: '#00ff00',
        borderRadius: '5px',
        boxShadow: 'inset 0 0 15px #00ff00'
      };
    } else if (theme === 'material') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: 'var(--secondary-bg)',
        borderRadius: '28px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      };
    }

    const closeBtn = () => {
      if (theme === '90s') {
        return (
          <button onClick={() => setIsModalOpen(false)} style={{ background: '#c0c0c0', border: '1px solid #fff', borderRightColor: '#000', borderBottomColor: '#000', padding: '2px 5px', fontWeight: 'bold', cursor: 'pointer' }}>X</button>
        );
      }
      if (theme === 'cli') return <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: '#ff5555', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>[ EXIT ]</button>;
      if (theme === 'material') return <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>;
      return <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' }}>[ CLOSE ]</button>;
    };

    const renderTabs = () => (
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: theme === '90s' ? 'none' : '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
        {['QUEUE', 'LIBRARY', 'PLAYLISTS'].map(tab => {
          const isActive = activeTab === tab;
          let style = { padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
          
          if (theme === 'material') {
            style = { ...style, borderRadius: '20px', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? 'var(--bg)' : 'var(--text)' };
          } else if (theme === '90s') {
            style = { ...style, background: '#c0c0c0', border: isActive ? '2px solid inset' : '2px solid outset', boxShadow: isActive ? 'inset 1px 1px #000' : 'none' };
          } else {
            style = { ...style, color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.5)', borderBottom: isActive ? '2px solid var(--accent)' : 'none' };
          }

          return <div key={tab} onClick={() => setActiveTab(tab)} style={style}>{tab}</div>;
        })}
      </div>
    );

    const renderQueue = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Active Queue ({playlist.length})</div>
          <button onClick={clearQueue} className={btnClass} style={btnStyle}>{theme === 'cli' ? '[ CLEAR ]' : 'Clear Queue'}</button>
        </div>
        {playlist.map((track, i) => (
          <div key={i} onClick={() => playIndex(i + 1)} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', background: status.track === track ? 'rgba(0,255,0,0.1)' : 'transparent' }}>
            <span style={{ marginRight: '10px', opacity: 0.5 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track}</span>
            {status.track === track && <span style={{ color: 'var(--accent)' }}>▶</span>}
          </div>
        ))}
        <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed var(--accent)', borderRadius: theme === 'material' ? '16px' : '0' }}>
          <div style={{ fontSize: '12px', marginBottom: '10px' }}>SAVE CURRENT QUEUE AS PLAYLIST</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={newPlaylistName} 
              onChange={e => setNewPlaylistName(e.target.value)} 
              placeholder="Playlist Name" 
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)', color: '#fff', padding: '5px' }}
            />
            <button onClick={savePlaylist} className={btnClass} style={btnStyle}>SAVE</button>
          </div>
        </div>
      </div>
    );

    const renderLibrary = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>File Library</div>
          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" style={{ display: 'none' }} id="modal-audio-upload" />
            <label htmlFor="modal-audio-upload" className={btnClass} style={{ ...btnStyle, display: 'inline-block', opacity: isUploading ? 0.5 : 1 }}>
              {isUploading ? 'UPLOADING...' : 'UPLOAD NEW'}
            </label>
          </div>
        </div>
        {library.map((file, i) => (
          <div key={i} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
            <button onClick={() => addToQueue(file)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', cursor: 'pointer' }}>+ QUEUE</button>
          </div>
        ))}
      </div>
    );

    const renderPlaylists = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Saved Playlists</div>
        {playlists.map((pl, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>{pl}</span>
            <button onClick={() => loadPlaylist(pl)} className={btnClass} style={btnStyle}>LOAD</button>
          </div>
        ))}
      </div>
    );

    return (
      <div style={overlayStyle} onClick={() => setIsModalOpen(false)}>
        <div style={modalBoxStyle} className="modal-animate" onClick={e => e.stopPropagation()}>
          {theme === '90s' && (
            <div style={{ background: 'navy', color: '#fff', padding: '3px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Media Center</span>
              {closeBtn()}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            {theme !== '90s' && <h2 style={{ margin: 0, fontSize: '18px' }}>{theme === 'cli' ? 'MAINFRAME // MEDIA_CENTER' : 'Media Center'}</h2>}
            {theme !== '90s' && closeBtn()}
          </div>
          
          {renderTabs()}
          
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'QUEUE' && renderQueue()}
            {activeTab === 'LIBRARY' && renderLibrary()}
            {activeTab === 'PLAYLISTS' && renderPlaylists()}
          </div>
          
          {theme === 'y2k' && <div className="y2k-scanline" style={{ pointerEvents: 'none' }}></div>}
          {theme === 'cli' && (
            <div style={{ marginTop: '15px', borderTop: '1px dashed #555', paddingTop: '10px', fontSize: '10px', opacity: 0.5 }}>
              STATUS: SYSTEM_UPLINK // {status.state.toUpperCase()} // VOL: {status.volume}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`} style={{ marginBottom: '20px' }}>
      {theme !== 'cli' && (
        <h2 style={{ margin: '0 0 15px 0' }}>
          {theme === '90s' ? 'Media Player' :
           theme === 'cyberpunk' ? 'AUDIO_UPLINK // MPD' :
           theme === 'fallout' ? 'HOLOTAPE_PLAYER' :
           theme === 'y2k' ? 'AUDIO_DECK // STREAM' :
           'AUDIO_DECK'}
        </h2>
      )}
      {renderCompactPanel()}
      {renderModal()}
    </div>
  );
}
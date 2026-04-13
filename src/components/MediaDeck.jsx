import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function MediaDeck({ audioData }) {
  const { theme } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('QUEUE'); // QUEUE, LIBRARY, PLAYLISTS
  const [playlist, setPlaylist] = useState([]);
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [clearQueueOnUpload, setClearQueueOnUpload] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const fileInputRef = useRef(null);

  const [isRestarting, setIsRestarting] = useState(false);

  // Fallback if the master sync hasn't arrived
  const rawStatus = audioData || { track: 'Establishing link...', state: 'stopped', volume: '100%' };
  const status = isRestarting ? { ...rawStatus, track: '[ RESTARTING DAEMON... ]' } : rawStatus;

  const fetchStatus = async () => {
    try { await fetch('/api/media/status'); } catch (e) {}
  };

  const fetchPlaylist = async () => {
    await fetchQueue();
  };

  const restartMPD = async () => {
    setIsRestarting(true);
    try {
      const res = await fetch('/api/media/restart', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
        await fetchPlaylist();
      }
    } catch (e) {
      console.error("Restart MPD failed", e);
    } finally {
      setIsRestarting(false);
    }
  };

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
    if (isModalOpen || isExpanded) {
      fetchQueue();
      fetchLibrary();
      fetchPlaylists();
    }
  }, [isModalOpen, isExpanded]);

  useEffect(() => {
    if ((isModalOpen && activeTab === 'QUEUE') || isExpanded) fetchQueue();
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

  const deleteTrack = async (filename) => {
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        fetchQueue();
        fetchLibrary();
      }
    } catch (e) { console.error("Delete track failed", e); }
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadCount(files.length);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('clearQueue', clearQueueOnUpload);

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      await fetchLibrary();
      await fetchQueue();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      setUploadCount(0);
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

    if (theme === 'cyberpunk') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(9, 10, 15, 0.85)', border: '1px solid var(--accent)', boxShadow: '0 0 10px rgba(255, 0, 85, 0.2)' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold', textShadow: '0 0 5px var(--accent)', marginBottom: '8px' }}>[ AUDIO_UPLINK ]</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', marginBottom: '10px', color: '#fff' }}>
              {status.track}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={togglePlay} style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', padding: '6px', cursor: 'pointer', fontWeight: 'bold', clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
              </button>
              <button onClick={nextTrack} style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', padding: '6px', cursor: 'pointer', fontWeight: 'bold', clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                [ SKIP ]
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ flex: 1, background: isExpanded ? 'var(--accent)' : 'transparent', border: '1px solid var(--accent)', color: isExpanded ? '#000' : 'var(--accent)', fontSize: '10px', padding: '6px', cursor: 'pointer', fontWeight: 'bold', clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                [ DATABASE ]
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div style={{ maxHeight: '180px', overflowY: 'auto', borderTop: '1px solid var(--accent)' }}>
              <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,0,85,0.2)', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple style={{ display: 'none' }} id="cp-audio-upload" />
                  <label htmlFor="cp-audio-upload" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}>
                    {isUploading ? `[ UPLOADING... ]` : '[ UPLOAD ]'}
                  </label>
                  <button onClick={restartMPD} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}>
                    [ RESTART_MPD ]
                  </button>
                </div>
              </div>
              <div style={{ padding: '10px' }}>
                {playlist.length === 0 ? (
                  <div style={{ color: 'var(--accent)', fontSize: '10px', opacity: 0.5 }}>NO_DATA_FOUND</div>
                ) : (
                  playlist.map((track, i) => {
                    const isPlaying = status.track === track;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', marginBottom: '2px', background: isPlaying ? 'var(--accent)' : 'transparent', color: isPlaying ? '#000' : 'rgba(255,0,85,0.6)', fontWeight: isPlaying ? 'bold' : 'normal', fontSize: '10px', border: isPlaying ? 'none' : '1px solid rgba(255,0,85,0.2)', cursor: 'pointer' }}>
                        <div onClick={() => playIndex(i + 1)} style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {i + 1}. {track}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteTrack(track); }} style={{ background: 'transparent', border: 'none', color: isPlaying ? '#000' : 'var(--accent)', cursor: 'pointer', fontSize: '10px', marginLeft: '5px' }}>
                          [X]
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (theme === 'system7') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontFamily: 'Geneva, sans-serif', fontSize: '11px', color: '#000' }}>
            <div style={{ fontWeight: 'bold', fontFamily: 'Chicago, sans-serif', marginBottom: '4px' }}>
              STATUS: {status.state.toUpperCase()}
            </div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {status.track}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={togglePlay} style={{ border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer' }}>
              {status.state === 'playing' ? '[ || ]' : '[ > ]'}
            </button>
            <button onClick={nextTrack} style={{ border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer' }}>
              {"[ >> ]"}
            </button>
            <button onClick={() => setIsModalOpen(true)} style={{ border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer', marginLeft: 'auto' }}>
              [ OPEN ]
            </button>
          </div>
        </div>
      );
    }

    if (theme === 'rickmorty') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#0d1117', border: '2px solid #97ce4c', borderRadius: '15px', boxShadow: '0 0 15px rgba(151, 206, 76, 0.4)', padding: '15px' }}>
          <div style={{ fontSize: '14px', color: '#97ce4c', fontWeight: 'bold', marginBottom: '8px', textShadow: '0 0 5px rgba(151, 206, 76, 0.4)' }}>// PORTAL_UPLINK</div>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px', marginBottom: '10px', color: '#97ce4c' }}>
            {status.track}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={togglePlay} style={{ flex: 1, background: '#0d1117', border: '2px solid #97ce4c', color: '#97ce4c', fontSize: '12px', padding: '8px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = '#0d1117'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#97ce4c'; }}>
              [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
            </button>
            <button onClick={nextTrack} style={{ flex: 1, background: '#0d1117', border: '2px solid #97ce4c', color: '#97ce4c', fontSize: '12px', padding: '8px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = '#0d1117'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#97ce4c'; }}>
              [ SKIP_DIMENSION ]
            </button>
            <button onClick={() => setIsModalOpen(true)} style={{ flex: 1, background: '#0d1117', border: '2px solid #e4a788', color: '#e4a788', fontSize: '12px', padding: '8px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e4a788'; e.currentTarget.style.color = '#0d1117'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#e4a788'; }}>
              [ OPEN_PORTAL ]
            </button>
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
        fontFamily: 'var(--font)',
        overflow: 'visible'
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
    } else if (theme === 'system7') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: '#fff',
        border: '1px solid #000',
        borderRadius: 0,
        boxShadow: '4px 4px 0px #000',
        color: '#000',
        padding: '2px',
        display: 'flex',
        flexDirection: 'column'
      };
    } else if (theme === 'material') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: 'var(--secondary-bg)',
        borderRadius: '28px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      };
    } else if (theme === 'rickmorty') {
      modalBoxStyle = {
        ...modalBoxStyle,
        background: '#0d1117',
        border: '2px solid #97ce4c',
        borderRadius: '15px',
        color: '#97ce4c',
        boxShadow: '0 0 15px rgba(151, 206, 76, 0.4)',
        fontFamily: "'Courier New', Courier, monospace"
      };
    }

    const closeBtn = () => {
      if (theme === 'system7') {
        return (
          <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', left: '2px', top: '2px', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', cursor: 'pointer' }}></button>
        );
      }
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: theme === '90s' ? 'none' : theme === 'system7' ? '1px solid #000' : '1px solid rgba(255,255,255,0.1)', paddingBottom: theme === 'system7' ? '0px' : '10px', paddingLeft: theme === 'system7' ? '10px' : '0' }}>
        {['QUEUE', 'LIBRARY', 'PLAYLISTS'].map(tab => {
          const isActive = activeTab === tab;
          let style = { padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
          
          if (theme === 'system7') {
            style = {
              ...style,
              fontFamily: 'Chicago, sans-serif',
              background: isActive ? '#000' : '#fff',
              color: isActive ? '#fff' : '#000',
              border: '1px solid #000',
              borderBottom: isActive ? '1px solid #000' : 'none',
              marginBottom: '-1px'
            };
          } else if (theme === 'material') {
            style = { ...style, borderRadius: '20px', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? 'var(--bg)' : 'var(--text)' };
          } else if (theme === '90s') {
            style = { ...style, background: '#c0c0c0', border: isActive ? '2px solid inset' : '2px solid outset', boxShadow: isActive ? 'inset 1px 1px #000' : 'none' };
          } else {
            style = { ...style, color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.5)', borderBottom: isActive ? '2px solid var(--accent)' : 'none' };
          }

          return <div key={tab} onClick={() => setActiveTab(tab)} style={style}>{tab}</div>;
        })}
        <button 
          onClick={restartMPD} 
          className={theme === 'cyberpunk' ? 'cp-btn' : theme === 'material' ? 'md-btn-tonal' : theme === 'fallout' ? 'fo-edit-btn' : ''}
          style={{
            marginLeft: 'auto',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: theme === 'system7' ? '2px 8px' : '8px 15px',
            fontFamily: theme === 'system7' ? 'Geneva, sans-serif' : 'inherit',
            background: theme === 'system7' ? '#fff' : theme === '90s' ? '#c0c0c0' : 'transparent',
            color: theme === 'system7' ? '#000' : theme === '90s' ? '#000' : theme === 'material' ? 'var(--text)' : 'var(--accent)',
            border: theme === 'system7' ? '1px solid #000' : theme === '90s' ? '2px outset' : theme === 'cyberpunk' || theme === 'material' ? 'none' : '1px solid var(--accent)',
            borderRadius: theme === 'material' ? '20px' : theme === 'system7' ? '4px' : '0',
            boxShadow: theme === 'system7' ? '1px 1px 0px #000' : 'none'
          }}
          disabled={isRestarting}
        >
          {theme === 'cli' || theme === 'fallout' ? '[ RESTART DAEMON ]' : 'Restart MPD'}
        </button>
      </div>
    );

    const renderQueue = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Active Queue ({playlist.length})</div>
          <button onClick={clearQueue} className={btnClass} style={theme === 'system7' ? { border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer' } : btnStyle}>{theme === 'cli' ? '[ CLEAR ]' : 'Clear Queue'}</button>
        </div>
        <div style={theme === 'system7' ? { border: '1px solid #000', background: '#fff', padding: '2px', fontFamily: 'Geneva, sans-serif', fontSize: '11px', color: '#000' } : {}}>
          {playlist.length === 0 && theme === 'rickmorty' && (
             <div style={{ padding: '20px', textAlign: 'center', color: '#e4a788' }}>[ WUBBA LUBBA DUB DUB - QUEUE IS EMPTY ]</div>
          )}
          {playlist.map((track, i) => {
            const isActive = status.track === track;
            let itemStyle = { padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' };
            if (theme === 'system7') {
              itemStyle = { ...itemStyle, background: isActive ? '#000' : 'transparent', color: isActive ? '#fff' : '#000', borderBottom: '1px dotted #000', padding: '4px' };
            } else {
              itemStyle = { ...itemStyle, background: isActive ? 'rgba(0,255,0,0.1)' : 'transparent' };
            }
            return (
              <div key={i} onClick={() => playIndex(i + 1)} style={itemStyle}>
                <span style={{ marginRight: '10px', opacity: theme === 'system7' ? 1 : 0.5 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track}</span>
                {isActive && <span style={{ color: theme === 'system7' ? '#fff' : 'var(--accent)' }}>▶</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTrack(track); }}
                  style={theme === 'system7' ? { border: '1px solid #000', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva, sans-serif', fontSize: '10px', padding: '1px 5px', cursor: 'pointer', marginLeft: '10px' } : { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', padding: '1px 5px', cursor: 'pointer', marginLeft: '10px' }}
                >
                  [ X ]
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '20px', padding: '15px', border: theme === 'system7' ? '1px solid #000' : '1px dashed var(--accent)', borderRadius: theme === 'material' ? '16px' : '0' }}>
          <div style={{ fontSize: '12px', marginBottom: '10px', fontFamily: theme === 'system7' ? 'Chicago, sans-serif' : 'inherit' }}>SAVE CURRENT QUEUE AS PLAYLIST</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={newPlaylistName} 
              onChange={e => setNewPlaylistName(e.target.value)} 
              placeholder="Playlist Name" 
              style={{ flex: 1, background: theme === 'system7' ? '#fff' : 'rgba(0,0,0,0.3)', border: theme === 'system7' ? '1px inset #000' : '1px solid var(--accent)', color: theme === 'system7' ? '#000' : '#fff', padding: '5px' }}
            />
            <button onClick={savePlaylist} className={btnClass} style={theme === 'system7' ? { border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer' } : btnStyle}>SAVE</button>
          </div>
        </div>
      </div>
    );

    const renderLibrary = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>File Library</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontFamily: theme === 'system7' ? 'Geneva, sans-serif' : 'inherit', border: theme === 'system7' ? '1px solid #000' : 'none', padding: theme === 'system7' ? '2px 4px' : '0', background: theme === 'system7' ? '#fff' : 'transparent', color: theme === 'system7' ? '#000' : 'inherit', cursor: 'pointer' }}>
              <input type="checkbox" checked={clearQueueOnUpload} onChange={e => setClearQueueOnUpload(e.target.checked)} style={theme === 'system7' ? { margin: 0 } : {}} />
              Clear queue and play batch
            </label>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple style={{ display: 'none' }} id="modal-audio-upload" />
            <label htmlFor="modal-audio-upload" className={btnClass} style={theme === 'system7' ? { border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer', display: 'inline-block', opacity: isUploading ? 0.5 : 1 } : { ...btnStyle, display: 'inline-block', opacity: isUploading ? 0.5 : 1 }}>
              {isUploading ? `[ UPLOADING ${uploadCount} FILES... ]` : 'UPLOAD NEW'}
            </label>
          </div>
        </div>
        <div style={theme === 'system7' ? { border: '1px solid #000', background: '#fff', padding: '2px', fontFamily: 'Geneva, sans-serif', fontSize: '11px', color: '#000' } : {}}>
          {library.map((file, i) => (
            <div key={i} style={{ padding: theme === 'system7' ? '4px' : '8px', borderBottom: theme === 'system7' ? '1px dotted #000' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
              <button onClick={() => addToQueue(file)} style={theme === 'system7' ? { border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer', fontSize: '10px' } : { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', cursor: 'pointer' }}>+ QUEUE</button>
            </div>
          ))}
        </div>
      </div>
    );

    const renderPlaylists = () => (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>Saved Playlists</div>
        <div style={theme === 'system7' ? { border: '1px solid #000', background: '#fff', padding: '2px', fontFamily: 'Geneva, sans-serif', fontSize: '11px', color: '#000' } : {}}>
          {playlists.map((pl, i) => (
            <div key={i} style={{ padding: theme === 'system7' ? '4px' : '10px', borderBottom: theme === 'system7' ? '1px dotted #000' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{pl}</span>
              <button onClick={() => loadPlaylist(pl)} className={btnClass} style={theme === 'system7' ? { border: '1px solid #000', borderRadius: '4px', boxShadow: '1px 1px 0px #000', background: '#fff', color: '#000', fontFamily: 'Geneva', padding: '2px 8px', cursor: 'pointer' } : btnStyle}>LOAD</button>
            </div>
          ))}
        </div>
      </div>
    );

    const ModalWrapper = theme === 'cli' ? 'fieldset' : 'div';

    return (
      <div style={overlayStyle} onClick={() => setIsModalOpen(false)}>
        <ModalWrapper style={modalBoxStyle} className="modal-animate" onClick={e => e.stopPropagation()}>
          {theme === 'cli' && (
            <legend style={{ padding: '0 10px', color: '#fff', backgroundColor: 'transparent', margin: 0, fontSize: '18px' }}>
              MAINFRAME // MEDIA_CENTER
            </legend>
          )}
          {theme === 'system7' && (
            <div style={{ height: '20px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '10px', background: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 2px)' }}>
              {closeBtn()}
              <span style={{ background: '#fff', padding: '0 8px', fontFamily: 'Chicago, sans-serif', fontWeight: 'bold', fontSize: '12px', zIndex: 2 }}>Media Center</span>
            </div>
          )}
          {theme === '90s' && (
            <div style={{ background: 'navy', color: '#fff', padding: '3px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Media Center</span>
              {closeBtn()}
            </div>
          )}
          {theme !== 'system7' && (
            <div style={{ display: 'flex', justifyContent: theme === 'cli' ? 'flex-end' : 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              {theme !== '90s' && theme !== 'cli' && (
                <h2 style={{ margin: 0, fontSize: '18px' }}>
                  Media Center
                </h2>
              )}
              {theme !== '90s' && closeBtn()}
            </div>
          )}
          
          <div style={{ padding: theme === 'system7' ? '0 10px 10px 10px' : '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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
        </ModalWrapper>
      </div>
    );
  };

  return (
    <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`} style={{ marginBottom: '20px' }}>
      {theme === 'system7' && (
          <div className="s7-titlebar">
              <span className="s7-title-text">Media Player</span>
          </div>
      )}
      {theme !== 'cli' && theme !== 'system7' && theme !== 'rickmorty' && (
        <h2 style={{ margin: '0 0 15px 0' }}>
          {theme === '90s' ? 'Media Player' :
           theme === 'cyberpunk' ? 'AUDIO_UPLINK // MPD' :
           theme === 'fallout' ? 'HOLOTAPE_PLAYER' :
           theme === 'y2k' ? 'AUDIO_DECK // STREAM' :
           'AUDIO_DECK'}
        </h2>
      )}
      {theme === 'system7' ? (
          <div className="s7-content">
            {renderCompactPanel()}
          </div>
      ) : (
          renderCompactPanel()
      )}
      {renderModal()}
    </div>
  );
}
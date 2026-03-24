import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function MediaDeck({ audioData }) {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fallback if the master sync hasn't arrived
  const status = audioData || { track: 'Establishing link...', state: 'stopped', volume: '100%' };

  const fetchPlaylist = async () => {
    try {
      const res = await fetch('/api/media/playlist');
      const data = await res.json();
      if (data.status === 'success') setPlaylist(data.playlist);
    } catch (e) { console.error("Playlist fetch failed", e); }
  };

  // Fetch the playlist when the user opens the menu, or if the track changes while open
  useEffect(() => {
    if (isExpanded) fetchPlaylist();
  }, [isExpanded, status.track]);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await fetch('/api/media/upload', { method: 'POST', body: formData });
      await fetchPlaylist(); // Refresh the visible list immediately
    } catch (err) { console.error("Upload failed", err); }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the hidden input
  };

  // Themed Button Style Helper
  const btnClass = theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : '';
  const btnStyle = theme !== 'fallout' && theme !== 'material' && theme !== '90s' 
    ? { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' } 
    : {};

  return (
    <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`} style={{ marginBottom: '20px' }}>
      
      <h2 style={{ margin: '0 0 15px 0' }}>
        {theme === '90s' ? 'Media Player' : 
         theme === 'cyberpunk' ? 'AUDIO_UPLINK // MPD' : 
         theme === 'fallout' ? 'HOLOTAPE_PLAYER' : 
         theme === 'y2k' ? 'AUDIO_DECK // STREAM' : 
         'AUDIO_DECK'}
      </h2>

      {theme === 'y2k' ? (
        /* =========================================
           Y2K 2ADVANCED FLASH LAYOUT
           ========================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>AUDIO_UPLINK</span>
                <span style={{ fontSize: '9px', opacity: 0.7 }}>[{status.state.toUpperCase()}]</span>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                {/* Signature Orange Side-Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>
                
                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '5px' }}>CURRENT_STREAM:</div>
                <div style={{ color: '#fff', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '10px', paddingLeft: '8px' }}>
                    {status.track}
                </div>

                {/* Flash-Era Controls */}
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={togglePlay} style={{ background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                            [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
                        </button>
                        <button onClick={nextTrack} style={{ background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                            [ SKIP ]
                        </button>
                    </div>
                    <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                        [ {isExpanded ? 'CLOSE_DB' : 'DATABASE'} ]
                    </button>
                </div>
            </div>

            {/* Expanding Database Drawer */}
            {isExpanded && (
                <div style={{ border: '1px dashed #2a4b66', padding: '8px', background: 'rgba(123, 188, 213, 0.05)', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent)' }}>LOCAL_AUDIO_FILES</span>
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" style={{ display: 'none' }} id="audio-upload" />
                            <label htmlFor="audio-upload" style={{ cursor: isUploading ? 'wait' : 'pointer', fontSize: '8px', color: '#070c16', backgroundColor: 'var(--accent)', padding: '2px 6px', opacity: isUploading ? 0.5 : 1 }}>
                                {isUploading ? 'UPLOADING...' : '+ INJECT_TRACK'}
                            </label>
                        </div>
                    </div>
                    
                    <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '5px' }}>
                        {playlist.length > 0 ? playlist.map((track, i) => {
                            const isPlaying = status.track === track;
                            return (
                                <div key={i} onClick={() => playIndex(i + 1)} style={{ 
                                    padding: '4px', cursor: 'pointer', fontSize: '9px',
                                    color: isPlaying ? '#070c16' : '#7bbcd5',
                                    backgroundColor: isPlaying ? 'var(--accent)' : 'transparent',
                                    borderBottom: '1px solid rgba(42, 75, 102, 0.5)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                    <span style={{ opacity: 0.5, marginRight: '8px' }}>ID_{String(i + 1).padStart(2, '0')}</span> 
                                    {track}
                                </div>
                            );
                        }) : (
                            <div style={{ fontSize: '9px', opacity: 0.5 }}>NO_AUDIO_FOUND</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      ) : (
        /* =========================================
           DEFAULT / 90s / CP / FO / MD LAYOUT
           ========================================= */
        <div style={theme === '90s' ? { border: '2px solid inset', padding: '10px' } : {}}>
          
          {/* Currently Playing Header */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: status.state === 'playing' ? 'var(--accent)' : 'inherit', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
              &gt; STATUS: {status.state.toUpperCase()}
            </div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>
              {status.track}
            </div>
          </div>

          {/* Primary Controls */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={togglePlay} className={btnClass} style={btnStyle}>
              [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
            </button>
            <button onClick={nextTrack} className={btnClass} style={btnStyle}>
              [ SKIP ]
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className={btnClass} style={{ ...btnStyle, marginLeft: 'auto' }}>
              [ {isExpanded ? 'CLOSE_DB' : 'DATABASE'} ]
            </button>
          </div>

          {/* Expanding Playlist & Upload Drawer */}
          {isExpanded && (
            <div style={{ marginTop: '15px', borderTop: theme === '90s' ? '1px solid #808080' : '1px dashed var(--accent)', paddingTop: '15px' }}>
              
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.8 }}>TRACK_INDEX:</span>
                
                {/* Hidden File Input Hack */}
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" style={{ display: 'none' }} id="audio-upload" />
                  <label 
                    htmlFor="audio-upload" 
                    style={{ cursor: isUploading ? 'wait' : 'pointer', fontSize: '12px', fontWeight: 'bold', color: 'var(--bg)', backgroundColor: 'var(--accent)', padding: '3px 8px', opacity: isUploading ? 0.5 : 1 }}
                  >
                    {isUploading ? 'UPLOADING_PACKET...' : '+ UPLOAD_TRACK'}
                  </label>
                </div>
              </div>

              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {playlist.length > 0 ? playlist.map((track, i) => {
                  const isPlaying = status.track === track;
                  return (
                    <div 
                      key={i} 
                      onClick={() => playIndex(i + 1)}
                      style={{ 
                        padding: '5px', cursor: 'pointer', fontSize: '13px',
                        color: isPlaying ? 'var(--bg)' : 'var(--text)',
                        backgroundColor: isPlaying ? 'var(--accent)' : 'transparent',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        borderBottom: theme === '90s' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <span style={{ opacity: isPlaying ? 1 : 0.5, marginRight: '8px' }}>{String(i + 1).padStart(2, '0')}</span> 
                      {track}
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '12px', opacity: 0.5, fontStyle: 'italic' }}>NO_AUDIO_FILES_DETECTED</div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
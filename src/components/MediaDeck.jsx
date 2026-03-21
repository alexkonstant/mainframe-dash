import React from 'react';

// Accept the audioData prop from App.jsx
const MediaDeck = ({ audioData }) => {
  // Fallback state if the master sync hasn't arrived yet
  const status = audioData || {
    track: 'Establishing link...',
    state: 'stopped',
    volume: '100%'
  };

  const togglePlay = async () => {
    // Fire the command to the Pi 1 (UI will naturally update on the next 3s sync)
    await fetch('/api/media/toggle', { method: 'POST' });
  };

  const nextTrack = async () => {
    await fetch('/api/media/next', { method: 'POST' });
  };

  // ... Keep your exact return() block from here down ...

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ color: '#0ff', margin: '0 0 10px 0', fontSize: '14px', letterSpacing: '1px' }}>
        AUDIO_UPLINK // MPD_STREAM
      </h3>
      
      <div style={{ 
        border: '1px solid rgba(0, 255, 255, 0.3)', 
        padding: '15px', 
        backgroundColor: 'rgba(0, 20, 30, 0.5)' 
      }}>
        {/* Track Info Screen */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#f04', fontSize: '12px', marginBottom: '5px' }}>
            &gt; STATUS: {status.state.toUpperCase()}
          </div>
          <div style={{ color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {status.track}
          </div>
        </div>

        {/* Cyberpunk Control Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={togglePlay}
            style={{ 
              background: 'transparent', 
              border: '1px solid #f04', 
              color: '#f04', 
              padding: '8px 15px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            [ {status.state === 'playing' ? 'PAUSE' : 'PLAY'} ]
          </button>
          
          <button 
            onClick={nextTrack}
            style={{ 
              background: 'transparent', 
              border: '1px solid #0ff', 
              color: '#0ff', 
              padding: '8px 15px', 
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            [ SKIP_TRACK ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaDeck;
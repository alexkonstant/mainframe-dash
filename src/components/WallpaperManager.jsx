import { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function WallpaperManager() {
  const { theme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [wallpapers, setWallpapers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Initialize state by checking the browser's persistent memory for the CURRENT theme
  const [activeBg, setActiveBg] = useState(() => {
    return localStorage.getItem(`mainframe_bg_${theme}`) || 'css-1';
  });

  const fetchWallpapers = () => {
    fetch('/api/wallpapers')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setWallpapers(data.wallpapers); })
      .catch(err => console.error("DB Offline", err));
  };

  useEffect(() => {
    if (isOpen) fetchWallpapers();
  }, [isOpen]);

  // 2. When the user changes the main theme, dynamically load that theme's saved wallpaper
  useEffect(() => {
    const savedBg = localStorage.getItem(`mainframe_bg_${theme}`) || 'css-1';
    setActiveBg(savedBg);
  }, [theme]);

  // 3. The Magic Background Injector (Now with persistent saving)
  useEffect(() => {
    // Lock the choice into the browser's hard drive so it survives tab closures
    localStorage.setItem(`mainframe_bg_${theme}`, activeBg);

    if (activeBg.startsWith('css-')) {
      // Revert to CSS built-in themes
      document.documentElement.setAttribute('data-wallpaper', activeBg.replace('css-', ''));
      document.body.style.backgroundImage = '';
    } else {
      // Override with Custom Image
      document.documentElement.setAttribute('data-wallpaper', 'custom');
      document.body.style.backgroundImage = `url('/api/wallpapers/view/${activeBg}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center center';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }, [activeBg, theme]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/wallpapers/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.status === 'success') {
        fetchWallpapers();
        setActiveBg(data.filename); // Auto-apply the newly uploaded image
      }
    } catch (err) { console.error(err); }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Button Class Helpers
  const btnClass = theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : '';
  const genericBtnStyle = theme !== 'fallout' && theme !== 'material' && theme !== '90s' 
    ? { border: '1px solid var(--accent)', background: 'transparent', color: 'var(--text)', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' } : {};

  return (
    <>
      {/* THE TRIGGER BUTTON (Matches the dropdown styling) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="theme-selector"
        style={{ padding: '8px 12px', minWidth: '80px', textAlign: 'center' }}
      >
        {theme === '90s' ? 'Display Properties' : theme === 'cyberpunk' ? 'OPTICS_CONFIG' : theme === 'fallout' ? 'VISUALS' : theme === 'y2k' ? 'BG_PREFS' : 'Wallpapers'}
      </button>

      {/* THE THEMED MODAL */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: theme === '90s' ? 'rgba(0,128,128,0.5)' : 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          backdropFilter: theme === 'cyberpunk' ? 'blur(5px)' : 'none'
        }}>
          <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`} style={{ width: '400px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, flexGrow: 1 }}>
                {theme === '90s' ? 'Background Display' : 'VISUAL_OVERRIDE'}
              </h2>
              <button onClick={() => setIsOpen(false)} className={btnClass} style={genericBtnStyle}>[X]</button>
            </div>

            {/* Uploader Block */}
            <div style={{ marginBottom: '20px', padding: '15px', border: theme === '90s' ? '2px inset' : '1px dashed var(--accent)', background: theme === '90s' ? '#fff' : 'rgba(0,0,0,0.2)' }}>
              <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" style={{ display: 'none' }} id="wp-upload" />
              <label htmlFor="wp-upload" className={btnClass} style={{ ...genericBtnStyle, display: 'block', textAlign: 'center', cursor: isUploading ? 'wait' : 'pointer', background: 'var(--accent)', color: 'var(--bg)', opacity: isUploading ? 0.5 : 1 }}>
                {isUploading ? 'UPLOADING...' : '+ IMPORT NEW WALLPAPER'}
              </label>
            </div>

            {/* Selection List */}
            <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '10px' }}>
              <div style={{ fontSize: '0.8em', opacity: 0.6, marginBottom: '10px', textTransform: 'uppercase' }}>Built-in CSS Formats</div>
              {['css-1', 'css-2', 'css-3'].map(bg => (
                <div key={bg} onClick={() => setActiveBg(bg)} style={{ padding: '8px', cursor: 'pointer', marginBottom: '5px', background: activeBg === bg ? 'var(--accent)' : 'transparent', color: activeBg === bg ? 'var(--bg)' : 'var(--text)', border: theme === '90s' ? 'none' : '1px solid var(--accent)' }}>
                  &gt; BASE_VARIANT_0{bg.split('-')[1]}
                </div>
              ))}

              <div style={{ fontSize: '0.8em', opacity: 0.6, marginTop: '20px', marginBottom: '10px', textTransform: 'uppercase' }}>Local Databank</div>
              {wallpapers.length === 0 && <div style={{ opacity: 0.5, fontStyle: 'italic' }}>NO_LOCAL_FILES_FOUND</div>}
              {wallpapers.map(wp => (
                <div key={wp} onClick={() => setActiveBg(wp)} style={{ padding: '8px', cursor: 'pointer', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: activeBg === wp ? 'var(--accent)' : 'transparent', color: activeBg === wp ? 'var(--bg)' : 'var(--text)', border: theme === '90s' ? 'none' : '1px solid var(--accent)' }}>
                  &gt; {wp}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
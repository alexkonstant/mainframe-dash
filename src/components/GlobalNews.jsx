import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function GlobalNews() {
    const [news, setNews] = useState([]);
    const [status, setStatus] = useState("> Intercepting broadcasts...");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { theme } = useContext(ThemeContext);

    const fetchNews = () => {
        setIsRefreshing(true);
        setStatus("> Intercepting broadcasts...");
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setNews(data.articles);
                    setStatus("> Broadcasts decrypted.");
                }
            })
            .catch(() => setStatus("> ERR_NEWS_FEED_OFFLINE"))
            .finally(() => setIsRefreshing(false));
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 1800000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`dashboard-panel global-news ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme === 'material' ? '20px' : '0' }}>
                <h2 style={{ flexGrow: 1, marginRight: '15px', marginBottom: theme === 'material' ? '0' : '' }}>
                    {theme === 'cyberpunk' ? 'N54_NEWS_BROADCAST // LIVE' :
                        theme === 'fallout' ? 'GALAXY_NEWS_RADIO // TEXT_RELAY' :
                            theme === 'material' ? 'Latest News' :
                                theme === 'y2k' ? 'GLOBAL_INTEL // SYNDICATE_FEED' :
                                    'GLOBAL_NEWS // HEADLINES'}
                </h2>
                <button onClick={fetchNews} disabled={isRefreshing}
                    className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                    style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: isRefreshing ? 'wait' : 'pointer', fontWeight: 'bold', padding: '5px 10px', height: 'fit-content', opacity: isRefreshing ? 0.5 : 1 } : { opacity: isRefreshing ? 0.5 : 1 }}
                >
                    {theme === 'material' ? 'Refresh' : '[ REFRESH ]'}
                </button>
            </div>

            {/* Default Status Indicators */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>}
            {theme === 'fallout' && <div style={{ marginBottom: '15px', opacity: 0.8 }}>&gt; SIGNAL_STRENGTH: GOOD</div>}

            {/* Y2K Specific Layout */}
            {theme === 'y2k' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>LIVE_UPLINK</span>
                        <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {news ? news.length : 0} PACKETS ]</span>
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                        {news && news.length > 0 ? news.map((article, i) => (
                            <div key={i} style={{ 
                                background: 'rgba(0, 0, 0, 0.4)', 
                                border: '1px solid #2a4b66', 
                                padding: '8px',
                                marginBottom: '8px',
                                position: 'relative'
                            }}>
                                {/* Left Orange Accent Line */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent)' }}></div>
                                
                                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SRC: {article.source || 'SYNDICATE'}</span>
                                    <span>ID_0{i + 1}</span>
                                </div>
                                
                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', marginBottom: '8px' }}>
                                    {article.title}
                                </div>
                                
                                <div style={{ textAlign: 'right' }}>
                                    <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" 
                                       style={{ 
                                           display: 'inline-block',
                                           background: 'linear-gradient(180deg, #162942, #070c16)',
                                           border: '1px solid #2a4b66',
                                           color: '#7bbcd5',
                                           fontSize: '8px',
                                           padding: '2px 6px',
                                           textDecoration: 'none',
                                           letterSpacing: '1px'
                                       }}>
                                       [ ACCESS_NODE ]
                                    </a>
                                </div>
                            </div>
                        )) : (
                            <div style={{ opacity: 0.5, fontSize: '9px' }}>&gt; AWAITING_TRANSMISSION...</div>
                        )}
                    </div>
                </div>
            ) : news.length > 0 ? (
                /* The Original Rendering Logic for Default / CP / FO / MD */
                <div className={theme === 'cyberpunk' ? 'cp-news-feed' : theme === 'fallout' ? 'fo-news-list' : theme === 'material' ? 'md-news-list' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: 0, margin: 0, lineHeight: '1.6' } : {}}>
                    {news.map((item, i) => (
                        <div key={i} className={theme === 'cyberpunk' ? 'cp-news-item' : theme === 'fallout' ? 'fo-news-item' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { marginBottom: '10px' } : {}}>
                            {theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && '&gt; '}
                            {theme === 'fallout' && <span style={{ marginRight: '10px' }}>&gt;</span>}
                            <a href={item.link || item.url} target="_blank" rel="noreferrer" className={theme === 'fallout' ? 'fo-termlink-btn' : theme === 'material' ? 'md-news-card' : 'interactive-link'}>
                                {theme === 'fallout' ? item.title.toUpperCase() : item.title}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === 'material' ? 'Fetching headlines...' : '> WAITING FOR TRANSMISSION...'}</div>
            )}
        </div>
    );
}
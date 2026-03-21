import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SystemControl() {
    const { theme } = useContext(ThemeContext);
    const [status, setStatus] = useState("Awaiting command...");
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const executeCommand = async (action, requireConfirm = false) => {
        if (requireConfirm && confirmAction !== action) {
            setConfirmAction(action);
            setStatus(`Confirm ${action.toUpperCase()}? Click again to execute.`);
            setTimeout(() => setConfirmAction(null), 3000); // Reset after 3s
            return;
        }

        setLoading(true);
        setStatus(`> Executing ${action.toUpperCase()}...`);
        setConfirmAction(null);

        try {
            const res = await fetch('/api/system/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            setStatus(`> ${data.message}`);
        } catch (err) {
            setStatus("> ERR_UPLINK_SEVERED");
        }
        setLoading(false);
    };

    return (
        <div className={`dashboard-panel system-control ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'System Properties' : 
                     theme === 'cyberpunk' ? 'CORE_CONTROL // ROOT_ACCESS' : 
                     theme === 'fallout' ? 'ROBCO_OS // POWER_MGMT' :
                     'SYS_CONTROL // ROOT'}
                </h2>
            )}
            
            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '15px' }}>System Control</h2>}

            <div style={{ opacity: theme === '90s' ? 1 : 0.7, marginBottom: '15px', fontStyle: theme === '90s' ? 'normal' : 'italic', color: confirmAction ? '#FFB4AB' : 'inherit' }}>
                {status}
            </div>

            <div className={theme === 'cyberpunk' ? 'cp-sys-grid' : theme === 'material' ? 'md-sys-grid' : ''} style={theme !== 'cyberpunk' && theme !== 'material' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } : {}}>
                
                {/* Save to ROM (lbu commit) */}
                <button 
                    disabled={loading}
                    onClick={() => executeCommand('commit')}
                    className={theme === '90s' ? 'win95-btn' : theme === 'cyberpunk' ? 'cp-btn' : theme === 'fallout' ? 'fo-termlink-btn' : 'md-btn-sys'}
                    style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: '10px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' } : {}}
                >
                    {theme === 'material' ? '💾 Save to ROM' : '[ COMMIT_ROM ]'}
                </button>

                {/* Update Packages */}
                <button 
                    disabled={loading}
                    onClick={() => executeCommand('update')}
                    className={theme === '90s' ? 'win95-btn' : theme === 'cyberpunk' ? 'cp-btn' : theme === 'fallout' ? 'fo-termlink-btn' : 'md-btn-sys'}
                    style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: '10px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' } : {}}
                >
                    {theme === 'material' ? '📦 Update OS' : '[ SYNC_PACKAGES ]'}
                </button>

                {/* Reboot */}
                <button 
                    disabled={loading}
                    onClick={() => executeCommand('reboot', true)}
                    className={theme === '90s' ? 'win95-btn' : theme === 'cyberpunk' ? 'cp-btn cp-btn-warn' : theme === 'fallout' ? 'fo-termlink-btn fo-warn-btn' : confirmAction === 'reboot' ? 'md-btn-sys md-btn-danger' : 'md-btn-sys'}
                    style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: '10px', background: confirmAction === 'reboot' ? '#ff0055' : 'transparent', color: confirmAction === 'reboot' ? '#000' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' } : {}}
                >
                    {confirmAction === 'reboot' ? 'CONFIRM?' : theme === 'material' ? '🔄 Reboot' : '[ REBOOT ]'}
                </button>

                {/* Shutdown */}
                <button 
                    disabled={loading}
                    onClick={() => executeCommand('shutdown', true)}
                    className={theme === '90s' ? 'win95-btn' : theme === 'cyberpunk' ? 'cp-btn cp-btn-warn' : theme === 'fallout' ? 'fo-termlink-btn fo-warn-btn' : confirmAction === 'shutdown' ? 'md-btn-sys md-btn-danger' : 'md-btn-sys'}
                    style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: '10px', background: confirmAction === 'shutdown' ? '#ff0055' : 'transparent', color: confirmAction === 'shutdown' ? '#000' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' } : {}}
                >
                    {confirmAction === 'shutdown' ? 'CONFIRM?' : theme === 'material' ? '🛑 Shutdown' : '[ POWER_OFF ]'}
                </button>

            </div>
        </div>
    );
}
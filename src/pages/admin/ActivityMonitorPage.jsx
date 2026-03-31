import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { io } from 'socket.io-client';

// ─────────────────────────────────────────────────────────────────────────────

function formatSeconds(total) {
    if (!total) return '0m';
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function timeSince(dateStr) {
    if (!dateStr) return 'Never';
    const diff = Math.round((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

const STATUS_CONFIG = {
    working: { label: 'Working',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  dot: '🟢' },
    idle:    { label: 'Idle',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '🟡' },
    offline: { label: 'Offline',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '🔴' },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ActivityMonitorPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [selected, setSelected] = useState(null);
    const socketRef = useRef(null);

    // ── Fetch initial data ──────────────────────────────────────────────────
    const fetchLive = useCallback(async () => {
        try {
            const res = await api.get('/activity/live');
            setSessions(res.data.sessions || []);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('[ActivityMonitor] Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Socket.io real-time updates ─────────────────────────────────────────
    useEffect(() => {
        fetchLive();

        const token = localStorage.getItem('token');
        const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5050';

        const socket = io(baseUrl, {
            auth: { token },
            reconnection: true,
            reconnectionDelayMax: 5000
        });

        socket.on('connect', () => {
            setSocketConnected(true);
            socket.emit('join_admin_activity');
        });

        socket.on('disconnect', () => setSocketConnected(false));

        socket.on('activity_update', (update) => {
            setSessions(prev => {
                const idx = prev.findIndex(s => s.employee_id === update.employee_id);
                if (idx === -1) {
                    // New session appeared — fetch full list
                    fetchLive();
                    return prev;
                }
                const next = [...prev];
                next[idx] = { ...next[idx], ...update };
                return next;
            });
            setLastRefresh(new Date());
        });

        socketRef.current = socket;

        // Fallback polling every 60s if socket is down
        const fallbackInterval = setInterval(fetchLive, 60000);

        return () => {
            socket.disconnect();
            clearInterval(fallbackInterval);
        };
    }, [fetchLive]);

    // ── Join admin-activity room via socket ─────────────────────────────────
    // (backend needs to handle 'join_admin_activity' event)

    const stats = {
        working: sessions.filter(s => s.status === 'working').length,
        idle:    sessions.filter(s => s.status === 'idle').length,
        offline: sessions.filter(s => s.status === 'offline').length,
    };

    return (
        <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                        Activity Monitor
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                        Real-time employee work session tracking
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: socketConnected ? '#22c55e' : '#ef4444' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: socketConnected ? '#22c55e' : '#ef4444', boxShadow: socketConnected ? '0 0 6px #22c55e' : 'none' }} />
                        {socketConnected ? 'Live' : 'Polling'}
                    </div>
                    {lastRefresh && (
                        <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                            Updated {timeSince(lastRefresh)}
                        </span>
                    )}
                    <button
                        onClick={fetchLive}
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { key: 'working', label: 'Working',  count: stats.working  },
                    { key: 'idle',    label: 'Idle',     count: stats.idle     },
                    { key: 'offline', label: 'Offline',  count: stats.offline  },
                ].map(({ key, label, count }) => {
                    const cfg = STATUS_CONFIG[key];
                    return (
                        <div key={key} style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${cfg.color}30`, borderRadius: '12px', padding: '16px 20px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: cfg.color }}>{count}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Sessions Table */}
            {loading ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '60px' }}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '60px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                    No active sessions right now.
                </div>
            ) : (
                <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {['Employee', 'Status', 'Active Time', 'Idle Time', 'Current App', 'Last Seen'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => {
                                const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.offline;
                                const emp = session.Employee || {};
                                return (
                                    <tr
                                        key={session.id}
                                        onClick={() => setSelected(session)}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            background: selected?.id === session.id ? 'rgba(99,102,241,0.08)' : 'transparent'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = selected?.id === session.id ? 'rgba(99,102,241,0.08)' : 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem' }}>{emp.full_name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569' }}>{emp.email || emp.code || ''}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 700 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, boxShadow: session.status === 'working' ? `0 0 6px ${cfg.color}` : 'none' }} />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#22c55e', fontSize: '0.875rem' }}>
                                            {formatSeconds(session.total_active_seconds)}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f59e0b', fontSize: '0.875rem' }}>
                                            {formatSeconds(session.total_idle_seconds)}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {session.last_active_app || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#475569', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {session.last_window_title || ''}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b' }}>
                                            {timeSince(session.last_seen_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Session Detail Drawer */}
            {selected && (
                <div
                    style={{ position: 'fixed', bottom: 0, right: 0, width: '360px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 0 0 0', padding: '24px', zIndex: 1000, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                            {selected.Employee?.full_name || 'Session Details'}
                        </h3>
                        <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </div>
                    {[
                        ['Status',       STATUS_CONFIG[selected.status]?.label || selected.status],
                        ['Active Time',  formatSeconds(selected.total_active_seconds)],
                        ['Idle Time',    formatSeconds(selected.total_idle_seconds)],
                        ['Current App',  selected.last_active_app || 'Unknown'],
                        ['Window',       selected.last_window_title || 'N/A'],
                        ['Last Seen',    timeSince(selected.last_seen_at)],
                        ['Session Start',selected.check_in_at ? new Date(selected.check_in_at).toLocaleTimeString() : '—'],
                        ['Check-in IP',  selected.check_in_ip || '—'],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                            <span style={{ color: '#64748b' }}>{label}</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600, maxWidth: 180, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

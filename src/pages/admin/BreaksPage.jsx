import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiFilter, HiCalendar, HiUserGroup, HiOutlineRefresh,
    HiDownload, HiClock, HiLightningBolt, HiChartBar, HiExclamation
} from 'react-icons/hi';
import api from '../../services/api';

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};
const startOfMonth = () => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
};

const PRESETS = [
    { label: 'Today', start: today(), end: today() },
    { label: 'Yesterday', start: daysAgo(1), end: daysAgo(1) },
    { label: 'Last 7 Days', start: daysAgo(6), end: today() },
    { label: 'This Month', start: startOfMonth(), end: today() },
];

function StatCard({ icon: Icon, label, value, color = 'text-primary', sub }) {
    return (
        <div className="glass-panel-pro p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-')}/10 border border-current/20 ${color}`}>
                <Icon className="text-xl" />
            </div>
            <div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{label}</div>
                {sub && <div className="text-[9px] text-text-muted mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

export default function BreaksPage() {
    const [breaks, setBreaks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [activePreset, setActivePreset] = useState('Today');
    const [filters, setFilters] = useState({
        start_date: today(),
        end_date: today(),
        employee_id: 'all'
    });

    useEffect(() => {
        api.get('/employees').then(r => setEmployees(Array.isArray(r.data) ? r.data : [])).catch(() => { });
    }, []);

    useEffect(() => { fetchBreaks(); }, [filters]);

    const fetchBreaks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start_date: filters.start_date,
                end_date: filters.end_date,
                employee_id: filters.employee_id
            });
            const res = await api.get(`/breaks/history?${params}`);
            setBreaks(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Break history error:', e);
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (preset) => {
        setActivePreset(preset.label);
        setFilters(f => ({ ...f, start_date: preset.start, end_date: preset.end }));
    };

    const calcDuration = (start, end, dur) => {
        if (dur) return dur;
        if (!end) return null; // active
        return Math.round((new Date(end) - new Date(start)) / 60000);
    };

    // Stats
    const stats = useMemo(() => {
        const completed = breaks.filter(b => b.end_time);
        const active = breaks.filter(b => !b.end_time);
        const durations = completed.map(b => calcDuration(b.start_time, b.end_time, b.duration)).filter(Boolean);
        const avg = durations.length ? Math.round(durations.reduce((a, c) => a + c, 0) / durations.length) : 0;
        const overdue = completed.filter(b => calcDuration(b.start_time, b.end_time, b.duration) > 60).length;
        return { total: breaks.length, active: active.length, avg, overdue };
    }, [breaks]);

    const exportCSV = () => {
        const rows = [['Employee', 'Code', 'Date', 'Start', 'End', 'Duration (min)', 'Status']];
        breaks.forEach(b => {
            const mins = calcDuration(b.start_time, b.end_time, b.duration);
            rows.push([
                b.Employee?.full_name || '',
                b.Employee?.code || '',
                b.date,
                b.start_time ? new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                b.end_time ? new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
                mins ?? 'Active',
                !b.end_time ? 'Active' : mins > 60 ? 'Overdue' : 'Completed'
            ]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `break-history-${filters.start_date}-to-${filters.end_date}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
                        <span className="w-2 h-8 bg-primary rounded-sm" />
                        Break History
                    </h1>
                    <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.3em] mt-1 pl-5">
                        Employee Break Audit & Duration Analysis
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchBreaks} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10" title="Refresh">
                        <HiOutlineRefresh className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all font-bold text-xs uppercase tracking-widest">
                        <HiDownload className="text-lg" />
                        Export CSV
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={HiChartBar} label="Total Breaks" value={stats.total} color="text-primary" />
                <StatCard icon={HiClock} label="Active Now" value={stats.active} color="text-warning" />
                <StatCard icon={HiLightningBolt} label="Avg Duration" value={`${stats.avg}m`} color="text-accent" />
                <StatCard icon={HiExclamation} label="Overdue (>60m)" value={stats.overdue} color="text-danger" />
            </div>

            {/* Filters */}
            <div className="glass-panel-pro p-5 space-y-4">
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${activePreset === p.label
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-text-secondary border-white/10 hover:border-primary/50 hover:text-primary'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wider">
                        <HiFilter className="text-primary text-lg" /> Filters
                    </div>
                    <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

                    {/* Date range */}
                    <div className="flex gap-3 flex-1 items-center">
                        <div className="relative group">
                            <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                            <input type="date" value={filters.start_date}
                                onChange={e => { setActivePreset(''); setFilters(f => ({ ...f, start_date: e.target.value })); }}
                                className="pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <span className="text-text-secondary text-xs">to</span>
                        <div className="relative group">
                            <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                            <input type="date" value={filters.end_date}
                                onChange={e => { setActivePreset(''); setFilters(f => ({ ...f, end_date: e.target.value })); }}
                                className="pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                        </div>
                    </div>

                    {/* Employee filter */}
                    <div className="relative group min-w-[220px]">
                        <HiUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <select value={filters.employee_id}
                            onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 appearance-none transition-colors">
                            <option value="all">All Personnel</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.code})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel-pro p-0 overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                {['Personnel', 'Date', 'Break In', 'Break Out', 'Duration', 'Status'].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-text-secondary animate-pulse text-sm">Syncing audit logs...</td></tr>
                                ) : breaks.length === 0 ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-text-secondary italic text-sm">No break records found for the selected period.</td></tr>
                                ) : breaks.map((brk, idx) => {
                                    const mins = calcDuration(brk.start_time, brk.end_time, brk.duration);
                                    const isActive = !brk.end_time;
                                    const isOverdue = !isActive && mins > 60;

                                    return (
                                        <motion.tr key={brk.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-sm font-black text-white border border-white/10">
                                                        {brk.Employee?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{brk.Employee?.full_name}</div>
                                                        <div className="text-[10px] text-primary font-mono">{brk.Employee?.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-text-secondary font-mono">{brk.date}</td>
                                            <td className="px-5 py-4 text-xs text-white font-mono font-bold">
                                                {new Date(brk.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-mono text-text-secondary">
                                                {brk.end_time ? new Date(brk.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className={`px-5 py-4 text-sm font-black ${isActive ? 'text-warning' : isOverdue ? 'text-danger' : 'text-white'}`}>
                                                {isActive ? '…' : `${mins}m`}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'bg-warning/10 text-warning border-warning/30 animate-pulse' :
                                                        isOverdue ? 'bg-danger/10 text-danger border-danger/30' :
                                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {isActive ? 'Active' : isOverdue ? 'Overdue' : 'Done'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer summary */}
                {breaks.length > 0 && (
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                            {breaks.length} record{breaks.length !== 1 ? 's' : ''} — {filters.start_date} to {filters.end_date}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary">
                            Avg: <span className="text-primary font-bold">{stats.avg}min</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

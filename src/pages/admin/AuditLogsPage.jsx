import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiFilter, HiDownload, HiClipboardList, HiOutlineShieldCheck, HiOutlineDotsHorizontal } from 'react-icons/hi';
import apiService from '../../services/api';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await apiService.get('/admin/audit-logs');
            setLogs(response.data.logs);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionStyles = (action) => {
        if (action.startsWith('CREATE')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (action.startsWith('UPDATE')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        if (action.startsWith('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-primary bg-primary/10 border-primary/20';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Indexing Registry</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-glow flex items-center gap-3">
                        <HiClipboardList className="text-primary" />
                        Operation Logs
                    </h1>
                    <p className="text-text-secondary">Immutable ledger of system transitions and security events.</p>
                </div>
            </header>

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Filter by action, entity or IP..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-pro pl-12 h-14"
                    />
                </div>
                <button className="btn-pro px-8 flex items-center gap-3">
                    <HiDownload className="text-lg" />
                    <span className="hidden md:inline">Export Audit DB</span>
                </button>
            </div>

            <div className="glass-panel-pro overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Timestamp</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Protocol Action</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Target Resource</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Origin Node</th>
                            <th className="px-6 py-5 text-right text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.filter(log =>
                            log.action.toLowerCase().includes(filter.toLowerCase()) ||
                            log.entity_type.toLowerCase().includes(filter.toLowerCase()) ||
                            log.ip_address.includes(filter)
                        ).map((log, idx) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group hover:bg-white/[0.03] transition-colors"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white/90">{new Date(log.created_at).toLocaleDateString()}</span>
                                        <span className="text-[10px] text-text-secondary font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionStyles(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <HiOutlineShieldCheck />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{log.entity_type}</span>
                                            <span className="text-[10px] text-text-secondary">#RESR-{log.entity_id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-mono font-bold text-accent">{log.ip_address}</span>
                                        <span className="text-[9px] text-text-secondary truncate max-w-[150px]">{log.user_agent}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                        <HiOutlineDotsHorizontal className="text-xl" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {logs.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.01]">
                        <p className="text-text-secondary font-medium italic tracking-widest uppercase text-xs">No ledger entries detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

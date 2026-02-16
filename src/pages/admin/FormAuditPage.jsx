import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiClipboardList, HiSearch, HiRefresh, HiUser, HiDownload, HiFilter
} from 'react-icons/hi';
import api from '../../services/api';

export default function FormAuditPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEntity, setFilterEntity] = useState('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Using existing audit endpoint with filters
            const params = {
                limit: 100
            };
            if (filterEntity !== 'ALL') {
                params.entity_type = filterEntity;
            } else {
                // Fetch relevant types only
                // Note: ideally backend supports array for entity_type or we filter client side
                // For now, let's fetch all and filter client side if backend doesn't support convenient generic search
            }

            const res = await api.get('/admin/audit-logs', { params });

            // Client-side filtering for form-related entities if backend is generic
            const relatedTypes = ['FORM_SUBMISSION', 'FORM_TEMPLATE', 'ATTENDANCE']; // Added attendance as it relates to leave
            const filtered = (res.data.logs || []).filter(log =>
                relatedTypes.includes(log.entity_type) ||
                log.action.includes('FORM') ||
                log.action.includes('TEMPLATE') // Fallback
            );

            setLogs(filtered);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filterEntity]);

    const filteredLogs = logs.filter(log =>
        log.User?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        if (filteredLogs.length === 0) return alert('No data to export');

        const headers = ['Date', 'User', 'Action', 'Entity Type', 'Details'];
        const rows = filteredLogs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.User?.full_name || 'System',
            log.action,
            log.entity_type,
            JSON.stringify(log.new_value || log.changes || '').replace(/"/g, '""')
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => `"${e.join('","')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `form_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-10">
            {/*Header*/}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-glow mb-2">FORM AUDIT TRAILS</h1>
                    <p className="text-xs text-text-secondary uppercase tracking-[0.3em]">Security & Compliance Logs</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider"
                    >
                        <HiDownload className="text-lg" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-primary"
                    >
                        <HiRefresh className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <div className="flex-1 relative group">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH LOGS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-6 font-bold text-xs uppercase"
                >
                    <option value="ALL">All Entities</option>
                    <option value="FORM_SUBMISSION">Submissions</option>
                    <option value="FORM_TEMPLATE">Templates</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-panel-pro overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-text-secondary">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-text-secondary">Actor</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-text-secondary">Action</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-text-secondary">Entity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-text-secondary">Changes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-xs uppercase tracking-widest text-text-secondary animate-pulse">Scanning Logs...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-xs uppercase tracking-widest text-text-secondary">No Records Found</td></tr>
                        ) : (
                            filteredLogs.map((log, i) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4 text-xs font-mono text-text-secondary">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px]">
                                                <HiUser />
                                            </div>
                                            <span className="text-xs font-bold">{log.User?.full_name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-red-500/10 text-red-400' :
                                                log.action.includes('CREATE') || log.action.includes('APPROVE') ? 'bg-green-500/10 text-green-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono opacity-70">
                                        {log.entity_type}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono opacity-50 max-w-xs truncate">
                                        {JSON.stringify(log.new_value || log.changes)}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

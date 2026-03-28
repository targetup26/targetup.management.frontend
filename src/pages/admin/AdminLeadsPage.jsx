import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineLightningBolt, HiSearch, HiFilter,
    HiOutlineRefresh, HiChevronRight, HiOutlinePhone,
    HiOutlineMail, HiOutlineGlobe, HiOutlineLocationMarker
} from 'react-icons/hi';
import { FiStar } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
    NEW:        { label: 'New',        color: 'bg-gray-500/15 text-gray-300 border-gray-500/30',       dot: 'bg-gray-400' },
    CONTACTED:  { label: 'Contacted',  color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',       dot: 'bg-blue-400' },
    INTERESTED: { label: 'Interested', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
    CONVERTED:  { label: 'Converted',  color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    REJECTED:   { label: 'Rejected',   color: 'bg-red-500/15 text-red-300 border-red-500/30',         dot: 'bg-red-400' },
};

const ALL_STATUSES = ['ALL', ...Object.keys(STATUS_CONFIG)];

function StatCard({ label, value, color = 'text-primary' }) {
    return (
        <div className="glass-panel-pro p-5 rounded-2xl flex flex-col gap-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
            <span className={`text-3xl font-black tabular-nums ${color}`}>{value}</span>
        </div>
    );
}

export default function AdminLeadsPage() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => { fetchLeads(); }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leads');
            setLeads(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId, newStatus) => {
        setUpdatingId(leadId);
        try {
            await api.patch(`/leads/${leadId}/status`, { status: newStatus });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = useMemo(() => {
        let list = leads;
        if (statusFilter !== 'ALL') list = list.filter(l => l.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(l =>
                l.business_name?.toLowerCase().includes(q) ||
                l.phone?.toLowerCase().includes(q) ||
                l.city?.toLowerCase().includes(q) ||
                l.email?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [leads, statusFilter, search]);

    // Stats
    const stats = useMemo(() => ({
        total: leads.length,
        converted: leads.filter(l => l.status === 'CONVERTED').length,
        interested: leads.filter(l => l.status === 'INTERESTED').length,
        contacted: leads.filter(l => l.status === 'CONTACTED').length,
        newLeads: leads.filter(l => !l.status || l.status === 'NEW').length,
    }), [leads]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <span className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                            <HiOutlineLightningBolt className="text-xl" />
                        </span>
                        Leads Manager
                    </h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1 ml-1">
                        Full CRM visibility — all leads across all agents
                    </p>
                </div>
                <button onClick={fetchLeads}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all font-bold text-xs uppercase tracking-widest">
                    <HiOutlineRefresh className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Leads"  value={stats.total}     color="text-white" />
                <StatCard label="New"          value={stats.newLeads}  color="text-gray-300" />
                <StatCard label="Contacted"    value={stats.contacted} color="text-blue-400" />
                <StatCard label="Interested"   value={stats.interested} color="text-yellow-400" />
                <StatCard label="Converted"    value={stats.converted} color="text-emerald-400" />
            </div>

            {/* Filters */}
            <div className="glass-panel-pro p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, phone, city..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {ALL_STATUSES.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                statusFilter === s
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:border-white/20'
                            }`}>
                            {s === 'ALL' ? `All (${leads.length})` : `${STATUS_CONFIG[s].label} (${leads.filter(l => l.status === s).length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel-pro rounded-2xl overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                {['Business', 'Contact', 'Location', 'Rating', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-white/30 animate-pulse text-sm">Loading leads...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-white/30 text-sm italic">No leads found.</td></tr>
                                ) : filtered.map((lead, idx) => {
                                    const st = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                                    return (
                                        <motion.tr key={lead.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                            onClick={() => navigate(`/sales/lead/${lead.id}`)}
                                        >
                                            {/* Business */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-sm font-black text-white border border-white/10 flex-shrink-0">
                                                        {lead.business_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{lead.business_name}</div>
                                                        {lead.Category && <div className="text-[10px] text-primary/60 font-mono">{lead.Category?.name}</div>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" onClick={e => e.stopPropagation()}>
                                                            <HiOutlinePhone className="text-emerald-400 flex-shrink-0" />
                                                            <a href={`tel:${lead.phone}`} className="hover:text-white transition-colors">{lead.phone}</a>
                                                        </div>
                                                    )}
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" onClick={e => e.stopPropagation()}>
                                                            <HiOutlineMail className="text-blue-400 flex-shrink-0" />
                                                            <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors truncate max-w-[160px]">{lead.email}</a>
                                                        </div>
                                                    )}
                                                    {lead.website && (
                                                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" onClick={e => e.stopPropagation()}>
                                                            <HiOutlineGlobe className="text-purple-400 flex-shrink-0" />
                                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate max-w-[160px]">
                                                                {lead.website.replace(/^https?:\/\//, '')}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-white/50">
                                                    <HiOutlineLocationMarker className="text-orange-400 flex-shrink-0" />
                                                    <span>{lead.city || lead.address || '—'}</span>
                                                </div>
                                            </td>

                                            {/* Rating */}
                                            <td className="px-5 py-4">
                                                {lead.rating > 0 ? (
                                                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                        <FiStar size={11} /> {lead.rating}
                                                        <span className="text-white/30 font-normal">({lead.review_count || 0})</span>
                                                    </div>
                                                ) : <span className="text-white/20 text-xs">—</span>}
                                            </td>

                                            {/* Status Dropdown */}
                                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={lead.status || 'NEW'}
                                                    disabled={updatingId === lead.id}
                                                    onChange={e => handleStatusChange(lead.id, e.target.value)}
                                                    className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 appearance-none cursor-pointer transition-all bg-transparent focus:outline-none ${st.color} ${updatingId === lead.id ? 'opacity-50' : ''}`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                        <option key={key} value={key} className="bg-gray-900 text-white">{cfg.label}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* View Arrow */}
                                            <td className="px-5 py-4">
                                                <HiChevronRight className="text-white/20 group-hover:text-primary transition-colors" />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                            Showing {filtered.length} of {leads.length} leads
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

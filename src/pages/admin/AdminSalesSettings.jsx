import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import {
    HiOutlineLightningBolt, HiOutlineDatabase, HiOutlineUsers,
    HiOutlineCog, HiOutlineRefresh, HiOutlineChartBar,
    HiOutlineCollection, HiOutlineClipboardCheck
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const AdminSalesSettings = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeJobs: 0,
        totalJobs: 0,
        agentsActive: 0
    });
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // In a real production app, these would be dedicated admin endpoints
            const [leadsRes, historyRes] = await Promise.all([
                api.get('/leads'),
                api.get('/leads/history')
            ]);

            const history = historyRes.data;
            setStats({
                totalLeads: leadsRes.data.length,
                activeJobs: history.filter(j => j.status === 'running' || j.status === 'pending').length,
                totalJobs: history.length,
                agentsActive: new Set(history.map(j => j.user_id)).size
            });
            setJobs(history.slice(0, 10)); // Show last 10 jobs
        } catch (err) {
            toast.error('Failed to load admin sales data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Sales Control Center</h2>
                    <p className="text-text-secondary text-sm font-bold opacity-60">Revenue Intelligence & Extraction Management</p>
                </div>
                <button
                    onClick={fetchAdminData}
                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <HiOutlineRefresh className={loading ? 'animate-spin' : ''} />
                    Sync Intelligence
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'Total Intelligence', value: stats.totalLeads, icon: HiOutlineDatabase, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Active Extractions', value: stats.activeJobs, icon: HiOutlineLightningBolt, color: 'text-accent', bg: 'bg-accent/10' },
                    { label: 'System Requests', value: stats.totalJobs, icon: HiOutlineCollection, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Active Agents', value: stats.agentsActive, icon: HiOutlineUsers, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel-pro p-6 rounded-3xl border-white/5 flex flex-col gap-4 relative overflow-hidden group"
                    >
                        <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color} shadow-lg shadow-black/20`}>
                            <stat.icon className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black tabular-nums">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Admin Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Global Activity */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-panel-pro rounded-[2.5rem] border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <HiOutlineClipboardCheck className="text-primary text-xl" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Global Extraction Feed</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] text-[10px] text-text-muted font-black uppercase tracking-widest border-b border-white/5">
                                        <th className="px-8 py-5">Job ID</th>
                                        <th className="px-8 py-5">Agent</th>
                                        <th className="px-8 py-5">Target</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Results</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-mono text-text-muted bg-white/5 px-2 py-1 rounded">
                                                    {job.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                                                        U{job.user_id}
                                                    </div>
                                                    <span className="text-xs font-bold">User {job.user_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-bold">{job.business_type}</div>
                                                <div className="text-[9px] text-text-muted uppercase tracking-tighter">{job.city || job.country}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${job.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        job.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-primary/10 text-primary border-primary/20 animate-pulse'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-sm tabular-nums">
                                                {job.total_results}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Global Sales Settings */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-8 rounded-[2.5rem] border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <HiOutlineCog className="text-primary text-xl" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Bawaba Logic</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Default Scraper Limit</label>
                                <input
                                    type="number"
                                    defaultValue={50}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Apify Worker Mode</label>
                                <select className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                                    <option>Standard Search</option>
                                    <option>Deep Enrichment</option>
                                    <option>Strict Validation</option>
                                </select>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Deploy Global Config
                            </button>
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="glass-panel-pro p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-500/10 to-primary/10 relative overflow-hidden group">
                        <HiOutlineChartBar className="absolute -bottom-4 -right-4 text-8xl text-primary/10 rotate-12 transition-transform group-hover:scale-110" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Revenue Node</h4>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">
                            The centralized Bawaba logic allows you to monitor all sales agents in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSalesSettings;

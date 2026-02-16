import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUsers, HiStatusOnline, HiChip, HiLightningBolt,
    HiShieldCheck, HiPlus, HiCog, HiClipboardList,
    HiArrowRight, HiClock, HiExclamation, HiChevronRight
} from 'react-icons/hi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="glass-panel-pro p-6 relative overflow-hidden group hover:border-primary/30 transition-all border-white/5"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/5 rounded-full blur-3xl translate-x-16 -translate-y-16 group-hover:bg-${color}/10 transition-all`} />

        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tighter italic">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 text-${color} group-hover:scale-110 transition-transform`}>
                <Icon className="text-xl" />
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-400/50 group-hover:text-green-400 transition-colors">
            <HiLightningBolt />
            <span className="uppercase tracking-[0.2em]">Live Stream</span>
        </div>
    </motion.div>
);

const TacticalAlert = ({ type, count, label, icon: Icon, color }) => (
    <div className={`p-5 rounded-2xl bg-${color}/5 border border-${color}/20 flex items-center justify-between group cursor-pointer hover:bg-${color}/10 transition-all`}>
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color}`}>
                <Icon className="text-lg" />
            </div>
            <div>
                <h4 className="text-lg font-black text-white italic leading-none">{count}</h4>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
        <HiChevronRight className="text-text-muted group-hover:translate-x-1 transition-transform" />
    </div>
);

export default function DashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [tactical, setTactical] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, tacticalRes, logsRes] = await Promise.all([
                api.get('/admin/dashboard-stats'),
                api.get('/admin/dashboard-tactical'),
                api.get('/admin/audit-logs?limit=8')
            ]);
            setStats(statsRes.data.stats);
            setTactical(tacticalRes.data.alerts);
            setRecentLogs(logsRes.data.logs);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Syncing Command Hub</span>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* --- Tactical Command Layer --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel-pro p-8 border-accent/20 bg-accent/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <HiExclamation className="text-9xl" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                            <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Tactical Alerts Required</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TacticalAlert
                                type="pending"
                                count={tactical?.pending || 0}
                                label="Pending Approvals"
                                icon={HiClipboardList}
                                color="primary"
                            />
                            <TacticalAlert
                                type="returned"
                                count={tactical?.returned || 0}
                                label="Rejected/Returned"
                                icon={HiExclamation}
                                color="orange-400"
                            />
                        </div>

                        <div className="mt-8 space-y-3">
                            {tactical?.recent?.map(form => (
                                <div key={form.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-xs group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-4 bg-primary rounded-full" />
                                        <span className="text-text-secondary font-mono">[{new Date(form.created_at).toLocaleDateString()}]</span>
                                        <span className="font-bold text-white uppercase">{form.Template?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/forms/${form.id}`)}
                                        className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        Execute Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2 px-2">
                        <HiLightningBolt className="text-accent" />
                        Operation Vectors
                    </h4>
                    <QuickAction label="Personnel Registry" icon={HiPlus} path="/admin/users" desc="Onboard new identity" />
                    <QuickAction label="Org Node Control" icon={HiChip} path="/admin/organization" desc="Adjust departmental structure" />
                    <QuickAction label="Access Protocols" icon={HiShieldCheck} path="/admin/roles" desc="Audit permission gates" />
                </div>
            </div>

            {/* --- Stats Fleet Overview --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Identity" value={stats?.totalEmployees || 0} icon={HiUsers} color="primary" delay={0.1} />
                <StatCard title="Live Presence" value={stats?.presentToday || 0} icon={HiStatusOnline} color="green-400" delay={0.2} />
                <StatCard title="Storage Vault" value="84% Full" icon={HiCog} color="accent" delay={0.3} />
                <StatCard title="Matrix Health" value="OPTIMAL" icon={HiLightningBolt} color="primary" delay={0.4} />
            </div>

            {/* --- Security Ledger (Audit) --- */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                        <HiClock className="text-primary" />
                        Global Security Ledger
                    </h4>
                    <button onClick={() => navigate('/admin/audit-logs')} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Full Audit</button>
                </div>

                <div className="glass-panel-pro p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <HiShieldCheck />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">{log.action}</span>
                                    <span className="text-[8px] font-mono text-text-muted">{new Date(log.created_at).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-xs font-bold text-white truncate">{log.entity_type} Modulated: <span className="text-text-secondary opacity-50 italic">id#{log.entity_id}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function QuickAction({ label, icon: Icon, path, desc }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(path)}
            className="group glass-panel-pro p-5 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all border-white/5"
        >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-primary/20">
                <Icon className="text-lg" />
            </div>
            <div className="flex-1">
                <h5 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">{label}</h5>
                <p className="text-[9px] text-text-secondary font-medium tracking-tight mt-1">{desc}</p>
            </div>
            <HiArrowRight className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
    );
}

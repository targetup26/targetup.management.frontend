import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUsers, HiClock, HiExclamation, HiDesktopComputer,
    HiLightningBolt, HiExternalLink, HiSearch, HiPlusCircle,
    HiShieldCheck, HiOutlineStatusOnline, HiArrowRight
} from 'react-icons/hi';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState({
        stats: {
            totalEmployees: 0,
            presentToday: 0,
            lateToday: 0,
            absentToday: 0,
            totalDevices: 0,
            onlineDevices: 0
        },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/attendance/stats/today');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const attendanceRate = data.stats.totalEmployees > 0
        ? Math.round((data.stats.presentToday / data.stats.totalEmployees) * 100)
        : 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header / System Ticker */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <HiShieldCheck className="text-primary" />
                        Command Center
                    </h2>
                    <p className="text-text-secondary mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        {t('systemOnline')} • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>

                <div className="flex gap-3">
                    <div className="glass-panel-pro px-4 py-2 flex items-center gap-3 text-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-text-secondary font-mono">Network Health</span>
                            <span className="text-white font-bold">{data.stats.onlineDevices}/{data.stats.totalDevices} Devices</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                        <HiOutlineStatusOnline className="text-xl text-primary animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('presentToday')}
                    value={data.stats.presentToday}
                    icon={<HiUsers />}
                    color="text-primary"
                    trend={`+${data.stats.presentToday} checked-in`}
                />
                <StatCard
                    title={t('lateArrivals')}
                    value={data.stats.lateToday}
                    icon={<HiClock />}
                    color="text-warning"
                    trend="Needs attention"
                    isAlert={data.stats.lateToday > 0}
                />
                <StatCard
                    title={t('absentToday')}
                    value={data.stats.absentToday}
                    icon={<HiExclamation />}
                    color="text-danger"
                    trend="Check logs"
                />

                {/* Visual Rate Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-panel-pro p-6 flex items-center justify-between border-l-4 border-accent"
                >
                    <div>
                        <h3 className="text-text-secondary text-xs font-mono uppercase tracking-widest">Efficiency</h3>
                        <p className="text-3xl font-bold text-white mt-1">{attendanceRate}%</p>
                        <span className="text-[10px] text-accent font-medium uppercase mt-2 block">Company Attendance</span>
                    </div>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * attendanceRate) / 100}
                                className="text-accent transition-all duration-1000 ease-out" />
                        </svg>
                        <HiLightningBolt className="absolute text-accent text-xl animate-pulse" />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Activity Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel-pro p-0 overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#6366f1]"></span>
                                {t('recentActivity') || 'Recent Activity'}
                            </h3>
                            <Link to="/attendance" className="text-xs text-primary hover:underline flex items-center gap-1">
                                View Full Log <HiExternalLink />
                            </Link>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {data.recentActivity.length > 0 ? (
                                    data.recentActivity.map((activity, idx) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group flex items-center gap-4 p-4 mb-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                                {activity.Employee?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                                        {activity.Employee?.full_name}
                                                    </h4>
                                                    <span className="text-[10px] font-mono text-text-secondary whitespace-nowrap">
                                                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-secondary truncate mt-0.5">
                                                    Checked in via <span className="text-white/60">{activity.device_name || 'Web Portal'}</span>
                                                </p>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${activity.status === 'LATE' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                                                }`}>
                                                {activity.status}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-text-secondary space-y-2 opacity-50">
                                        <HiLightningBolt className="text-4xl" />
                                        <p className="text-sm">Waiting for incoming logs...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Col: Quick Actions & Devices */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-6 neon-border bg-gradient-to-br from-primary/5 to-transparent">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            Quick Operations
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction
                                label="Scan Network"
                                icon={<HiSearch />}
                                color="bg-primary/20 text-primary border-primary/20"
                                onClick={() => navigate('/settings')}
                            />
                            <QuickAction
                                label="Add Entry"
                                icon={<HiPlusCircle />}
                                color="bg-accent/20 text-accent border-accent/20"
                                onClick={() => navigate('/attendance')}
                            />
                            <QuickAction
                                label="New Employee"
                                icon={<HiUsers />}
                                color="bg-success/20 text-success border-success/20"
                                onClick={() => navigate('/employees')}
                            />
                            <QuickAction
                                label="Reports"
                                icon={<HiArrowRight />}
                                color="bg-white/10 text-white border-white/10"
                                onClick={() => navigate('/reports')}
                            />
                        </div>
                    </div>

                    <div className="glass-panel-pro p-6 bg-surface/50">
                        <h3 className="font-bold text-white mb-4 text-sm flex items-center justify-between">
                            System Nodes
                            <span className="text-[10px] font-mono font-normal text-text-secondary">AUTO-SCAN ACTIVE</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <HiDesktopComputer className="text-primary text-xl" />
                                    <div>
                                        <div className="text-xs font-bold text-white">Central Hub</div>
                                        <div className="text-[10px] text-text-secondary font-mono">{import.meta.env.VITE_API_BASE_URL || '127.0.0.1'}</div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-success font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                    READY
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, trend, isAlert }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-panel-pro p-6 relative group ${isAlert ? 'ring-1 ring-warning/30' : ''}`}
        >
            <div className={`absolute top-4 right-4 text-2xl ${color} opacity-40 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="relative z-10">
                <h3 className="text-text-secondary text-xs font-mono uppercase tracking-widest">{title}</h3>
                <p className="text-4xl font-bold text-white mt-1">{value}</p>
                <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter opacity-70">
                        {trend}
                    </span>
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-full transition-all duration-500 ${color}`}></div>
        </motion.div>
    );
}

function QuickAction({ label, icon, color, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${color} hover:shadow-lg`}
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </motion.button>
    );
}

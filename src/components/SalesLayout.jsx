import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLightningBolt, HiDatabase, HiCollection, HiLogout, HiUser, HiChartBar } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, mobile = false }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} className="w-full">
            <div className={clsx(
                "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300",
                isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}>
                <Icon className="text-2xl md:text-xl" />
                <span className="text-[10px] md:text-sm font-semibold">{label}</span>
            </div>
        </Link>
    );
};

export default function SalesLayout() {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Sales Time Tracking (Heartbeat)
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                // This informs the server that the agent is active in the sales node
                await api.post('/leads/heartbeat', { user_id: user.id });
            } catch (err) {
                console.warn('Heartbeat suppressed');
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 60000); // Pulse every 60s
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <LeadAgentTracker />
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-gray-900/40 backdrop-blur-2xl border-r border-white/5 flex-col p-6 h-full">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <HiLightningBolt className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter">SALES</h1>
                        <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase">Intelligence</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/sales/categories" icon={HiChartBar} label="Categories" />
                    <NavItem to="/sales/request" icon={HiLightningBolt} label="Extract Leads" />
                    <NavItem to="/sales/dashboard" icon={HiDatabase} label="Leads Database" />
                    <NavItem to="/sales/history" icon={HiCollection} label="History" />
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-400 transition-all w-full"
                    >
                        <HiLogout />
                        <span className="text-sm font-medium">Exit Workspace</span>
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-900/5 to-transparent">
                {/* Header */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
                    <div className="md:hidden flex items-center gap-2">
                        <HiLightningBolt className="text-blue-500 text-2xl" />
                        <span className="font-bold tracking-tighter text-lg">SALES</span>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-white">{user?.full_name || 'Sales Rep'}</span>
                            <span className="text-[10px] text-blue-500 uppercase font-black">Agent</span>
                        </div>
                        <Link to="/sales/profile" className="w-10 h-10 rounded-full border-2 border-blue-500/30 p-0.5 hover:border-blue-400 transition-colors">
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center font-bold text-blue-400">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-4 flex items-center justify-around z-50">
                <NavItem to="/sales/categories" icon={HiChartBar} label="Stats" mobile />
                <NavItem to="/sales/request" icon={HiLightningBolt} label="Extract" mobile />
                <NavItem to="/sales/dashboard" icon={HiDatabase} label="Leads" mobile />
                <NavItem to="/sales/history" icon={HiCollection} label="History" mobile />
            </nav>
        </div>
    );
}

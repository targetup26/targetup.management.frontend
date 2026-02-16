import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlineKey, HiOutlineDesktopComputer, HiOutlineBadgeCheck } from 'react-icons/hi';

const SalesProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Profile Header */}
            <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-r from-primary/30 to-accent/20 border border-white/5 overflow-hidden flex items-end p-8">
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="flex items-center gap-6 z-10">
                    <div className="w-24 h-24 rounded-3xl bg-surface border-4 border-background flex items-center justify-center text-3xl font-black text-primary shadow-xl">
                        {user?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">{user?.full_name}</h2>
                            <HiOutlineBadgeCheck className="text-primary text-xl" />
                        </div>
                        <p className="text-text-secondary text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                            Active Intel Agent • Node {user?.id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Agent Stats */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-6">Execution Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-text-secondary">Uptime Rank</span>
                                <span className="text-xs font-black text-primary">ELITE</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    className="h-full bg-primary shadow-[0_0_8px_primary]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Identity Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel-pro p-8 rounded-[3rem] border-white/5 space-y-8">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Identity Configuration</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Agent Name</label>
                                    <div className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-2xl border border-white/10 text-sm font-bold">
                                        <HiOutlineUser className="text-primary" />
                                        {user?.full_name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">System Username</label>
                                    <div className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-2xl border border-white/10 text-sm font-bold opacity-60">
                                        <HiOutlineDesktopComputer className="text-text-muted" />
                                        @{user?.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Node Security</h3>
                            <button className="flex items-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-4 rounded-2xl border border-primary/20 transition-all text-xs font-black uppercase tracking-widest">
                                <HiOutlineKey />
                                Reset Access Token
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesProfilePage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineArrowRight } from 'react-icons/hi';

const SalesLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(username, password);
            if (success) {
                toast.success('Sales Intel Node Connected');
                navigate('/sales');
            } else {
                toast.error('Authentication Failed');
            }
        } catch (error) {
            toast.error('Network failure in Sales Gateway');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-['Space_Grotesk']">
            {/* Background Dynamics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel-pro p-10 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                            <HiOutlineLightningBolt className="text-3xl text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Sales Gateway</h1>
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Intelligence Node v5.0</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Agent Identity</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:text-white/20"
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Access Token</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-bold placeholder:text-white/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe" className="text-[10px] font-black uppercase tracking-widest text-text-secondary cursor-pointer hover:text-primary transition-colors">
                                Remember Intel Link
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Establish Link
                                    <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        <HiOutlineShieldCheck className="text-primary text-sm" />
                        End-to-End Secure Matrix
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default SalesLoginPage;

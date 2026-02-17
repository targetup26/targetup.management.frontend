import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiLockClosed, HiUser, HiFingerPrint, HiLightningBolt } from 'react-icons/hi';

export default function LoginPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState('Checking...');

    useEffect(() => {
        // Simulate system check animation
        const timer = setTimeout(() => setSystemStatus('ONLINE'), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || t('loginFailed'));
            // Shake effect could be added here via local state
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-float-delayed"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10"
            >
                {/* Visual Side (Hidden on Mobile) */}
                <div className="hidden md:flex flex-col justify-center p-8 relative glass-panel-pro min-h-[500px]">
                    <div className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono text-primary animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        SYSTEM {systemStatus}
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
                                Secure<br />Access
                            </h1>
                            <p className="text-text-secondary text-lg mb-8 max-w-xs">
                                Advanced biometric surveillance and automated attendance tracking system.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"
                            >
                                <HiFingerPrint className="text-3xl text-accent mb-2" />
                                <div className="text-sm font-medium text-white">Bio-Auth</div>
                                <div className="text-xs text-text-secondary">Enabled</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"
                            >
                                <HiLightningBolt className="text-3xl text-primary mb-2" />
                                <div className="text-sm font-medium text-white">Real-time</div>
                                <div className="text-xs text-text-secondary">Syncing</div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Decorative Grid Lines - Replaced broken external URL with local CSS pattern */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            color: 'var(--color-primary, #3b82f6)'
                        }}>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="flex flex-col justify-center">
                    <div className="glass-panel-pro p-8 md:p-12 neon-border">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Targetup Portal</h2>
                            <p className="text-text-secondary text-sm">Enter credential sequence</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-primary uppercase tracking-wider pl-1">{t('username')}</label>
                                <div className="relative group">
                                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        className="input-pro pl-12"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Identification"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-primary uppercase tracking-wider pl-1">{t('password')}</label>
                                <div className="relative group">
                                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        className="input-pro pl-12"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-pro mt-8 group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            {t('signingIn')}...
                                        </>
                                    ) : (
                                        <>
                                            {t('signIn')}
                                            <HiLightningBolt className="group-hover:text-yellow-300 transition-colors" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCog, HiShieldCheck, HiDatabase, HiClipboardList, HiPencilAlt, HiCheck, HiX, HiAdjustments } from 'react-icons/hi';
import apiService from '../../services/api';

export default function GlobalSettingsPage() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSetting, setEditingSetting] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiService.get('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            await apiService.put(`/admin/settings/${key}`, { setting_value: value });
            fetchSettings();
            setEditingSetting(null);
        } catch (error) {
            console.error('Failed to update setting:', error);
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'security': return { icon: <HiShieldCheck />, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/20' };
            case 'attendance': return { icon: <HiClipboardList />, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' };
            case 'system': return { icon: <HiCog />, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' };
            default: return { icon: <HiDatabase />, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/20' };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary animate-pulse">Syncing Kernel Config</span>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-glow flex items-center gap-3">
                        <HiAdjustments className="text-primary" />
                        System Core
                    </h1>
                    <p className="text-text-secondary">Low-level overrides and global synchronization patterns.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {settings.map((setting, idx) => {
                    const styles = getCategoryStyles(setting.category);
                    const isEditing = editingSetting === setting.id;

                    return (
                        <motion.div
                            key={setting.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`glass-panel-pro p-8 relative overflow-hidden group transition-all ${isEditing ? 'border-primary/40 bg-primary/[0.02]' : 'hover:border-white/10'}`}
                        >
                            {/* Decorative background number */}
                            <span className="absolute -right-4 -bottom-10 text-9xl font-black text-white/[0.02] pointer-events-none group-hover:text-white/[0.04] transition-colors">
                                0{idx + 1}
                            </span>

                            <div className="flex items-start gap-8 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 ${styles.bg} ${styles.color} ${styles.border} border`}>
                                    {styles.icon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold tracking-tight text-white/90">
                                            {setting.setting_key.replace(/_/g, ' ')}
                                        </h3>
                                        <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${styles.bg} ${styles.color} ${styles.border}`}>
                                            {setting.category}
                                        </div>
                                    </div>

                                    <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-2xl">
                                        {setting.description || 'No description provided for this system variable.'}
                                    </p>

                                    <AnimatePresence mode="wait">
                                        {isEditing ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex gap-3 max-w-xl"
                                            >
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    defaultValue={setting.setting_value}
                                                    className="input-pro py-3"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') updateSetting(setting.setting_key, e.target.value);
                                                        if (e.key === 'Escape') setEditingSetting(null);
                                                    }}
                                                    id={`input-${setting.id}`}
                                                />
                                                <button
                                                    onClick={() => updateSetting(setting.setting_key, document.getElementById(`input-${setting.id}`).value)}
                                                    className="w-14 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                >
                                                    <HiCheck />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSetting(null)}
                                                    className="w-14 h-12 bg-white/5 text-text-secondary hover:text-white rounded-xl flex items-center justify-center text-xl border border-white/5 transition-colors"
                                                >
                                                    <HiX />
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-3 font-mono text-sm text-accent shadow-inner">
                                                    {setting.setting_value || <span className="text-white/20 italic">VOID</span>}
                                                </div>
                                                <button
                                                    onClick={() => setEditingSetting(setting.id)}
                                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-sm font-bold uppercase tracking-widest border border-white/5"
                                                >
                                                    <HiPencilAlt className="text-lg" />
                                                    Rewrite
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

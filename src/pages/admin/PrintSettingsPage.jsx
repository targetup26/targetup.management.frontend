import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiPrinter, HiSave, HiRefresh, HiPhotograph, HiX, HiCheckCircle
} from 'react-icons/hi';
import api from '../../services/api';

export default function PrintSettingsPage() {
    const [settings, setSettings] = useState({
        company_name: 'TARGETUP CORPORATION',
        company_logo_url: '',
        header_subtitle: 'HUMAN RESOURCE MANAGEMENT',
        footer_text: '© 2026 Targetup Corporation. Official Copy.'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/print');
            setSettings(res.data.settings);
        } catch (error) {
            console.error('Error fetching print settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await api.put('/settings/print', settings);
            setMessage({ type: 'success', text: res.data.message || 'Settings saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset to default settings?')) return;

        setSaving(true);
        setMessage(null);
        try {
            const res = await api.post('/settings/print/reset');
            setSettings(res.data.settings);
            setMessage({ type: 'success', text: 'Settings reset to defaults' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reset settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
                        <span className="w-2 h-8 bg-primary rounded-sm" />
                        Print Template Settings
                    </h1>
                    <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.3em] mt-1 pl-5">
                        Customize Company Branding for All Printed Documents
                    </p>
                </div>
            </header>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                >
                    {message.type === 'success' ? <HiCheckCircle className="text-2xl" /> : <HiX className="text-2xl" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings Form */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-8">
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                            <HiPrinter /> Company Branding
                        </h2>

                        <div className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.company_name}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    className="input-pro"
                                    placeholder="TARGETUP CORPORATION"
                                />
                                <p className="text-[9px] text-text-secondary italic">
                                    This will appear in the header of all printed documents
                                </p>
                            </div>

                            {/* Header Subtitle */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    Header Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={settings.header_subtitle}
                                    onChange={(e) => setSettings({ ...settings, header_subtitle: e.target.value })}
                                    className="input-pro"
                                    placeholder="HUMAN RESOURCE MANAGEMENT"
                                />
                            </div>

                            {/* Company Logo URL */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                    <HiPhotograph /> Company Logo URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={settings.company_logo_url || ''}
                                    onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                                    className="input-pro"
                                    placeholder="https://example.com/logo.png or /path/to/logo.png"
                                />
                                <p className="text-[9px] text-text-secondary italic">
                                    Leave empty to use default "TUP" text logo
                                </p>
                            </div>

                            {/* Footer Text */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                    Footer Text
                                </label>
                                <textarea
                                    value={settings.footer_text}
                                    onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                                    className="input-pro min-h-[80px]"
                                    placeholder="© 2026 Targetup Corporation. Official Copy."
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 btn-pro py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                <HiSave className="text-lg" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={saving}
                                className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                            >
                                <HiRefresh className="text-lg" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-8">
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6">
                            Live Preview
                        </h2>

                        {/* Preview of Print Header */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="border border-black font-sans text-black mb-6">
                                <div className="flex h-24">
                                    {/* Left: Logo */}
                                    <div className="w-[25%] border-r border-black p-2 flex items-center justify-center">
                                        {settings.company_logo_url ? (
                                            <img src={settings.company_logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <div className="text-xl font-black italic">Target</div>
                                        )}
                                    </div>

                                    {/* Center: Title */}
                                    <div className="flex-1 border-r border-black flex flex-col items-center justify-center text-center p-2">
                                        <h1 className="text-sm font-bold uppercase mb-2 tracking-wide leading-tight">
                                            {settings.company_name || 'TARGET UP MARKETING MANAGEMENT L.L.C'}
                                        </h1>
                                        <h2 className="text-lg font-bold capitalize">
                                            Document Title
                                        </h2>
                                    </div>

                                    {/* Right: Meta Data */}
                                    <div className="w-[25%] text-[8px] font-bold flex flex-col">
                                        <div className="flex flex-1 border-b border-black items-center">
                                            <span className="w-12 pl-1 border-r border-black h-full flex items-center">Form No.</span>
                                            <span className="flex-1 pl-1 h-full flex items-center">: T - F 0000</span>
                                        </div>
                                        <div className="flex flex-1 border-b border-black items-center">
                                            <span className="w-12 pl-1 border-r border-black h-full flex items-center">Rev. No.</span>
                                            <span className="flex-1 pl-1 h-full flex items-center">: 0</span>
                                        </div>
                                        <div className="flex flex-1 border-b border-black items-center">
                                            <span className="w-12 pl-1 border-r border-black h-full flex items-center">Rev. Date</span>
                                            <span className="flex-1 pl-1 h-full flex items-center">: 01/01/2025</span>
                                        </div>
                                        <div className="flex flex-1 items-center">
                                            <span className="w-12 pl-1 border-r border-black h-full flex items-center">Page</span>
                                            <span className="flex-1 pl-1 h-full flex items-center">: 1 of 1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Content */}
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <p className="text-[7px] font-black uppercase text-gray-400 mb-1">Sample Field</p>
                                        <p className="text-xs font-bold text-black">Sample Value</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <p className="text-[7px] font-black uppercase text-gray-400 mb-1">Another Field</p>
                                        <p className="text-xs font-bold text-black">Another Value</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Preview */}
                            <div className="mt-8 pt-4 border-t border-gray-200">
                                <p className="text-[8px] text-gray-400">
                                    {settings.footer_text || '© 2026 Targetup Corporation. Official Copy.'}
                                </p>
                            </div>
                        </div>

                        <p className="text-[10px] text-text-secondary mt-4 italic text-center">
                            This is how your branding will appear on all printed documents
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

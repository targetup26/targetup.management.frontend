import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiPlus, HiSearch, HiTemplate, HiPencilAlt, HiCheckCircle, HiBan,
    HiRefresh, HiDocumentAdd, HiCode
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function FormTemplatesPage() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/forms/templates');
            setTemplates(res.data.templates || []);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this template?`)) return;
        try {
            await api.put(`/admin/forms/templates/${id}`, { is_active: !currentStatus });
            fetchTemplates();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-glow mb-2">TEMPLATE MANAGER</h1>
                    <p className="text-xs text-text-secondary uppercase tracking-[0.3em]">Configure Dynamic Form Schemas</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchTemplates}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-primary"
                    >
                        <HiRefresh className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/forms/templates/new')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                    >
                        <HiPlus className="text-xl" />
                        <span>CREATE NEW</span>
                    </button>
                </div>
            </div>

            {/* --- Search & Filter --- */}
            <div className="relative group max-w-md">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="SEARCH TEMPLATES..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold tracking-widest outline-none focus:border-primary/50 transition-all"
                />
            </div>

            {/* --- Templates Grid --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Loading Schemas</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template, idx) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel-pro p-6 group hover:border-primary/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${template.is_active
                                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                    {template.is_active ? 'Active' : 'Disabled'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    {template.type === 'join' ? '👤' : template.type === 'leave' ? '🏖️' : '📄'}
                                </div>
                                <h3 className="text-xl font-bold mb-1">{template.name}</h3>
                                <p className="text-xs text-text-secondary font-mono">Type: {template.type} • v{template.version}</p>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => navigate(`/admin/forms/templates/${template.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold"
                                >
                                    <HiPencilAlt />
                                    <span>Edit Schema</span>
                                </button>
                                <button
                                    onClick={() => toggleStatus(template.id, template.is_active)}
                                    className={`p-3 rounded-lg border transition-all ${template.is_active
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                        : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                                        }`}
                                    title={template.is_active ? "Deactivate" : "Activate"}
                                >
                                    {template.is_active ? <HiBan /> : <HiCheckCircle />}
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Card */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: filteredTemplates.length * 0.1 }}
                        onClick={() => navigate('/admin/forms/templates/new')}
                        className="glass-panel-pro p-6 flex flex-col items-center justify-center gap-4 border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[240px] group"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                            <HiPlus className="text-text-secondary group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-bold tracking-widest text-text-secondary group-hover:text-primary">CREATE NEW TEMPLATE</span>
                    </motion.button>
                </div>
            )}
        </div>
    );
}

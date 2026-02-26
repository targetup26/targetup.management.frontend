import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiLayers, FiFolder, FiTrendingUp, FiDownload, FiClock, FiArrowRight, FiActivity } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CategoryDashboard = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data || res.data);
        } catch (err) {
            toast.error('Failed to load category intelligence');
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-blue-400 mb-2">
                        <FiActivity className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Data Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Taxonomy Engine</h1>
                    <p className="mt-2 text-gray-400 max-w-2xl font-medium">
                        Automatically classified leads across dynamic categories and subcategories.
                        Target markets with surgical precision.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-3 flex items-center gap-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <FiTrendingUp className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Leads</div>
                            <div className="text-xl font-bold text-white">
                                {categories.reduce((acc, cat) => acc + (parseInt(cat.lead_count) || 0), 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-gray-900/50 animate-pulse rounded-3xl border border-gray-800"></div>
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={item}
                            onClick={() => navigate(`/sales/leads?category=${cat.id}`)}
                            className="group bg-gray-900 border border-gray-800 hover:border-blue-500/50 p-6 rounded-3xl transition-all cursor-pointer relative overflow-hidden ring-1 ring-white/5 hover:ring-blue-500/20 shadow-xl"
                        >
                            {/* Decorative Background */}
                            <div className="absolute -right-4 -top-4 text-gray-800 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FiLayers size={120} />
                            </div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="p-4 bg-gray-800 rounded-2xl group-hover:bg-blue-600 transition-all shadow-inner">
                                    <FiFolder className="text-blue-400 group-hover:text-white text-2xl" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tabular-nums">
                                        {cat.lead_count || 0}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Leads Verified</div>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">{cat.slug}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                                            <FiLayers className="text-blue-500" /> Structures
                                        </div>
                                        <div className="text-sm font-bold text-gray-300">{cat.subcategory_count || 0} Subcategories</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                                            <FiDownload className="text-green-500" /> Exported
                                        </div>
                                        <div className="text-sm font-bold text-gray-300">{cat.total_exports || 0} Total</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                        <FiClock />
                                        <span>Last Export: {cat.last_exported_at ? new Date(cat.last_exported_at).toLocaleDateString() : 'Never'}</span>
                                    </div>
                                    <FiArrowRight className="text-gray-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!loading && categories.length === 0 && (
                <div className="py-32 text-center bg-gray-900 border-2 border-dashed border-gray-800 rounded-[3rem]">
                    <FiLayers className="mx-auto text-5xl text-gray-700 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Engine is Idle</h2>
                    <p className="text-gray-500">No categories have been generated yet. Import some leads to boot the system.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryDashboard;

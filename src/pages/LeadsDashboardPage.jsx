import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter, FiSearch, FiRefreshCcw, FiExternalLink, FiMail, FiPhone, FiGlobe, FiMapPin, FiMap, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const LeadsDashboardPage = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const url = categoryId ? `/leads?category=${categoryId}` : '/leads';
            const res = await api.get(url);
            setLeads(res.data.data || res.data);
        } catch (err) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.post('/leads/export');
            toast.success(res.data.message);
            if (res.data.downloadUrl) {
                window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${res.data.downloadUrl}`, '_blank');
            }
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const filteredLeads = leads.filter(l =>
        (l.business_name || '').toLowerCase().includes(filter.toLowerCase()) ||
        (l.city || '').toLowerCase().includes(filter.toLowerCase()) ||
        (l.address || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-white">Leads Dashboard</h1>
                        <p className="text-gray-400">Manage and export your production-grade leads.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLeads}
                        className="p-3 bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition-all"
                    >
                        <FiRefreshCcw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <FiDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by business, city, or address..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-400 border border-gray-700">
                    <FiFilter />
                    <span>Showing {filteredLeads.length} leads</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-72 bg-gray-800/50 animate-pulse rounded-2xl border border-gray-800"></div>
                    ))
                ) : filteredLeads.map((lead, idx) => (
                    <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 transition-all group overflow-hidden flex flex-col shadow-lg"
                    >
                        {/* Status Strip */}
                        <div className={`h-1 w-full ${lead.exported_count > 0 ? 'bg-green-500' : 'bg-blue-600'}`}></div>

                        <div className="p-6 space-y-5">
                            {/* Header Section */}
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none">
                                    {lead.business_name}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                    <FiMapPin className="text-blue-500" /> {lead.city || 'Global Intelligence'}
                                </p>
                            </div>

                            {/* Contact Details - Strict Vertical Layout */}
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Phone:</label>
                                    <div className="text-sm font-mono text-gray-300">
                                        {lead.phone ? (
                                            <a href={`tel:${lead.phone}`} className="hover:text-blue-400 flex items-center gap-2">
                                                <FiPhone className="text-blue-600" /> {lead.phone}
                                            </a>
                                        ) : 'NOT_AVAILABLE'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Email:</label>
                                    <div className="text-sm font-mono text-gray-300 truncate">
                                        {lead.email ? (
                                            <a href={`mailto:${lead.email}`} className="hover:text-blue-400 flex items-center gap-2">
                                                <FiMail className="text-blue-600" /> {lead.email}
                                            </a>
                                        ) : 'NOT_AVAILABLE'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Website:</label>
                                    <div className="text-sm font-mono text-gray-300 truncate">
                                        {lead.website ? (
                                            <a href={lead.website} target="_blank" rel="noreferrer" className="hover:text-blue-400 flex items-center gap-2">
                                                <FiGlobe className="text-blue-600" /> {lead.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : 'NOT_AVAILABLE'}
                                    </div>
                                </div>
                            </div>

                            {/* Confidence Score */}
                            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-12 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${lead.classification_confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold">{lead.classification_confidence}% MATCH</span>
                                </div>

                                {lead.google_maps_url && (
                                    <a href={lead.google_maps_url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-green-500 transition-colors">
                                        <FiExternalLink />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!loading && filteredLeads.length === 0 && (
                <div className="py-20 text-center bg-gray-900 border border-dashed border-gray-800 rounded-3xl">
                    <p className="text-gray-500 text-lg">No intelligence found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default LeadsDashboardPage;

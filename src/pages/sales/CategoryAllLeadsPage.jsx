import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPhone, FiMail, FiMapPin, FiGlobe, FiDownload, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CategoryAllLeadsPage = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [id, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [categoryRes, leadsRes] = await Promise.all([
                api.get(`/categories/${id}`),
                api.get(`/categories/${id}/leads?page=${page}&limit=20`)
            ]);

            setCategory(categoryRes.data.data);
            setLeads(leadsRes.data.data);
            setTotalPages(leadsRes.data.pagination.totalPages);
        } catch (err) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await api.post('/leads/export', {
                category_id: id
            });

            const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${res.data.file_path}`;
            window.open(downloadUrl, '_blank');
            toast.success(`Exported ${res.data.exported_count} leads!`);
        } catch (err) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate(`/sales/category/${id}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Subcategories
            </button>

            {loading && leads.length === 0 ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-10 w-64 bg-gray-800 rounded-lg"></div>
                    <div className="h-4 w-96 bg-gray-800 rounded-lg"></div>
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-800 rounded-2xl"></div>)}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">All {category?.name} Leads</h1>
                            <p className="text-gray-400 mt-1">Viewing all leads across all subcategories</p>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={exporting || leads.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
                        >
                            <FiDownload /> {exporting ? 'Exporting...' : 'Export All'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {leads.map((lead, idx) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">{lead.business_name}</h3>
                                        {lead.Subcategory && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-1">
                                                    <FiTag size={12} />
                                                    {lead.Subcategory.name}
                                                </div>
                                            </div>
                                        )}
                                        {lead.address && (
                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                <FiMapPin className="text-blue-500" />
                                                <span>{lead.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                                    {lead.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                                <FiPhone />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                                                <p className="text-white font-mono text-sm">{lead.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {lead.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                                <FiMail />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                                <p className="text-white text-sm truncate">{lead.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {lead.website && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                                                <FiGlobe />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Website</p>
                                                <a
                                                    href={lead.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-400 hover:text-purple-300 text-sm truncate block"
                                                >
                                                    {lead.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {leads.length === 0 && !loading && (
                        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
                            <p className="text-gray-500">No leads found in this category yet.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryAllLeadsPage;

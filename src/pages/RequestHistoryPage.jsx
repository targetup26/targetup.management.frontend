import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiActivity, FiCheckCircle, FiXCircle, FiRefreshCw, FiMapPin, FiDownload, FiFileText, FiLayers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const RequestHistoryPage = () => {
    const [activeTab, setActiveTab] = useState('extractions');
    const [history, setHistory] = useState([]);
    const [exports, setExports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [historyRes, exportsRes] = await Promise.all([
                api.get('/leads/history'),
                api.get('/leads/export/history')
            ]);
            setHistory(historyRes.data.data || historyRes.data);
            setExports(exportsRes.data.data || exportsRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (filePath) => {
        if (!filePath) return;
        const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050'}${filePath}`;
        window.open(downloadUrl, '_blank');
        toast.success('Download started');
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'failed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'running': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <FiCheckCircle />;
            case 'failed': return <FiXCircle />;
            case 'running': return <FiActivity className="animate-spin" />;
            case 'pending': return <FiClock className="animate-pulse" />;
            default: return <FiClock />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">History & Exports</h1>
                    <p className="text-gray-400">Track your extractions and download past exports.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                        <button
                            onClick={() => setActiveTab('extractions')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'extractions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FiActivity /> Extractions
                        </button>
                        <button
                            onClick={() => setActiveTab('exports')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'exports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FiDownload /> Exports
                        </button>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition-all"
                        title="Refresh Data"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'extractions' ? (
                        <motion.div
                            key="extractions"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-x-auto"
                        >
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Niche</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Dataset ID</th>
                                        <th className="px-6 py-4">Results</th>
                                        <th className="px-6 py-4">Launched</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading && history.length === 0 ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="6" className="px-6 py-8 bg-gray-900/50"></td>
                                            </tr>
                                        ))
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                                                No extraction jobs found.
                                            </td>
                                        </tr>
                                    ) : history.map((job) => (
                                        <tr key={job.id} className="hover:bg-gray-800/30 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border w-fit uppercase ${getStatusStyle(job.status)}`}>
                                                    {getStatusIcon(job.status)}
                                                    {job.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-bold">{job.business_type}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Category Search</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <FiMapPin className="text-blue-500" />
                                                    <span>{[job.city, job.state].filter(Boolean).join(', ') || 'Global'}</span>
                                                    {job.country && <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">{job.country}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-600 group-hover:text-gray-400 transition-colors">
                                                    {job.apify_run_id ? job.apify_run_id.slice(0, 12) + '...' : 'WAITING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-400 font-bold text-lg">{job.total_results}</span>
                                                    <span className="text-[10px] text-gray-600 uppercase">leads</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                                                {new Date(job.created_at || job.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="exports"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-x-auto"
                        >
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Export Date</th>
                                        <th className="px-6 py-4">Scope</th>
                                        <th className="px-6 py-4">Filters</th>
                                        <th className="px-6 py-4">Leads Count</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading && exports.length === 0 ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="5" className="px-6 py-8 bg-gray-900/50"></td>
                                            </tr>
                                        ))
                                    ) : exports.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                                No export history found.
                                            </td>
                                        </tr>
                                    ) : exports.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-800/30 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <FiClock className="text-gray-500" />
                                                    {new Date(exp.created_at || exp.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiLayers className="text-purple-500" />
                                                    <span className="font-medium text-white">
                                                        {exp.Category ? exp.Category.name : 'All Categories'}
                                                    </span>
                                                </div>
                                                {exp.Subcategory && (
                                                    <div className="text-xs text-gray-500 ml-6 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                                        {exp.Subcategory.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {exp.filters && Object.keys(JSON.parse(exp.filters)).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(JSON.parse(exp.filters)).map(([key, val]) => (
                                                            <span key={key} className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] text-gray-400">
                                                                {key}: {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600 italic">No filters</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                                                    {exp.exported_count} Records
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDownload(exp.file_path)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-blue-500/20"
                                                >
                                                    <FiDownload /> Download CSV
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RequestHistoryPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiSearch, FiCheckCircle, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import leadService from '../../services/leadService';
import { format } from 'date-fns';

const LeadJobHistoryPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await leadService.getJobHistory();
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Extraction History</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Query</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Results</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Loading history...</td></tr>
                        ) : jobs.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No jobs found.</td></tr>
                        ) : jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 font-mono text-gray-500">
                                    {format(new Date(job.created_at), 'MMM dd, HH:mm')}
                                </td>
                                <td className="p-4 font-medium text-white">{job.business_type || job.keyword}</td>
                                <td className="p-4 flex items-center gap-2">
                                    {job.city}, {job.country}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${job.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                        job.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="p-4 font-mono">
                                    {job.leads_extracted || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadJobHistoryPage;

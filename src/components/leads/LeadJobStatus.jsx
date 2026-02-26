import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLoader, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import leadService from '../../services/leadService';

const LeadJobStatus = ({ jobId, onComplete }) => {
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!jobId) return;

        let interval;
        const checkStatus = async () => {
            try {
                const res = await leadService.getJobStatus(jobId);
                const { status: jobStatus, progress: jobProgress, leads_extracted } = res.data;

                setStatus(jobStatus);
                setProgress(jobProgress || 0);

                if (jobStatus === 'completed') {
                    clearInterval(interval);
                    if (onComplete) onComplete(leads_extracted);
                } else if (jobStatus === 'failed') {
                    clearInterval(interval);
                    setError('Extraction failed. Please try again.');
                }
            } catch (err) {
                console.error('Failed to poll job status', err);
                setError('Lost connection to server');
            }
        };

        // Check immediately then poll
        checkStatus();
        interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, [jobId, onComplete]);

    if (!jobId) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-6"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {status === 'pending' || status === 'processing' ? (
                        <FiLoader className="animate-spin text-blue-500 text-xl" />
                    ) : status === 'completed' ? (
                        <FiCheckCircle className="text-green-500 text-xl" />
                    ) : (
                        <FiAlertTriangle className="text-red-500 text-xl" />
                    )}
                    <span className="font-medium text-white capitalize">
                        {status === 'processing' ? ' extracting leads...' : status}
                    </span>
                </div>
                <span className="text-gray-400 text-sm">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <FiAlertTriangle /> {error}
                </p>
            )}
        </motion.div>
    );
};

export default LeadJobStatus;

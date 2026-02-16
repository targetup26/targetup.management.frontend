import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClipboardList, HiArrowRight, HiClock, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FormsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [availableForms, setAvailableForms] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [formsRes, submissionsRes] = await Promise.all([
                api.get('/forms/available'),
                api.get('/forms/my-submissions')
            ]);
            setAvailableForms(formsRes.data);
            setMySubmissions(submissionsRes.data);
        } catch (err) {
            console.error('Failed to fetch forms:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-success bg-success/10 border-success/20';
            case 'REJECTED': return 'text-danger bg-danger/10 border-danger/20';
            case 'PENDING': return 'text-warning bg-warning/10 border-warning/20';
            default: return 'text-text-secondary bg-white/5 border-white/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <HiCheckCircle />;
            case 'REJECTED': return <HiExclamationCircle />;
            case 'PENDING': return <HiClock />;
            default: return <HiClipboardList />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <HiClipboardList className="text-primary" />
                        My Forms
                    </h2>
                    <p className="text-text-secondary mt-1 italic">
                        Submit requests and track your form submissions
                    </p>
                </motion.div>

                <div className="glass-panel-pro px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold text-white">{user?.full_name}</p>
                    </div>
                </div>
            </header>

            {/* Available Forms */}
            <section>
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Available Forms
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableForms.map((form) => (
                        <motion.div
                            key={form.id}
                            whileHover={{ y: -5 }}
                            className="glass-panel-pro p-6 cursor-pointer group border-white/5 hover:border-primary/20 transition-all"
                            onClick={() => navigate(`/forms/${form.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl group-hover:scale-110 transition-transform">
                                    <HiClipboardList />
                                </div>
                                <HiArrowRight className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                {form.name}
                            </h4>
                            {form.description && (
                                <p className="text-xs text-text-secondary line-clamp-2">{form.description}</p>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                                    Version {form.version}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {availableForms.length === 0 && (
                    <div className="glass-panel-pro p-12 text-center">
                        <HiClipboardList className="text-6xl text-text-secondary opacity-20 mx-auto mb-4" />
                        <p className="text-text-secondary">No forms available at this time</p>
                    </div>
                )}
            </section>

            {/* Recent Submissions */}
            <section>
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Recent Submissions
                </h3>

                <div className="glass-panel-pro overflow-hidden">
                    {mySubmissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="p-5">Form Type</th>
                                        <th className="p-5">Submitted</th>
                                        <th className="p-5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {mySubmissions.map((submission) => (
                                        <tr key={submission.id} className="group hover:bg-white/[0.03] transition-all">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                                                        <HiClipboardList />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{submission.Template?.name}</p>
                                                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                                                            ID: {submission.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="text-xs text-text-secondary font-mono">
                                                    {new Date(submission.submitted_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-text-secondary font-mono opacity-50">
                                                    {new Date(submission.submitted_at).toLocaleTimeString()}
                                                </p>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 border ${getStatusColor(submission.status)}`}>
                                                    {getStatusIcon(submission.status)}
                                                    {submission.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <HiClock className="text-6xl text-text-secondary opacity-20 mx-auto mb-4" />
                            <p className="text-text-secondary">No submissions yet</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

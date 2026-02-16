import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPrinter, HiDocumentText, HiIdentification } from 'react-icons/hi';
import api from "../../../services/api";

const UserFormsModal = ({ employee, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (employee) {
            fetchSubmissions();
        }
    }, [employee]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/forms/employee/${employee.id}`);
            setSubmissions(res.data.submissions);
        } catch (error) {
            console.error('Error fetching employee submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintSubmission = (submissionId) => {
        window.open(`/admin/print/${submissionId}?type=submission`, '_blank');
    };

    const handlePrintProfile = () => {
        window.open(`/admin/print/${employee.id}?type=employee`, '_blank');
    };

    if (!employee) return null;

    const handlePrint = (type, mode = 'full') => {
        // Navigate to print page with query params
        const url = `/admin/print/${employee.id}?type=${type}&mode=${mode}`;
        window.open(url, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#090b10] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                {employee.full_name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">{employee.full_name}</div>
                                <div className="text-xs font-mono text-primary uppercase">ID: {employee.code || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handlePrint('employee', 'profile')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all group text-left"
                            >
                                <div className="p-3 rounded-lg bg-black/40 text-primary group-hover:scale-110 transition-transform">
                                    <HiUserCircle className="text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Employee Profile</h4>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Full details snapshot</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handlePrint('employee', 'join_form')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all group text-left"
                            >
                                <div className="p-3 rounded-lg bg-black/40 text-primary group-hover:scale-110 transition-transform">
                                    <HiDocumentText className="text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Joining Form</h4>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Standard onboarding document</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handlePrint('employee', 'full')}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 transition-all group text-left"
                            >
                                <div className="p-3 rounded-lg bg-black/40 text-primary group-hover:scale-110 transition-transform">
                                    <HiPrinter className="text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Complete Dossier</h4>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Profile + All Forms</p>
                                </div>
                            </button>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button onClick={onClose} className="btn-ghost-pro w-full py-3 uppercase tracking-widest font-bold text-xs">
                                Close Menu
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default UserFormsModal;

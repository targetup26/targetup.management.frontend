import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiClipboardCheck, HiUpload } from 'react-icons/hi';
import api from '../services/api';

export default function JoinFormPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Valid onboarding token is required to access this portal.');
            setLoading(false);
            return;
        }

        const loadTemplate = async () => {
            try {
                const res = await api.get(`/onboarding/template/${token}`);
                setTemplate(res.data.template);

                // Initialize form data
                const initialData = {};
                res.data.template.schema.sections.forEach(section => {
                    section.fields.forEach(field => {
                        initialData[field.name] = '';
                    });
                });
                setFormData(initialData);

            } catch (err) {
                setError(err.response?.data?.error || 'Failed to initialize onboarding session.');
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [token]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (name, file) => {
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            // Using the new specialized public onboarding upload endpoint
            const res = await api.post('/onboarding/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data', 'X-Onboarding-Token': token }
            });
            handleInputChange(name, res.data.file.id);
        } catch (err) {
            alert('File upload failed. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/onboarding/submit', {
                template_id: template.id,
                form_data: formData,
                onboarding_token: token
            });
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
            <div className="glass-panel-pro max-w-md w-full p-10 text-center space-y-6">
                <HiExclamationCircle className="text-6xl text-red-500 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Session Error</h2>
                <p className="text-text-secondary text-sm">{error}</p>
                <div className="pt-4">
                    <button onClick={() => window.location.reload()} className="btn-pro w-full">Retry Connection</button>
                </div>
            </div>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
            <div className="glass-panel-pro max-w-lg w-full p-12 text-center space-y-8">
                <HiCheckCircle className="text-8xl text-green-400 mx-auto animate-bounce-short" />
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Manifest Logged</h2>
                    <p className="text-text-secondary text-base">Your enrollment request has been securely transmitted to HR Command. You may close this window.</p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status: AWAITING_AUTHORIZATION</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#05070a] py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">👤</div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{template.name}</h1>
                            <p className="text-xs text-primary font-black tracking-[0.4em] uppercase">Onboarding Portal • TargetUP Ecosystem</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {template.schema.sections.map((section, sIdx) => (
                        <motion.section
                            key={sIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sIdx * 0.1 }}
                            className="glass-panel-pro p-0 overflow-hidden"
                        >
                            <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center gap-3">
                                <span className="w-2 h-2 bg-primary rounded-full" />
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{section.title}</h3>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {section.fields.map(field => (
                                    <div key={field.name} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-2`}>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                required={field.required}
                                                className="input-pro min-h-[120px] py-4"
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                required={field.required}
                                                className="input-pro py-4 appearance-none"
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            >
                                                <option value="" className="bg-[#05070a]">SELECT_OPTION</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-[#05070a]">{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'file' ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => handleFileUpload(field.name, e.target.files[0])}
                                                />
                                                <div className={`input-pro py-4 flex items-center justify-between transition-all ${formData[field.name] ? 'border-primary/50 bg-primary/5' : ''}`}>
                                                    <span className="text-xs font-bold text-text-secondary">
                                                        {formData[field.name] ? '✓ ARCHIVE_LINKED' : 'UPLOAD_FILE_VECTOR'}
                                                    </span>
                                                    <HiUpload className={formData[field.name] ? 'text-primary' : 'text-text-secondary'} />
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                className="input-pro py-4"
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    ))}

                    <div className="pt-10 flex justify-center">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-pro h-16 px-20 text-sm font-black tracking-[0.3em] uppercase flex items-center gap-3"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <HiClipboardCheck className="text-xl" />
                            )}
                            {submitting ? 'TRANSMITTING...' : 'LOG MANIFEST'}
                        </button>
                    </div>
                </form>

                <footer className="mt-20 text-center border-t border-white/5 pt-10">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">
                        © 2026 TargetUP Onboarding Environment • Secure Link Sequence
                    </p>
                </footer>
            </div>
        </div>
    );
}

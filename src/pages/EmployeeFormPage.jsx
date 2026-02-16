import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiClipboardCheck, HiUpload, HiArrowLeft } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeFormPage() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [template, setTemplate] = useState(null);
    const [fieldOptions, setFieldOptions] = useState({});
    const [formData, setFormData] = useState({});
    const [employeeProfile, setEmployeeProfile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadFormData();
    }, [templateId]);

    const loadFormData = async () => {
        try {
            const [templateRes, profileRes] = await Promise.all([
                api.get(`/forms/template/${templateId}`),
                api.get('/forms/my-profile')
            ]);

            setTemplate(templateRes.data.template);
            setFieldOptions(templateRes.data.fieldOptions);
            setEmployeeProfile(profileRes.data);

            // Initialize form data with auto-fill
            const initialData = {};
            templateRes.data.template.schema.sections.forEach(section => {
                section.fields.forEach(field => {
                    if (field.auto_fill) {
                        // Resolve auto-fill path
                        const value = resolveAutoFillPath(field.auto_fill, profileRes.data);
                        initialData[field.name] = value || '';
                    } else if (field.calculation) {
                        // Will be calculated dynamically
                        initialData[field.name] = '';
                    } else {
                        initialData[field.name] = '';
                    }
                });
            });

            setFormData(initialData);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load form');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resolve auto-fill path like 'profile.employee.full_name'
     */
    const resolveAutoFillPath = (path, data) => {
        const parts = path.split('.');
        let value = data;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return null;
            }
        }

        return value;
    };

    /**
     * Calculate dynamic fields like service years and date differences
     */
    const calculateField = (calculation, formData) => {
        if (!calculation) return '';

        // years_since(joining_date)
        if (calculation.startsWith('years_since(')) {
            const fieldName = calculation.match(/years_since\(([^)]+)\)/)?.[1];
            const dateValue = formData[fieldName];
            if (dateValue) {
                const years = (new Date() - new Date(dateValue)) / (1000 * 60 * 60 * 24 * 365);
                return years.toFixed(1);
            }
        }

        // date_diff(from_date, to_date)
        if (calculation.startsWith('date_diff(')) {
            const match = calculation.match(/date_diff\(([^,]+),\s*([^)]+)\)/);
            if (match) {
                const fromField = match[1];
                const toField = match[2];
                const fromDate = formData[fromField];
                const toDate = formData[toField];

                if (fromDate && toDate) {
                    const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                    return days > 0 ? days.toString() : '0';
                }
            }
        }

        return '';
    };

    const handleInputChange = (name, value, field) => {
        const newFormData = { ...formData, [name]: value };

        // Recalculate dependent fields
        template.schema.sections.forEach(section => {
            section.fields.forEach(f => {
                if (f.calculation) {
                    newFormData[f.name] = calculateField(f.calculation, newFormData);
                }
            });
        });

        setFormData(newFormData);
    };

    const handleFileUpload = async (name, file) => {
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/storage/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
            await api.post('/forms/submit', {
                template_id: template.id,
                form_data: formData
            });
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="glass-panel-pro max-w-md w-full p-10 text-center space-y-6">
                <HiExclamationCircle className="text-6xl text-red-500 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Error</h2>
                <p className="text-text-secondary text-sm">{error}</p>
                <button onClick={() => navigate('/forms')} className="btn-pro w-full">
                    Back to Forms
                </button>
            </div>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="glass-panel-pro max-w-lg w-full p-12 text-center space-y-8">
                <HiCheckCircle className="text-8xl text-green-400 mx-auto animate-bounce-short" />
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Submitted Successfully</h2>
                    <p className="text-text-secondary text-base">Your form has been submitted and is pending approval.</p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status: PENDING_REVIEW</p>
                </div>
                <button onClick={() => navigate('/forms')} className="btn-pro w-full">
                    Back to Forms
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/forms')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{template.name}</h1>
                    <p className="text-xs text-primary font-black tracking-[0.4em] uppercase">
                        Employee Form • Targetup System
                    </p>
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
                            {section.fields.map(field => {
                                const isReadonly = field.readonly || field.auto_fill || field.calculation;
                                const options = fieldOptions[field.options_field] || field.options || [];

                                return (
                                    <div key={field.name} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-2`}>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                            {isReadonly && <span className="text-[8px] text-primary bg-primary/10 px-2 py-0.5 rounded">AUTO-FILLED</span>}
                                        </label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                required={field.required}
                                                readOnly={isReadonly}
                                                className={`input-pro min-h-[120px] py-4 ${isReadonly ? 'bg-white/[0.02] cursor-not-allowed' : ''}`}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                required={field.required}
                                                disabled={isReadonly}
                                                className={`input-pro py-4 appearance-none ${isReadonly ? 'bg-white/[0.02] cursor-not-allowed' : ''}`}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                                            >
                                                <option value="" className="bg-background">SELECT OPTION</option>
                                                {options.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-background">
                                                        {opt.label}
                                                    </option>
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
                                                        {formData[field.name] ? '✓ FILE UPLOADED' : 'CLICK TO UPLOAD'}
                                                    </span>
                                                    <HiUpload className={formData[field.name] ? 'text-primary' : 'text-text-secondary'} />
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                readOnly={isReadonly}
                                                className={`input-pro py-4 ${isReadonly ? 'bg-white/[0.02] cursor-not-allowed' : ''}`}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                                            />
                                        )}
                                        {field.description && (
                                            <p className="text-[9px] text-text-secondary italic ml-1">{field.description}</p>
                                        )}
                                    </div>
                                );
                            })}
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
                        {submitting ? 'SUBMITTING...' : 'SUBMIT FORM'}
                    </button>
                </div>
            </form>
        </div>
    );
}

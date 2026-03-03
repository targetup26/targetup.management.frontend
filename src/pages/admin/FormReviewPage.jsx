import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiClipboardList, HiCheck, HiX, HiDownload, HiUser, HiArrowLeft,
    HiShieldCheck
} from 'react-icons/hi';
import api, { getApiBaseUrl } from '../../services/api';

const StatusBadge = ({ status }) => {
    const capsStatus = status?.toUpperCase() || 'UNKNOWN';
    const configs = {
        'PENDING': { color: 'yellow-400', label: 'Pending Review' },
        'APPROVED': { color: 'green-400', label: 'Authorized' },
        'REJECTED': { color: 'red-400', label: 'Denied' },
        'DRAFT': { color: 'gray-400', label: 'Draft Mode' }
    };
    const config = configs[capsStatus] || { color: 'primary', label: capsStatus };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${config.color}/10 border border-${config.color}/20 text-${config.color}`}>
            {config.label}
        </span>
    );
};

export default function FormReviewPage() {
    const { id: submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobRoles, setJobRoles] = useState([]);
    const [apiBaseUrl, setApiBaseUrl] = useState('');

    const fetchDetail = async () => {
        try {
            const [subRes, rolesRes] = await Promise.all([
                api.get(`/admin/submissions/${submissionId}`),
                api.get('/job-roles')
            ]);
            setSubmission(subRes.data.submission);
            setJobRoles(rolesRes.data || []);
        } catch (err) {
            console.error('Fetch detail error:', err);
            // navigate('/admin/forms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            const url = await getApiBaseUrl();
            setApiBaseUrl(url);
        };
        fetchDetail();
        fetchConfig();
    }, [submissionId]);

    const handleAction = async (action) => {
        try {
            await api.post(`/admin/submissions/${submissionId}/action`, { action: action.toLowerCase() });
            fetchDetail();
        } catch (error) {
            alert('Operation failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const resolveJobRoleName = (id) => {
        if (!id) return '---';
        const templateField = submission?.Template?.schema?.sections
            ?.flatMap(s => s.fields)
            ?.find(f => f.name === 'job_role_id');

        if (templateField?.options) {
            const opt = templateField.options.find(o => o.value === id);
            if (opt) return opt.label;
        }

        const role = jobRoles.find(r => r.id === parseInt(id) || r.id === id);
        return role ? role.name : id;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Syncing With Archive</span>
        </div>
    );

    if (!submission) return (
        <div className="text-center py-20">
            <p className="text-red-500 font-bold">Record not found or access denied.</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary underline">Go Back</button>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-primary hover:text-black transition-all"
                    >
                        <HiArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-glow uppercase leading-none">{submission.Template?.name}</h1>
                        <p className="text-[10px] text-text-secondary font-black tracking-[0.3em] uppercase mt-2">LINK SEQUENCE: #{submission.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <StatusBadge status={submission.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-panel-pro p-8">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-primary mb-8 uppercase flex items-center gap-2">
                            <HiClipboardList className="text-lg" /> Submission Data Matrix
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(submission.form_data || {}).map(([key, value]) => {
                                if (key === 'id_card_scan' || key === 'cv_upload' || key === 'personal_photo') return null;
                                const isJobRole = key.toLowerCase().includes('job_role');
                                const displayValue = isJobRole ? resolveJobRoleName(value) : (value?.toString() || '---');

                                return (
                                    <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group/field hover:border-primary/20 transition-all">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 group-hover/field:text-primary transition-colors">{key.replace(/_/g, ' ')}</p>
                                        <p className="font-bold text-sm text-white">{displayValue}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Attachments */}
                    <section className="glass-panel-pro p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase flex items-center gap-2">
                                <HiShieldCheck className="text-lg" /> Secure Document Streams
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'personal_photo', label: 'Primary Bio-Scan' },
                                { id: 'id_card_scan', label: 'Identity Matrix' },
                                { id: 'cv_upload', label: 'Experience Ledger' }
                            ].map(cred => {
                                const attachment = submission.Attachments?.find(a => a.field_name === cred.id);
                                const isMissing = !attachment;

                                return (
                                    <div key={cred.id} className={`glass-panel-pro p-5 border-dashed transition-all ${isMissing ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-primary/20 bg-primary/[0.02]'}`}>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-4">{cred.label}</p>
                                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center relative group/cred">
                                            {!isMissing ? (
                                                <>
                                                    {attachment.FileMetadata?.mime_type?.startsWith('image/') ? (
                                                        <img
                                                            src={`${apiBaseUrl}/api/storage/download/${attachment.file_metadata_id}?token=${localStorage.getItem('token')}`}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/cred:scale-110"
                                                            alt={cred.id}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-primary">
                                                            <span className="text-3xl">📄</span>
                                                            <span className="text-[10px] font-bold uppercase">Archive Loaded</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cred:opacity-100 transition-all flex items-center justify-center gap-3">
                                                        <a
                                                            href={`${apiBaseUrl}/api/storage/download/${attachment.file_metadata_id}?token=${localStorage.getItem('token')}&download=true`}
                                                            className="p-3 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-all"
                                                        >
                                                            <HiDownload className="text-xl" />
                                                        </a>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-red-500/30">
                                                    <span className="text-2xl italic font-black">X</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Missing Vector</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <section className="glass-panel-pro p-8">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary mb-6 uppercase">OPERATOR CONTEXT</h3>
                        <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl text-primary"><HiUser /></div>
                            <div>
                                <p className="text-sm font-bold text-white leading-tight">
                                    {submission.Employee?.full_name || submission.form_data?.full_name || 'ONBOARDING CANDIDATE'}
                                </p>
                                <p className="text-[10px] font-mono text-text-secondary uppercase mt-1">{submission.Employee?.Department?.name || 'QUEUED FOR REVIEW'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase">Signature Protocol</h4>
                            <div className="space-y-6 relative ml-2 mt-4">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                                {(submission.Signatures || []).map((sig, i) => (
                                    <div key={sig.id} className="relative pl-6">
                                        <div className={`absolute left-[-4px] top-1 w-2 h-2 rounded-full border-2 border-[#05070a] ${sig.status === 'signed' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary leading-none mb-1">{sig.signer_role.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-bold text-white leading-tight">{sig.Signer?.full_name || 'Pending System Action'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Print */}
                        <button
                            onClick={() => window.open(`/admin/print/${submission.id}?type=submission`, '_blank')}
                            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest uppercase hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2 mt-10"
                        >
                            <span className="text-lg">🖨️</span>
                            <span>PRINT DOCUMENT</span>
                        </button>
                    </section>

                    {(submission.status?.toUpperCase() === 'PENDING' || submission.status?.toUpperCase() === 'SUBMITTED') && (
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleAction('APPROVE')}
                                className="px-6 py-5 rounded-2xl bg-green-500 text-[#05070a] font-black text-[10px] tracking-widest uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                <HiCheck className="text-lg" />
                                <span>AUTHORIZE SUBMISSION</span>
                            </button>
                            <button
                                onClick={() => handleAction('REJECT')}
                                className="px-6 py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <HiX className="text-lg" />
                                <span>DENY ACCESS</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

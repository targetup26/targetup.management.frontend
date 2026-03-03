import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    HiClipboardList, HiSearch, HiFilter, HiCheck, HiX,
    HiRefresh, HiChevronRight, HiEye, HiUser, HiTemplate,
    HiDownload
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api, { getApiBaseUrl } from '../../services/api';

const StatusBadge = ({ status }) => {
    const capsStatus = status?.toUpperCase() || 'UNKNOWN';
    const configs = {
        'PENDING': { color: 'yellow-400', label: 'Pending Review' },
        'SUBMITTED': { color: 'yellow-400', label: 'Submitted' },
        'APPROVED': { color: 'green-400', label: 'Authorized' },
        'REJECTED': { color: 'red-400', label: 'Denied' },
        'DRAFT': { color: 'gray-400', label: 'Draft Mode' }
    };
    const config = configs[capsStatus] || { color: 'primary', label: capsStatus };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${config.color}/10 border border-${config.color}/20 text-${config.color}`}>
            {config.label}
        </span>
    );
};

const SubmissionDetailModal = ({ submissionId, onClose, onAction, jobRoles = [] }) => {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiBaseUrl, setApiBaseUrl] = useState('');

    const resolveJobRoleName = (id) => {
        if (!id) return '---';

        // 1. Check template schema options first (most accurate for dynamic forms)
        const templateField = submission?.Template?.schema?.sections
            ?.flatMap(s => s.fields)
            ?.find(f => f.name === 'job_role_id');

        if (templateField?.options) {
            const opt = templateField.options.find(o => o.value === id);
            if (opt) return opt.label;
        }

        // 2. Fallback to global roles table
        const role = jobRoles.find(r => r.id === parseInt(id) || r.id === id);
        return role ? role.name : id;
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/admin/submissions/${submissionId}`);
                setSubmission(res.data.submission);
            } catch (err) {
                console.error('Fetch detail error:', err);
                onClose();
            } finally {
                setLoading(false);
            }
        };
        const fetchConfig = async () => {
            const url = await getApiBaseUrl();
            setApiBaseUrl(url);
        };
        fetchDetail();
        fetchConfig();
    }, [submissionId]);

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!submission) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-10 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-panel-pro w-full max-w-5xl overflow-hidden relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all z-10 text-xl">
                    <HiX />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden h-[90vh] md:h-[80vh]">
                    {/* Left Panel: Matrix Info */}
                    <div className="lg:col-span-2 p-8 overflow-y-auto border-r border-white/5 custom-scrollbar">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                                {submission.Template?.type === 'join' ? '👤' : '📄'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter text-glow uppercase">{submission.Template?.name}</h2>
                                <p className="text-[10px] text-text-secondary font-black tracking-[0.3em] uppercase">LINK SEQUENCE: #{submission.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(submission.form_data).map(([key, value]) => {
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

                        {/* --- Credential Triage Zone (Pro View) --- */}
                        <div className="mt-10">
                            <h3 className="text-xs font-black tracking-[0.3em] text-primary mb-6 uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                Mandatory Credential Streams
                            </h3>
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
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-primary">
                                                                <span className="text-3xl">📄</span>
                                                                <span className="text-[10px] font-bold uppercase">Archive Loaded</span>
                                                            </div>
                                                        )}
                                                        {/* Fallback for deleted/missing images */}
                                                        <div className="flex flex-col items-center gap-2 text-yellow-500/50" style={{ display: 'none' }}>
                                                            <span className="text-3xl">🖼️</span>
                                                            <span className="text-[10px] font-bold uppercase text-center">File Deleted</span>
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cred:opacity-100 transition-all flex items-center justify-center gap-3 scale-95 group-hover/cred:scale-100">
                                                            <a
                                                                href={`${apiBaseUrl}/api/storage/download/${attachment.file_metadata_id}?token=${localStorage.getItem('token')}&download=true`}
                                                                className="p-3 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-all"
                                                                target="_blank" rel="noreferrer"
                                                                onClick={(e) => {
                                                                    // Prevent download if image failed to load
                                                                    const img = e.currentTarget.parentElement.parentElement.querySelector('img');
                                                                    if (img && img.style.display === 'none') {
                                                                        e.preventDefault();
                                                                        alert('This file has been deleted from storage');
                                                                    }
                                                                }}
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

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isMissing ? 'text-red-500' : 'text-green-500'}`}>
                                                    {isMissing ? 'NOT_FOUND' : 'SYNCHRONIZED'}
                                                </span>
                                                <span className="text-[8px] font-mono text-text-secondary opacity-40">{cred.id}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Other Attachments Section */}
                        {submission.Attachments?.filter(att => !['id_card_scan', 'cv_upload', 'personal_photo'].includes(att.field_name)).length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-sm font-black tracking-[0.2em] text-text-secondary mb-4 uppercase">SUPPLEMENTARY DATA</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {submission.Attachments.filter(att => !['id_card_scan', 'cv_upload', 'personal_photo'].includes(att.field_name)).map(att => (
                                        <a
                                            key={att.id}
                                            href={`${apiBaseUrl}/api/storage/download/${att.file_metadata_id}?token=${localStorage.getItem('token')}&download=true`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
                                        >
                                            <div className="text-2xl group-hover:scale-110 transition-transform">📂</div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-white truncate">{att.FileMetadata?.original_name || 'Attached File'}</p>
                                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{att.field_name?.replace(/_/g, ' ')}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Controls & History */}
                    <div className="bg-white/5 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary mb-6 uppercase">OPERATOR CONTEXT</h3>
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl text-primary"><HiUser /></div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">
                                        {submission.Employee?.full_name || submission.form_data?.full_name || 'ONBOARDING CANDIDATE'}
                                    </p>
                                    <p className="text-[10px] font-mono text-text-secondary uppercase">{submission.Employee?.Department?.name || 'QUEUED FOR REVIEW'}</p>
                                </div>
                            </div>
                            <StatusBadge status={submission.status} />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-text-secondary mb-6 uppercase">SIGNATURE PROTOCOL</h3>
                            <div className="space-y-6 relative ml-2">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                                {submission.Signatures?.map((sig, i) => (
                                    <div key={sig.id} className="relative pl-6">
                                        <div className={`absolute left-[-4px] top-1 w-2 h-2 rounded-full border-2 border-[#05070a] ${sig.status === 'signed' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary leading-none mb-1">{sig.signer_role.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-bold text-white leading-tight">{sig.Signer?.full_name || 'Pending System Action'}</p>
                                        {sig.signed_at && <p className="text-[9px] text-text-muted mt-1 font-mono">{new Date(sig.signed_at).toLocaleString()}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={() => window.open(`/admin/print/${submission.id}?type=submission`, '_blank')}
                            className="w-full px-6 py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] tracking-widest uppercase hover:bg-primary/20 transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            <span className="text-lg">🖨️</span>
                            <span>PRINT DOCUMENT</span>
                        </button>

                        {(submission.status?.toUpperCase() === 'PENDING' || submission.status?.toUpperCase() === 'SUBMITTED') && (
                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button
                                    onClick={() => onAction(submission.id, 'APPROVE')}
                                    className="px-6 py-4 rounded-xl bg-green-500 text-[#05070a] font-black text-[10px] tracking-widest uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    <HiCheck className="text-lg" />
                                    <span>AUTHORIZE</span>
                                </button>
                                <button
                                    onClick={() => onAction(submission.id, 'REJECT')}
                                    className="px-6 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <HiX className="text-lg" />
                                    <span>DENY</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default function FormSubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [viewingId, setViewingId] = useState(null);
    const [jobRoles, setJobRoles] = useState([]);
    const navigate = useNavigate();

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const [subRes, rolesRes] = await Promise.all([
                api.get('/admin/submissions'),
                api.get('/job-roles')
            ]);

            const data = subRes.data.submissions || [];
            setSubmissions(data);
            setJobRoles(rolesRes.data || []);

            // Calculate stats
            const newStats = data.reduce((acc, sub) => {
                acc.total++;
                const s = sub.status?.toUpperCase();
                if (s === 'PENDING') acc.pending++;
                if (s === 'APPROVED') acc.approved++;
                if (s === 'REJECTED') acc.rejected++;
                return acc;
            }, { total: 0, pending: 0, approved: 0, rejected: 0 });
            setStats(newStats);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.post(`/admin/submissions/${id}/action`, { action: action.toLowerCase() });
            fetchSubmissions();
            if (viewingId === id) setViewingId(null);
        } catch (error) {
            alert('Operation failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const name = sub.Employee?.full_name || sub.form_data?.full_name || 'ONBOARDING CANDIDATE';
        const code = sub.Employee?.employee_code || '';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || sub.status?.toUpperCase() === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading && submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Accessing Form Database</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Modal */}
            {viewingId && (
                <SubmissionDetailModal
                    submissionId={viewingId}
                    onClose={() => setViewingId(null)}
                    onAction={handleAction}
                    jobRoles={jobRoles}
                />
            )}

            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-glow mb-2">FORM MANAGEMENT</h1>
                    <p className="text-xs text-text-secondary uppercase tracking-[0.3em]">Centralized Submission Oversight Hub</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/forms/templates')}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                        <HiTemplate className="text-lg" />
                        <span>Manage Templates</span>
                    </button>
                    <button
                        onClick={fetchSubmissions}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-primary"
                    >
                        <HiRefresh className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* --- Stats Row --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Files', value: stats.total, color: 'primary' },
                    { label: 'Pending Review', value: stats.pending, color: 'yellow-400' },
                    { label: 'Authorized', value: stats.approved, color: 'green-400' },
                    { label: 'Denied Access', value: stats.rejected, color: 'red-400' }
                ].map((stat, i) => (
                    <div key={i} className="glass-panel-pro p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">{stat.label}</p>
                        <h3 className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* --- Controls --- */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH BY STAFF ID OR NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold tracking-widest outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50"
                        style={{ color: '#fff' }}
                    >
                        <option value="ALL" style={{ background: '#0b0e12', color: '#fff' }}>All Statuses</option>
                        <option value="PENDING" style={{ background: '#0b0e12', color: '#fff' }}>Pending</option>
                        <option value="APPROVED" style={{ background: '#0b0e12', color: '#fff' }}>Approved</option>
                        <option value="REJECTED" style={{ background: '#0b0e12', color: '#fff' }}>Rejected</option>
                    </select>
                </div>
            </div>

            {/* --- Main Table --- */}
            <div className="glass-panel-pro overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Staff Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Template</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Timeline</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Security Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary text-right">Operational Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((sub, idx) => (
                                    <motion.tr
                                        key={sub.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                                        onClick={() => setViewingId(sub.id)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${!sub.Employee ? 'bg-primary/20 border-primary/40 text-primary animate-pulse' : 'bg-white/5 border-white/10 text-primary'}`}>
                                                    <HiUser />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                        {sub.Employee?.full_name || sub.form_data?.full_name || 'ONBOARDING CANDIDATE'}
                                                    </p>
                                                    <p className="text-[10px] font-mono text-text-secondary">
                                                        {sub.Employee ? `ID: ${sub.Employee.code}` : 'STATUS: NOT PROVISIONED'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest">{sub.Template?.name}</p>
                                                <p className="text-[10px] text-text-secondary italic">Type: {sub.Template?.type}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <HiClipboardList className="text-xs" />
                                                <span className="text-[10px] font-bold tracking-tighter">
                                                    {new Date(sub.submitted_at || sub.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {(sub.status?.toUpperCase() === 'PENDING' || sub.status?.toUpperCase() === 'SUBMITTED') && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAction(sub.id, 'APPROVE'); }}
                                                            className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-all"
                                                            title="Authorize"
                                                        >
                                                            <HiCheck />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAction(sub.id, 'REJECT'); }}
                                                            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                                                            title="Deny"
                                                        >
                                                            <HiX />
                                                        </button>
                                                        <div className="w-px h-4 bg-white/10 mx-1" />
                                                    </>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setViewingId(sub.id); }}
                                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-primary transition-all"
                                                    title="View Detailed Intel"
                                                >
                                                    <HiEye />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary italic">No entry vectors found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

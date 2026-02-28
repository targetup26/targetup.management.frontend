import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HiArrowLeft, HiPrinter, HiDownload, HiUser, HiIdentification,
    HiOfficeBuilding, HiBriefcase, HiCalendar, HiCheckCircle, HiClock,
    HiShieldCheck, HiUserAdd, HiX, HiLightningBolt, HiClipboardList,
    HiChartBar, HiDocumentText, HiDotsVertical
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getApiBaseUrl } from '../../services/api';
import AttendanceHistory from '../../components/admin/AttendanceHistory';

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all text-xs font-black uppercase tracking-widest ${active ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-white hover:bg-white/[0.02]'}`}
    >
        <Icon className="text-lg" />
        {label}
    </button>
);

const AnalyticsCard = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="glass-panel-pro p-6 flex items-center gap-4 group">
        <div className={`w-12 h-12 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
            <Icon className="text-xl" />
        </div>
        <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
            <p className="text-[9px] text-text-muted font-mono uppercase mt-1 opacity-50">{subtext}</p>
        </div>
    </div>
);

export default function EmployeeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [apiBaseUrl, setApiBaseUrl] = useState('');

    // [User Creation State]
    const [showUserModal, setShowUserModal] = useState(false);
    const [userPassword, setUserPassword] = useState('');
    const [userRole, setUserRole] = useState('EMPLOYEE');
    const [creating, setCreating] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/employees/${id}`);
                setEmployee(res.data);
            } catch (err) {
                console.error('Fetch employee error:', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchConfig = async () => {
            const url = await getApiBaseUrl();
            setApiBaseUrl(url);
        };
        fetchEmployee();
        fetchConfig();
    }, [id]);

    const handleCreateUser = async () => {
        setCreating(true);
        try {
            const res = await api.post(`/admin/users/create-from-employee/${id}`, {
                password: userPassword,
                role: userRole
            });
            setSuccessData(res.data);
        } catch (err) {
            alert(err.response?.data?.error || 'Provisioning failed.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Retrieving Dossier</span>
        </div>
    );

    if (!employee) return (
        <div className="p-10 text-center">
            <h2 className="text-2xl font-bold text-white italic tracking-tight">DOSSIER CORRUPT OR MISSING</h2>
            <button onClick={() => navigate('/admin/users')} className="mt-4 text-primary font-black uppercase text-xs tracking-widest hover:underline">Return to Directory</button>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Action Alerts (Direct Approval) */}
            <AnimatePresence>
                {(employee.stats?.pendingForms > 0) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-panel-pro border-primary/30 bg-primary/5 p-4 flex items-center justify-between mb-8 overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                                <HiClipboardList className="text-xl" />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-white uppercase tracking-widest leading-none">
                                    Action Required: {employee.stats.pendingForms} Pending Submission(s)
                                </h5>
                                <p className="text-[10px] text-text-secondary mt-1">
                                    Latest: <span className="font-bold text-primary italic uppercase">{employee.stats.recentPending[0]?.Template?.name}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/admin/forms/${employee.stats.recentPending[0]?.id}`)}
                            className="btn-pro px-6 py-2.5 text-[9px] font-black uppercase tracking-widest"
                        >
                            Direct Review
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/users')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 group">
                        <HiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{employee.full_name}</h1>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${employee.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                                {employee.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">{employee.code} • {employee.Department?.name} • {employee.JobRole?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Quick Action Shortcuts */}
                    <div className="hidden lg:flex items-center gap-2 mr-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                        <button title="Secure Chat" className="p-2.5 rounded-xl bg-white/5 hover:bg-accent/20 hover:text-accent transition-all">
                            <HiLightningBolt />
                        </button>
                        <button title="ID Print" onClick={() => navigate(`/admin/settings/print?employee=${id}`)} className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                            <HiPrinter />
                        </button>
                        <button title="System Reset" onClick={() => setShowUserModal(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all">
                            <HiShieldCheck />
                        </button>
                    </div>

                    {!employee.User ? (
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="btn-pro px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <HiUserAdd className="text-lg" /> Provision Access
                        </button>
                    ) : (
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                            <HiShieldCheck className="text-primary text-lg" /> Vault Linked
                        </button>
                    )}
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary">
                        <HiDotsVertical />
                    </button>
                </div>
            </header>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                    label="Punctuality"
                    value={`${employee.stats?.punctualityRate || 0}%`}
                    subtext="On-time Ratio"
                    icon={HiCheckCircle}
                    color="green-400"
                />
                <AnalyticsCard
                    label="Work Hours"
                    value={`${employee.stats?.workHours || 0}h`}
                    subtext="Current Month"
                    icon={HiClock}
                    color="primary"
                />
                <AnalyticsCard
                    label="Breaks"
                    value={`${employee.BreakLogs?.reduce((acc, b) => acc + (b.duration || 0), 0) || 0}m`}
                    subtext="Total duration"
                    icon={HiLightningBolt}
                    color="orange-400"
                />
                <AnalyticsCard
                    label="Forms"
                    value={employee.Submissions?.length || 0}
                    subtext="Submission count"
                    icon={HiDocumentText}
                    color="accent"
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide">
                <TabButton active={activeTab === 'overview'} label="Bio-Data" icon={HiUser} onClick={() => setActiveTab('overview')} />
                <TabButton active={activeTab === 'attendance'} label="Attendance & Breaks" icon={HiCalendar} onClick={() => setActiveTab('attendance')} />
                <TabButton active={activeTab === 'forms'} label="Documents & Forms" icon={HiClipboardList} onClick={() => setActiveTab('forms')} />
                <TabButton active={activeTab === 'activity'} label="Activity Log" icon={HiLightningBolt} onClick={() => setActiveTab('activity')} />
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section className="glass-panel-pro p-8">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <HiUser className="text-lg" /> Personal Identification
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label="Passport Number" value={employee.passport_number} />
                                        <InfoField label="Nationality" value={employee.nationality} />
                                        <InfoField label="Marital Status" value={employee.marital_status} />
                                        <InfoField label="Dependents" value={employee.dependents_count} />
                                        <InfoField label="Phone Contact" value={employee.phone} />
                                        <InfoField label="Email Address" value={employee.email} />
                                    </div>
                                </section>

                                <section className="glass-panel-pro p-8">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <HiBriefcase className="text-lg" /> Professional Placement
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label="Job Designation" value={employee.JobRole?.name} />
                                        <InfoField label="Departmental Node" value={employee.Department?.name} />
                                        <InfoField label="Activation Date" value={employee.hire_date} />
                                        <InfoField label="Assigned Shift" value={employee.Shift?.name} />
                                        <InfoField label="Linked Bank" value={employee.bank_name} />
                                        <InfoField label="IBAN Record" value={employee.iban} className="md:col-span-2" />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                        <HiClock className="text-lg" /> Attendance History
                                    </h3>
                                    <AttendanceHistory employeeId={id} />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                                        <HiLightningBolt className="text-lg text-orange-400" /> Break Event Stream
                                    </h3>
                                    <div className="glass-panel-pro p-6 space-y-4 max-h-[1000px] overflow-y-auto scrollbar-hide">
                                        {employee.BreakLogs?.length > 0 ? (
                                            employee.BreakLogs.map((log, bidx) => (
                                                <div key={log.id || bidx} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-400/20 transition-all group">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                                        <HiClock />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                                                        <p className="text-xs font-bold text-white mt-0.5">
                                                            {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="mx-2 opacity-30">→</span>
                                                            {log.end_time ? new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ACTIVE'}
                                                        </p>
                                                        <p className="text-[9px] font-mono text-orange-400/80 uppercase mt-1">Duration: {log.duration || 0} mins</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center text-text-secondary opacity-50 italic text-[10px] uppercase tracking-widest">No recent break activity</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'forms' && (
                            <div className="space-y-8">
                                <section className="glass-panel-pro p-8">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <HiClipboardList className="text-lg" /> Authorized Dossier Records
                                    </h3>
                                    {employee.Submissions?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {employee.Submissions.map(sub => (
                                                <div key={sub.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                            <HiDocumentText className="text-xl" />
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400' : sub.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white mb-1 leading-tight">{sub.Template?.name}</h4>
                                                    <p className="text-[9px] font-mono text-text-secondary uppercase mb-4 opacity-50">{new Date(sub.created_at).toLocaleString()}</p>
                                                    <button
                                                        onClick={() => navigate(`/admin/forms/${sub.id}`)}
                                                        className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                                                    >
                                                        Review Signature
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center glass-panel-pro border-dashed opacity-40">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No official submissions linked</p>
                                        </div>
                                    )}
                                </section>

                                <section className="glass-panel-pro p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                            <HiIdentification className="text-lg" /> Personnel Vault (Join Documents)
                                        </h3>
                                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase">
                                            <HiShieldCheck className="text-green-500/50" /> Secure Encryption Active
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {/* Combined view of Submission Attachments and Direct Vault Files */}
                                        {((employee.Submissions?.filter(s => s.Template?.type === 'join').flatMap(s => s.Attachments || []) || []).length > 0 ||
                                            (employee.VaultFiles?.length > 0)) ? (
                                            <>
                                                {/* 1. Show submission attachments */}
                                                {(employee.Submissions?.filter(s => s.Template?.type === 'join').flatMap(s => s.Attachments || []) || []).map(att => (
                                                    <div key={`att-${att.id}`} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 group hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">📂</div>
                                                            <a
                                                                href={`${apiBaseUrl}/api/storage/download/${att.FileMetadata?.id || att.file_metadata_id}?token=${localStorage.getItem('token')}&download=true`}
                                                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-primary transition-all"
                                                            >
                                                                <HiDownload />
                                                            </a>
                                                        </div>
                                                        <div className="flex-1 overflow-hidden space-y-1">
                                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest truncate">{att.field_name?.replace(/_/g, ' ') || 'Join Document'}</p>
                                                            <p className="text-[10px] font-bold text-white/50 truncate italic">{att.FileMetadata?.original_name || 'vault_record.dat'}</p>
                                                            <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">{((att.FileMetadata?.file_size || 0) / 1024).toFixed(0)} KB • SECURE</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* 2. Show directly linked files not covered above */}
                                                {(employee.VaultFiles || []).filter(vf => !employee.Submissions?.flatMap(s => s.Attachments || []).some(att => att.file_metadata_id === vf.id)).map(file => (
                                                    <div key={`file-${file.id}`} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 group hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] text-glow">📄</div>
                                                            <a
                                                                href={`${apiBaseUrl}/api/storage/download/${file.id}?token=${localStorage.getItem('token')}&download=true`}
                                                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-primary transition-all"
                                                            >
                                                                <HiDownload />
                                                            </a>
                                                        </div>
                                                        <div className="flex-1 overflow-hidden space-y-1">
                                                            <p className="text-[9px] font-black text-accent uppercase tracking-widest truncate">Vault Asset</p>
                                                            <p className="text-[10px] font-bold text-white/50 truncate italic">{file.original_name}</p>
                                                            <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">{((file.file_size || 0) / 1024).toFixed(0)} KB • LINKED</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                <HiIdentification className="text-4xl mx-auto mb-3 text-white/5" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No Documents found in Vault</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="glass-panel-pro p-8 space-y-8">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <HiLightningBolt className="text-lg" /> Identity Event Stream
                                </h3>
                                <div className="space-y-6 relative ml-4">
                                    <div className="absolute left-[-17px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-white/5 to-transparent" />
                                    {employee.ActionHistory?.length > 0 ? (
                                        employee.ActionHistory.map((log, idx) => (
                                            <div key={idx} className="relative pl-6 group">
                                                <div className="absolute left-[-23px] top-1.5 w-4 h-4 rounded-full bg-[#0b0f15] border-2 border-primary group-hover:scale-125 transition-transform" />
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${log.action.includes('CREATE') ? 'text-green-400' : 'text-primary'}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-text-secondary opacity-50">{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-white/80">{log.entity_type} Modulated</p>
                                                <p className="text-[10px] text-text-secondary mt-1 italic">Authorized by {log.User?.full_name || 'System Auto-Link'}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-text-secondary py-10 text-center italic">No events recorded in this cycle</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* User Account Modal */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-md p-0 shadow-2xl overflow-hidden border-accent/20"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 text-glow">
                                    <HiIdentification className="text-primary" />
                                    Account Provisioning
                                </h3>
                                <button onClick={() => { if (!successData) setShowUserModal(false); }} className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {!successData ? (
                                    <>
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl">👤</div>
                                            <div>
                                                <div className="text-white font-bold">{employee.full_name}</div>
                                                <div className="text-[10px] font-mono text-primary uppercase">Staff ID: {employee.code}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-primary uppercase tracking-widest ml-1">Temporary Password</label>
                                                <input
                                                    type="text"
                                                    className="input-pro"
                                                    value={userPassword}
                                                    onChange={(e) => setUserPassword(e.target.value)}
                                                    placeholder="LEAVE BLANK FOR AUTO-GENERATE"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-primary uppercase tracking-widest ml-1">Access Role</label>
                                                <select
                                                    className="input-pro bg-transparent"
                                                    value={userRole}
                                                    onChange={(e) => setUserRole(e.target.value)}
                                                >
                                                    <option value="EMPLOYEE" className="bg-[#0b0f15]">Standard Personnel</option>
                                                    <option value="HR" className="bg-[#0b0f15]">HR Administrator</option>
                                                    <option value="DEPT_MANAGER" className="bg-[#0b0f15]">Department Manager</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-6">
                                            <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-xl hover:bg-white/5 transition-all">Abort</button>
                                            <button onClick={handleCreateUser} disabled={creating} className="flex-1 btn-pro py-4 text-[10px] font-black tracking-widest shadow-lg shadow-primary/20">{creating ? 'PROVISIONING...' : 'Confirm'}</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400 text-3xl">
                                            <HiCheckCircle />
                                        </div>
                                        <h4 className="text-lg font-black text-white italic">SUCCESSFULLY LINKED</h4>
                                        <div className="p-4 rounded-xl bg-white/[0.03] space-y-2 text-left font-mono">
                                            <div className="text-[10px] text-primary">Username: {successData.user.username}</div>
                                            <div className="text-[10px] text-primary text-glow">Password: {successData.tempPassword}</div>
                                        </div>
                                        <button onClick={() => window.location.reload()} className="w-full btn-pro py-4 text-[10px] font-black tracking-widest">Close & Reload</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function InfoField({ label, value, className = '' }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1 opacity-40">{label}</p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm font-bold text-white transition-all hover:border-primary/20">
                {value || '---'}
            </div>
        </div>
    );
}

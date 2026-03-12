import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiPhone, FiMail, FiGlobe, FiMapPin, FiExternalLink,
    FiPlus, FiTrash2, FiStar, FiClock, FiCheckCircle, FiXCircle,
    FiPhoneCall, FiMessageSquare, FiCalendar, FiActivity, FiEdit3
} from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ── Status Config ─────────────────────────────────────────
const STATUS_CONFIG = {
    NEW:          { label: 'New',          color: 'bg-gray-500/15 text-gray-300 border-gray-500/30',     dot: 'bg-gray-400' },
    CONTACTED:    { label: 'Contacted',    color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',     dot: 'bg-blue-400' },
    INTERESTED:   { label: 'Interested',   color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
    CONVERTED:    { label: 'Converted',    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    REJECTED:     { label: 'Rejected',     color: 'bg-red-500/15 text-red-300 border-red-500/30',       dot: 'bg-red-400' },
};

const OUTCOME_CONFIG = {
    ANSWERED:       { label: 'Answered',       icon: <FiCheckCircle />, color: 'text-emerald-400' },
    NO_ANSWER:      { label: 'No Answer',      icon: <FiXCircle />,     color: 'text-gray-400' },
    BUSY:           { label: 'Busy',           icon: <FiPhoneCall />,   color: 'text-yellow-400' },
    INTERESTED:     { label: 'Interested',     icon: <FiStar />,        color: 'text-yellow-300' },
    NOT_INTERESTED: { label: 'Not Interested', icon: <FiXCircle />,     color: 'text-red-400' },
    FOLLOW_UP:      { label: 'Follow Up',      icon: <FiClock />,       color: 'text-blue-400' },
    CONVERTED:      { label: 'Converted',      icon: <FiCheckCircle />, color: 'text-emerald-300' },
};

const TYPE_ICON = {
    CALL:          <FiPhoneCall className="text-blue-400" />,
    EMAIL:         <FiMail className="text-purple-400" />,
    MEETING:       <FiCalendar className="text-emerald-400" />,
    NOTE:          <FiMessageSquare className="text-gray-400" />,
    STATUS_CHANGE: <FiActivity className="text-yellow-400" />,
};

// ── Log Activity Modal ────────────────────────────────────
function LogActivityModal({ isOpen, onClose, onSave, loading }) {
    const [form, setForm] = useState({ type: 'CALL', outcome: '', notes: '', next_follow_up: '', duration_minutes: '' });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = () => {
        if (!form.notes && !form.outcome) { toast.error('Add notes or select an outcome'); return; }
        onSave({ ...form, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null });
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-lg bg-gray-950 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl"><FiActivity /></span>
                    Log Activity
                </h2>

                {/* Type */}
                <div className="mb-5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Activity Type</label>
                    <div className="grid grid-cols-5 gap-2">
                        {['CALL','EMAIL','MEETING','NOTE','STATUS_CHANGE'].map(t => (
                            <button key={t} onClick={() => set('type', t)}
                                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${form.type === t ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>
                                {t.replace('_',' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Outcome (only for calls) */}
                {form.type === 'CALL' && (
                    <div className="mb-5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Outcome</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(OUTCOME_CONFIG).map(([key, cfg]) => (
                                <button key={key} onClick={() => set('outcome', key)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${form.outcome === key ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/5 text-gray-500 hover:border-white/10'}`}>
                                    <span className={cfg.color}>{cfg.icon}</span>{cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Duration (for calls) */}
                {form.type === 'CALL' && (
                    <div className="mb-5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Duration (minutes)</label>
                        <input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                )}

                {/* Notes */}
                <div className="mb-5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Notes</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                        rows={4} placeholder="What happened? What was discussed? ..."
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all resize-none" />
                </div>

                {/* Next Follow-up */}
                <div className="mb-6">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Next Follow-up Date</label>
                    <input type="date" value={form.next_follow_up} onChange={e => set('next_follow_up', e.target.value)}
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all" />
                </div>

                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={loading}
                        className="flex-1 py-3 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50">
                        {loading ? 'Saving...' : '✔ Save Activity'}
                    </button>
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-black text-sm border border-white/8 text-gray-400 hover:text-white hover:border-white/20 transition-all">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Activity Item ─────────────────────────────────────────
function ActivityItem({ activity, onDelete, canDelete }) {
    const outcome = activity.outcome ? OUTCOME_CONFIG[activity.outcome] : null;
    const typeIcon = TYPE_ICON[activity.type] || <FiMessageSquare />;
    const date = new Date(activity.created_at || activity.createdAt);

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 group">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-gray-900 border border-white/8 flex items-center justify-center text-base flex-shrink-0">
                    {typeIcon}
                </div>
                <div className="w-px flex-1 bg-white/5 mt-2" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                {activity.type?.replace('_', ' ')}
                            </span>
                            {outcome && (
                                <span className={`flex items-center gap-1 text-xs font-bold ${outcome.color}`}>
                                    {outcome.icon} {outcome.label}
                                </span>
                            )}
                            {activity.duration_minutes && (
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <FiClock size={10} /> {activity.duration_minutes}m
                                </span>
                            )}
                        </div>
                        {canDelete && (
                            <button onClick={() => onDelete(activity.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-500/10">
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>

                    {activity.notes && (
                        <p className="text-sm text-gray-300 leading-relaxed mb-2">{activity.notes}</p>
                    )}

                    {activity.next_follow_up && (
                        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 rounded-lg px-3 py-1.5 w-fit">
                            <FiCalendar size={11} />
                            Follow-up: {new Date(activity.next_follow_up).toLocaleDateString()}
                        </div>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <span>{activity.User?.full_name || 'You'}</span>
                        <span>·</span>
                        <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────
export default function LeadDetailPage() {
    const { leadId } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actLoading, setActLoading] = useState(false);
    const [quickNote, setQuickNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [logModal, setLogModal] = useState(false);
    const [statusChanging, setStatusChanging] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    useEffect(() => { fetchAll(); }, [leadId]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [leadRes, actRes] = await Promise.all([
                api.get(`/leads/${leadId}`),
                api.get(`/leads/${leadId}/activities`)
            ]);
            setLead(leadRes.data.data || leadRes.data);
            setActivities(actRes.data.data || actRes.data || []);
        } catch (err) {
            toast.error('Failed to load lead details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setShowStatusMenu(false);
        if (newStatus === lead.status) return;
        setStatusChanging(true);
        try {
            const res = await api.patch(`/leads/${leadId}/status`, { status: newStatus });
            setLead(prev => ({ ...prev, status: newStatus }));
            const newActivity = await api.get(`/leads/${leadId}/activities`);
            setActivities(newActivity.data.data || []);
            toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setStatusChanging(false);
        }
    };

    const handleSaveQuickNote = async () => {
        if (!quickNote.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.post(`/leads/${leadId}/activities`, { type: 'NOTE', notes: quickNote });
            setActivities(prev => [res.data.data, ...prev]);
            setQuickNote('');
            toast.success('Note saved!');
        } catch (err) {
            toast.error('Failed to save note');
        } finally {
            setSavingNote(false);
        }
    };

    const handleLogActivity = async (form) => {
        setActLoading(true);
        try {
            const res = await api.post(`/leads/${leadId}/activities`, form);
            setActivities(prev => [res.data.data, ...prev]);
            setLogModal(false);
            toast.success('Activity logged!');
        } catch (err) {
            toast.error('Failed to log activity');
        } finally {
            setActLoading(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!confirm('Delete this activity?')) return;
        try {
            await api.delete(`/leads/${leadId}/activities/${activityId}`);
            setActivities(prev => prev.filter(a => a.id !== activityId));
            toast.success('Deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-60 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-3xl" />
            <div className="h-80 bg-gray-800 rounded-3xl" />
        </div>
    );

    if (!lead) return (
        <div className="text-center py-20 text-gray-500">Lead not found</div>
    );

    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

    return (
        <>
            <LogActivityModal isOpen={logModal} onClose={() => setLogModal(false)} onSave={handleLogActivity} loading={actLoading} />

            <div className="max-w-4xl mx-auto space-y-6 pb-16" onClick={() => setShowStatusMenu(false)}>

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group text-sm font-bold">
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                {/* ── Header Card ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 border border-white/8 rounded-3xl p-8">

                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-black text-white mb-2 truncate">{lead.business_name}</h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                {lead.Category && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
                                        {lead.Category.name}
                                    </span>
                                )}
                                {lead.Subcategory && (
                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold">
                                        {lead.Subcategory.name}
                                    </span>
                                )}
                                {lead.rating > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                        <FiStar size={11} /> {lead.rating} ({lead.review_count || 0})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setShowStatusMenu(v => !v); }}
                                disabled={statusChanging}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black transition-all hover:opacity-80 ${statusCfg.color}`}>
                                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                                {statusCfg.label}
                                <FiEdit3 size={12} className="opacity-60" />
                            </button>
                            <AnimatePresence>
                                {showStatusMenu && (
                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                        onClick={e => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-2 z-50 bg-gray-950 border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[180px]">
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <button key={key} onClick={() => handleStatusChange(key)}
                                                className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${lead.status === key ? 'bg-white/8 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
                        {lead.phone && (
                            <a href={`tel:${lead.phone}`}
                                className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl group hover:border-emerald-500/40 transition-all">
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-all">
                                    <FiPhone />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Phone</p>
                                    <p className="text-sm font-bold text-white font-mono truncate">{lead.phone}</p>
                                </div>
                            </a>
                        )}
                        {lead.email && (
                            <a href={`mailto:${lead.email}`}
                                className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/15 p-4 rounded-2xl group hover:border-blue-500/40 transition-all">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-all">
                                    <FiMail />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-bold text-white truncate">{lead.email}</p>
                                </div>
                            </a>
                        )}
                        {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/15 p-4 rounded-2xl group hover:border-purple-500/40 transition-all">
                                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition-all">
                                    <FiGlobe />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Website</p>
                                    <p className="text-sm font-bold text-purple-300 truncate flex items-center gap-1">
                                        {lead.website.replace(/^https?:\/\//, '')} <FiExternalLink size={10} />
                                    </p>
                                </div>
                            </a>
                        )}
                        {(lead.address || lead.city) && (
                            <a href={lead.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(lead.formatted_address || lead.address)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-orange-500/5 border border-orange-500/15 p-4 rounded-2xl group hover:border-orange-500/40 transition-all">
                                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl group-hover:bg-orange-500/20 transition-all">
                                    <FiMapPin />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-white truncate">{lead.city || lead.address}</p>
                                </div>
                            </a>
                        )}
                    </div>
                </motion.div>

                {/* ── Activity Section ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-gray-900/50 border border-white/8 rounded-3xl p-8">

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black flex items-center gap-3">
                            <span className="p-2 bg-blue-600/15 text-blue-400 rounded-xl"><FiActivity /></span>
                            Activity Log
                            {activities.length > 0 && (
                                <span className="text-xs font-black px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">{activities.length}</span>
                            )}
                        </h2>
                        <button onClick={() => setLogModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-900/30">
                            <FiPlus /> Log Call / Activity
                        </button>
                    </div>

                    {/* Quick Note */}
                    <div className="mb-8 bg-gray-950/50 border border-white/5 rounded-2xl p-4">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">✏️ Quick Note</p>
                        <textarea
                            value={quickNote}
                            onChange={e => setQuickNote(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSaveQuickNote(); }}
                            rows={2}
                            placeholder="Type a quick note... (Ctrl+Enter to save)"
                            className="w-full bg-transparent text-sm text-gray-300 outline-none resize-none placeholder-gray-700"
                        />
                        {quickNote.trim() && (
                            <div className="flex justify-end mt-2">
                                <button onClick={handleSaveQuickNote} disabled={savingNote}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50">
                                    {savingNote ? 'Saving...' : '💾 Save Note'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feed */}
                    {activities.length === 0 ? (
                        <div className="text-center py-16 text-gray-600">
                            <FiActivity className="mx-auto text-4xl mb-3 opacity-30" />
                            <p className="text-sm font-bold uppercase tracking-widest">No activities yet</p>
                            <p className="text-xs mt-1 text-gray-700">Log a call or add a note to start tracking</p>
                        </div>
                    ) : (
                        <div>
                            {activities.map(activity => (
                                <ActivityItem key={activity.id} activity={activity}
                                    onDelete={handleDeleteActivity} canDelete={true} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiShieldCheck, HiOutlineViewGrid, HiLightningBolt, HiStatusOnline,
    HiChatAlt2, HiLockClosed, HiCloudUpload, HiScale, HiPlus, HiX, HiCheck,
    HiTrash, HiOfficeBuilding, HiUsers, HiMicrophone, HiRefresh, HiClock
} from 'react-icons/hi';
import apiService from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel-pro p-6 relative overflow-hidden group border-white/5 hover:border-primary/30 transition-all">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-3xl translate-x-8 -translate-y-8`} />
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-glow">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 text-${color}`}>
                <Icon className="text-xl" />
            </div>
        </div>
    </div>
);

const ToggleSetting = ({ label, description, icon: Icon, value, onChange, loading }) => (
    <div className="glass-panel-pro p-6 border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-8">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                <Icon className="text-xl" />
            </div>
            <div>
                <h4 className="font-bold text-white/90">{label}</h4>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">{description}</p>
            </div>
        </div>
        <button
            disabled={loading}
            onClick={() => onChange(!value)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${value ? 'bg-primary' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${value ? 'left-7 shadow-lg' : 'left-1'}`} />
        </button>
    </div>
);

export default function ChatControlPage() {
    const [stats, setStats] = useState({ total_messages: 0, active_users_24h: 0, total_rooms: 0 });
    const [policies, setPolicies] = useState({});
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Presence Config State
    const [presenceConfig, setPresenceConfig] = useState(null);
    const [savingPresence, setSavingPresence] = useState(false);
    const [presenceMessage, setPresenceMessage] = useState('');

    // Metadata for creation
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);

    const [formType, setFormType] = useState('group'); // group, department, announcement
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        department_id: '',
        member_ids: []
    });

    useEffect(() => {
        fetchData();
        fetchMetadata();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, policiesRes, roomsRes] = await Promise.all([
                apiService.get('/chat/analytics'),
                apiService.get('/chat/policies'),
                apiService.get('/admin/chat/rooms'),
            ]);
            setStats(statsRes.data.analytics);
            setPolicies(policiesRes.data.policies);
            setRooms(roomsRes.data.rooms.filter(r => r.room_type !== 'dm'));
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
        // /config is optional — don't block the main load if it's missing
        try {
            const configRes = await apiService.get('/config');
            setPresenceConfig(configRes.data?.config?.presence || null);
        } catch {
            // /config endpoint not available — presence section will be hidden
        }
    };

    const fetchMetadata = async () => {
        try {
            const [deptRes, userRes] = await Promise.all([
                apiService.get('/departments'),
                apiService.get('/users')
            ]);
            setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
            // /users may return paginated {data: [...]} or flat array
            const userList = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
            setUsers(userList);
        } catch (error) {
            console.error('Metadata fetch error:', error);
        }
    };

    const handleTogglePolicy = async (key, value) => {
        setUpdating(true);
        try {
            const updatedPolicies = { ...policies, [key]: value ? 'true' : 'false' };
            await apiService.put('/chat/policies', { policies: { [key]: value ? 'true' : 'false' } });
            setPolicies(updatedPolicies);
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleRoom = async (roomId, field, value) => {
        try {
            await apiService.put(`/admin/chat/rooms/${roomId}`, { [field]: value });
            setRooms(rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r));
        } catch (error) {
            console.error('Room update error:', error);
        }
    };

    const handleCreateRoom = async () => {
        setUpdating(true);
        try {
            await apiService.post('/chat/rooms', {
                type: formType,
                ...formData
            });
            setShowCreateModal(false);
            fetchData();
            // Reset form
            setFormData({ name: '', description: '', department_id: '', member_ids: [] });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create channel');
        } finally {
            setUpdating(false);
        }
    };

    const handleSavePresence = async () => {
        setSavingPresence(true);
        setPresenceMessage('');
        try {
            await apiService.put('/admin/config/presence', {
                labels: presenceConfig.labels,
                thresholds: presenceConfig.thresholds
            });
            setPresenceMessage('Presence configuration synchronized.');
            setTimeout(() => setPresenceMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save config:', error);
            setPresenceMessage('Failed to save presence config.');
        } finally {
            setSavingPresence(false);
        }
    };

    const updatePresenceLabel = (status, value) => {
        setPresenceConfig(prev => ({
            ...prev,
            labels: { ...prev.labels, [status]: value }
        }));
    };

    const updatePresenceThreshold = (value) => {
        setPresenceConfig(prev => ({
            ...prev,
            thresholds: { ...prev.thresholds, idleMinutes: parseInt(value) || 5 }
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Syncing Control Plane</span>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-glow flex items-center gap-3">
                        <HiShieldCheck className="text-primary" />
                        Communication Center
                    </h1>
                    <p className="text-text-secondary italic">Control plane for internal communications, presence logic, and policy enforcement.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-pro flex items-center gap-2"
                >
                    <HiPlus />
                    <span>Establish Channel</span>
                </button>
            </header>

            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Communication Volume"
                    value={stats.total_messages}
                    icon={HiChatAlt2}
                    color="primary"
                />
                <StatCard
                    title="Active Participants"
                    value={stats.active_users_24h}
                    icon={HiStatusOnline}
                    color="green-400"
                />
                <StatCard
                    title="Operational Channels"
                    value={stats.total_rooms}
                    icon={HiOutlineViewGrid}
                    color="accent"
                />
            </div>

            {/* Channels Table */}
            <div className="glass-panel-pro overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Active Communication Channels</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 whitespace-nowrap">Channel</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 whitespace-nowrap">Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 whitespace-nowrap">Stats</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 whitespace-nowrap">Governance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/10 ${room.room_type === 'department' ? 'text-blue-400 bg-blue-400/10' :
                                                room.room_type === 'announcement' ? 'text-yellow-400 bg-yellow-400/10' :
                                                    room.room_type === 'dm' ? 'text-primary bg-primary/10' : 'text-accent bg-accent/10'
                                                }`}>
                                                {room.room_type === 'department' ? <HiOfficeBuilding /> :
                                                    room.room_type === 'announcement' ? <HiMicrophone /> :
                                                        room.room_type === 'dm' ? <HiChatAlt2 /> : <HiUsers />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-white block">
                                                    {room.name || (room.room_type === 'dm' ? 'Direct Message' : 'Untitled')}
                                                </span>
                                                <span className="text-[10px] text-text-secondary uppercase">
                                                    {room.room_type === 'department' ? room.Department?.name : room.room_type}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${room.room_type === 'department' ? 'text-blue-400 border-blue-400/20' :
                                            room.room_type === 'announcement' ? 'text-yellow-400 border-yellow-400/20' :
                                                'text-text-secondary border-white/10'
                                            }`}>
                                            {room.room_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-mono text-white/60">{room.member_count} Members</span>
                                            <span className="text-[10px] text-text-secondary">{room.message_count} Messages</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover/toggle:text-primary transition-colors">ReadOnly</span>
                                                <input
                                                    type="checkbox"
                                                    checked={room.is_read_only}
                                                    onChange={(e) => handleToggleRoom(room.id, 'is_read_only', e.target.checked)}
                                                    className="w-4 h-4 rounded border-white/20 bg-black text-primary transition-all"
                                                />
                                            </label>
                                            <button
                                                onClick={() => handleToggleRoom(room.id, 'is_active', !room.is_active)}
                                                className={`p-2 rounded-lg border transition-all ${room.is_active ? 'text-green-400 border-green-400/20 hover:bg-red-400/10 hover:text-red-400' : 'text-red-400 border-red-400/20 hover:bg-green-400/10 hover:text-green-400'
                                                    }`}
                                                title={room.is_active ? 'Archive' : 'Restore'}
                                            >
                                                {room.is_active ? <HiCheck /> : <HiX />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Presence Management Integrated Section */}
            {presenceConfig && (
                <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                            <HiStatusOnline className="text-primary" />
                            Presence Configuration
                        </h4>
                        <button
                            onClick={handleSavePresence}
                            disabled={savingPresence}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            {savingPresence ? <HiRefresh className="animate-spin" /> : <HiCheck />}
                            {savingPresence ? 'Syncing...' : 'Update Presence Kernels'}
                        </button>
                    </div>

                    {presenceMessage && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`text-[10px] font-bold uppercase tracking-widest text-center py-2 rounded-lg ${presenceMessage.includes('Failed') ? 'text-red-400 bg-red-400/5' : 'text-green-400 bg-green-400/5'}`}>
                            {presenceMessage}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel-pro p-6 space-y-4">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status Identifiers</p>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(presenceConfig.labels).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(key)}`} />
                                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter">{key}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => updatePresenceLabel(key, e.target.value)}
                                            className="input-pro py-2 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel-pro p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Automation Logic</p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-secondary flex items-center gap-2">
                                        <HiClock className="text-accent" /> Auto-Idle Threshold (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={presenceConfig.thresholds.idleMinutes}
                                        onChange={(e) => updatePresenceThreshold(e.target.value)}
                                        className="input-pro py-2"
                                        min="1"
                                        max="60"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Live Preview</span>
                                <div className="flex gap-3">
                                    {Object.entries(presenceConfig.labels).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(key)}`} />
                                            <span className="text-[9px] font-bold text-white/60">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Policy Controls */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                        <HiLockClosed className="text-primary" />
                        Governance Protocols
                    </h4>

                    <div className="space-y-4">
                        <ToggleSetting
                            label="Direct Messaging (DM)"
                            description="Allow employees to initiate private 1-to-1 encrypted conversations."
                            icon={HiLightningBolt}
                            value={policies.dm_enabled === 'true'}
                            onChange={(v) => handleTogglePolicy('dm_enabled', v)}
                            loading={updating}
                        />
                        <ToggleSetting
                            label="File Transmission"
                            description="Enable users to upload and share files through message channels."
                            icon={HiCloudUpload}
                            value={policies.file_upload_enabled === 'true'}
                            onChange={(v) => handleTogglePolicy('file_upload_enabled', v)}
                            loading={updating}
                        />
                    </div>
                </div>

                {/* Privacy Shield Info */}
                <div className="space-y-6">
                    <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                        <HiScale className="text-accent" />
                        Management Rules
                    </h1>
                    <div className="glass-panel-pro p-8 bg-black/20 border border-white/5 rounded-3xl">
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_var(--primary)]" />
                                <div className="text-sm">
                                    <span className="text-white font-bold block mb-1">Administrative Privacy Shield</span>
                                    <p className="text-text-secondary text-xs leading-relaxed">
                                        Administrators have NO visibility into message content in employee channels. Access is restricted to metadata only.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shadow-[0_0_8px_var(--accent)]" />
                                <div className="text-sm">
                                    <span className="text-white font-bold block mb-1">Centralized Structure</span>
                                    <p className="text-text-secondary text-xs leading-relaxed">
                                        Only administrators can manifest Department, Group, or Announcement channels. Employees cannot deviate from the defined structure.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel-pro p-8 max-w-lg w-full relative z-[101]">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <HiPlus className="text-primary" /> Manifest New Channel
                            </h2>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    {['group', 'department', 'announcement'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFormType(t)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${formType === t ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/10 text-text-secondary'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    className="input-pro py-3"
                                    placeholder="Channel Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />

                                {formType === 'department' && (
                                    <select
                                        className="input-pro py-3"
                                        value={formData.department_id}
                                        onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                                    >
                                        <option value="">Link to Department...</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                )}

                                {formType !== 'department' && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Assign Initial Operators</p>
                                        <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-xl bg-black/40 border border-white/5 custom-scrollbar">
                                            {users.map(u => (
                                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.member_ids.includes(u.id)}
                                                        onChange={e => {
                                                            const ids = e.target.checked
                                                                ? [...formData.member_ids, u.id]
                                                                : formData.member_ids.filter(id => id !== u.id);
                                                            setFormData({ ...formData, member_ids: ids });
                                                        }}
                                                        className="w-4 h-4 rounded border-white/20 bg-black text-primary"
                                                    />
                                                    <span className="text-xs">{u.full_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button disabled={updating} onClick={handleCreateRoom} className="btn-pro flex-1 h-12 uppercase tracking-widest font-black text-xs">Establish Channel</button>
                                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all uppercase tracking-widest font-black text-[10px]">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getStatusColor(status) {
    switch (status) {
        case 'available': return 'bg-green-500 shadow-[0_0_8px_#22c55e]';
        case 'idle': return 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
        case 'busy': return 'bg-red-500 shadow-[0_0_8px_#ef4444]';
        case 'meeting': return 'bg-orange-500 shadow-[0_0_8px_#f97316]';
        case 'invisible': return 'bg-gray-400 shadow-[0_0_8px_#9ca3af]';
        default: return 'bg-gray-500';
    }
}

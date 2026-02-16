import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiShieldCheck, HiFingerPrint, HiAdjustments, HiX, HiCheck, HiLockClosed } from 'react-icons/hi';
import api from '../../services/api';

export default function RoleManagementPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedPermissions: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/admin/roles'),
                api.get('/admin/permissions')
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                selectedPermissions: role.Permissions.map(p => p.id)
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                selectedPermissions: []
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRole(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingRole) {
                await api.put(`/admin/roles/${editingRole.id}`, {
                    name: formData.name,
                    description: formData.description
                });
                await api.put(`/admin/roles/${editingRole.id}/permissions`, {
                    permission_ids: formData.selectedPermissions
                });
            } else {
                const createRes = await api.post('/admin/roles', {
                    name: formData.name,
                    description: formData.description
                });
                await api.put(`/admin/roles/${createRes.data.id}/permissions`, {
                    permission_ids: formData.selectedPermissions
                });
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Failed to save role:', error);
            alert(error.response?.data?.error || 'Failed to save role');
        }
    };

    const deleteRole = async (id) => {
        if (!confirm('Erase this authorization segment? This will impact all nested operators.')) return;
        try {
            await api.delete(`/admin/roles/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete role:', error);
            alert(error.response?.data?.error || 'Failed to delete role');
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => ({
            ...prev,
            selectedPermissions: prev.selectedPermissions.includes(permId)
                ? prev.selectedPermissions.filter(id => id !== permId)
                : [...prev.selectedPermissions, permId]
        }));
    };

    const toggleCategory = (category) => {
        const categoryPerms = permissions.filter(p => p.category === category).map(p => p.id);
        const allSelected = categoryPerms.every(id => formData.selectedPermissions.includes(id));

        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                selectedPermissions: prev.selectedPermissions.filter(id => !categoryPerms.includes(id))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedPermissions: [...new Set([...prev.selectedPermissions, ...categoryPerms])]
            }));
        }
    };

    const permissionsByCategory = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary animate-pulse">Compiling ACL Mesh</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-glow flex items-center gap-3">
                        <HiLockClosed className="text-primary" />
                        Auth Tiers
                    </h1>
                    <p className="text-text-secondary">Orchestrate role clusters and granular permission inheritance.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn-pro flex items-center gap-2 group"
                >
                    <HiPlus className="group-hover:rotate-90 transition-transform" />
                    <span>Synthesize Tier</span>
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {roles.map((role, idx) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-panel-pro p-8 relative overflow-hidden group hover:border-primary/30 transition-all"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <HiFingerPrint className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-glow transition-all">{role.name}</h3>
                                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-text-secondary">
                                                {role.Permissions?.length || 0} DEPLOYED_NODES
                                            </div>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">{role.description || 'No descriptive metadata provided.'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {role.Permissions?.slice(0, 12).map(perm => (
                                        <div
                                            key={perm.id}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${perm.is_sensitive
                                                    ? 'bg-red-500/5 text-red-500 border-red-500/20'
                                                    : 'bg-primary/5 text-primary border-primary/20'
                                                }`}
                                        >
                                            {perm.is_sensitive && <HiShieldCheck className="text-xs" />}
                                            {perm.key}
                                        </div>
                                    ))}
                                    {role.Permissions?.length > 12 && (
                                        <div className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/30 border border-white/5">
                                            + {role.Permissions.length - 12} FRAGMENTS
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => openModal(role)}
                                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-primary border border-white/5 flex items-center justify-center text-xl transition-all"
                                    title="Modulate"
                                >
                                    <HiPencil />
                                </button>
                                <button
                                    onClick={() => deleteRole(role.id)}
                                    className="w-12 h-12 rounded-2xl bg-red-500/5 hover:bg-red-500/20 text-red-400 border border-red-500/10 flex items-center justify-center text-xl transition-all"
                                    title="Purge"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 lg:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="glass-panel-pro p-8 lg:p-12 max-w-6xl w-full max-h-[90vh] relative z-[101] border-primary/20 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter text-glow">
                                        {editingRole ? 'Tier Modulation' : 'New Tier Synthesis'}
                                    </h2>
                                    <p className="text-xs text-text-secondary uppercase tracking-widest mt-1">Configure authorization vectors and sensitivity overrides</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors"
                                >
                                    <HiX className="text-3xl" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Tier Designation (UPPERCASE)</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                            className="input-pro py-4 font-mono font-bold tracking-widest text-lg"
                                            placeholder="LEVEL_X_OPS"
                                            disabled={editingRole !== null}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Strategic Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-pro py-4"
                                            placeholder="Describe the operational scope..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <HiAdjustments className="text-2xl text-primary" />
                                        <h3 className="text-xl font-black uppercase tracking-widest text-white/90">Permission Matrix</h3>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>

                                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                                        <div key={category} className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                                    {category} SECURITY_GROUP
                                                </h4>
                                                <button
                                                    onClick={() => toggleCategory(category)}
                                                    className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors py-1 px-3 rounded-lg border border-white/5 hover:bg-white/5"
                                                >
                                                    {perms.every(p => formData.selectedPermissions.includes(p.id)) ? 'Invert Sector' : 'Authorize Sector'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {perms.map(perm => (
                                                    <label
                                                        key={perm.id}
                                                        className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${formData.selectedPermissions.includes(perm.id)
                                                                ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                                                                : 'bg-white/2 border-white/5 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className="mt-1 relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.selectedPermissions.includes(perm.id)}
                                                                onChange={() => togglePermission(perm.id)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${formData.selectedPermissions.includes(perm.id)
                                                                    ? 'bg-primary border-primary'
                                                                    : 'bg-transparent border-white/20'
                                                                }`}>
                                                                {formData.selectedPermissions.includes(perm.id) && <HiCheck className="text-white text-xs" />}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-black uppercase tracking-tight text-white truncate">{perm.key}</span>
                                                                {perm.is_sensitive && (
                                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase">
                                                                        <HiShieldCheck /> CRIT
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-text-secondary leading-normal">{perm.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10 pt-8 border-t border-white/5">
                                <button
                                    onClick={handleSubmit}
                                    className="btn-pro flex-1 h-14 font-black tracking-[0.2em] uppercase text-xs"
                                >
                                    {editingRole ? 'Commit Tier modulation' : 'Verify & Initialize Tier'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

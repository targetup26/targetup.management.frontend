import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiServer, HiSave, HiCheckCircle, HiExclamation, HiPlus, HiPencil, HiTrash, HiX, HiStatusOnline } from 'react-icons/hi';
import api from '../../services/api';

export default function StorageSettingsPage() {
    const [departments, setDepartments] = useState([]);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // id of department being saved

    const [showServerModal, setShowServerModal] = useState(false);
    const [editingServer, setEditingServer] = useState(null);
    const [serverFormData, setServerFormData] = useState({
        name: '', ip_address: '', port: 3001, storage_path: 'C:\\TargetStorage', total_capacity_gb: 500, is_active: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/storage/settings');
            setDepartments(response.data.departments);
            setServers(response.data.servers);
        } catch (error) {
            console.error('Failed to load storage settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const openServerModal = (server = null) => {
        if (server) {
            setEditingServer(server);
            setServerFormData({ ...server });
        } else {
            setEditingServer(null);
            setServerFormData({
                name: '', ip_address: '', port: 3001, storage_path: 'C:\\TargetStorage', total_capacity_gb: 500, is_active: true
            });
        }
        setShowServerModal(true);
    };

    const handleSaveServer = async (e) => {
        e.preventDefault();
        try {
            if (editingServer) {
                await api.put(`/storage/servers/${editingServer.id}`, serverFormData);
            } else {
                await api.post('/storage/servers', serverFormData);
            }
            setShowServerModal(false);
            await loadSettings();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to save server');
        }
    };

    const handleDeleteServer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this storage node?')) return;
        try {
            await api.delete(`/storage/servers/${id}`);
            await loadSettings();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete server');
        }
    };

    const handleUpdate = async (dept) => {
        setSaving(dept.id);
        try {
            const serverSelect = document.getElementById(`server-${dept.id}`);
            const quotaInput = document.getElementById(`quota-${dept.id}`);

            await api.post('/storage/settings', {
                department_id: dept.id,
                server_id: serverSelect.value,
                quota_mb: quotaInput.value
            });

            await loadSettings();
        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Failed to update: ' + error.message);
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-full gap-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
                <p className="text-text-secondary animate-pulse font-medium tracking-widest uppercase text-xs">Syncing Storage Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-glow mb-2 flex items-center gap-3">
                        <HiServer className="text-primary" />
                        Storage Topology
                    </h1>
                    <p className="text-text-secondary">Configure distributed storage nodes and department quotas.</p>
                </div>
            </header>

            <div className="glass-panel-pro overflow-hidden">
                {/* --- Table Header Decoration --- */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left bg-white/[0.02]">
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Department</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Active Node</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Storage Quota</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Sync Status</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {departments.map(dept => {
                                const currentServerId = dept.DepartmentStorage?.server_id || (servers.length > 0 ? servers[0].id : '');
                                const currentQuota = dept.DepartmentStorage?.quota_mb || 10000;
                                const isConfigured = !!dept.DepartmentStorage;

                                return (
                                    <motion.tr
                                        key={dept.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-white/[0.03] transition-colors"
                                    >
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg group-hover:text-primary transition-colors">{dept.name}</span>
                                                <span className="text-[10px] text-text-secondary uppercase tracking-tighter">ID: {dept.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="relative w-64">
                                                <select
                                                    id={`server-${dept.id}`}
                                                    defaultValue={currentServerId}
                                                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    {servers.map(server => (
                                                        <option key={server.id} value={server.id} className="bg-background text-white">
                                                            {server.name} — {server.ip_address}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                                    <HiServer />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    id={`quota-${dept.id}`}
                                                    defaultValue={currentQuota}
                                                    className="w-28 bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                                />
                                                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">MB</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {isConfigured ? (
                                                <div className="flex items-center gap-2 text-green-400 bg-green-400/5 px-3 py-1.5 rounded-full border border-green-400/20 w-fit">
                                                    <HiCheckCircle className="text-lg" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/5 px-3 py-1.5 rounded-full border border-yellow-400/20 w-fit">
                                                    <HiExclamation className="text-lg" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Fallback</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleUpdate(dept)}
                                                disabled={saving === dept.id}
                                                className="btn-pro min-w-[100px] flex items-center justify-center gap-2 group-hover:scale-105"
                                            >
                                                {saving === dept.id ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <HiSave className="text-lg" />
                                                        <span className="text-sm">Apply</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {departments.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.01]">
                        <HiServer className="text-6xl text-white/5 mx-auto mb-4" />
                        <p className="text-text-secondary font-medium italic tracking-widest">No topological nodes detected.</p>
                    </div>
                )}
            </div>

            {/* --- STORAGE NODES MANAGEMENT --- */}
            <div className="flex justify-between items-end mt-12 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <HiServer className="text-primary" />
                        Storage Nodes
                    </h2>
                    <p className="text-text-secondary text-sm">Manage physical and virtual storage servers across your infrastructure.</p>
                </div>
                <button onClick={() => openServerModal()} className="btn-pro flex items-center justify-center gap-2">
                    <HiPlus className="text-lg" />
                    <span>Add Server Node</span>
                </button>
            </div>

            <div className="glass-panel-pro overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-500 via-primary to-green-500 opacity-50" />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left bg-white/[0.02]">
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Server Name</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">IP & Port</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Capacity</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5">Status</th>
                                <th className="p-6 text-xs uppercase tracking-[0.2em] text-white/40 font-bold border-b border-white/5 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {servers.map(server => (
                                <tr key={server.id} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg">{server.name}</span>
                                            <span className="text-[10px] text-text-secondary font-mono bg-white/5 px-2 py-0.5 rounded w-fit mt-1">{server.storage_path}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm text-blue-300">{server.ip_address}</span>
                                            <span className="text-text-secondary text-xs">:{server.port}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${Math.min(100, (server.used_capacity_gb / server.total_capacity_gb) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-text-secondary font-bold">
                                                {Number(server.used_capacity_gb).toFixed(1)} / {server.total_capacity_gb} GB
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {server.is_active ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <HiStatusOnline className="animate-pulse" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Online</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-400">
                                                <HiExclamation />
                                                <span className="text-xs font-bold uppercase tracking-wider">Offline</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => openServerModal(server)} className="p-2 text-white/40 hover:text-primary transition-colors bg-white/5 rounded-lg">
                                                <HiPencil />
                                            </button>
                                            <button onClick={() => handleDeleteServer(server.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors bg-white/5 rounded-lg">
                                                <HiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {servers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        <p className="text-text-secondary italic">No storage servers available. Add one above.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SERVER MODAL */}
            <AnimatePresence>
                {showServerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowServerModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-panel-pro relative w-full max-w-lg p-8 border border-white/10 shadow-2xl"
                        >
                            <button 
                                onClick={() => setShowServerModal(false)}
                                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                            >
                                <HiX className="text-2xl" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <HiServer className="text-primary" />
                                {editingServer ? 'Edit Storage Node' : 'Add Storage Node'}
                            </h2>

                            <form onSubmit={handleSaveServer} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Server Name</label>
                                    <input 
                                        type="text" required 
                                        value={serverFormData.name} 
                                        onChange={e => setServerFormData({...serverFormData, name: e.target.value})}
                                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors"
                                        placeholder="e.g. Node-Alpha-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">IP Address</label>
                                        <input 
                                            type="text" required 
                                            value={serverFormData.ip_address} 
                                            onChange={e => setServerFormData({...serverFormData, ip_address: e.target.value})}
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-mono transition-colors"
                                            placeholder="192.168.1.10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Port</label>
                                        <input 
                                            type="number" required 
                                            value={serverFormData.port} 
                                            onChange={e => setServerFormData({...serverFormData, port: Number(e.target.value)})}
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-mono transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Storage Path (Agent Root)</label>
                                    <input 
                                        type="text" required 
                                        value={serverFormData.storage_path} 
                                        onChange={e => setServerFormData({...serverFormData, storage_path: e.target.value})}
                                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-mono transition-colors"
                                        placeholder="C:\TargetStorage"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Total Capacity (GB)</label>
                                        <input 
                                            type="number" required 
                                            value={serverFormData.total_capacity_gb} 
                                            onChange={e => setServerFormData({...serverFormData, total_capacity_gb: Number(e.target.value)})}
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center h-full pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" className="sr-only peer"
                                                    checked={serverFormData.is_active}
                                                    onChange={e => setServerFormData({...serverFormData, is_active: e.target.checked})}
                                                />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </div>
                                            <span className="text-sm font-medium text-white">Active Node</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowServerModal(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-pro px-8 border-none pointer-events-auto filter saturate-150">
                                        Save Node
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="glass-panel-pro p-6 flex items-center justify-between border-primary/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                        <HiServer className="text-2xl text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold">Total Nodes: {servers.length}</h4>
                        <p className="text-xs text-text-secondary tracking-tight">Active storage infrastructure health is monitored in real-time.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                </div>
            </footer>
        </div>
    );
}

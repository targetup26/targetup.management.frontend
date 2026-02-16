import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiServer, HiSave, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import api from '../../services/api';

export default function StorageSettingsPage() {
    const [departments, setDepartments] = useState([]);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // id of department being saved

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

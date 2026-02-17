import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiStatusOnline, HiRefresh, HiUser, HiDesktopComputer, HiChip, HiFingerPrint, HiXCircle, HiPlus, HiPencil, HiTrash, HiCheck, HiClock } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import clsx from 'clsx';

export default function NetworkMonitorPage() {
    const { t } = useTranslation();
    const [devices, setDevices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [lastScanTime, setLastScanTime] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        mac_address: '',
        employee_id: ''
    });

    const isOnline = (device, minutes = 15) => {
        if (!device) return false;
        const lastSeen = device.last_seen_at ? new Date(device.last_seen_at).getTime() : 0;
        const lastHeartbeat = device.last_heartbeat ? new Date(device.last_heartbeat).getTime() : 0;
        const mostRecent = Math.max(lastSeen, lastHeartbeat);
        if (mostRecent === 0) return false;
        const diff = new Date().getTime() - mostRecent;
        return diff < minutes * 60 * 1000;
    };

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/devices');
            const sorted = (res.data || []).sort((a, b) => {
                const aOnline = isOnline(a);
                const bOnline = isOnline(b);
                if (aOnline && !bOnline) return -1;
                if (!aOnline && bOnline) return 1;
                return 0;
            });
            setDevices(sorted);

            // Update last scan time based on the most recent last_seen_at
            const lastSeenArray = (res.data || []).map(d => d.last_seen_at ? new Date(d.last_seen_at).getTime() : 0);
            const latest = Math.max(...lastSeenArray);
            if (latest > 0) setLastScanTime(new Date(latest));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            // Backend returns { data: [], meta: {} } for paginated employees
            const employeeList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setEmployees(employeeList);
        } catch (err) {
            console.error(err);
            setEmployees([]);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        try {
            await api.get('/devices/scan');
            await fetchDevices();
        } catch (err) {
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/devices/${id}/status`, { approval_status: status });
            await fetchDevices();
        } catch (err) {
            console.error(err);
            alert('Failed to update device status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) return;
        try {
            await api.delete(`/devices/${id}`);
            await fetchDevices();
        } catch (err) {
            console.error(err);
            alert('Failed to delete device');
        }
    };

    const openModal = (device = null) => {
        if (device) {
            setEditingDevice(device);
            setFormData({
                name: device.name || '',
                ip_address: device.ip_address || '',
                mac_address: device.mac_address || '',
                employee_id: device.employee_id || ''
            });
        } else {
            setEditingDevice(null);
            setFormData({ name: '', ip_address: '', mac_address: '', employee_id: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDevice) {
                await api.put(`/devices/${editingDevice.id}`, formData);
            } else {
                await api.post('/devices', formData);
            }
            setIsModalOpen(false);
            await fetchDevices();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to save device');
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchEmployees();
        const interval = setInterval(fetchDevices, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-10 pb-12 text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-glow">
                        <div className="relative">
                            <HiStatusOnline className="text-primary" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-50"></span>
                        </div>
                        {t('networkDevices') || 'Network Devices Manager'}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                        <p className="text-text-secondary italic">
                            {t('liveDeviceTracking') || 'Configure and monitor hardware nodes within the attendance matrix.'}
                        </p>
                        {lastScanTime && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary uppercase tracking-wider">
                                <HiClock className="text-xs" />
                                <span>{t('lastAutoScan') || 'Last Scan'}: {lastScanTime.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal()}
                        className="flex-1 md:flex-none btn-pro flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                        <HiPlus className="text-primary" />
                        {t('addDevice') || 'Add Device'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleScan}
                        disabled={scanning}
                        className="flex-1 md:flex-none btn-pro flex items-center justify-center gap-2 px-8 py-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        <HiRefresh className={clsx(scanning && "animate-spin text-primary")} />
                        {scanning ? (t('scanning') || 'Syncing...') : (t('scanNow') || 'Pulse Scan')}
                    </motion.button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel-pro p-6 border-white/5 bg-white/[0.02] group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-white/5 text-text-secondary">
                            <HiChip className="text-xl" />
                        </div>
                        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">{t('totalDevices') || 'Hardware Nodes'}</p>
                    </div>
                    <p className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{devices.length}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel-pro p-6 border-primary/20 bg-primary/5 group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <HiStatusOnline className="text-xl animate-pulse" />
                        </div>
                        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-bold">{t('onlineNow') || 'Active Uplinks'}</p>
                    </div>
                    <p className="text-4xl font-bold text-white text-glow">
                        {devices.filter(d => isOnline(d)).length}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel-pro p-6 border-danger/20 bg-danger/5 group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-danger/10 text-danger">
                            <HiXCircle className="text-xl" />
                        </div>
                        <p className="text-[10px] font-mono text-danger uppercase tracking-[0.2em] font-bold">{t('offline') || 'Dark Nodes'}</p>
                    </div>
                    <p className="text-4xl font-bold text-white">
                        {devices.filter(d => !isOnline(d)).length}
                    </p>
                </motion.div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {Array.isArray(devices) && devices.map((device, idx) => {
                        const online = isOnline(device);
                        return (
                            <motion.div
                                key={device.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={clsx(
                                    "glass-panel-pro p-6 border group relative overflow-hidden transition-all duration-500",
                                    online ? "border-primary/20 bg-primary/[0.02]" : "border-white/5 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4 items-center">
                                        <div className={clsx(
                                            "p-4 rounded-xl border transition-all duration-500",
                                            online ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/10 text-text-secondary"
                                        )}>
                                            <HiDesktopComputer className="text-2xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-xl group-hover:text-primary transition-colors">{device.name}</h4>
                                            <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">{device.ip_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] border",
                                            online ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-text-secondary border-white/10"
                                        )}>
                                            {online ? 'ONLINE' : 'OFFLINE'}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openModal(device)}
                                                className="p-1.5 rounded bg-white/5 border border-white/10 text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
                                                title="Edit Device"
                                            >
                                                <HiPencil className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(device.id)}
                                                className="p-1.5 rounded bg-white/5 border border-white/10 text-text-secondary hover:text-danger hover:border-danger/30 transition-all"
                                                title="Delete Device"
                                            >
                                                <HiTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs py-2 border-b border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <HiFingerPrint className="text-sm opacity-50" />
                                            <span>Hardware Node ID</span>
                                        </div>
                                        <span className="font-mono text-primary font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]" title={device.mac_address}>
                                            {device.mac_address || 'UNIDENTIFIED'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs py-2 border-b border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <HiUser className="text-sm opacity-50" />
                                            <span>Personnel Link</span>
                                        </div>
                                        <span className={clsx("font-bold flex items-center gap-2", device.Employee ? "text-primary" : "text-text-secondary italic")}>
                                            {device.Employee?.full_name || 'System Level'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs py-2">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <HiRefresh className="text-sm opacity-50" />
                                            <span>Last Signal</span>
                                        </div>
                                        <span className="text-white font-mono opacity-80">
                                            {(() => {
                                                const lastSeen = device.last_seen_at ? new Date(device.last_seen_at).getTime() : 0;
                                                const lastHeartbeat = device.last_heartbeat ? new Date(device.last_heartbeat).getTime() : 0;
                                                const maxTime = Math.max(lastSeen, lastHeartbeat);
                                                return maxTime > 0 ? new Date(maxTime).toLocaleTimeString() : 'Never';
                                            })()}
                                        </span>
                                    </div>

                                    {/* Status Display/Action for PENDING */}
                                    {device.approval_status === 'PENDING' && (
                                        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mt-4">
                                            <p className="text-[10px] text-warning font-mono tracking-wider text-center mb-3">AWAITING AUTHORIZATION</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(device.id, 'APPROVED')}
                                                    className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 rounded hover:bg-primary/30 transition-colors"
                                                >
                                                    Authorize
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(device.id, 'REJECTED')}
                                                    className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-danger/20 text-danger border border-danger/30 rounded hover:bg-danger/30 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {online && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-primary shadow-[0_0_10px_#10b981]"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    ></motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {devices.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center glass-panel-pro border-dashed border-white/10 bg-white/[0.01]"
                    >
                        <HiXCircle className="text-6xl text-text-secondary opacity-10 mx-auto mb-4" />
                        <p className="text-text-secondary font-mono tracking-widest uppercase text-xs">
                            {t('noDevicesFound') || 'No hardware nodes detected in the authorized matrix.'}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Device Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass-panel-pro overflow-hidden border-white/10 bg-[#0a0a0b]"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {editingDevice ? <HiPencil className="text-primary" /> : <HiPlus className="text-primary" />}
                                    {editingDevice ? (t('editDevice') || 'Modify Hardware Node') : (t('addDevice') || 'Register New Node')}
                                </h3>
                                <p className="text-text-secondary text-sm mt-1">Configure parameters for identity and network routing.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mb-2">Device Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                                            placeholder="e.g. Reception Desktop"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mb-2">IP Address</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.ip_address}
                                                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                                                placeholder="192.168.1.100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mb-2">MAC Address</label>
                                            <input
                                                type="text"
                                                value={formData.mac_address}
                                                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                                                placeholder="00:00:00:00:00:00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mb-2">Bind to Personnel</label>
                                        <select
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm appearance-none"
                                        >
                                            <option value="" className="bg-[#0a0a0b]">System Level (No Personnel)</option>
                                            {Array.isArray(employees) && employees.map(emp => (
                                                <option key={emp.id} value={emp.id} className="bg-[#0a0a0b]">{emp.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 bg-white/5 text-text-secondary border border-white/10 rounded-lg hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-black rounded-lg font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <HiCheck className="text-lg" />
                                        {editingDevice ? 'Update Node' : 'Register Node'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

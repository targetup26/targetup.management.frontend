import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiDeviceMobile, HiTrash, HiPlus, HiShieldCheck, HiSearch, HiLink, HiUser, HiX, HiPlusCircle, HiStatusOnline, HiIdentification, HiDatabase } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function SettingsPage() {
    const { t } = useTranslation();
    const [devices, setDevices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', ip_address: '', mac_address: '', employee_id: '' });
    const [assocData, setAssocData] = useState({ device_idx: null, employee_id: '' });

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/devices');
            setDevices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            // Safe handling: check if response has data.data (paginated) or is the array itself
            const employeeData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setEmployees(employeeData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchEmployees();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/devices', newDevice);
            setNewDevice({ name: '', ip_address: '', mac_address: '', employee_id: '' });
            setShowAdd(false);
            fetchDevices();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add device');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDeleteDevice') || 'Are you sure you want to remove this device?')) return;
        try {
            await api.delete(`/devices/${id}`);
            fetchDevices();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleScan = async () => {
        setScanning(true);
        try {
            const res = await api.get('/devices/scan');
            setDiscoveredDevices(res.data);
        } catch (err) {
            console.error(err);
            alert(t('scanFailed') || 'Network scan failed');
        } finally {
            setScanning(false);
        }
    };

    const handleAssociate = async (device) => {
        if (!assocData.employee_id) {
            alert(t('selectEmployee') || 'Please select an employee');
            return;
        }

        try {
            await api.post('/devices', {
                ...device,
                employee_id: assocData.employee_id
            });
            setAssocData({ device_idx: null, employee_id: '' });
            setDiscoveredDevices(prev => prev.filter(d => d.ip_address !== device.ip_address));
            fetchDevices();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to link device');
        }
    };

    return (
        <div className="space-y-8 pb-12 text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <HiDatabase className="text-primary" />
                        {t('settings') || 'System Configuration'}
                    </h2>
                    <p className="text-text-secondary mt-1 italic">
                        {t('configureSystem') || 'Authorize network hardware and manage secure system parameters.'}
                    </p>
                </motion.div>

                <div className="flex gap-4">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleScan}
                        disabled={scanning}
                        className="btn-ghost-pro flex items-center gap-2 px-6 py-3 border-primary/20 hover:border-primary/50"
                    >
                        <HiSearch className={scanning ? 'animate-spin text-primary' : 'text-primary'} />
                        {scanning ? (t('scanning') || 'Analyzing...') : (t('scanNetwork') || 'Deep Scan')}
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAdd(!showAdd)}
                        className="btn-pro flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
                    >
                        {showAdd ? <HiX className="text-xl" /> : <HiPlusCircle className="text-xl" />}
                        {showAdd ? (t('abort') || 'Cancel Entry') : (t('addDevice') || 'Register Hardware')}
                    </motion.button>
                </div>
            </header>

            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel-pro p-8 mb-6 border-primary/20 bg-primary/[0.02]">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <HiPlusCircle className="text-primary" />
                                {t('newDevice') || 'Hardware Authorization Entry'}
                            </h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('deviceName') || 'Registry Name'}</label>
                                        <input
                                            required
                                            className="input-pro"
                                            value={newDevice.name}
                                            onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                                            placeholder="e.g., Gate 01 Scanner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('ipAddress') || 'Network IPv4'}</label>
                                        <input
                                            required
                                            className="input-pro font-mono"
                                            value={newDevice.ip_address}
                                            onChange={e => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                                            placeholder="10.0.0.X"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('macAddress') || 'Physical MAC'}</label>
                                        <input
                                            className="input-pro font-mono"
                                            value={newDevice.mac_address}
                                            onChange={e => setNewDevice({ ...newDevice, mac_address: e.target.value })}
                                            placeholder="XX:XX:XX:XX:XX:XX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('associatedEmployee') || 'Linked Personnel'}</label>
                                        <select
                                            className="input-pro appearance-none"
                                            value={newDevice.employee_id}
                                            onChange={e => setNewDevice({ ...newDevice, employee_id: e.target.value })}
                                        >
                                            <option value="" className="bg-background">{t('none') || 'Shared Terminal (System)'}</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id} className="bg-background">{emp.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-8">
                                    <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost-pro px-8 py-3 uppercase tracking-widest text-xs font-bold">
                                        {t('cancel') || 'Abort'}
                                    </button>
                                    <button type="submit" className="btn-pro px-10 py-3 uppercase tracking-widest text-xs font-bold shadow-lg shadow-primary/20">
                                        {t('save') || 'Commit to Registry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {discoveredDevices.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel-pro overflow-hidden mb-8 border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                >
                    <div className="p-5 border-b border-white/5 bg-primary/10 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2 text-glow">
                            <HiSearch className="text-primary animate-pulse" /> {t('discoveredDevices') || 'Network Discovery Matrix'}
                        </h3>
                        <button onClick={() => setDiscoveredDevices([])} className="text-[10px] font-mono text-text-secondary hover:text-white uppercase tracking-widest transition-colors">
                            {t('clear') || 'Flush Results'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="p-5">Network IP</th>
                                    <th className="p-5">Physical Address</th>
                                    <th className="p-5 text-right flex items-center justify-end gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                                        Action Protocols
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono text-xs">
                                {discoveredDevices.map((device, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.03] transition-colors">
                                        <td className="p-5 text-white font-bold">{device.ip_address}</td>
                                        <td className="p-5 text-text-secondary">{device.mac_address}</td>
                                        <td className="p-5 text-right">
                                            {assocData.device_idx === idx ? (
                                                <div className="flex items-center gap-2 justify-end">
                                                    <select
                                                        className="input-pro py-1 text-[10px] w-48 font-sans"
                                                        value={assocData.employee_id}
                                                        onChange={e => setAssocData({ ...assocData, employee_id: e.target.value })}
                                                    >
                                                        <option value="" className="bg-background italic">{t('selectEmployee') || 'Target Personnel'}</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id} className="bg-background">{emp.full_name}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => handleAssociate(device)} className="btn-pro py-1 px-4 text-[10px] uppercase font-bold tracking-widest shadow-sm">
                                                        {t('associate') || 'Link'}
                                                    </button>
                                                    <button onClick={() => setAssocData({ device_idx: null, employee_id: '' })} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                                        <HiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAssocData({ device_idx: idx, employee_id: '' })}
                                                    className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/20 rounded-lg transition-all flex items-center gap-2 ml-auto font-sans text-[10px] uppercase tracking-widest font-bold"
                                                >
                                                    <HiLink /> {t('associate') || 'Authorize Entity'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel-pro overflow-hidden border-white/5 shadow-2xl"
            >
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2 text-glow">
                        <HiShieldCheck className="text-primary" /> {t('authorizedDevices') || 'Secure Hardware Registry'}
                    </h3>
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">{devices.length} Nodes Active</span>
                </div>

                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                        <p className="text-text-secondary font-mono tracking-widest uppercase text-xs">Accessing hardware database...</p>
                    </div>
                ) : devices.length === 0 ? (
                    <div className="p-20 text-center text-text-secondary italic flex flex-col items-center">
                        <HiDatabase className="text-6xl mb-4 opacity-10" />
                        <p className="max-w-md mx-auto">No devices registered. External attendance authentication calls will be rejected. System currently in Lockdown Mode.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="p-5">{t('deviceName') || 'Registry Name'}</th>
                                    <th className="p-5">{t('ipAddress') || 'IPv4 Address'}</th>
                                    <th className="p-5">{t('macAddress') || 'MAC ID'}</th>
                                    <th className="p-5">{t('associatedEmployee') || 'Linked Personnel'}</th>
                                    <th className="p-5">{t('lastSeen') || 'Connectivity'}</th>
                                    <th className="p-5 text-right">{t('actions') || 'Control'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {devices.map((device) => (
                                    <tr key={device.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                                                    <HiDeviceMobile className="text-text-secondary group-hover:text-primary transition-colors text-xl" />
                                                </div>
                                                <span className="text-white font-bold group-hover:text-primary transition-colors">{device.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-xs text-text-secondary font-mono group-hover:text-white transition-colors">{device.ip_address}</td>
                                        <td className="p-5 text-xs text-text-secondary font-mono uppercase">{device.mac_address || 'UNIDENTIFIED'}</td>
                                        <td className="p-5">
                                            {device.Employee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                        <HiUser className="text-primary text-xs" />
                                                    </div>
                                                    <span className="text-sm text-white font-medium">{device.Employee.full_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-text-secondary text-xs uppercase tracking-widest font-mono opacity-50 px-2 py-0.5 border border-white/5 bg-white/5 rounded">{t('systemWide') || 'Root Node'}</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {device.last_seen_at ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-success group-hover:text-success/100 transition-opacity">
                                                        <HiStatusOnline className="animate-pulse shadow-[0_0_10px_#10b981]" />
                                                        <span className="text-[10px] font-mono leading-none font-bold uppercase tracking-widest">Active</span>
                                                    </div>
                                                    <span className="text-[10px] text-text-secondary font-mono">{new Date(device.last_seen_at).toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-text-secondary opacity-30 italic">
                                                    <span className="w-2 h-2 bg-text-secondary rounded-full"></span>
                                                    <span className="text-[10px] uppercase font-bold tracking-tighter">{t('neverSeen') || 'No Signal Detected'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(device.id)}
                                                    className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-danger/30"
                                                    title={t('delete') || 'Revoke Authorization'}
                                                >
                                                    <HiTrash className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="glass-panel-pro p-6 border-l-4 border-l-primary/50 bg-primary/[0.01]"
            >
                <h4 className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-2">
                    <HiShieldCheck className="text-lg" />
                    Security Protocol Alpha-9
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed font-serif">
                    The Matrix validates hardware signatures and <code className="text-primary font-mono bg-primary/5 px-1 rounded">IPv4</code> fingerprints. Only registered entities can transmit attendance data.
                    Testing from internal loopback hosts (e.g., <code className="text-primary">127.0.0.1</code>) requires explicit registration.
                </p>
            </motion.div>
        </div>
    );
}

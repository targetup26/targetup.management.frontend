import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiStatusOnline, HiRefresh, HiUser, HiDesktopComputer, HiChip, HiHashtag, HiFingerPrint, HiXCircle } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import clsx from 'clsx';

export default function NetworkMonitorPage() {
    const { t } = useTranslation();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/devices');
            // Sort by status (Online first) then name
            const sorted = res.data.sort((a, b) => {
                const aOnline = isOnline(a.last_seen_at);
                const bOnline = isOnline(b.last_seen_at);
                if (aOnline && !bOnline) return -1;
                if (!aOnline && bOnline) return 1;
                return 0;
            });
            setDevices(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        try {
            await api.get('/devices/scan');
            await fetchDevices(); // Reload to update status and last_seen
        } catch (err) {
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    const isOnline = (dateString, minutes = 10) => {
        if (!dateString) return false;
        const diff = new Date() - new Date(dateString);
        return diff < minutes * 60 * 1000;
    };

    useEffect(() => {
        fetchDevices();
        // Auto-refresh every 30 seconds
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
                    <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <div className="relative">
                            <HiStatusOnline className="text-primary" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-50"></span>
                        </div>
                        {t('networkMonitor') || 'Live Interface Matrix'}
                    </h2>
                    <p className="text-text-secondary mt-1 italic">
                        {t('liveDeviceTracking') || 'Real-time synchronization and status telemetry for authorized hardware nodes.'}
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScan}
                    disabled={scanning}
                    className="btn-pro flex items-center gap-2 px-8 py-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                    <HiRefresh className={clsx(scanning && "animate-spin text-primary")} />
                    {scanning ? (t('scanning') || 'Synchronizing...') : (t('scanNow') || 'Pulse Scan')}
                </motion.button>
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
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 w-full"></div>
                    </div>
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
                        {devices.filter(d => isOnline(d.last_seen_at)).length}
                    </p>
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(devices.filter(d => isOnline(d.last_seen_at)).length / devices.length) * 100 || 0}%` }}
                        ></motion.div>
                    </div>
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
                        {devices.filter(d => !isOnline(d.last_seen_at)).length}
                    </p>
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-danger"
                            initial={{ width: 0 }}
                            animate={{ width: `${(devices.filter(d => !isOnline(d.last_seen_at)).length / devices.length) * 100 || 0}%` }}
                        ></motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {devices.map((device, idx) => {
                        const online = isOnline(device.last_seen_at);
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
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] border",
                                        online ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-text-secondary border-white/10"
                                    )}>
                                        {online ? 'ONLINE' : 'OFFLINE'}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs py-2 border-b border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <HiFingerPrint className="text-sm opacity-50" />
                                            <span>Hardware Hash</span>
                                        </div>
                                        <span className="font-mono text-white opacity-80">{device.mac_address || 'UNIDENTIFIED'}</span>
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
                                            {device.last_seen_at ? new Date(device.last_seen_at).toLocaleTimeString() : 'Never'}
                                        </span>
                                    </div>
                                </div>

                                {online && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-primary"
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
        </div>
    );
}

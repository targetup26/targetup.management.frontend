import { useState, useEffect } from 'react';
import api from '../services/api';
import FilterBar from '../components/FilterBar';
import AttendanceTable from '../components/AttendanceTable';
import ManualEntryModal from '../components/ManualEntryModal';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HiClock, HiPlusCircle } from 'react-icons/hi';

export default function AttendancePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [filters, setFilters] = useState({
        from: '', to: '', department_id: '', job_role_id: '', status: ''
    });

    const fetchAttendance = async () => {
        // Silent update if socket triggered it could be handled differently, 
        // but for now, we just reload data so user sees Latest.
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
            const res = await api.get('/attendance', { params });
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAttendance().finally(() => setLoading(false));
    }, [filters]);

    // Socket.io Real-time Listener
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
        const socket = io(socketUrl);


        socket.on('connect', () => {
            console.log('Connected to Real-time Server');
        });

        socket.on('attendance_update', (payload) => {
            console.log('New Attendance Data:', payload);
            // Re-fetch data to reflect changes immediately
            // Optimization: We could merge payload.data into 'data' state directly
            fetchAttendance();
        });

        return () => socket.disconnect();
    }, []);

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const { t } = useTranslation();

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <HiClock className="text-primary" />
                        {t('attendance')}
                    </h2>
                    <p className="text-text-secondary mt-1 flex items-center gap-2 italic">
                        {t('monitor_workforce') || 'Monitor workforce presence and violations in real-time.'}
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="btn-pro flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
                >
                    <HiPlusCircle className="text-xl" />
                    {t('manualEntry')}
                </motion.button>
            </header>

            <ManualEntryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchAttendance}
                editingEntry={editingEntry}
            />

            <FilterBar filters={filters} setFilters={setFilters} />

            {loading ? (
                <div className="text-center py-12 text-white animate-pulse">Loading Attendance Data...</div>
            ) : (
                <AttendanceTable data={data} onEdit={handleEdit} />
            )}
        </div>
    );
}

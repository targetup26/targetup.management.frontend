import React, { useState, useEffect } from 'react';
import { HiClock, HiCheckCircle, HiExclamationCircle, HiCalendar, HiBan } from 'react-icons/hi';
import api from '../../services/api';

export default function AttendanceHistory({ employeeId }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch attendance entries for specific employee
                const res = await api.get(`/attendance/history?employee_id=${employeeId}`);
                setEntries(res.data);
            } catch (err) {
                console.error('Fetch attendance history error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchHistory();
        }
    }, [employeeId]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PRESENT': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
            case 'LATE': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
            case 'ON_BREAK': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
            case 'ABSENT': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
            case 'LEAVE': return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
            default: return { bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10' };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 glass-panel-pro border-dashed">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Syncing Records</span>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 glass-panel-pro border-dashed opacity-50">
                <HiCalendar className="text-4xl text-white/5" />
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Zero Records Found</p>
                    <p className="text-[9px] text-text-muted mt-1">Attendance history for ID #{employeeId} is currently empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
                {entries.map((entry) => {
                    const styles = getStatusStyles(entry.status);
                    const clockIn = entry.clock_in ? new Date(entry.clock_in) : null;
                    const clockOut = entry.clock_out ? new Date(entry.clock_out) : null;

                    let duration = "---";
                    if (clockIn && clockOut) {
                        const diff = Math.floor((clockOut - clockIn) / (1000 * 60));
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        duration = `${h}h ${m}m`;
                    } else if (clockIn && entry.status === 'PRESENT') {
                        duration = "ACTIVE";
                    }

                    return (
                        <div key={entry.id} className="glass-panel-pro p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-center ${styles.text} group-hover:scale-110 transition-transform`}>
                                    {entry.status === 'PRESENT' ? <HiCheckCircle className="text-xl" /> :
                                        entry.status === 'LATE' ? <HiExclamationCircle className="text-xl" /> :
                                            entry.status === 'ON_BREAK' ? <HiClock className="text-xl" /> :
                                                <HiCalendar className="text-xl" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white tracking-tight">
                                        {new Date(entry.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${styles.bg} ${styles.text} border ${styles.border}`}>
                                            {entry.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{entry.source}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 md:gap-12 px-2">
                                <div>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Clock In</p>
                                    <p className="text-xs font-bold text-white/80 font-mono">
                                        {clockIn ? clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Clock Out</p>
                                    <p className="text-xs font-bold text-white/80 font-mono">
                                        {clockOut ? clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                            (entry.status === 'ON_BREAK' || !entry.clock_out && entry.clock_in ? <span className="text-primary italic animate-pulse">ACTIVE</span> : '---')}
                                    </p>
                                </div>
                                <div className="hidden sm:block text-right min-w-[80px]">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Duration</p>
                                    <p className={`text-xs font-black font-mono ${duration === 'ACTIVE' ? 'text-primary' : 'text-white/60'}`}>
                                        {duration}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiSearch, HiFilter, HiDownload, HiCalendar,
    HiClock, HiUserGroup, HiOutlineRefresh
} from 'react-icons/hi';
import api from '../../services/api';
import { format } from 'date-fns';

export default function BreaksPage() {
    const [breaks, setBreaks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        employee_id: 'all'
    });
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchBreaks();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const empRes = await api.get('/employees');
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    };

    const fetchBreaks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start_date: filters.start_date,
                end_date: filters.end_date,
                employee_id: filters.employee_id
            });
            const response = await api.get(`/breaks/history?${params}`);
            setBreaks(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching breaks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const calculateDuration = (start, end, duration) => {
        if (duration) return duration;
        if (!end) return 'Active';
        const s = new Date(start);
        const e = new Date(end);
        return Math.floor((e - s) / (1000 * 60));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Break History Audit</h1>
                    <p className="text-text-secondary mt-1">Global break log registry and duration analysis.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={fetchBreaks} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                        <HiOutlineRefresh className={loading ? "animate-spin" : ""} />
                    </button>
                    {/* Placeholder for Export
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all font-bold text-xs uppercase tracking-widest">
                        <HiDownload className="text-lg" />
                        Export Log
                    </button>
                    */}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel-pro p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-text-secondary text-sm font-bold uppercase tracking-wider min-w-fit">
                    <HiFilter className="text-lg text-primary" />
                    Filters
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <span className="text-text-secondary self-center">to</span>
                    <div className="relative group flex-1 md:flex-none">
                        <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto min-w-[200px]">
                    <div className="relative group">
                        <HiUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <select
                            value={filters.employee_id}
                            onChange={(e) => handleFilterChange('employee_id', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 appearance-none transition-colors"
                        >
                            <option value="all">All Personnel</option>
                            {Array.isArray(employees) && employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.code})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-panel-pro p-0 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/[0.02] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                            <tr>
                                <th className="p-4 font-bold">Personnel</th>
                                <th className="p-4 font-bold text-center">Date</th>
                                <th className="p-4 font-bold text-center">Break In</th>
                                <th className="p-4 font-bold text-center">Break Out</th>
                                <th className="p-4 font-bold text-center">Duration</th>
                                <th className="p-4 font-bold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-text-secondary animate-pulse">
                                            Syncing audit logs...
                                        </td>
                                    </tr>
                                ) : breaks.length > 0 ? (
                                    breaks.map((brk, idx) => {
                                        const mins = calculateDuration(brk.start_time, brk.end_time, brk.duration);
                                        const isOverdue = typeof mins === 'number' && mins > 60; // Assuming 60 min default limit

                                        return (
                                            <motion.tr
                                                key={brk.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                            {brk.Employee?.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{brk.Employee?.full_name}</div>
                                                            <div className="text-[10px] text-text-secondary font-mono">{brk.Employee?.code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-center text-text-secondary font-mono">
                                                    {brk.date}
                                                </td>
                                                <td className="p-4 text-xs text-center text-white font-mono">
                                                    {new Date(brk.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-4 text-xs text-center text-text-secondary font-mono">
                                                    {brk.end_time ? new Date(brk.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </td>
                                                <td className={`p-4 text-sm text-center font-bold ${isOverdue ? 'text-danger' : 'text-white'}`}>
                                                    {mins} <span className="text-[10px] font-normal text-text-secondary uppercase">{typeof mins === 'number' ? 'mins' : ''}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${!brk.end_time ? 'bg-warning/20 text-warning border border-warning/30 animate-pulse' :
                                                        isOverdue ? 'bg-danger/20 text-danger border border-danger/30' :
                                                            'bg-success/10 text-success border border-success/20'
                                                        }`}>
                                                        {!brk.end_time ? 'Active Session' : isOverdue ? 'Limit Exceeded' : 'Completed'}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-text-secondary italic">
                                            No break records found for the selected period.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

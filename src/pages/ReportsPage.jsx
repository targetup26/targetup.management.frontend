import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiDocumentReport, HiDownload, HiCalendar, HiClock, HiUserGroup, HiExclamation, HiPlusCircle } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import clsx from 'clsx';

export default function ReportsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
        to: new Date().toISOString().split('T')[0] // Today
    });
    const [filters, setFilters] = useState({
        department_id: '',
        job_role_id: '',
        employee_id: ''
    });
    const [departments, setDepartments] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJobRoles = async () => {
        try {
            const res = await api.get('/job-roles');
            setJobRoles(res.data);
        } catch (err) {
            console.error(err);
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

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                from: dateRange.from,
                to: dateRange.to,
                ...filters // Pass the selected filters to the backend
            };
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const res = await api.get('/attendance', { params });
            setAttendanceData(res.data);

            // Calculate statistics
            const stats = calculateStats(res.data);
            setReportData(stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalRecords = data.length;
        const present = data.filter(d => d.status === 'PRESENT').length;
        const late = data.filter(d => d.status === 'LATE').length;
        const absent = data.filter(d => d.status === 'ABSENT').length;
        const leave = data.filter(d => d.status === 'LEAVE').length;

        // 1. Determine the base list of employees to show
        let targetEmployees = employees;
        if (filters.employee_id) {
            targetEmployees = employees.filter(e => e.id == filters.employee_id);
        } else {
            if (filters.department_id) {
                targetEmployees = targetEmployees.filter(e => e.department_id == filters.department_id);
            }
            if (filters.job_role_id) {
                targetEmployees = targetEmployees.filter(e => e.job_role_id == filters.job_role_id);
            }
        }

        // 2. Initialize stats for these employees
        const byEmployee = {};
        targetEmployees.forEach(emp => {
            byEmployee[emp.id] = {
                name: emp.full_name,
                code: emp.code,
                present: 0,
                late: 0,
                absent: 0,
                totalViolations: 0
            };
        });

        // 3. Populate with actual attendance data
        data.forEach(record => {
            const empId = record.employee_id;
            // Only update if this employee is in our target list (should always be true if backend filter matches frontend)
            if (byEmployee[empId]) {
                if (record.status === 'PRESENT') byEmployee[empId].present++;
                if (record.status === 'LATE') byEmployee[empId].late++;
                if (record.status === 'ABSENT') byEmployee[empId].absent++;
                if (record.status === 'LEAVE') {
                    // Logic for leave if needed, or just standard counting
                }
                byEmployee[empId].totalViolations += record.violation_points || 0;
            } else if (!filters.employee_id && !filters.department_id && !filters.job_role_id) {
                // If no filters selected, we might encounter employees not in our initial list (e.g. deleted/inactive?)
                // Add them gracefully if needed, or ignore.
                // Ideally 'employees' state covers everyone.
            }
        });

        return {
            totalRecords,
            present,
            late,
            absent,
            leave,
            presentPercentage: totalRecords > 0 ? ((present / totalRecords) * 100).toFixed(1) : 0,
            byEmployee: Object.values(byEmployee)
        };
    };

    const exportToCSV = () => {
        if (!attendanceData.length) {
            alert('No data to export');
            return;
        }

        const headers = ['Date', 'Employee', 'Department', 'Clock In', 'Clock Out', 'Status', 'Violations', 'Device Check In'];
        const rows = attendanceData.map(record => {
            const timeStr = record.device_clock_in
                ? new Date(record.device_clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : (record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

            const deviceStr = record.device_name ? `${record.device_name} (${record.device_ip})` : (record.device_ip || '');

            return [
                record.date,
                record.Employee?.full_name || '',
                record.Employee?.Department?.name || '',
                record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                record.status,
                record.violation_points || 0,
                `${timeStr} - ${deviceStr}`
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${dateRange.from}_to_${dateRange.to}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchDepartments();
        fetchJobRoles();
        fetchEmployees();
        fetchReport();
    }, []);

    return (
        <div className="space-y-8 pb-12 text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <HiDocumentReport className="text-primary" />
                        {t('reports') || 'Intelligence Center'}
                    </h2>
                    <p className="text-text-secondary mt-1 flex items-center gap-2 italic">
                        {t('attendanceAnalytics') || 'Advanced attendance analytics and workforce insights.'}
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportToCSV}
                    disabled={!attendanceData.length}
                    className="btn-pro flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiDownload className="text-xl" />
                    {t('exportCSV') || 'Export Dataset'}
                </motion.button>
            </header>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel-pro p-8"
            >
                <h3 className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {t('filters') || 'Analysis Configuration'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Date From */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest px-1">
                            {t('from') || 'Temporal Start'}
                        </label>
                        <div className="relative group">
                            <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-hover:text-primary transition-colors" />
                            <input
                                type="date"
                                className="input-pro pl-12"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest px-1">
                            {t('to') || 'Temporal End'}
                        </label>
                        <div className="relative group">
                            <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-hover:text-primary transition-colors" />
                            <input
                                type="date"
                                className="input-pro pl-12"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest px-1">
                            {t('department') || 'Sector'}
                        </label>
                        <select
                            className="input-pro appearance-none"
                            value={filters.department_id}
                            onChange={(e) => setFilters({ ...filters, department_id: e.target.value, job_role_id: '', employee_id: '' })}
                        >
                            <option value="" className="bg-background">{t('allDepartments') || 'Global Network'}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id} className="bg-background">{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Job Role Filter */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest px-1">
                            {t('jobRole') || 'Specialization'}
                        </label>
                        <select
                            className="input-pro appearance-none"
                            value={filters.job_role_id}
                            onChange={(e) => setFilters({ ...filters, job_role_id: e.target.value, employee_id: '' })}
                        >
                            <option value="" className="bg-background">{t('allJobRoles') || 'All Ranks'}</option>
                            {jobRoles
                                .filter(role => !filters.department_id || role.department_id == filters.department_id)
                                .map(role => (
                                    <option key={role.id} value={role.id} className="bg-background">{role.name}</option>
                                ))}
                        </select>
                    </div>

                    {/* Employee Filter */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest px-1">
                            {t('employee') || 'Subject'}
                        </label>
                        <select
                            className="input-pro appearance-none"
                            value={filters.employee_id}
                            onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                        >
                            <option value="" className="bg-background">{t('allEmployees') || 'Entire Personnel'}</option>
                            {employees
                                .filter(emp => !filters.department_id || emp.department_id == filters.department_id)
                                .filter(emp => !filters.job_role_id || emp.job_role_id == filters.job_role_id)
                                .map(emp => (
                                    <option key={emp.id} value={emp.id} className="bg-background">{emp.full_name}</option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="btn-pro px-8 py-4 flex-1 uppercase tracking-widest font-bold text-xs shadow-lg shadow-primary/20"
                    >
                        {loading ? t('loading') || 'Processing...' : t('generateReport') || 'Execute Analysis'}
                    </button>
                    <button
                        onClick={() => {
                            setFilters({ department_id: '', job_role_id: '', employee_id: '' });
                            setDateRange({
                                from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                                to: new Date().toISOString().split('T')[0]
                            });
                        }}
                        className="btn-ghost-pro px-8 py-4 uppercase tracking-widest font-bold text-xs"
                    >
                        {t('clearFilters') || 'Reset Parameters'}
                    </button>
                </div>
            </motion.div>

            {/* Statistics Section */}
            {reportData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ReportStatCard
                            title={t('present') || 'Present'}
                            value={reportData.present}
                            subline={`${reportData.presentPercentage}% Total`}
                            icon={<HiUserGroup />}
                            color="text-success"
                        />
                        <ReportStatCard
                            title={t('late') || 'Late Arrivals'}
                            value={reportData.late}
                            subline="Requires review"
                            icon={<HiClock />}
                            color="text-warning"
                        />
                        <ReportStatCard
                            title={t('absent') || 'Absentees'}
                            value={reportData.absent}
                            subline="Unaccounted"
                            icon={<HiExclamation />}
                            color="text-danger"
                        />
                        <ReportStatCard
                            title={t('leave') || 'Leaves'}
                            value={reportData.leave}
                            subline="Authorized"
                            icon={<HiDocumentReport />}
                            color="text-primary"
                        />
                    </div>

                    {/* Detailed Summary Table */}
                    <div className="glass-panel-pro overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-sm">
                                <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#10b981]"></span>
                                {t('Employee Summary') || 'Employee Intelligence Matrix'}
                            </h3>
                            <span className="text-[10px] font-mono text-text-secondary uppercase">Computed via Data-Source</span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="p-5 font-bold">{t('employee') || 'Entity'}</th>
                                        <th className="p-5 text-center font-bold px-8">{t('present') || 'Present'}</th>
                                        <th className="p-5 text-center font-bold px-8">{t('late') || 'Late'}</th>
                                        <th className="p-5 text-center font-bold px-8">{t('absent') || 'Absent'}</th>
                                        <th className="p-5 text-center font-bold px-8">{t('totalViolations') || 'Violations'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {reportData.byEmployee.map((emp, idx) => (
                                        <tr key={idx} className="group hover:bg-white/[0.03] transition-all duration-300">
                                            <td className="p-5">
                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{emp.name}</div>
                                                <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">{emp.code || '—'}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="px-3 py-1 bg-success/10 text-success rounded-lg font-mono text-xs border border-success/20">{emp.present}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="px-3 py-1 bg-warning/10 text-warning rounded-lg font-mono text-xs border border-warning/20">{emp.late}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="px-3 py-1 bg-danger/10 text-danger rounded-lg font-mono text-xs border border-danger/20">{emp.absent}</span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg font-bold font-mono text-xs border",
                                                    emp.totalViolations > 0 ? 'bg-danger/20 text-danger border-danger/40 animate-pulse' : 'bg-success/10 text-success border-success/20'
                                                )}>
                                                    {emp.totalViolations} PTS
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!reportData && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-panel-pro p-20 text-center flex flex-col items-center border-dashed border-white/10"
                >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <HiDocumentReport className="text-5xl text-primary opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Dataset Generated</h3>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        {t('selectDateRange') || 'Select a temporal range and parameters to begin workforce data extraction.'}
                    </p>
                </motion.div>
            )}
        </div>
    );
}

function ReportStatCard({ title, value, subline, icon, color }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel-pro p-6 relative group border-white/5 hover:border-primary/20"
        >
            <div className={`absolute top-6 right-6 text-3xl ${color} opacity-20 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110`}>
                {icon}
            </div>
            <div className="relative z-10">
                <h3 className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] mb-1">{title}</h3>
                <p className="text-4xl font-bold text-white tracking-tighter mb-2">{value}</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" style={{ color: 'var(--color-primary)' }}></span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{subline}</span>
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-full transition-all duration-700 ${color}`}></div>
        </motion.div>
    );
}

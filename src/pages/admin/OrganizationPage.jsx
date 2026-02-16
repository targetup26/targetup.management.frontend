import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOfficeBuilding, HiBriefcase, HiTrash, HiPencil, HiPlusCircle, HiCollection, HiBadgeCheck, HiClock, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function OrganizationPage() {
    const { t } = useTranslation();
    const [departments, setDepartments] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [editingShift, setEditingShift] = useState(null);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });
    const [shiftForm, setShiftForm] = useState({
        name: '',
        start_time: '09:00',
        end_time: '17:00',
        break_start_time: '13:00',
        break_end_time: '14:00',
        max_break_minutes: 60
    });

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

    const fetchShifts = async () => {
        try {
            const res = await api.get('/shifts');
            setShifts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchJobRoles();
        fetchShifts();
    }, []);

    // Department Handlers
    const handleOpenDeptModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setDeptForm({ name: dept.name, description: dept.description || '' });
        } else {
            setEditingDept(null);
            setDeptForm({ name: '', description: '' });
        }
        setShowDeptModal(true);
    };

    const handleSubmitDept = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, deptForm);
            } else {
                await api.post('/departments', deptForm);
            }
            setShowDeptModal(false);
            setEditingDept(null);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save department');
        }
    };

    const handleDeleteDept = async (id) => {
        if (!confirm(t('confirmDelete') || 'Are you sure?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert('Failed to delete department');
        }
    };

    // Job Role Handlers
    const handleOpenRoleModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({ name: role.name, description: role.description || '' });
        } else {
            setEditingRole(null);
            setRoleForm({ name: '', description: '' });
        }
        setShowRoleModal(true);
    };

    const handleSubmitRole = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await api.put(`/job-roles/${editingRole.id}`, roleForm);
            } else {
                await api.post('/job-roles', roleForm);
            }
            setShowRoleModal(false);
            setEditingRole(null);
            fetchJobRoles();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save job role');
        }
    };

    const handleDeleteRole = async (id) => {
        if (!confirm(t('confirmDelete') || 'Are you sure?')) return;
        try {
            await api.delete(`/job-roles/${id}`);
            fetchJobRoles();
        } catch (err) {
            alert('Failed to delete job role');
        }
    };

    // Shift Handlers
    const handleOpenShiftModal = (shift = null) => {
        if (shift) {
            setEditingShift(shift);
            setShiftForm({
                name: shift.name,
                start_time: shift.start_time,
                end_time: shift.end_time,
                break_start_time: shift.break_start_time || '13:00',
                break_end_time: shift.break_end_time || '14:00',
                max_break_minutes: shift.max_break_minutes || 60
            });
        } else {
            setEditingShift(null);
            setShiftForm({
                name: '',
                start_time: '09:00',
                end_time: '17:00',
                break_start_time: '13:00',
                break_end_time: '14:00',
                max_break_minutes: 60
            });
        }
        setShowShiftModal(true);
    };

    const handleSubmitShift = async (e) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await api.put(`/shifts/${editingShift.id}`, shiftForm);
            } else {
                await api.post('/shifts', shiftForm);
            }
            setShowShiftModal(false);
            setEditingShift(null);
            fetchShifts();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save shift');
        }
    };

    const handleDeleteShift = async (id) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;
        try {
            await api.delete(`/shifts/${id}`);
            fetchShifts();
        } catch (err) {
            alert('Failed to delete shift');
        }
    };

    return (
        <div className="space-y-12 pb-12 text-white">
            {/* Page Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
                    <HiCollection className="text-primary" />
                    Organization Management
                </h1>
                <p className="text-text-secondary">
                    Configure organizational structure, roles, and work schedules
                </p>
            </header>

            {/* Departments Section */}
            <section className="space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <HiOfficeBuilding className="text-primary" />
                            {t('departments') || 'Departments'}
                        </h2>
                        <p className="text-text-secondary mt-1 text-sm">
                            {t('manageDepartments') || 'Manage organizational divisions and sectors'}
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenDeptModal()}
                        className="btn-pro flex items-center gap-2 px-6 py-3"
                    >
                        <HiPlusCircle className="text-xl" />
                        {t('addDepartment') || 'Add Department'}
                    </motion.button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {departments.map((dept, idx) => (
                            <motion.div
                                key={dept.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel-pro p-6 relative group border-white/5 hover:border-primary/20 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                    <button
                                        onClick={() => handleOpenDeptModal(dept)}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all"
                                    >
                                        <HiPencil className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDept(dept.id)}
                                        className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all"
                                    >
                                        <HiTrash className="text-lg" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                        <HiOfficeBuilding className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{dept.name}</h3>
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Department</span>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed min-h-[3rem] mb-4">
                                    {dept.description || 'No description provided'}
                                </p>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Job Roles Section */}
            <section className="space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <HiBadgeCheck className="text-accent" />
                            {t('jobRoles') || 'Job Roles'}
                        </h2>
                        <p className="text-text-secondary mt-1 text-sm">
                            {t('manageJobRoles') || 'Define positions and responsibilities'}
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenRoleModal()}
                        className="btn-ghost-pro flex items-center gap-2 px-6 py-3 border-accent/20 hover:border-accent/50 text-accent"
                    >
                        <HiPlusCircle className="text-xl" />
                        {t('addJobRole') || 'Add Job Role'}
                    </motion.button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {jobRoles.map((role, idx) => (
                            <motion.div
                                key={role.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel-pro p-6 relative group border-white/5 hover:border-accent/20 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                    <button
                                        onClick={() => handleOpenRoleModal(role)}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all"
                                    >
                                        <HiPencil className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all"
                                    >
                                        <HiTrash className="text-lg" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                                        <HiBriefcase className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{role.name}</h3>
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Job Role</span>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed min-h-[3rem] mb-4">
                                    {role.description || 'No description provided'}
                                </p>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Shifts Section */}
            <section className="space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <HiClock className="text-warning" />
                            {t('shifts') || 'Work Shifts'}
                        </h2>
                        <p className="text-text-secondary mt-1 text-sm">
                            Configure working hours and break schedules
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenShiftModal()}
                        className="btn-ghost-pro flex items-center gap-2 px-6 py-3 border-warning/20 hover:border-warning/50 text-warning"
                    >
                        <HiPlusCircle className="text-xl" />
                        Add Shift
                    </motion.button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {shifts.map((shift, idx) => (
                            <motion.div
                                key={shift.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel-pro p-6 relative group border-white/5 hover:border-warning/20 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                    <button
                                        onClick={() => handleOpenShiftModal(shift)}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all"
                                    >
                                        <HiPencil className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShift(shift.id)}
                                        className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all"
                                    >
                                        <HiTrash className="text-lg" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                                        <HiClock className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-warning transition-colors">{shift.name}</h3>
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Work Shift</span>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-text-secondary">Working:</span>
                                        <span className="text-white">{shift.start_time} - {shift.end_time}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-warning">Break Window:</span>
                                        <span className="text-white">{shift.break_start_time || 'N/A'} - {shift.break_end_time || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                                        <span>Max Break:</span>
                                        <span>{shift.max_break_minutes} min</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-warning/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Department Modal */}
            <AnimatePresence>
                {showDeptModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-md p-0 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <HiOfficeBuilding className="text-primary" />
                                    {editingDept ? (t('editDepartment') || 'Edit Department') : (t('addDepartment') || 'Add Department')}
                                </h3>
                                <button onClick={() => setShowDeptModal(false)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitDept} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('name') || 'Name'}</label>
                                    <input
                                        type="text"
                                        className="input-pro"
                                        value={deptForm.name}
                                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Engineering"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('description') || 'Description'}</label>
                                    <textarea
                                        className="input-pro"
                                        rows="4"
                                        value={deptForm.description}
                                        onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                                        placeholder="Define department responsibilities..."
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        {t('cancel') || 'Cancel'}
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        {editingDept ? (t('update') || 'Update') : (t('create') || 'Create')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Job Role Modal */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-md p-0 shadow-2xl overflow-hidden border-accent/20"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <HiBadgeCheck className="text-accent" />
                                    {editingRole ? (t('editJobRole') || 'Edit Job Role') : (t('addJobRole') || 'Add Job Role')}
                                </h3>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitRole} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-accent uppercase tracking-wider px-1">{t('name') || 'Name'}</label>
                                    <input
                                        type="text"
                                        className="input-pro"
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Senior Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-accent uppercase tracking-wider px-1">{t('description') || 'Description'}</label>
                                    <textarea
                                        className="input-pro"
                                        rows="4"
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        placeholder="Define role responsibilities..."
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs border-accent/20 hover:border-accent/50 text-accent">
                                        {t('cancel') || 'Cancel'}
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs bg-accent shadow-accent/20 hover:shadow-accent/40">
                                        {editingRole ? (t('update') || 'Update') : (t('create') || 'Create')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Shift Modal */}
            <AnimatePresence>
                {showShiftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-lg p-0 shadow-2xl overflow-hidden border-warning/20"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <HiClock className="text-warning" />
                                    {editingShift ? 'Edit Shift' : 'Add Shift'}
                                </h3>
                                <button onClick={() => setShowShiftModal(false)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitShift} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-warning uppercase tracking-wider px-1">Shift Name</label>
                                        <input
                                            type="text"
                                            className="input-pro"
                                            value={shiftForm.name}
                                            onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                                            required
                                            placeholder="e.g., Morning Shift"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider px-1">Start Time</label>
                                            <input
                                                type="time"
                                                className="input-pro"
                                                value={shiftForm.start_time}
                                                onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider px-1">End Time</label>
                                            <input
                                                type="time"
                                                className="input-pro"
                                                value={shiftForm.end_time}
                                                onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 space-y-4">
                                        <h4 className="text-[10px] font-mono font-bold text-warning uppercase tracking-widest">Break Scheduling</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider px-1">Break Start</label>
                                                <input
                                                    type="time"
                                                    className="input-pro"
                                                    value={shiftForm.break_start_time}
                                                    onChange={(e) => setShiftForm({ ...shiftForm, break_start_time: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider px-1">Break End</label>
                                                <input
                                                    type="time"
                                                    className="input-pro"
                                                    value={shiftForm.break_end_time}
                                                    onChange={(e) => setShiftForm({ ...shiftForm, break_end_time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider px-1">Max Break Duration (Minutes)</label>
                                            <input
                                                type="number"
                                                className="input-pro"
                                                value={shiftForm.max_break_minutes}
                                                onChange={(e) => setShiftForm({ ...shiftForm, max_break_minutes: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowShiftModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs border-warning/20 hover:border-warning/50 text-warning">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs bg-warning shadow-warning/20 hover:shadow-warning/40">
                                        {editingShift ? 'Update' : 'Create'}
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

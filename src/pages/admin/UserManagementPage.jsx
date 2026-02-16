import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiPlus, HiTrash, HiPencil, HiUsers, HiMail, HiShieldCheck,
    HiX, HiCheck, HiUserCircle, HiSearch, HiFilter, HiShare,
    HiChevronLeft, HiChevronRight, HiExternalLink, HiTicket,
    HiUserAdd, HiUser, HiPhone, HiIdentification, HiPrinter,
    HiOfficeBuilding, HiBriefcase, HiClock, HiCalendar, HiUserGroup
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { copyToClipboard } from '../../utils/clipboard';

import UserFormsModal from './components/UserFormsModal';

export default function UserManagementPage() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department_id: '',
        status: '',
        join_date_start: '',
        join_date_end: ''
    });
    const [depts, setDepts] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [shifts, setShifts] = useState([]);

    // Employee Modal State (for Onboard/Edit)
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState({
        code: '',
        full_name: '',
        email: '',
        phone: '',
        department_id: '',
        job_role_id: '',
        shift_id: '',
        is_active: true,
        hire_date: new Date().toISOString().split('T')[0]
    });

    // Invitation State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [inviting, setInviting] = useState(false);

    // Create User State (from EmployeesPage)
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedEmployeeForUser, setSelectedEmployeeForUser] = useState(null);
    const [userPassword, setUserPassword] = useState('target@2026');

    // Print/Forms Modal State
    const [showFormsModal, setShowFormsModal] = useState(false);
    const [selectedEmployeeForForms, setSelectedEmployeeForForms] = useState(null);

    const handleOpenFormsModal = (employee) => {
        setSelectedEmployeeForForms(employee);
        setShowFormsModal(true);
    };

    const fetchEmployees = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: meta.limit,
                search: searchTerm,
                ...filters
            };
            const response = await api.get('/employees', { params });
            // The response from my updated controller is { data, meta }
            setEmployees(response.data.data || []);
            setMeta(response.data.meta || { total: 0, page: 1, limit: 15, last_page: 1 });
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters, meta.limit]);

    useEffect(() => {
        fetchEmployees(1);
    }, [searchTerm, filters]);

    useEffect(() => {
        api.get('/departments').then(res => setDepts(res.data)).catch(console.error);
        api.get('/job-roles').then(res => setJobRoles(res.data)).catch(console.error);
        api.get('/shifts').then(res => setShifts(res.data)).catch(console.error);
    }, []);

    const handleInvite = async () => {
        setInviting(true);
        try {
            const res = await api.post('/onboarding/invite', { email: inviteEmail });
            setInviteLink(res.data.invite_link);
        } catch (error) {
            alert('Failed to generate invite: ' + (error.response?.data?.error || error.message));
        } finally {
            setInviting(false);
        }
    };

    const copyInviteLink = () => {
        copyToClipboard(inviteLink, 'Invitation link copied to clipboard!');
    };

    const closeInviteModal = () => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteLink('');
    };

    const handleOpenUserModal = (employee) => {
        setSelectedEmployeeForUser(employee);
        setUserPassword('target@2026');
        setShowUserModal(true);
    };

    const handleCreateUser = async () => {
        if (!selectedEmployeeForUser) return;

        setLoading(true);
        try {
            const res = await api.post(`/admin/users/create-from-employee/${selectedEmployeeForUser.id}`, {
                password: userPassword
            });
            alert(`Login created successfully!\nUsername: ${res.data.user.username}\nPassword: ${res.data.tempPassword || userPassword}`);
            setShowUserModal(false);
            fetchEmployees(meta.page);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create user account');
        } finally {
            setLoading(false);
        }
    };

    // Employee Management Handlers
    const handleOpenModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setForm({
                code: employee.code,
                full_name: employee.full_name,
                email: employee.email || '',
                phone: employee.phone || '',
                department_id: employee.department_id || '',
                job_role_id: employee.job_role_id || '',
                shift_id: employee.shift_id || '',
                system_role: employee.User?.role || '',
                is_active: employee.is_active,
                hire_date: employee.hire_date || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingEmployee(null);
            setForm({
                code: '',
                full_name: '',
                email: '',
                phone: '',
                department_id: '',
                job_role_id: '',
                shift_id: '',
                system_role: '',
                is_active: true,
                hire_date: new Date().toISOString().split('T')[0]
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare payload
            const payload = { ...form };
            // backend expects 'role' for the user role update, so map system_role to role
            if (payload.system_role) {
                payload.role = payload.system_role;
            }

            if (editingEmployee) {
                await api.put(`/employees/${editingEmployee.id}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            handleCloseModal();
            fetchEmployees(meta.page);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        setLoading(true);
        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees(meta.page);
        } catch (err) {
            alert('Failed to delete employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
                        <span className="w-2 h-8 bg-primary rounded-sm" />
                        Personnel Management
                    </h1>
                    <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.3em] mt-1 pl-5">
                        Enterprise Access Control & Onboarding Registry
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-pro flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
                    >
                        <HiUserAdd className="text-xl" />
                        Onboard Personnel
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="btn-ghost-pro flex items-center gap-2 group px-6 border border-white/10"
                    >
                        <HiPlus className="group-hover:rotate-90 transition-transform" />
                        <span>Invite via Link</span>
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="glass-panel-pro p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative group lg:col-span-2">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH BY STAFF ID OR NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest outline-none focus:border-primary/50 transition-all uppercase"
                    />
                </div>

                <select
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest outline-none focus:border-primary/50 uppercase"
                    value={filters.department_id}
                    onChange={(e) => setFilters(f => ({ ...f, department_id: e.target.value }))}
                >
                    <option value="">All Divisions</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                <select
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest outline-none focus:border-primary/50 uppercase"
                    value={filters.status}
                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                >
                    <option value="">Any Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    onClick={() => setFilters({ department_id: '', status: '', join_date_start: '', join_date_end: '' })}
                    className="btn-ghost-pro border-white/10 shadow-none text-[10px]"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table Area */}
            <div className="glass-panel-pro overflow-hidden border-white/5 shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Staff Identifier</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Personnel</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Division & Rank</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Auth Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {employees.map((emp, idx) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-white/[0.03] transition-all cursor-pointer"
                                    onClick={() => navigate(`/admin/users/${emp.id}`)}
                                >
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                            {emp.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg text-text-secondary group-hover:text-primary transition-colors">
                                                <HiUserCircle />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white group-hover:text-primary transition-all">{emp.full_name}</span>
                                                <span className="text-[9px] font-mono text-text-secondary uppercase">JOINED: {emp.hire_date || 'PENDING'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{emp.Department?.name || 'GENERIC_POOL'}</span>
                                            <span className="text-[9px] text-text-secondary italic uppercase">{emp.JobRole?.name || 'UNRANKED'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${emp.is_active ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'}`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${emp.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                                {emp.is_active ? 'ACTIVE_SESSION' : 'ACCOUNT_LOCKED'}
                                            </span>
                                            {emp.User && (
                                                <HiShieldCheck className="text-primary text-base" title="Desktop App Access Active" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!emp.User && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenUserModal(emp); }}
                                                    className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-2"
                                                    title="Create System Access"
                                                >
                                                    <HiUserAdd className="text-sm" />
                                                    <span className="text-[10px] font-black uppercase">Create Login</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(emp); }}
                                                className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                                                title="Edit Profile"
                                            >
                                                <HiPencil className="text-lg" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }}
                                                className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-danger/30"
                                                title="Delete Employee"
                                            >
                                                <HiTrash className="text-lg" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenFormsModal(emp); }}
                                                className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                                                title="Print Profile / Forms"
                                            >
                                                <HiPrinter className="text-lg" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${emp.id}`); }}
                                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-black border border-white/5 flex items-center justify-center transition-all group/btn"
                                            >
                                                <HiExternalLink className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                        Showing {employees.length} of {meta.total} Entities
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={meta.page <= 1}
                            onClick={() => fetchEmployees(meta.page - 1)}
                            className="p-2 rounded-lg bg-white/5 disabled:opacity-20 hover:bg-white/10 transition-all border border-white/5"
                        >
                            <HiChevronLeft />
                        </button>
                        <span className="px-4 flex items-center text-[10px] font-mono font-black text-primary">
                            PAGE {meta.page} / {meta.last_page}
                        </span>
                        <button
                            disabled={meta.page >= meta.last_page}
                            onClick={() => fetchEmployees(meta.page + 1)}
                            className="p-2 rounded-lg bg-white/5 disabled:opacity-20 hover:bg-white/10 transition-all border border-white/5"
                        >
                            <HiChevronRight />
                        </button>
                    </div>
                </div>

                {loading && employees.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary animate-pulse text-glow">Synchronizing Personnel Grid...</p>
                    </div>
                )}
            </div>

            {/* Employee Modal (Onboard/Edit) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-2xl p-0 shadow-2xl overflow-hidden border-accent/20"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 text-glow">
                                    {editingEmployee ? <HiPencil className="text-warning" /> : <HiUserAdd className="text-primary" />}
                                    {editingEmployee ? 'Update Profile' : 'New Enrollment'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Personnel ID</label>
                                        <div className="relative group">
                                            <HiIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                className="input-pro pl-12 placeholder:italic"
                                                value={form.code}
                                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                                placeholder="Leave blank for auto-generate"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                className="input-pro pl-12"
                                                value={form.full_name}
                                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Direct Email</label>
                                        <div className="relative group">
                                            <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                className="input-pro pl-12"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="alias@domain.pro"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Contact Frequency</label>
                                        <div className="relative group">
                                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                className="input-pro pl-12"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+XX XXX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Division</label>
                                        <div className="relative group">
                                            <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                                            <select
                                                className="input-pro pl-12 appearance-none"
                                                value={form.department_id}
                                                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-background">Assign Division</option>
                                                {Array.isArray(depts) && depts.map(dept => (
                                                    <option key={dept.id} value={dept.id} className="bg-background">{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Operational Rank</label>
                                        <div className="relative group">
                                            <HiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                                            <select
                                                className="input-pro pl-12 appearance-none"
                                                value={form.job_role_id}
                                                onChange={(e) => setForm({ ...form, job_role_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-background">Assign Rank</option>
                                                {Array.isArray(jobRoles) && jobRoles.map(role => (
                                                    <option key={role.id} value={role.id} className="bg-background">{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Shift Assignment</label>
                                        <div className="relative group">
                                            <HiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                                            <select
                                                className="input-pro pl-12 appearance-none"
                                                value={form.shift_id}
                                                onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
                                            >
                                                <option value="" className="bg-background">Unassigned / No Shift</option>
                                                {Array.isArray(shifts) && shifts.map(shift => (
                                                    <option key={shift.id} value={shift.id} className="bg-background">{shift.name} ({shift.start_time}-{shift.end_time})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Activation Date</label>
                                        <div className="relative group">
                                            <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="date"
                                                className="input-pro pl-12"
                                                value={form.hire_date}
                                                onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* System Role Update (only if user login exists) */}
                                {editingEmployee?.User && (
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                                            <HiShieldCheck className="text-lg" />
                                            System Permission Level
                                        </div>
                                        <div className="relative group">
                                            <select
                                                className="input-pro appearance-none font-bold text-accent"
                                                value={form.system_role}
                                                onChange={(e) => setForm({ ...form, system_role: e.target.value })}
                                            >
                                                <option value="EMPLOYEE">Standard Employee (Attendance Only)</option>
                                                <option value="HR_VIEWER">HR Viewer (Read Only)</option>
                                                <option value="HR_MANAGER">HR Manager (Full Access)</option>
                                                <option value="ADMIN">System Administrator (Root)</option>
                                            </select>
                                        </div>
                                        <p className="text-[9px] text-text-secondary italic">
                                            Warning: Granting 'ADMIN' or 'HR_MANAGER' provides elevated access to sensitive data.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-10">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        Abort
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                        {editingEmployee ? 'Synchronize' : 'Commit Profile'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                            onClick={closeInviteModal}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-panel-pro p-10 max-w-lg w-full relative z-[101] border-primary/20 shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-glow uppercase flex items-center gap-3">
                                        <HiTicket className="text-primary" />
                                        Initialize Invite
                                    </h2>
                                    <p className="text-xs text-text-secondary uppercase tracking-[0.2em] mt-2">
                                        Generate a secure, one-time link for onboarding
                                    </p>
                                </div>
                                <button onClick={closeInviteModal} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            {!inviteLink ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Target Email Vector</label>
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="input-pro py-4 px-6 italic"
                                            placeholder="alias@operator.com"
                                        />
                                        <p className="text-[9px] text-text-secondary opacity-40 italic">Link is strictly one-time use per submission vector.</p>
                                    </div>
                                    <button
                                        disabled={inviting || !inviteEmail}
                                        onClick={handleInvite}
                                        className="btn-pro w-full h-16 uppercase font-black tracking-widest text-xs shadow-lg shadow-primary/20"
                                    >
                                        {inviting ? 'Generating Security Token...' : 'Generate Invite Link'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 text-center space-y-4">
                                        <HiCheck className="text-4xl text-green-400 mx-auto" />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Link Sequence Initialized</h3>
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 break-all text-[10px] font-mono text-primary select-all">
                                            {inviteLink}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={copyInviteLink} className="btn-pro flex-1 h-14 flex items-center justify-center gap-2">
                                            <HiShare /> Copy Link
                                        </button>
                                        <button onClick={closeInviteModal} className="btn-ghost-pro flex-1 h-14 text-xs font-black uppercase">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* User Account Modal (from EmployeesPage) */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel-pro w-full max-w-md p-0 shadow-2xl overflow-hidden border-accent/20"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 text-glow">
                                    <HiIdentification className="text-primary" />
                                    Configure Login Access
                                </h3>
                                <button onClick={() => setShowUserModal(false)} className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
                                    <HiUser className="text-3xl text-primary" />
                                    <div>
                                        <div className="text-white font-bold">{selectedEmployeeForUser?.full_name}</div>
                                        <div className="text-[10px] font-mono text-primary uppercase">Username: {selectedEmployeeForUser?.code}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">Access Password</label>
                                    <div className="relative group">
                                        <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            className="input-pro pl-12"
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-secondary italic px-1">Provide a custom password or use the default one.</p>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button onClick={() => setShowUserModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateUser}
                                        disabled={loading}
                                        className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs shadow-lg shadow-primary/20"
                                    >
                                        {loading ? 'Processing...' : 'Activate Access'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* User Forms / Print Modal */}
            {showFormsModal && (
                <UserFormsModal
                    employee={selectedEmployeeForForms}
                    onClose={() => setShowFormsModal(false)}
                />
            )}
        </div>
    );
}

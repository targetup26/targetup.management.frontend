import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiUser, HiTrash, HiPencil, HiPlus, HiX, HiIdentification, HiUserAdd, HiMail, HiPhone, HiOfficeBuilding, HiBriefcase, HiCalendar, HiUserGroup } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function EmployeesPage() {
    const { t } = useTranslation();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        full_name: '',
        email: '',
        phone: '',
        department_id: '',
        job_role_id: '',
        hire_date: new Date().toISOString().split('T')[0]
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            // Safe handling: check if response has data.data (paginated) or is the array itself
            const employeeData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setEmployees(employeeData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
        fetchJobRoles();
    }, []);

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                code: employee.code,
                full_name: employee.full_name,
                email: employee.email || '',
                phone: employee.phone || '',
                department_id: employee.department_id || '',
                job_role_id: employee.job_role_id || '',
                hire_date: employee.hire_date || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                code: '',
                full_name: '',
                email: '',
                phone: '',
                department_id: '',
                job_role_id: '',
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
        try {
            if (editingEmployee) {
                await api.put(`/employees/${editingEmployee.id}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            handleCloseModal();
            fetchEmployees();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save employee');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees();
        } catch (err) {
            alert('Failed to delete employee');
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
                        <HiUserGroup className="text-primary" />
                        {t('employees') || 'Personnel Registry'}
                    </h2>
                    <p className="text-text-secondary mt-1 flex items-center gap-2 italic">
                        {t('manageEmployees') || 'Manage active workforce members and departmental assignments.'}
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal()}
                    className="btn-pro flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
                >
                    <HiUserAdd className="text-xl" />
                    {t('addEmployee') || 'Onboard Personnel'}
                </motion.button>
            </header>

            {/* Employee Modal */}
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
                                    {editingEmployee ? (t('editEmployee') || 'Update Profile') : (t('addEmployee') || 'New Enrollment')}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('employeeCode') || 'Personnel ID'}</label>
                                        <div className="relative group">
                                            <HiIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                className="input-pro pl-12"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                placeholder="LEAVE BLANK FOR AUTO-GEN"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('fullName') || 'Full Legal Name'}</label>
                                        <div className="relative group">
                                            <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                className="input-pro pl-12"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('email') || 'Direct Email'}</label>
                                        <div className="relative group">
                                            <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                className="input-pro pl-12"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="alias@domain.pro"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('phone') || 'Contact Frequency'}</label>
                                        <div className="relative group">
                                            <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                className="input-pro pl-12"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+XX XXX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('department') || 'Division'}</label>
                                        <div className="relative group">
                                            <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                                            <select
                                                className="input-pro pl-12 appearance-none"
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-background">{t('selectDepartment') || 'Assign Division'}</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id} className="bg-background">{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('jobRole') || 'Operational Rank'}</label>
                                        <div className="relative group">
                                            <HiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                                            <select
                                                className="input-pro pl-12 appearance-none"
                                                value={formData.job_role_id}
                                                onChange={(e) => setFormData({ ...formData, job_role_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-background">{t('selectJobRole') || 'Assign Rank'}</option>
                                                {jobRoles.map(role => (
                                                    <option key={role.id} value={role.id} className="bg-background">{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('hireDate') || 'Activation Date'}</label>
                                    <div className="relative group">
                                        <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="date"
                                            className="input-pro pl-12"
                                            value={formData.hire_date}
                                            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        {t('cancel') || 'Abort'}
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                        {editingEmployee ? (t('update') || 'Synchronize') : (t('create') || 'Commit Profile')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Employee Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel-pro overflow-hidden"
            >
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                        <p className="text-text-secondary font-mono tracking-widest uppercase text-xs">Accessing personnel records...</p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="p-20 text-center text-text-secondary">
                        <HiUserGroup className="text-6xl mx-auto mb-4 opacity-10" />
                        <p className="italic">{t('noEmployees') || 'No active personnel records found in the registry.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="p-5 font-bold">{t('code') || 'ID'}</th>
                                    <th className="p-5 font-bold">{t('name') || 'Personnel'}</th>
                                    <th className="p-5 font-bold">{t('department') || 'Division'}</th>
                                    <th className="p-5 font-bold">{t('jobRole') || 'Rank'}</th>
                                    <th className="p-5 font-bold">{t('contact') || 'Comms'}</th>
                                    <th className="p-5 font-bold">{t('hireDate') || 'Tenure'}</th>
                                    <th className="p-5 text-right font-bold">{t('actions') || 'Control'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {employees.map((employee) => (
                                    <tr key={employee.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                        <td className="p-5">
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                {employee.code}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                                                    <HiUser className="text-text-secondary group-hover:text-primary transition-colors text-xl" />
                                                </div>
                                                <div className="font-bold text-white group-hover:text-primary transition-colors text-sm">{employee.full_name}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-[10px] uppercase font-bold tracking-tighter text-text-secondary border border-white/5 bg-white/5 px-2 py-0.5 rounded">
                                                {employee.Department?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs text-text-secondary italic font-serif opacity-80">{employee.JobRole?.name || '-'}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                                                    <HiMail className="text-primary/70" /> {employee.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                                                    <HiPhone className="text-primary/70" /> {employee.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-mono text-white/40">{employee.hire_date || '-'}</td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(employee)}
                                                    className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                                                    title={t('edit') || 'Modify'}
                                                >
                                                    <HiPencil className="text-lg" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="p-2 text-danger hover:bg-danger/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-danger/30"
                                                    title={t('delete') || 'Terminate'}
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
        </div>
    );
}

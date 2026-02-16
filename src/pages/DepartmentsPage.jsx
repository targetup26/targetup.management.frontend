import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOfficeBuilding, HiBriefcase, HiTrash, HiPencil, HiPlus, HiX, HiPlusCircle, HiCollection, HiBadgeCheck } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function DepartmentsPage() {
    const { t } = useTranslation();
    const [departments, setDepartments] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });

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
        fetchDepartments();
        fetchJobRoles();
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

    return (
        <div className="space-y-12 pb-12 text-white">
            {/* Departments Section */}
            <section className="space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <HiCollection className="text-primary" />
                            {t('departments') || 'Organizational Divisions'}
                        </h2>
                        <p className="text-text-secondary mt-1 italic">
                            {t('manageDepartments') || 'Structure your workforce by defining operational sectors and cost centers.'}
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
                        {t('addDepartment') || 'Initialize Sector'}
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
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">{t('department') || 'Division Sector'}</span>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed min-h-[3rem] mb-4">
                                    {dept.description || t('noDepartmentDescription') || 'Establish sector objectives and operational boundaries for this division.'}
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
                        <h2 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <HiBadgeCheck className="text-accent" />
                            {t('jobRoles') || 'Operational Ranks'}
                        </h2>
                        <p className="text-text-secondary mt-1 italic">
                            {t('manageJobRoles') || 'Define operational hierarchies and workforce responsibilities.'}
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
                        {t('addJobRole') || 'Register Rank'}
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
                                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                        <HiBriefcase className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{role.name}</h3>
                                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">{t('jobRole') || 'Personnel Rank'}</span>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed min-h-[3rem] mb-4">
                                    {role.description || t('noRoleDescription') || 'Define specific operational requirements and authority levels for this rank.'}
                                </p>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
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
                                    {editingDept ? (t('editDepartment') || 'Modify Sector') : (t('addDepartment') || 'Initialize Sector')}
                                </h3>
                                <button onClick={() => setShowDeptModal(false)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitDept} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('name') || 'Division Name'}</label>
                                    <input
                                        type="text"
                                        className="input-pro"
                                        value={deptForm.name}
                                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Tactical Operations"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-primary uppercase tracking-wider px-1">{t('description') || 'Sector Objectives'}</label>
                                    <textarea
                                        className="input-pro"
                                        rows="4"
                                        value={deptForm.description}
                                        onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                                        placeholder="Define division responsibilities..."
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        {t('cancel') || 'Abort'}
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs">
                                        {editingDept ? (t('update') || 'Synchronize') : (t('create') || 'Commit')}
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
                                    {editingRole ? (t('editJobRole') || 'Modify Rank') : (t('addJobRole') || 'Register Rank')}
                                </h3>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                    <HiX className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitRole} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-accent uppercase tracking-wider px-1">{t('name') || 'Rank Designation'}</label>
                                    <input
                                        type="text"
                                        className="input-pro"
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Senior Systems Analyst"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono text-accent uppercase tracking-wider px-1">{t('description') || 'Rank Authority'}</label>
                                    <textarea
                                        className="input-pro"
                                        rows="4"
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        placeholder="Define rank scope and responsibilities..."
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs border-accent/20 hover:border-accent/50 text-accent">
                                        {t('cancel') || 'Abort'}
                                    </button>
                                    <button type="submit" className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs bg-accent shadow-accent/20 hover:shadow-accent/40">
                                        {editingRole ? (t('update') || 'Synchronize') : (t('create') || 'Commit')}
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

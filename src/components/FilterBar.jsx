import { useEffect, useState } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function FilterBar({ filters, setFilters }) {
    const { t } = useTranslation();
    const [depts, setDepts] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        // Load Filter Options
        api.get('/departments').then(res => setDepts(res.data)).catch(console.error);
        api.get('/job-roles').then(res => setRoles(res.data)).catch(console.error);
    }, []);

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="glass-panel-pro p-6 mb-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 items-end">
            {/* Date Range */}
            <div className="md:col-span-2">
                <label className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block px-1">{t('dateRange')}</label>
                <div className="flex gap-3">
                    <input type="date" className="input-pro text-sm"
                        value={filters.from || ''} onChange={(e) => handleChange('from', e.target.value)} />
                    <input type="date" className="input-pro text-sm"
                        value={filters.to || ''} onChange={(e) => handleChange('to', e.target.value)} />
                </div>
            </div>

            <div>
                <label className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block px-1">{t('department')}</label>
                <select className="input-pro text-sm"
                    value={filters.department_id || ''} onChange={(e) => handleChange('department_id', e.target.value)}>
                    <option value="" className="bg-background text-white">{t('all')}</option>
                    {depts.map(d => <option key={d.id} value={d.id} className="bg-background text-white">{d.name}</option>)}
                </select>
            </div>

            <div>
                <label className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block px-1">{t('role')}</label>
                <select className="input-pro text-sm"
                    value={filters.job_role_id || ''} onChange={(e) => handleChange('job_role_id', e.target.value)}>
                    <option value="" className="bg-background text-white">{t('all')}</option>
                    {roles.map(r => <option key={r.id} value={r.id} className="bg-background text-white">{r.name}</option>)}
                </select>
            </div>

            <div>
                <label className="text-xs font-mono text-primary uppercase tracking-wider mb-2 block px-1">{t('status')}</label>
                <select className="input-pro text-sm"
                    value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value)}>
                    <option value="" className="bg-background text-white">{t('all')}</option>
                    <option value="PRESENT" className="bg-background text-white">{t('present')}</option>
                    <option value="LATE" className="bg-background text-white">{t('late')}</option>
                    <option value="ABSENT" className="bg-background text-white">{t('absent')}</option>
                    <option value="LEAVE" className="bg-background text-white">{t('leave')}</option>
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setFilters({})}
                    className="w-full btn-ghost-pro text-xs h-[48px] uppercase tracking-widest font-bold">
                    {t('resetFilters') || 'Reset'}
                </button>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { HiX, HiPencilAlt } from 'react-icons/hi';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ManualEntryModal({ isOpen, onClose, onSuccess, editingEntry }) {
    const { t } = useTranslation();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showClockOut, setShowClockOut] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        clock_in: '',
        clock_out: '',
        status: 'PRESENT',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);

            // If editing, populate form with existing data
            if (editingEntry) {
                // Helper function to convert UTC datetime to local datetime-local format
                const toLocalDatetime = (utcString) => {
                    if (!utcString) return '';
                    const date = new Date(utcString);
                    // Adjust for timezone offset to show correct local time
                    const offset = date.getTimezoneOffset() * 60000;
                    const localDate = new Date(date.getTime() - offset);
                    return localDate.toISOString().slice(0, 16);
                };

                const clockIn = toLocalDatetime(editingEntry.clock_in);
                const clockOut = toLocalDatetime(editingEntry.clock_out);

                setFormData({
                    employee_id: editingEntry.employee_id || '',
                    date: editingEntry.date || new Date().toISOString().split('T')[0],
                    clock_in: clockIn,
                    clock_out: clockOut,
                    status: editingEntry.status || 'PRESENT',
                    notes: editingEntry.override_reason || ''
                });
                setShowClockOut(Boolean(clockOut));
            } else {
                // Reset form for new entry
                setFormData({
                    employee_id: '',
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '',
                    clock_out: '',
                    status: 'PRESENT',
                    notes: ''
                });
                setShowClockOut(false);
            }
        }
    }, [isOpen, editingEntry]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingEntry) {
                // Update existing entry
                await api.put(`/attendance/${editingEntry.id}`, formData);
            } else {
                // Create new entry
                await api.post('/attendance', formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to save entry');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <div className="glass-panel-pro w-full max-w-lg p-0 shadow-2xl overflow-hidden border-accent/20">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HiPencilAlt className="text-primary" />
                        {editingEntry ? (t('editEntry') || 'Edit Entry') : t('manualEntry')}
                    </h3>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <HiX className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-primary uppercase tracking-wider mb-2 px-1">{t('employee')}</label>
                        <select
                            required
                            className="input-pro"
                            value={formData.employee_id}
                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        >
                            <option value="" className="bg-background">{t('selectEmployee') || 'Select Employee'}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id} className="bg-background">{emp.full_name} ({emp.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-primary uppercase tracking-wider mb-2 px-1">{t('date')}</label>
                            <input
                                type="date"
                                required
                                className="input-pro"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-primary uppercase tracking-wider mb-2 px-1">{t('status')}</label>
                            <select
                                className="input-pro"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="PRESENT" className="bg-background">{t('present')}</option>
                                <option value="LATE" className="bg-background">{t('late')}</option>
                                <option value="ABSENT" className="bg-background">{t('absent')}</option>
                                <option value="HALF_DAY" className="bg-background">{t('half_day') || 'Half Day'}</option>
                                <option value="LEAVE" className="bg-background">{t('leave')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-primary uppercase tracking-wider mb-2 px-1">{t('clockIn') || 'Clock In'}</label>
                            <input
                                type="datetime-local"
                                className="input-pro"
                                value={formData.clock_in}
                                onChange={(e) => setFormData({ ...formData, clock_in: e.target.value })}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="block text-xs font-mono text-primary uppercase tracking-wider">{t('clockOut') || 'Clock Out'}</label>
                                <label className="flex items-center gap-2 cursor-pointer bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                    <input
                                        type="checkbox"
                                        className="h-3 w-3 rounded bg-white/10 border-white/20 text-primary focus:ring-primary"
                                        checked={showClockOut}
                                        onChange={(e) => {
                                            setShowClockOut(e.target.checked);
                                            if (!e.target.checked) {
                                                setFormData({ ...formData, clock_out: '' });
                                            }
                                        }}
                                    />
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">{t('addClockOut') || 'Add'}</span>
                                </label>
                            </div>
                            {showClockOut ? (
                                <input
                                    type="datetime-local"
                                    className="input-pro animate-in fade-in slide-in-from-top-1"
                                    value={formData.clock_out}
                                    onChange={(e) => setFormData({ ...formData, clock_out: e.target.value })}
                                />
                            ) : (
                                <div className="input-pro opacity-30 cursor-not-allowed bg-white/[0.02] border-dashed border-white/10 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest h-[48px]">
                                    {t('noClockOut') || 'OFF'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-primary uppercase tracking-wider mb-2 px-1">{t('notes') || 'Override Reason'}</label>
                        <textarea
                            className="input-pro min-h-[100px] resize-none"
                            placeholder={t('entryReasonPlaceholder') || 'Reason for manual entry...'}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-ghost-pro py-4 uppercase tracking-widest font-bold text-xs"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-pro py-4 uppercase tracking-widest font-bold text-xs shadow-lg shadow-primary/20"
                        >
                            {loading ? t('saving') || 'Saving...' : t('save') || 'Commit Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

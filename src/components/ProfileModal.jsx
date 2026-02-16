import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiX, HiUser, HiLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user && isOpen) {
            setFormData(prev => ({ ...prev, full_name: user.full_name || '' }));
            setMessage({ type: '', text: '' });
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            setMessage({ type: 'error', text: t('passwordsDoNotMatch') || 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                full_name: formData.full_name,
                password: formData.password, // Current password for verification
                new_password: formData.new_password
            });
            setMessage({ type: 'success', text: t('profileUpdated') || 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', new_password: '', confirm_password: '' }));
            setTimeout(onClose, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || t('updateFailed') || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t('profileSettings') || 'Profile Settings'}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                        <HiX className="text-2xl" />
                    </button>
                </div>

                {message.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('fullName') || 'Full Name'}</label>
                        <div className="relative">
                            <HiUser className="absolute left-3 top-3 text-text-secondary" />
                            <input
                                type="text"
                                name="full_name"
                                className="input-field pl-10"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/10 my-4 pt-4">
                        <p className="text-sm text-text-secondary mb-3">{t('changePassword') || 'Change Password (Optional)'}</p>

                        <div className="space-y-3">
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    className="input-field"
                                    placeholder={t('currentPassword') || "Current Password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="new_password"
                                    className="input-field"
                                    placeholder={t('newPassword') || "New Password"}
                                    value={formData.new_password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    className="input-field"
                                    placeholder={t('confirmNewPassword') || "Confirm New Password"}
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary px-6">
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button type="submit" className="btn-primary px-8" disabled={loading}>
                            {loading ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

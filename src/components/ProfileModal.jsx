import { useState, useEffect } from 'react';
import { HiX, HiUser, HiLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const inputClass = "w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm";

export default function ProfileModal({ isOpen, onClose }) {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({ full_name: '', password: '', new_password: '', confirm_password: '' });
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
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await updateProfile({ full_name: formData.full_name, password: formData.password, new_password: formData.new_password });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, password: '', new_password: '', confirm_password: '' }));
            setTimeout(onClose, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0d1526] border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <HiUser className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Profile Settings</h3>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                        <HiX className="text-xl" />
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`p-3 rounded-xl mb-4 text-sm text-center border ${
                        message.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Full Name</label>
                        <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                            <input
                                type="text"
                                name="full_name"
                                className={`${inputClass} pl-9`}
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <HiLockClosed className="text-white/30 text-sm" />
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Change Password <span className="text-white/20 font-normal normal-case">(optional)</span></p>
                        </div>
                        <div className="space-y-3">
                            <input type="password" name="password" className={inputClass} placeholder="Current Password" value={formData.password} onChange={handleChange} />
                            <input type="password" name="new_password" className={inputClass} placeholder="New Password" value={formData.new_password} onChange={handleChange} />
                            <input type="password" name="confirm_password" className={inputClass} placeholder="Confirm New Password" value={formData.confirm_password} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

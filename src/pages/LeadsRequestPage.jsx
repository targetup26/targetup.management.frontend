import React, { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiSearch, FiGlobe, FiMapPin, FiCheckCircle, FiLoader, FiZap, FiPlus, FiTrash2, FiMap } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import LeadJobStatus from '../components/leads/LeadJobStatus';

const LeadsRequestPage = () => {
    const [loading, setLoading] = useState(false);
    const [manualUrl, setManualUrl] = useState('');
    const [currentJobId, setCurrentJobId] = useState(null);
    const [formData, setFormData] = useState({
        business_type: '',
        city: '',
        state: '',
        country: 'us',
        location: '',
        max_results: 50,
        include_closed: false,
        manual_urls: []
    });

    const addUrl = () => {
        if (!manualUrl) return;
        if (!manualUrl.startsWith('http')) {
            toast.error('Please enter a valid URL');
            return;
        }
        setFormData({
            ...formData,
            manual_urls: [...formData.manual_urls, manualUrl]
        });
        setManualUrl('');
    };

    const removeUrl = (index) => {
        setFormData({
            ...formData,
            manual_urls: formData.manual_urls.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCurrentJobId(null);

        try {
            const res = await api.post('/leads/extract', formData);
            toast.success('Extraction job initialized! Our agents are on it.');

            if (res.data.job_id) {
                setCurrentJobId(res.data.job_id);
            }

            setFormData({
                business_type: '',
                city: '',
                state: '',
                country: 'us',
                location: '',
                max_results: 50,
                include_closed: false,
                manual_urls: []
            });
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Failed to initialize extraction';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <FiZap className="text-3xl text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Advanced Lead Extraction</h1>
                        <p className="text-gray-400">Target your next customers with production-grade intelligence.</p>
                    </div>
                </div>

                {currentJobId && (
                    <div className="mb-8">
                        <LeadJobStatus
                            jobId={currentJobId}
                            onComplete={(count) => toast.success(`Search completed! Found ${count} leads.`)}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Business Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">Business Type / Niche</label>
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Restaurants, Gyms, Clinics"
                                    value={formData.business_type}
                                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Location Query */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">Location Query (Specific)</label>
                            <div className="relative">
                                <FiMap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="e.g. Near Burj Khalifa, Downtown"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">City</label>
                            <div className="relative">
                                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="e.g. Cairo"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* State */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">State / Region</label>
                            <input
                                type="text"
                                placeholder="e.g. Giza, California"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">Country Code (ISO-2)</label>
                            <div className="relative">
                                <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    maxLength="2"
                                    placeholder="us, eg, ae"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                                />
                            </div>
                        </div>

                        {/* Max Results */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 block">Limit Results</label>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.max_results}
                                onChange={(e) => setFormData({ ...formData, max_results: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${formData.include_closed ? 'bg-blue-600 border-blue-600' : 'border-gray-700 bg-gray-800 group-hover:border-gray-500'}`}>
                                {formData.include_closed && <FiCheckCircle className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.include_closed}
                                onChange={(e) => setFormData({ ...formData, include_closed: e.target.checked })}
                            />
                            <span className="text-sm text-gray-300">Include Permanently Closed Places</span>
                        </label>
                    </div>

                    {/* Manual URLs Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <label className="text-sm font-medium text-gray-300 block">Target Specific URLs (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Paste Google Maps URL here..."
                                value={manualUrl}
                                onChange={(e) => setManualUrl(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={addUrl}
                                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-blue-400 hover:bg-gray-700 transition-all"
                            >
                                <FiPlus className="text-xl" />
                            </button>
                        </div>

                        {formData.manual_urls.length > 0 && (
                            <div className="space-y-2">
                                {formData.manual_urls.map((url, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 bg-gray-800/30 border border-gray-700 p-2 rounded-lg truncate text-xs text-gray-400">
                                        <span className="truncate">{url}</span>
                                        <button onClick={() => removeUrl(idx)} className="text-red-400 hover:text-red-300">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <FiLoader className="animate-spin text-xl" /> : <FiZap className="text-xl" />}
                        {loading ? 'Booting Apify...' : 'Launch Production Extraction'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LeadsRequestPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTag, FiChevronRight, FiGrid } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const LeadSubcategoryPage = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategoryData();
    }, [id]);

    const fetchCategoryData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/categories/${id}`);
            setCategory(res.data.data);
        } catch (err) {
            toast.error('Failed to load category data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-0">
            <button
                onClick={() => navigate('/sales/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Industries
            </button>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-10 w-64 bg-gray-800 rounded-lg"></div>
                    <div className="h-4 w-96 bg-gray-800 rounded-lg"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>)}
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{category?.name}</h1>
                        <p className="text-gray-400 mt-1">Explore specific niches and sub-categories within this industry.</p>
                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {category?.Subcategories?.map((sub, idx) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/sales/subcategory/${sub.id}`)}
                                className="bg-gray-900 border border-gray-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/50 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                        <FiTag />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white leading-tight">{sub.name}</h4>
                                        <p className="text-sm text-gray-500 mt-0.5">{sub.lead_count || 0} Total Leads</p>
                                    </div>
                                </div>
                                <div className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                                    <FiChevronRight size={24} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {category?.Subcategories?.length === 0 && (
                        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
                            <FiGrid className="mx-auto text-4xl text-gray-700 mb-4" />
                            <p className="text-gray-500">No sub-categories identified yet in this sector.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LeadSubcategoryPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiUsers, FiChevronRight, FiTrendingUp, FiBriefcase, FiActivity, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const LeadCategoryDashboard = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name) => {
        const icons = {
            'Fitness': <FiActivity />,
            'Food & Beverage': <FiUsers />,
            'Medical': <FiBriefcase />,
            'Real Estate': <FiMapPin />,
            'Automotive': <FiTrendingUp />
        };
        return icons[name] || <FiBriefcase />;
    };

    const getColor = (name) => {
        const colors = {
            'Fitness': 'bg-green-500/10 text-green-500',
            'Food & Beverage': 'bg-orange-500/10 text-orange-500',
            'Medical': 'bg-blue-500/10 text-blue-500',
            'Real Estate': 'bg-purple-500/10 text-purple-500',
            'Automotive': 'bg-red-500/10 text-red-500'
        };
        return colors[name] || 'bg-gray-500/10 text-gray-500';
    };

    return (
        <div className="space-y-8 p-4 md:p-0">
            <div>
                <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
                <p className="text-gray-400">Select an industry to explore classified leads.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-gray-800/50 animate-pulse rounded-2xl border border-gray-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, idx) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(`/sales/category/${category.id}`)}
                            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${getColor(category.name)}`}>
                                    {getIcon(category.name)}
                                </div>
                                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-medium border border-gray-700">
                                    {category.lead_count} Leads
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                            <p className="text-sm text-gray-500">
                                {category.Subcategories?.length || 0} Specializations
                            </p>

                            <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Explore Industry <FiChevronRight className="ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && categories.length === 0 && (
                <div className="py-20 text-center bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
                    <p className="text-gray-500 text-lg">No categories discovered yet. Extract some leads to begin!</p>
                </div>
            )}
        </div>
    );
};

export default LeadCategoryDashboard;

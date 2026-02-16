import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const TaxonomyManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [targetCategory, setTargetCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/taxonomy/categories');
            setCategories(res.data.data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!newName.trim()) {
            toast.error('Please enter a new name');
            return;
        }

        try {
            await api.put(`/admin/taxonomy/categories/${selectedCategory.id}/rename`, {
                new_name: newName
            });
            toast.success('Category renamed successfully!');
            setShowRenameModal(false);
            setNewName('');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to rename category');
        }
    };

    const handleMerge = async () => {
        if (!targetCategory) {
            toast.error('Please select a target category');
            return;
        }

        try {
            await api.post(`/admin/taxonomy/categories/${selectedCategory.id}/merge`, {
                target_category_id: targetCategory
            });
            toast.success('Categories merged successfully!');
            setShowMergeModal(false);
            setTargetCategory(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to merge categories');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/taxonomy/categories/${selectedCategory.id}`);
            toast.success('Category deleted successfully!');
            setShowDeleteModal(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete category');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Taxonomy Management</h1>
                <p className="text-gray-400 mt-1">Manage categories and subcategories for lead classification.</p>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                        <FiTag size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                        <p className="text-sm text-gray-500">{category.lead_count} leads · {category.Subcategories?.length || 0} subcategories</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setNewName(category.name);
                                            setShowRenameModal(true);
                                        }}
                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setShowMergeModal(true);
                                        }}
                                        className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                                    >
                                        <FiPlus />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            {category.Subcategories?.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-800">
                                    {category.Subcategories.map(sub => (
                                        <div key={sub.id} className="px-3 py-2 bg-gray-800/50 rounded-lg text-sm text-gray-300">
                                            {sub.name} ({sub.lead_count})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Rename Category</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                            placeholder="Enter new name"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <FiCheck /> Rename
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Merge Modal */}
            {showMergeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Merge Category</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Merge "{selectedCategory?.name}" into another category. All leads and subcategories will be moved.
                        </p>
                        <select
                            value={targetCategory || ''}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                        >
                            <option value="">Select target category</option>
                            {categories
                                .filter(c => c.id !== selectedCategory?.id)
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowMergeModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMerge}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                <FiPlus /> Merge
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                                <FiAlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Delete Category</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete "{selectedCategory?.name}"? This will also delete all associated subcategories and unlink {selectedCategory?.lead_count} leads.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TaxonomyManagementPage;

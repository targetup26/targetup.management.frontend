import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSave, HiX, HiCode, HiTemplate, HiInformationCircle, HiSparkles, HiChatAlt2 } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import VisualFormBuilder from '../../components/VisualFormBuilder';

export default function FormTemplateEditorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [form, setForm] = useState({
        name: '',
        type: 'custom',
        schema: '{\n  "sections": [\n    {\n      "title": "New Section",\n      "fields": []\n    }\n  ]\n}',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [jsonError, setJsonError] = useState(null);
    const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'code'

    // Helper to get schema object safely
    const getSchemaObject = () => {
        try {
            return JSON.parse(form.schema);
        } catch (e) {
            return { sections: [] };
        }
    };

    const handleSchemaChange = (newSchema) => {
        setForm({ ...form, schema: JSON.stringify(newSchema, null, 2) });
    };

    useEffect(() => {
        if (isEditMode) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/admin/forms/templates/${id}`);
            const data = res.data.template;
            setForm({
                name: data.name,
                type: data.type,
                schema: JSON.stringify(data.schema, null, 2),
                is_active: data.is_active
            });
        } catch (error) {
            alert('Failed to load template');
            navigate('/admin/forms/templates');
        }
    };

    const handleSave = async () => {
        // validate JSON
        try {
            JSON.parse(form.schema);
            setJsonError(null);
        } catch (e) {
            setJsonError(e.message);
            return;
        }

        if (!form.name) {
            alert('Template name is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                type: form.type,
                schema: JSON.parse(form.schema),
                is_active: form.is_active
            };

            if (isEditMode) {
                await api.put(`/admin/forms/templates/${id}`, payload);
            } else {
                await api.post('/admin/forms/templates', payload);
            }

            navigate('/admin/forms/templates');
        } catch (error) {
            alert('Save failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* --- Header --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-glow mb-2">
                        {isEditMode ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}
                    </h1>
                    <p className="text-xs text-text-secondary uppercase tracking-[0.3em]">
                        {isEditMode ? `Updating Schema ID: ${id}` : 'Define Structure JSON'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/forms/templates')}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <HiSave className="text-xl" />
                        <span>{loading ? 'SAVING...' : 'SAVE SCHEMA'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Metadata Panel --- */}
                <div className="space-y-6">
                    <div className="glass-panel-pro p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <HiTemplate className="text-primary" />
                            <span>Metadata</span>
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary mb-2">Template Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                    placeholder="e.g. Employee Evaluation"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary mb-2">Form Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                                    disabled={isEditMode}
                                >
                                    <option value="custom">Custom Form</option>
                                    <option value="join">Join Form (System)</option>
                                    <option value="leave">Leave Form (System)</option>
                                </select>
                                {isEditMode && <p className="text-[10px] text-yellow-500 mt-2">Type cannot be changed after creation.</p>}
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                                />
                                <span className="text-sm font-bold">Active Status</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel-pro p-6 bg-blue-500/5 border-blue-500/10">
                        <div className="flex gap-3">
                            <HiInformationCircle className="text-xl text-blue-400 shrink-0" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-blue-400">Schema Structure</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Define fields within sections. Supported types:
                                    <span className="block font-mono mt-1 text-white/50">text, number, date, select, file, textarea</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- JSON Editor --- */}
                <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
                    <div className="glass-panel-pro flex-1 flex flex-col overflow-hidden relative border-primary/20">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setViewMode('visual')}
                                    className={`flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'visual' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                                >
                                    <HiSparkles className="text-lg" />
                                    <span>VISUAL BUILDER</span>
                                </button>
                                <div className="w-[1px] h-4 bg-white/10" />
                                <button
                                    onClick={() => setViewMode('code')}
                                    className={`flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'code' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                                >
                                    <HiCode className="text-lg" />
                                    <span>JSON CODE</span>
                                </button>
                            </div>
                            {jsonError && (
                                <span className="text-xs font-bold text-red-400 animate-pulse">
                                    ⚠️ Invalid JSON syntax
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {viewMode === 'visual' ? (
                                <div className="p-6">
                                    <VisualFormBuilder
                                        schema={getSchemaObject()}
                                        onChange={handleSchemaChange}
                                    />
                                </div>
                            ) : (
                                <textarea
                                    value={form.schema}
                                    onChange={(e) => setForm({ ...form, schema: e.target.value })}
                                    className="w-full h-full min-h-[500px] bg-[#0d0f12] text-green-400 font-mono text-sm p-6 resize-none outline-none focus:bg-[#0f1115] transition-colors"
                                    spellCheck="false"
                                />
                            )}
                        </div>
                        {jsonError && (
                            <div className="bg-red-500/10 border-t border-red-500/20 px-6 py-3 text-red-400 text-xs font-mono break-all">
                                {jsonError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

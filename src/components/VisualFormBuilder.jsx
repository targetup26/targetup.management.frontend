import React from 'react';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

export default function VisualFormBuilder({ schema, onChange }) {
    // Ensure schema has sections
    const sections = schema?.sections || [];

    const addSection = () => {
        const newSection = {
            title: 'New Section',
            fields: []
        };
        onChange({ ...schema, sections: [...sections, newSection] });
    };

    const updateSection = (index, updates) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], ...updates };
        onChange({ ...schema, sections: newSections });
    };

    const removeSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        onChange({ ...schema, sections: newSections });
    };

    const addField = (sectionIndex) => {
        const newField = {
            label: 'New Field',
            type: 'text',
            required: false
        };
        const newSections = [...sections];
        newSections[sectionIndex].fields.push(newField);
        onChange({ ...schema, sections: newSections });
    };

    const updateField = (sectionIndex, fieldIndex, updates) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields[fieldIndex] = {
            ...newSections[sectionIndex].fields[fieldIndex],
            ...updates
        };
        onChange({ ...schema, sections: newSections });
    };

    const removeField = (sectionIndex, fieldIndex) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields = newSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
        onChange({ ...schema, sections: newSections });
    };

    return (
        <div className="space-y-6">
            {sections.map((section, sIdx) => (
                <div key={sIdx} className="glass-panel-pro p-4 border border-white/10 rounded-xl relative group">
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                            className="bg-transparent text-lg font-bold text-white border-b border-white/10 focus:border-primary outline-none px-2 py-1 flex-1 mr-4"
                            placeholder="Section Title"
                        />
                        <button
                            onClick={() => removeSection(sIdx)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <HiTrash />
                        </button>
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-white/5">
                        {section.fields?.map((field, fIdx) => (
                            <div key={fIdx} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(sIdx, fIdx, { label: e.target.value })}
                                        className="bg-black/20 rounded px-2 py-1 text-sm border border-white/5 focus:border-primary/50 outline-none"
                                        placeholder="Label"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateField(sIdx, fIdx, { type: e.target.value })}
                                        className="bg-black/20 rounded px-2 py-1 text-sm border border-white/5 focus:border-primary/50 outline-none"
                                    >
                                        <option value="text">Text Input</option>
                                        <option value="number">Number</option>
                                        <option value="textarea">Text Area</option>
                                        <option value="date">Date</option>
                                        <option value="select">Dropdown</option>
                                        <option value="file">File Upload</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(sIdx, fIdx, { required: e.target.checked })}
                                            className="rounded border-gray-600 bg-transparent text-primary focus:ring-primary"
                                        />
                                        Req
                                    </label>
                                    <button
                                        onClick={() => removeField(sIdx, fIdx)}
                                        className="text-red-400 hover:text-red-300 text-sm p-1 ml-2"
                                    >
                                        <HiX />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => addField(sIdx)}
                            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                        >
                            <HiPlus /> ADD FIELD
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={addSection}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
                <HiTemplate /> ADD NEW SECTION
            </button>

            {sections.length === 0 && (
                <div className="text-center py-10 opacity-30">
                    <HiSparkles className="text-4xl mx-auto mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">Start building your form</p>
                </div>
            )}
        </div>
    );
};

// Simple Icon component for the delete button if implicit imports fail
const HiX = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

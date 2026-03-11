import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiFolderAdd, HiPencilAlt } from 'react-icons/hi';

export default function InputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder,
    initialValue = '',
    icon = <HiFolderAdd />,
    submitLabel = 'Create'
}) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-panel-pro w-full max-w-md relative z-[301] overflow-hidden border-primary/20 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                                {icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                                <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">Input required for operation</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    autoFocus
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-text-secondary/30"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/5 text-sm font-bold transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!value.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-black transition-all uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-primary/20"
                            >
                                {submitLabel}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

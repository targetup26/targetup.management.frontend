import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiTrash, HiPencilAlt, HiEye, HiFolderOpen } from 'react-icons/hi';

export default function FileContextMenu({ x, y, file, onClose, onAction }) {
    if (!file) return null;

    const menuActions = [
        {
            id: 'open',
            label: file.is_folder ? 'Open Folder' : 'Preview',
            icon: file.is_folder ? HiFolderOpen : HiEye,
            show: true,
            primary: true
        },
        {
            id: 'download',
            label: 'Download',
            icon: HiDownload,
            show: !file.is_folder
        },
        {
            id: 'rename',
            label: 'Rename',
            icon: HiPencilAlt,
            show: true
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: HiTrash,
            show: true,
            danger: true
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ top: y, left: x }}
                className="fixed z-[200] w-56 glass-panel-pro p-1.5 shadow-2xl border-white/10"
            >
                {/* Backdrop to close */}
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={onClose}
                />

                <div className="flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary truncate">
                            {file.is_folder ? 'Folder' : 'File'} Action
                        </p>
                        <p className="text-xs font-bold truncate text-white">{file.original_name}</p>
                    </div>

                    {menuActions.filter(a => a.show).map(action => (
                        <button
                            key={action.id}
                            onClick={() => {
                                onAction(action.id, file);
                                onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${action.danger
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : action.primary
                                        ? 'text-primary hover:bg-primary/10'
                                        : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <action.icon className="text-lg opacity-70" />
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

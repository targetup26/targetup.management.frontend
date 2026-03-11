import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUpload,
    HiDownload,
    HiDocument,
    HiClock,
    HiSearch,
    HiFolder,
    HiViewGrid,
    HiViewList,
    HiDotsVertical,
    HiFolderAdd,
    HiEye,
    HiShieldExclamation
} from 'react-icons/hi';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import BreadcrumbNav from '../components/storage/BreadcrumbNav';
import FileContextMenu from '../components/storage/FileContextMenu';
import InputModal from '../components/storage/InputModal';

export default function MyFilesPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [thumbnails, setThumbnails] = useState({});
    const [previewingFile, setPreviewingFile] = useState(null);

    // New State for Upgrades
    const [viewMode, setViewMode] = useState('grid');
    const [currentFolder, setCurrentFolder] = useState(null);
    const [navigationStack, setNavigationStack] = useState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [inputModal, setInputModal] = useState({ isOpen: false, type: 'create', item: null });

    useEffect(() => {
        loadUserInfo();
    }, []);

    useEffect(() => {
        if (user) {
            loadFiles(null);
        }
    }, [user]);

    const loadUserInfo = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const loadFiles = async (folderId = null) => {
        setLoading(true);
        try {
            const response = await api.get('/storage/files', {
                params: { folder_id: folderId }
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderNavigate = (folder) => {
        if (!folder) {
            setCurrentFolder(null);
            setNavigationStack([]);
            loadFiles(null);
        } else {
            setCurrentFolder(folder);
            setNavigationStack(prev => [...prev, folder]);
            loadFiles(folder.id);
        }
    };

    const handleBreadcrumbNavigate = (folder) => {
        if (!folder) {
            setCurrentFolder(null);
            setNavigationStack([]);
            loadFiles(null);
        } else {
            const index = navigationStack.findIndex(f => f.id === folder.id);
            const newStack = navigationStack.slice(0, index + 1);
            setCurrentFolder(folder);
            setNavigationStack(newStack);
            loadFiles(folder.id);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!user?.employee_id) return;

        setUploading(true);
        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('employee_id', user.employee_id);
                formData.append('department_id', user.department_id);
                if (currentFolder) {
                    formData.append('folder_id', currentFolder.id);
                }

                await api.post('/storage/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                });
            }
            await loadFiles(currentFolder?.id);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [user, currentFolder]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const createFolder = async (name) => {
        try {
            await api.post('/storage/folders', {
                name,
                department_id: user.department_id,
                employee_id: user.employee_id,
                folder_id: currentFolder?.id || null
            });
            loadFiles(currentFolder?.id);
        } catch (err) {
            console.error('Create folder failed:', err);
        }
    };

    const handleRename = async (newName) => {
        const item = inputModal.item;
        if (!item || !newName || newName === item.original_name) return;

        try {
            await api.put(`/storage/${item.id}/rename`, { new_name: newName });
            loadFiles(currentFolder?.id);
        } catch (err) {
            console.error('Rename failed:', err);
        }
    };

    const openCreateFolderModal = () => {
        setInputModal({ isOpen: true, type: 'create', item: null });
    };

    const openRenameModal = (item) => {
        setInputModal({ isOpen: true, type: 'rename', item });
    };

    const downloadFile = (file) => {
        if (file.is_folder) return;
        const token = localStorage.getItem('token');
        const baseUrl = api.defaults.baseURL;
        const downloadUrl = `${baseUrl}/storage/download/${file.id}?download=true&token=${token}`;
        window.open(downloadUrl, '_blank');
    };

    const loadContent = (file) => {
        if (thumbnails[file.id]) return thumbnails[file.id];
        const token = localStorage.getItem('token');
        const baseUrl = api.defaults.baseURL;
        const url = `${baseUrl}/storage/download/${file.id}?token=${token}`;
        setThumbnails(prev => ({ ...prev, [file.id]: url }));
        return url;
    };

    const handlePreview = (file) => {
        if (file.is_folder) {
            handleFolderNavigate(file);
            return;
        }
        setPreviewingFile(file);
        if (file.mime_type?.startsWith('image/') || file.mime_type?.includes('pdf')) {
            loadContent(file);
        }
    };

    const deleteFile = async (file) => {
        if (!confirm(`Delete "${file.original_name}"?`)) return;
        try {
            await api.delete(`/storage/${file.id}`);
            setFiles(f => f.filter(x => x.id !== file.id));
        } catch (err) { console.error(err); }
    };

    const handleAction = (action, file) => {
        switch (action) {
            case 'open': handlePreview(file); break;
            case 'download': downloadFile(file); break;
            case 'rename': openRenameModal(file); break;
            case 'delete': deleteFile(file); break;
            default: break;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        if (file.is_folder) return <HiFolder className="text-yellow-500" />;
        const mime = file.mime_type;
        if (mime?.startsWith('image/')) return '🖼️';
        if (mime?.includes('pdf')) return '📄';
        return '📎';
    };

    const filteredFiles = files.filter(f => f.original_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full gap-6 select-none p-6" onClick={() => setContextMenu(null)}>
            {/* Header / Actions */}
            <div className="glass-panel-pro p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-1">
                    <h1 className="text-xl font-bold tracking-tight sr-only">My Files</h1>
                    <div className="relative flex-1 max-w-sm">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search in my files..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <BreadcrumbNav
                        path={navigationStack}
                        onNavigate={handleBreadcrumbNavigate}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                        >
                            <HiViewGrid className="text-lg" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                        >
                            <HiViewList className="text-lg" />
                        </button>
                    </div>
                    <button
                        onClick={openCreateFolderModal}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <HiFolderAdd className="text-xl" />
                        <span>New Folder</span>
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`glass-panel-pro border-2 border-dashed p-8 cursor-pointer transition-all shrink-0 ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-primary/30'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <div className="w-full max-w-sm">
                            <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                <span className="animate-pulse text-primary">Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-primary" animate={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <HiUpload className="text-3xl text-primary opacity-70" />
                            <div className="text-center">
                                <p className="font-bold text-sm">Drop files into "{currentFolder?.original_name || 'Root'}"</p>
                                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Secure Tunnel Multi-Part Upload</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Explorer */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Retrieving metadata...</span>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <HiDocument className="text-6xl mx-auto mb-4" />
                        <p className="uppercase tracking-widest font-bold text-xs">This dimension is empty</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-10">
                        {filteredFiles.map(file => (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`glass-panel-pro p-5 group relative cursor-pointer border-transparent transition-all hover:bg-white/[0.02] ${file.is_sensitive ? 'bg-red-500/5' : ''}`}
                                onDoubleClick={() => handlePreview(file)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({ x: e.clientX, y: e.clientY, file });
                                }}
                            >
                                <div className="text-4xl mb-4 h-24 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 transition-transform group-hover:scale-105">
                                    {file.is_folder ? (
                                        <HiFolder className="text-amber-400 text-6xl drop-shadow-md" />
                                    ) : thumbnails[file.id] ? (
                                        <img src={thumbnails[file.id]} alt={file.original_name} className="w-full h-full object-cover rounded-lg" />
                                    ) : getFileIcon(file)}
                                </div>

                                <p className="text-xs font-bold truncate mb-1" title={file.original_name}>{file.original_name}</p>
                                <div className="flex items-center justify-between text-[9px] text-text-secondary font-black uppercase tracking-tighter">
                                    <span>{file.is_folder ? 'Folder' : formatFileSize(file.file_size)}</span>
                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>

                                <button
                                    className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenu({ x: e.clientX, y: e.clientY, file });
                                    }}
                                >
                                    <HiDotsVertical />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel-pro overflow-hidden border-white/5">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-text-secondary">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Size</th>
                                    <th className="px-6 py-4">Modified</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {filteredFiles.map(file => (
                                    <tr
                                        key={file.id}
                                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        onDoubleClick={() => handlePreview(file)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setContextMenu({ x: e.clientX, y: e.clientY, file });
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs font-bold">
                                                {getFileIcon(file)}
                                                <span>{file.original_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-text-secondary">
                                            {file.is_folder ? '--' : formatFileSize(file.file_size)}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-text-secondary">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="p-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setContextMenu({ x: e.clientX, y: e.clientY, file });
                                                }}
                                            >
                                                <HiDotsVertical />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PreviewModal
                file={previewingFile}
                onClose={() => setPreviewingFile(null)}
                thumbnail={previewingFile ? thumbnails[previewingFile.id] : null}
            />

            {contextMenu && (
                <FileContextMenu
                    {...contextMenu}
                    onAction={handleAction}
                    onClose={() => setContextMenu(null)}
                />
            )}

            <InputModal
                isOpen={inputModal.isOpen}
                onClose={() => setInputModal({ ...inputModal, isOpen: false })}
                onSubmit={inputModal.type === 'create' ? createFolder : handleRename}
                title={inputModal.type === 'create' ? 'Create New Folder' : 'Rename Item'}
                placeholder={inputModal.type === 'create' ? 'Folder name...' : 'New name...'}
                initialValue={inputModal.type === 'rename' ? inputModal.item.original_name : ''}
                submitLabel={inputModal.type === 'create' ? 'Create' : 'Save Changes'}
                icon={inputModal.type === 'create' ? <HiFolderAdd /> : <HiPencilAlt className="text-amber-400" />}
            />
        </div>
    );
}

function PreviewModal({ file, onClose, thumbnail }) {
    if (!file) return null;
    const isImage = file.mime_type?.startsWith('image/');
    const isPDF = file.mime_type?.includes('pdf');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel-pro w-full max-w-4xl h-[80vh] flex flex-col relative z-[101] overflow-hidden border-primary/20 shadow-2xl">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <p className="text-xs font-black uppercase tracking-widest">{file.original_name}</p>
                        <button onClick={onClose} className="text-2xl hover:text-primary transition-colors">×</button>
                    </div>
                    <div className="flex-1 bg-black/20 flex items-center justify-center overflow-auto">
                        {isImage ? <img src={thumbnail} className="max-w-full max-h-full object-contain p-4" /> :
                            isPDF ? <iframe src={thumbnail} className="w-full h-full bg-white" /> :
                                <div className="text-center p-10 font-bold opacity-30 uppercase tracking-tighter">No Preview Available</div>}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    HiFolder,
    HiUser,
    HiDocument,
    HiDownload,
    HiTrash,
    HiUpload,
    HiShieldExclamation,
    HiClock,
    HiCheckCircle,
    HiChevronRight,
    HiSearch,
    HiViewGrid,
    HiViewList,
    HiEye,
    HiDotsVertical,
    HiFolderAdd,
    HiPencilAlt
} from 'react-icons/hi';
import apiService from '../../services/api';
import PermissionGuard from '../../components/PermissionGuard';
import BreadcrumbNav from '../../components/storage/BreadcrumbNav';
import FileContextMenu from '../../components/storage/FileContextMenu';
import InputModal from '../../components/storage/InputModal';

export default function FileManagerPage() {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewingFile, setPreviewingFile] = useState(null);
    const [thumbnails, setThumbnails] = useState({});
    const [failedThumbnails, setFailedThumbnails] = useState(new Set());

    // New State for Upgrades
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [currentFolder, setCurrentFolder] = useState(null);
    const [navigationStack, setNavigationStack] = useState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [inputModal, setInputModal] = useState({ isOpen: false, type: 'folder', item: null });
    const [shareModal, setShareModal] = useState({ isOpen: false, file: null, link: null, loading: false });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const response = await apiService.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Failed to load departments:', error);
        }
    };

    const loadFiles = async (employee, folderId = null) => {
        setLoading(true);
        setSelectedFiles([]);

        try {
            const response = await apiService.get('/storage/files', {
                params: {
                    employee_id: employee?.id,
                    department_id: selectedDepartment?.id,
                    folder_id: folderId
                }
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        setCurrentFolder(null);
        setNavigationStack([]);
        loadFiles(emp, null);
    };

    const handleFolderNavigate = (folder) => {
        if (!folder) {
            setCurrentFolder(null);
            setNavigationStack([]);
            loadFiles(selectedEmployee, null);
        } else {
            setCurrentFolder(folder);
            setNavigationStack(prev => [...prev, folder]);
            loadFiles(selectedEmployee, folder.id);
        }
    };

    const handleBreadcrumbNavigate = (folder) => {
        if (!folder) {
            setCurrentFolder(null);
            setNavigationStack([]);
            loadFiles(selectedEmployee, null);
        } else {
            const index = navigationStack.findIndex(f => f.id === folder.id);
            const newStack = navigationStack.slice(0, index + 1);
            setCurrentFolder(folder);
            setNavigationStack(newStack);
            loadFiles(selectedEmployee, folder.id);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!selectedEmployee || !selectedDepartment) return;

        setUploading(true);
        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('department_id', selectedDepartment.id);
                formData.append('employee_id', selectedEmployee.id);
                if (currentFolder) {
                    formData.append('folder_id', currentFolder.id);
                }

                await apiService.post('/storage/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                });
            }
            await loadFiles(selectedEmployee, currentFolder?.id);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [selectedDepartment, selectedEmployee, currentFolder]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: !selectedEmployee
    });

    const createFolder = async (name) => {
        try {
            await apiService.post('/storage/folders', {
                name,
                department_id: selectedDepartment.id,
                employee_id: selectedEmployee.id,
                folder_id: currentFolder?.id || null
            });
            loadFiles(selectedEmployee, currentFolder?.id);
        } catch (err) {
            console.error('Create folder failed:', err);
        }
    };

    const handleRename = async (newName) => {
        const item = inputModal.item;
        if (!item || !newName || newName === item.original_name) return;

        try {
            await apiService.put(`/storage/${item.id}/rename`, { new_name: newName });
            loadFiles(selectedEmployee, currentFolder?.id);
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
        const baseUrl = apiService.defaults.baseURL;
        const downloadUrl = `${baseUrl}/storage/download/${file.id}?download=true&token=${token}`;
        window.open(downloadUrl, '_blank');
    };

    const loadContent = (file) => {
        if (thumbnails[file.id]) return thumbnails[file.id];
        if (failedThumbnails.has(file.id)) return null; // Don't retry failed

        const token = localStorage.getItem('token');
        const baseUrl = apiService.defaults.baseURL;
        const url = `${baseUrl}/storage/download/${file.id}?token=${token}`;

        setThumbnails(prev => ({ ...prev, [file.id]: url }));
        return url;
    };

    const handleThumbnailError = (fileId) => {
        setFailedThumbnails(prev => new Set([...prev, fileId]));
        setThumbnails(prev => { const next = { ...prev }; delete next[fileId]; return next; });
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

    useEffect(() => {
        files.forEach(file => {
            if (file.mime_type?.startsWith('image/') && !failedThumbnails.has(file.id)) {
                loadContent(file);
            }
        });
    }, [files]);

    const deleteFile = async (file) => {
        if (!confirm(`Permanently delete "${file.original_name}"?`)) return;
        try {
            await apiService.delete(`/storage/${file.id}`);
            setFiles(f => f.filter(x => x.id !== file.id));
        } catch (err) { console.error(err); }
    };

    const generateShareLink = async (file) => {
        setShareModal({ isOpen: true, file, link: null, loading: true });
        try {
            const res = await apiService.post(`/storage/share/${file.id}`, { expires_in_days: 7 });
            setShareModal(prev => ({ ...prev, link: res.data.share_url, loading: false }));
        } catch (err) {
            console.error('Share link error:', err);
            setShareModal(prev => ({ ...prev, loading: false, link: null }));
        }
    };

    const handleAction = (action, file) => {
        switch (action) {
            case 'open': handlePreview(file); break;
            case 'download': downloadFile(file); break;
            case 'rename': openRenameModal(file); break;
            case 'delete': deleteFile(file); break;
            case 'share': generateShareLink(file); break;
            default: break;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        if (file.is_folder) return <HiFolder className="text-amber-400" />;
        const mime = file.mime_type;
        if (mime?.startsWith('image/')) return '🖼️';
        if (mime?.startsWith('video/')) return '🎥';
        if (mime?.includes('pdf')) return '📄';
        return '📎';
    };

    const filteredFiles = files.filter(f => f.original_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-full gap-6 select-none" onClick={() => setContextMenu(null)}>
            {/* Sidebar Explorer */}
            <div className="w-80 glass-panel-pro flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                        <HiFolder className="text-primary" />
                        Explorer
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {departments.map(dept => (
                        <div key={dept.id} className="space-y-1">
                            <button
                                onClick={() => setSelectedDepartment(selectedDepartment?.id === dept.id ? null : dept)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedDepartment?.id === dept.id ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10' : 'hover:bg-white/5 text-text-secondary'
                                    }`}
                            >
                                <motion.div animate={{ rotate: selectedDepartment?.id === dept.id ? 90 : 0 }}>
                                    <HiChevronRight />
                                </motion.div>
                                <HiFolder className="text-amber-400 text-lg" />
                                <span className="font-bold text-sm truncate">{dept.name}</span>
                            </button>

                            <AnimatePresence>
                                {selectedDepartment?.id === dept.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="ml-6 space-y-1 overflow-hidden"
                                    >
                                        {dept.Employees?.map(emp => (
                                            <button
                                                key={emp.id}
                                                onClick={() => handleEmployeeSelect(emp)}
                                                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedEmployee?.id === emp.id ? 'bg-white/10 text-white shadow-inner' : 'hover:bg-white/5 text-text-secondary'
                                                    }`}
                                            >
                                                <HiUser className="opacity-50" />
                                                <span className="truncate">{emp.full_name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 gap-6">
                {/* Search & Actions Bar */}
                <div className="glass-panel-pro p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search in directory..."
                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:border-primary/50 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {selectedEmployee && (
                            <BreadcrumbNav
                                path={navigationStack}
                                onNavigate={handleBreadcrumbNavigate}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedEmployee && (
                            <div className="flex gap-1 p-1 bg-white/5 rounded-lg mr-4">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'}`}
                                    title="Grid View"
                                >
                                    <HiViewGrid className="text-lg" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'}`}
                                    title="List View"
                                >
                                    <HiViewList className="text-lg" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                disabled={!selectedEmployee}
                                onClick={openCreateFolderModal}
                                className="px-5 py-2.5 bg-primary hover:bg-primary-dark border border-primary/20 rounded-xl text-white text-sm font-black flex items-center gap-2 disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <HiFolderAdd className="text-xl" />
                                <span>NEW FOLDER</span>
                            </button>
                        </div>
                    </div>
                </div>

                {!selectedEmployee ? (
                    <div className="flex-1 glass-panel-pro flex flex-col items-center justify-center text-center p-20 gap-4 opacity-50">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl">📁</div>
                        <h3 className="text-xl font-bold">No Directory Selected</h3>
                        <p className="text-text-secondary text-sm max-w-xs uppercase tracking-tighter">Choose an employee from the explorer to manage their file system.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Drag & Drop Upload */}
                        <div
                            {...getRootProps()}
                            className={`glass-panel-pro border-2 border-dashed p-8 cursor-pointer group transition-all shrink-0 ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-primary/30'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-3">
                                {uploading ? (
                                    <div className="w-full max-w-sm">
                                        <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                            <span className="animate-pulse">Uploading Protocol...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl group-hover:scale-110 transition-transform">
                                            <HiUpload />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-sm tracking-tight">Secure Upload Port</p>
                                            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">Drag files into "{currentFolder?.original_name || 'Root'}" or click to bypass</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* File Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Decrypting Files...</span>
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <HiDocument className="text-6xl mx-auto mb-4" />
                                    <p className="uppercase tracking-widest font-bold text-xs">Folder Empty</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
                                    {filteredFiles.map(file => (
                                        <motion.div
                                            key={file.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`glass-panel-pro p-5 group relative cursor-pointer border-transparent transition-all ${selectedFiles.includes(file.id) ? 'border-primary shadow-lg shadow-primary/10' : ''
                                                } ${file.is_sensitive ? 'bg-red-500/5' : ''}`}
                                            onClick={() => setViewMode(viewMode)} // dummy to prevent bubble
                                            onDoubleClick={() => handlePreview(file)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, file });
                                            }}
                                        >
                                            {file.is_sensitive && (
                                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase">
                                                    <HiShieldExclamation /> Sensitive
                                                </div>
                                            )}

                                            <div className="text-4xl mb-4 pt-4 text-center group-hover:scale-105 transition-transform h-32 flex items-center justify-center overflow-hidden rounded-xl bg-white/[0.02] border border-white/5">
                                                {file.is_folder ? (
                                                    <HiFolder className="text-amber-400 text-6xl drop-shadow-md" />
                                                ) : thumbnails[file.id] ? (
                                                    <img
                                                        src={thumbnails[file.id]}
                                                        alt={file.original_name}
                                                        className="w-full h-full object-cover"
                                                        onError={() => handleThumbnailError(file.id)}
                                                    />
                                                ) : getFileIcon(file)}
                                            </div>

                                            <p className="text-sm font-bold truncate mb-1" title={file.original_name}>
                                                {file.original_name}
                                            </p>

                                            <div className="flex items-center gap-4 text-[10px] text-text-secondary font-bold uppercase tracking-tighter">
                                                <span>{file.is_folder ? 'Directory' : formatFileSize(file.file_size)}</span>
                                                <div className="flex items-center gap-1">
                                                    <HiClock /> {new Date(file.createdAt).toLocaleDateString()}
                                                </div>
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
                                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
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
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-xl">
                                                                {getFileIcon(file)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{file.original_name}</p>
                                                                {file.is_sensitive && <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Sensitive</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-text-secondary">
                                                        {file.is_folder ? '--' : formatFileSize(file.file_size)}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-text-secondary">
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
                    onClose={() => setContextMenu(null)}
                    onAction={handleAction}
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

            {/* Share Link Modal */}
            <AnimatePresence>
                {shareModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShareModal({ isOpen: false, file: null, link: null, loading: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-panel-pro p-8 w-full max-w-lg mx-4 rounded-2xl border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">🔗</div>
                                <div>
                                    <h3 className="font-black text-white text-sm uppercase tracking-widest">Share Link</h3>
                                    <p className="text-xs text-text-secondary truncate max-w-xs">{shareModal.file?.original_name}</p>
                                </div>
                            </div>

                            {shareModal.loading ? (
                                <div className="flex items-center justify-center gap-3 py-6">
                                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    <span className="text-sm text-text-secondary">Generating secure link...</span>
                                </div>
                            ) : shareModal.link ? (
                                <div className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                        <span className="text-xs text-white/60 break-all flex-1 font-mono">{shareModal.link}</span>
                                        <button
                                            onClick={() => {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(shareModal.link);
                                                } else {
                                                    const el = document.createElement('textarea');
                                                    el.value = shareModal.link;
                                                    document.body.appendChild(el);
                                                    el.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(el);
                                                }
                                            }}
                                            className="shrink-0 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition-all"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-text-secondary text-center uppercase tracking-widest">
                                        ⏰ Expires in 7 days · Anyone with this link can download
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => window.open(shareModal.link, '_blank')}
                                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition"
                                        >
                                            Open Page
                                        </button>
                                        <button
                                            onClick={() => setShareModal({ isOpen: false, file: null, link: null, loading: false })}
                                            className="flex-1 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest transition"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-400 text-sm text-center py-4">Failed to generate link. Try again.</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PreviewModal({ file, onClose, thumbnail }) {
    if (!file) return null;

    const isImage = file.mime_type?.startsWith('image/');
    const isPDF = file.mime_type?.includes('pdf');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-panel-pro w-full max-w-5xl h-full flex flex-col relative z-[101] overflow-hidden border-primary/20 shadow-2xl"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                                📎
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{file.original_name}</h3>
                                <p className="text-xs text-text-secondary uppercase tracking-widest">{file.mime_type} • Version {file.version}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 bg-black/20 flex items-center justify-center overflow-auto min-h-0">
                        {isImage ? (
                            <div className="p-4 sm:p-10 flex items-center justify-center h-full">
                                <img
                                    src={thumbnail}
                                    alt={file.original_name}
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                                />
                            </div>
                        ) : isPDF ? (
                            <iframe
                                src={`${thumbnail}#toolbar=0`}
                                className="w-full h-full border-none bg-white"
                                title={file.original_name}
                            />
                        ) : (
                            <div className="text-center space-y-4 p-10">
                                <span className="text-8xl block">📎</span>
                                <h4 className="text-xl font-bold">No High-Def Preview Available</h4>
                                <p className="text-text-secondary uppercase tracking-widest text-[10px] font-black">Binary stream detected. Download to inspect.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
                        <button onClick={onClose} className="px-8 py-3 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                            Close Vector
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

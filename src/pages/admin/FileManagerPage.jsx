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
    HiEye
} from 'react-icons/hi';
import apiService from '../../services/api';
import PermissionGuard from '../../components/PermissionGuard';

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

    const loadEmployeeFiles = async (employee) => {
        setSelectedEmployee(employee);
        setLoading(true);
        setSelectedFiles([]);

        try {
            const response = await apiService.get('/storage/files', {
                params: { employee_id: employee.id }
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoading(false);
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

                await apiService.post('/storage/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                });
            }
            await loadEmployeeFiles(selectedEmployee);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [selectedDepartment, selectedEmployee]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: !selectedEmployee
    });

    const downloadFile = (file) => {
        const token = localStorage.getItem('token');
        const baseUrl = apiService.defaults.baseURL;
        const downloadUrl = `${baseUrl}/storage/download/${file.id}?download=true&token=${token}`;

        // Use window.open for direct browser download
        // This solves CORS and memory issues for large files
        window.open(downloadUrl, '_blank');
    };

    const loadContent = (file) => {
        if (thumbnails[file.id]) return thumbnails[file.id];

        const token = localStorage.getItem('token');
        const baseUrl = apiService.defaults.baseURL;
        const url = `${baseUrl}/storage/download/${file.id}?token=${token}`;

        setThumbnails(prev => ({ ...prev, [file.id]: url }));
        return url;
    };

    const handlePreview = (file) => {
        setPreviewingFile(file);
        if (file.mime_type?.startsWith('image/') || file.mime_type?.includes('pdf')) {
            loadContent(file);
        }
    };

    useEffect(() => {
        files.forEach(file => {
            if (file.mime_type?.startsWith('image/')) {
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

    const toggleFileSelection = (fileId) => {
        setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mime) => {
        if (mime?.startsWith('image/')) return '🖼️';
        if (mime?.startsWith('video/')) return '🎥';
        if (mime?.includes('pdf')) return '📄';
        return '📎';
    };

    const filteredFiles = files.filter(f => f.original_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-full gap-6">
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
                                <HiFolder className="text-lg" />
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
                                                onClick={() => loadEmployeeFiles(emp)}
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
                    <div className="relative flex-1 max-w-md">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search in folder..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:border-primary/50 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 text-[10px] items-center text-text-secondary uppercase tracking-widest font-bold">
                        <HiViewGrid className="text-lg text-primary" />
                        Grid View
                    </div>
                </div>

                {!selectedEmployee ? (
                    <div className="flex-1 glass-panel-pro flex flex-col items-center justify-center text-center p-20 gap-4 opacity-50">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl">📁</div>
                        <h3 className="text-xl font-bold">No Directory Selected</h3>
                        <p className="text-text-secondary text-sm max-w-xs uppercase tracking-tighter">Choose a department and employee from the explorer to manage their files.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Drag & Drop Upload */}
                        <div
                            {...getRootProps()}
                            className={`glass-panel-pro border-2 border-dashed p-10 cursor-pointer group transition-all shrink-0 ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-primary/30'
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
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl group-hover:scale-110 transition-transform">
                                            <HiUpload />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold tracking-tight">Secure Upload Port</p>
                                            <p className="text-xs text-text-secondary uppercase tracking-widest">Drag files here or click to bypass</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* File Grid */}
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
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-10">
                                    {filteredFiles.map(file => (
                                        <motion.div
                                            key={file.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`glass-panel-pro p-5 group relative cursor-pointer border-transparent transition-all ${selectedFiles.includes(file.id) ? 'border-primary shadow-lg shadow-primary/10' : ''
                                                } ${file.is_sensitive ? 'bg-red-500/5' : ''}`}
                                            onClick={() => toggleFileSelection(file.id)}
                                        >
                                            {file.is_sensitive && (
                                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase">
                                                    <HiShieldExclamation /> Sensitive
                                                </div>
                                            )}

                                            <div className="text-4xl mb-4 pt-4 text-center group-hover:scale-110 transition-transform h-32 flex items-center justify-center overflow-hidden rounded-xl bg-white/[0.02] border border-white/5">
                                                {thumbnails[file.id] ? (
                                                    <img src={thumbnails[file.id]} alt={file.original_name} className="w-full h-full object-cover" />
                                                ) : getFileIcon(file.mime_type)}
                                            </div>

                                            <p className="text-sm font-bold truncate mb-1" title={file.original_name} onClick={(e) => { e.stopPropagation(); handlePreview(file); }}>
                                                {file.original_name}
                                            </p>

                                            <div className="flex items-center gap-4 text-[10px] text-text-secondary font-medium">
                                                <span>{formatFileSize(file.file_size)}</span>
                                                <div className="flex items-center gap-1">
                                                    <HiClock /> {new Date(file.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Action Overlay */}
                                            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePreview(file); }}
                                                    className="flex-1 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-lg flex items-center justify-center transition-colors"
                                                    title="Quick Preview"
                                                >
                                                    <HiEye />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                                                    className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-lg flex items-center justify-center transition-colors"
                                                    title="Download Vector"
                                                >
                                                    <HiDownload />
                                                </button>
                                                <PermissionGuard permission="storage.delete">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteFile(file); }}
                                                        className="flex-1 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <HiTrash />
                                                    </button>
                                                </PermissionGuard>
                                            </div>

                                            {selectedFiles.includes(file.id) && (
                                                <HiCheckCircle className="absolute top-4 right-4 text-primary text-xl" />
                                            )}
                                        </motion.div>
                                    ))}
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

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUpload, HiDownload, HiDocument, HiClock } from 'react-icons/hi';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';

export default function MyFilesPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUserInfo();
        loadMyFiles();
    }, []);

    const loadUserInfo = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const loadMyFiles = async () => {
        try {
            const response = await api.get('/storage/files');
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    };

    const onDrop = async (acceptedFiles) => {
        if (!user?.employee_id) {
            alert('No employee record found for your account');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('employee_id', user.employee_id);
                formData.append('department_id', user.department_id);

                await api.post('/storage/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                });

                setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
            }

            await loadMyFiles();
            alert('Files uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const downloadFile = async (file) => {
        try {
            const response = await api.get(`/storage/download/${file.id}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.original_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return '🖼️';
        if (mimeType?.startsWith('video/')) return '🎥';
        if (mimeType?.includes('pdf')) return '📄';
        if (mimeType?.includes('word')) return '📝';
        if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
        return '📎';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Files</h1>

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-all cursor-pointer ${isDragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                    }`}
            >
                <input {...getInputProps()} />
                <HiUpload className="text-5xl mx-auto mb-3 text-primary" />
                {uploading ? (
                    <div>
                        <p className="text-lg mb-2">Uploading... {uploadProgress}%</p>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-lg mb-1">
                            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                        </p>
                        <p className="text-sm text-text-secondary">or click to browse</p>
                    </>
                )}
            </div>

            {/* Files Grid */}
            {files.length === 0 ? (
                <div className="text-center py-10 text-text-secondary">
                    <HiDocument className="text-5xl mx-auto mb-3 opacity-50" />
                    <p>No files uploaded yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.map(file => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel-pro p-4"
                        >
                            <div className="text-5xl mb-3 text-center">
                                {getFileIcon(file.mime_type)}
                            </div>

                            <p className="text-sm font-medium mb-1 truncate" title={file.original_name}>
                                {file.original_name}
                            </p>

                            <div className="text-xs text-text-secondary space-y-1 mb-3">
                                <p>{formatFileSize(file.file_size)}</p>
                                <p className="flex items-center gap-1">
                                    <HiClock className="text-xs" />
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                                {file.version > 1 && (
                                    <p className="text-primary">v{file.version}</p>
                                )}
                            </div>

                            <button
                                onClick={() => downloadFile(file)}
                                className="w-full btn-secondary flex items-center justify-center gap-2"
                            >
                                <HiDownload />
                                Download
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

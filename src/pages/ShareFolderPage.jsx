import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://26.32.68.132:5050/api';

function formatSize(bytes) {
    if (!bytes) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return `${bytes.toFixed(1)} ${units[i]}`;
}

function getFileIcon(mimeType, isFolder) {
    if (isFolder) return '📁';
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈';
    return '📄';
}

function getFileColor(mimeType, isFolder) {
    if (isFolder) return 'text-amber-400';
    if (!mimeType) return 'text-white/40';
    if (mimeType.startsWith('image/')) return 'text-pink-400';
    if (mimeType.startsWith('video/')) return 'text-purple-400';
    if (mimeType.startsWith('audio/')) return 'text-cyan-400';
    if (mimeType.includes('pdf')) return 'text-red-400';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-400';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-400';
    return 'text-white/40';
}

export default function ShareFolderPage() {
    const { token } = useParams();
    const [info, setInfo] = useState(null);       // folder info
    const [files, setFiles] = useState([]);
    const [breadcrumb, setBreadcrumb] = useState([]);
    const [status, setStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [downloading, setDownloading] = useState(null);
    const [loadingFolder, setLoadingFolder] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const loadFolder = useCallback(async (subfolderId = null) => {
        setLoadingFolder(true);
        try {
            const params = subfolderId ? { subfolder_id: subfolderId } : {};
            const res = await axios.get(`${API_BASE}/share/${token}/folder`, { params });
            setInfo(res.data.folder);
            setFiles(res.data.files);
            setBreadcrumb(res.data.breadcrumb);
            if (status !== 'ready') setStatus('ready');
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'This link is invalid or no longer available.');
            setStatus('error');
        } finally {
            setLoadingFolder(false);
        }
    }, [token, status]);

    useEffect(() => { loadFolder(); }, [token]);

    const navigateTo = (folderId) => {
        loadFolder(folderId === info?.id ? null : folderId);
    };

    const downloadFile = async (file) => {
        setDownloading(file.id);
        try {
            const response = await axios.get(`${API_BASE}/share/${token}/folder/file/${file.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = file.original_name;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Download failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setDownloading(null);
        }
    };

    const downloadAll = () => {
        setDownloading('zip');
        const url = `${API_BASE}/share/${token}/folder/zip`;
        const a = document.createElement('a');
        a.href = url;
        a.download = `${info?.name || 'folder'}.zip`;
        a.click();
        setTimeout(() => setDownloading(null), 2000);
    };

    const realFiles = files.filter(f => !f.is_folder);
    const subFolders = files.filter(f => f.is_folder);
    const currentFolderName = breadcrumb.length ? breadcrumb[breadcrumb.length - 1]?.name : '';

    return (
        <div className="min-h-screen bg-[#0a0a14] overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Top Navbar */}
            <div className="relative z-10 sticky top-0 border-b border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-sm font-black text-white shrink-0">T</div>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
                        {status === 'ready' && breadcrumb.map((crumb, idx) => (
                            <span key={crumb.id} className="flex items-center gap-1 shrink-0">
                                {idx > 0 && <span className="text-white/20 text-sm">/</span>}
                                <button
                                    onClick={() => navigateTo(crumb.id)}
                                    className={`text-sm font-bold px-2 py-1 rounded-lg transition-all ${
                                        idx === breadcrumb.length - 1
                                            ? 'text-white bg-white/5'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {idx === 0 ? '📁 ' : ''}{crumb.name}
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* View toggle */}
                    {status === 'ready' && (
                        <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg text-xs transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>⊞</button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg text-xs transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>☰</button>
                        </div>
                    )}

                    {/* Download all button */}
                    {status === 'ready' && realFiles.length > 0 && (
                        <button
                            onClick={downloadAll}
                            disabled={downloading === 'zip'}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {downloading === 'zip' ? <><div className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> Zipping...</> : '⬇ ZIP All'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {status === 'loading' && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-32">
                            <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
                            <p className="text-white/30 text-sm">Loading folder...</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-16 text-center">
                            <div className="text-5xl mb-4">🔒</div>
                            <h2 className="text-xl font-bold text-white mb-2">Link Unavailable</h2>
                            <p className="text-red-400/70 text-sm">{errorMsg}</p>
                        </motion.div>
                    )}

                    {status === 'ready' && (
                        <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                            {/* Folder header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-black text-white">{currentFolderName}</h1>
                                    <p className="text-sm text-white/30 mt-1">
                                        {subFolders.length > 0 && `${subFolders.length} folder${subFolders.length !== 1 ? 's' : ''} · `}
                                        {realFiles.length} file{realFiles.length !== 1 ? 's' : ''}
                                        {info?.expires_at && ` · Expires ${new Date(info.expires_at).toLocaleDateString()}`}
                                    </p>
                                </div>
                                {loadingFolder && (
                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                                )}
                            </div>

                            {/* Empty state */}
                            {files.length === 0 && (
                                <div className="flex flex-col items-center gap-3 py-24 text-center">
                                    <span className="text-5xl">🌵</span>
                                    <p className="text-white/30 text-sm font-bold uppercase tracking-widest">This folder is empty</p>
                                </div>
                            )}

                            {/* GRID VIEW */}
                            {viewMode === 'grid' && files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={file.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => file.is_folder ? navigateTo(file.id) : null}
                                            className={`group relative rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 transition-all p-4 flex flex-col items-center gap-3 ${file.is_folder ? 'cursor-pointer' : ''}`}
                                        >
                                            {/* Icon */}
                                            <div className={`text-4xl transition-transform group-hover:scale-110 ${getFileColor(file.mime_type, file.is_folder)}`}>
                                                {getFileIcon(file.mime_type, file.is_folder)}
                                            </div>

                                            {/* Name */}
                                            <p className="text-xs font-bold text-white text-center line-clamp-2 leading-tight w-full">{file.original_name}</p>

                                            {/* Size */}
                                            {!file.is_folder && (
                                                <p className="text-[10px] text-white/30">{formatSize(file.file_size)}</p>
                                            )}

                                            {/* Download overlay for files */}
                                            {!file.is_folder && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                                                    disabled={downloading === file.id}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-xs"
                                                >
                                                    {downloading === file.id
                                                        ? <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                                                        : '⬇'}
                                                </button>
                                            )}

                                            {/* Folder arrow */}
                                            {file.is_folder && (
                                                <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-amber-400 text-xs transition-opacity">›</span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* LIST VIEW */}
                            {viewMode === 'list' && files.length > 0 && (
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                                    {/* Header */}
                                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] text-white/30 font-black uppercase tracking-widest">
                                        <div className="col-span-6">Name</div>
                                        <div className="col-span-3 hidden md:block">Modified</div>
                                        <div className="col-span-2 hidden md:block">Size</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="divide-y divide-white/[0.03]">
                                        {files.map((file, idx) => (
                                            <motion.div
                                                key={file.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.025 }}
                                                onClick={() => file.is_folder ? navigateTo(file.id) : null}
                                                className={`grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-white/[0.04] transition-colors group ${file.is_folder ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className="col-span-6 flex items-center gap-3 min-w-0">
                                                    <span className={`text-xl shrink-0 ${getFileColor(file.mime_type, file.is_folder)}`}>{getFileIcon(file.mime_type, file.is_folder)}</span>
                                                    <span className="text-sm font-bold text-white truncate">{file.original_name}</span>
                                                </div>
                                                <div className="col-span-3 text-xs text-white/30 hidden md:block">
                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="col-span-2 text-xs text-white/30 hidden md:block">
                                                    {file.is_folder ? '—' : formatSize(file.file_size)}
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    {file.is_folder ? (
                                                        <span className="text-amber-400/50 group-hover:text-amber-400 text-sm transition-colors">›</span>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                                                            disabled={downloading === file.id}
                                                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-xs text-white/60 hover:text-white transition-all"
                                                        >
                                                            {downloading === file.id
                                                                ? <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                                                                : '⬇'}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer info */}
                            <p className="text-center text-[10px] text-white/15 uppercase tracking-widest pt-4">
                                Shared by {info?.shared_by} · Powered by Target Attendance System
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://26.32.68.132:5050/api';

function formatSize(bytes) {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return `${bytes.toFixed(1)} ${units[i]}`;
}

function getFileEmoji(mimeType) {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return '🗜️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈';
    return '📄';
}

function FilePreview({ token, mimeType }) {
    const previewUrl = `${API_BASE}/share/${token}/preview`;
    const isImage = mimeType?.startsWith('image/');
    const isVideo = mimeType?.startsWith('video/');
    const isAudio = mimeType?.startsWith('audio/');
    const isPDF   = mimeType?.includes('pdf');

    if (isImage) return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center min-h-48 max-h-96">
            <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-96 object-contain rounded-xl"
            />
        </div>
    );

    if (isVideo) return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black">
            <video
                controls
                className="w-full max-h-80 rounded-xl"
                src={previewUrl}
            >
                Your browser does not support video playback.
            </video>
        </div>
    );

    if (isAudio) return (
        <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center gap-4">
            <div className="text-5xl animate-pulse">🎵</div>
            <audio controls className="w-full" src={previewUrl}>
                Your browser does not support audio playback.
            </audio>
        </div>
    );

    if (isPDF) return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-white" style={{ height: '420px' }}>
            <iframe
                src={`${previewUrl}#toolbar=0&view=FitH`}
                className="w-full h-full border-none"
                title="PDF Preview"
            />
        </div>
    );

    return null; // No preview for other file types
}

export default function ShareDownloadPage() {
    const { token } = useParams();
    const [info, setInfo] = useState(null);
    const [status, setStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [progress, setProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    const canPreview = (mime) =>
        mime?.startsWith('image/') ||
        mime?.startsWith('video/') ||
        mime?.startsWith('audio/') ||
        mime?.includes('pdf');

    useEffect(() => {
        axios.get(`${API_BASE}/share/${token}/info`)
            .then(res => {
                setInfo(res.data);
                setStatus('ready');
                // Auto-show preview for images
                if (res.data.mime_type?.startsWith('image/')) setShowPreview(true);
            })
            .catch(err => {
                setErrorMsg(err.response?.data?.error || 'This link is invalid or no longer available.');
                setStatus('error');
            });
    }, [token]);

    const handleDownload = async () => {
        setStatus('downloading');
        setProgress(0);
        try {
            const response = await axios.get(`${API_BASE}/share/${token}/download`, {
                responseType: 'blob',
                onDownloadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = info.filename;
            a.click();
            window.URL.revokeObjectURL(url);
            setStatus('done');
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Download failed. Please try again.');
            setStatus('error');
        }
    };

    const currentStatus = status === 'done' ? 'ready' : status; // allow re-download after done

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] overflow-hidden relative py-10">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
            </div>
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={status === 'loading' ? 'loading' : 'content'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 w-full max-w-lg mx-4"
                >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl overflow-hidden">
                        {/* Top gradient bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        <div className="p-8">
                            {/* Branding */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white">T</div>
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Target System</span>
                            </div>

                            {/* Loading */}
                            {status === 'loading' && (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                                    <p className="text-white/40 text-sm font-medium">Verifying link...</p>
                                </div>
                            )}

                            {/* Error */}
                            {status === 'error' && (
                                <div className="flex flex-col items-center gap-4 py-8 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">🔒</div>
                                    <h2 className="text-lg font-bold text-white">Link Unavailable</h2>
                                    <p className="text-red-400/80 text-sm leading-relaxed">{errorMsg}</p>
                                </div>
                            )}

                            {/* Ready / Downloading / Done */}
                            {info && status !== 'loading' && status !== 'error' && (
                                <>
                                    {/* Preview Section */}
                                    <AnimatePresence>
                                        {canPreview(info.mime_type) && showPreview && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-6 overflow-hidden"
                                            >
                                                <FilePreview token={token} mimeType={info.mime_type} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* File Header Row */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center text-3xl">
                                            {getFileEmoji(info.mime_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-base font-bold text-white break-all leading-tight truncate" title={info.label || info.filename}>
                                                {info.label || info.filename}
                                            </h1>
                                            <p className="text-xs text-white/30 break-all truncate">{info.filename}</p>
                                            <p className="text-xs text-white/40 mt-1 font-medium">{formatSize(info.file_size)}</p>
                                        </div>
                                    </div>

                                    {/* Preview toggle button */}
                                    {canPreview(info.mime_type) && (
                                        <button
                                            onClick={() => setShowPreview(p => !p)}
                                            className="w-full mb-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            {showPreview ? '▲ Hide Preview' : '▼ Show Preview'}
                                        </button>
                                    )}

                                    {/* Meta Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        {[
                                            { label: 'Shared by', value: info.shared_by || 'System' },
                                            { label: 'Uploaded', value: new Date(info.uploaded_at).toLocaleDateString() },
                                            { label: 'Downloads left', value: info.downloads_remaining !== null ? info.downloads_remaining : '∞' },
                                            { label: 'File type', value: info.mime_type?.split('/')[1]?.toUpperCase() || 'FILE' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">{label}</p>
                                                <p className="text-sm font-bold text-white truncate">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expiry warning */}
                                    {info.expires_at && (
                                        <div className="mb-4 flex items-center gap-2 text-amber-400/80 text-xs font-medium bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                                            <span>⏰</span>
                                            Expires: {new Date(info.expires_at).toLocaleString()}
                                        </div>
                                    )}

                                    {/* Download Button */}
                                    {(status === 'ready' || status === 'done') && (
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {status === 'done' ? '✅ Downloaded — Download Again' : '⬇ Download File'}
                                        </button>
                                    )}

                                    {/* Progress Bar */}
                                    {status === 'downloading' && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs text-white/40 font-bold uppercase">
                                                <span className="animate-pulse">Downloading...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 pb-6 text-center">
                            <p className="text-[10px] text-white/20 uppercase tracking-widest">
                                Powered by Target Attendance System
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

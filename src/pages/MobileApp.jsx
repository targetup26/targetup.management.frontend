import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiClock, HiLogout } from 'react-icons/hi';

export default function MobileApp() {
    const { user, logout } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [status, setStatus] = useState('OUT');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = async () => {
        // TODO: Implement mobile check-in
        setStatus('IN');
    };

    const handleCheckOut = async () => {
        // TODO: Implement mobile check-out
        setStatus('OUT');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-pro p-8 max-w-md w-full text-center"
            >
                <div className="mb-8">
                    <HiClock className="text-6xl text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {currentTime.toLocaleTimeString()}
                    </h1>
                    <p className="text-text-secondary">
                        {currentTime.toLocaleDateString()}
                    </p>
                </div>

                <div className="mb-8">
                    <p className="text-sm text-text-secondary mb-1">Welcome</p>
                    <h2 className="text-2xl font-bold text-white">{user?.full_name}</h2>
                    <p className="text-sm text-accent mt-1">Status: {status}</p>
                </div>

                <div className="space-y-4">
                    {status === 'OUT' ? (
                        <button
                            onClick={handleCheckIn}
                            className="w-full btn-pro bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                            Check In
                        </button>
                    ) : (
                        <button
                            onClick={handleCheckOut}
                            className="w-full btn-pro bg-gradient-to-r from-red-500 to-rose-600"
                        >
                            Check Out
                        </button>
                    )}

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                    >
                        <HiLogout /> Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

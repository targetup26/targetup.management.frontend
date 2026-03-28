import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiUsers, HiClock, HiChartBar, HiBriefcase, HiTranslate, HiLogout, HiUser, HiStatusOnline, HiPause } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const SidebarItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to}>
            <div className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 mb-1",
                isActive
                    ? "bg-primary/20 text-white border-l-4 border-primary shadow-glow"
                    : "text-text-secondary hover:bg-white/5 hover:text-white"
            )}>
                <Icon className="text-xl" />
                <span className="font-medium">{label}</span>
            </div>
        </Link>
    );
};

export default function Layout() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const isRtl = i18n.language === 'ar';

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(nextLang);
    };

    useEffect(() => {
        document.body.dir = isRtl ? 'rtl' : 'ltr';
    }, [isRtl]);

    return (
        <div className="flex h-screen overflow-hidden bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Sidebar */}
            <motion.aside
                initial={{ x: isRtl ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 glass-panel m-4 flex flex-col p-4 shadow-2xl z-20"
            >
                <div className="flex items-center gap-3 mb-8 mt-2 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                        T
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
                        Targetup
                    </h1>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem to="/" icon={HiHome} label={t('dashboard')} />
                    <SidebarItem to="/attendance" icon={HiClock} label={t('attendance')} />
                    <SidebarItem to="/employees" icon={HiUsers} label={t('employees')} />
                    <SidebarItem to="/departments" icon={HiBriefcase} label={t('departments')} />
                    <SidebarItem to="/reports" icon={HiChartBar} label={t('reports')} />
                    <SidebarItem to="/breaks" icon={HiPause} label="Break History" />
                    <SidebarItem to="/network-monitor" icon={HiStatusOnline} label={t('networkMonitor') || 'Network Monitor'} />
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col p-4 pl-0">
                {/* Header */}
                <header className="h-16 mb-4 px-6 glass-panel flex items-center justify-end gap-4 shadow-lg z-10">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors border border-white/10"
                        title={i18n.language === 'en' ? 'العربية' : 'English'}
                    >
                        <HiTranslate className="text-xl" />
                    </button>

                    {/* Profile Badge */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                        >
                            <span className="text-sm font-medium text-white hidden md:block">
                                {user?.full_name || user?.username || 'User'}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold shadow-md">
                                {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-52 bg-[#0f172a] border border-white/10 rounded-xl py-2 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                                >
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setShowProfileModal(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <HiUser /> {t('profile_settings') || 'Profile Settings'}
                                    </button>
                                    <div className="my-1 border-t border-white/5"></div>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                    >
                                        <HiLogout /> {t('logout') || 'Logout'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <div className="flex-1 glass-panel p-6 overflow-auto shadow-inner relative">
                    <Outlet />
                </div>
            </main>

            <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </div>
    );
}

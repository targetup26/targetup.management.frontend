import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiCog, HiShieldCheck, HiClipboardList, HiLogout,
    HiUsers, HiFolder, HiOutlineArrowLeft, HiOutlineBell,
    HiOutlineStatusOnline, HiOutlineViewGrid, HiChatAlt2, HiClock, HiPrinter, HiCollection, HiOutlineLightningBolt
} from 'react-icons/hi';
// import AdminBreadcrumbs from './admin/AdminBreadcrumbs'; // TODO: Restore from Local History

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navSections = [
        {
            title: 'Personnel Hub',
            items: [
                { path: '/admin', label: 'Command Center', icon: HiOutlineViewGrid },
                { path: '/admin/users', label: 'User Directory', icon: HiUsers },
                { path: '/admin/roles', label: 'Access Control', icon: HiShieldCheck },
                { path: '/admin/organization', label: 'Org Structure', icon: HiCollection },
            ]
        },
        {
            title: 'Operations Hub',
            items: [
                { path: '/admin/forms', label: 'Form Engine', icon: HiClipboardList },
                { path: '/admin/chat', label: 'Secure Comms', icon: HiChatAlt2 },
                { path: '/admin/files', label: 'Cloud Assets', icon: HiFolder },
                { path: '/admin/breaks', label: 'Shift Audits', icon: HiClock },
            ]
        },
        {
            title: 'Revenue & Intelligence',
            items: [
                { path: '/admin/sales', label: 'Sales Control', icon: HiOutlineLightningBolt },
                { path: '/admin/leads', label: 'Leads Manager', icon: HiOutlineLightningBolt },
                { path: '/admin/taxonomy', label: 'Lead Taxonomy', icon: HiCollection },
            ]
        },
        {
            title: 'System Infrastructure',
            items: [
                { path: '/admin/network-monitor', label: 'Network Node', icon: HiOutlineStatusOnline },
                { path: '/admin/settings/print', label: 'ID Templates', icon: HiPrinter },
                { path: '/admin/audit-logs', label: 'Security Logs', icon: HiClipboardList },
                { path: '/admin/storage-settings', label: 'Vault Config', icon: HiCog },
                { path: '/admin/settings', label: 'Global Core', icon: HiCog }
            ]
        }
    ];

    const allItems = navSections.flatMap(s => s.items);
    const currentItem = allItems.find(item => item.path === location.pathname) || allItems[0];

    return (
        <div className="min-h-screen bg-background flex font-['Space_Grotesk'] text-white">
            {/* Backdrop Gradient */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-accent rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <div className="w-72 glass-panel-pro m-4 rounded-[2rem] border-white/5 flex flex-col z-10 relative overflow-hidden">
                <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <HiOutlineViewGrid className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Admin OS</h1>
                            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">v5.0 Management</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {navSections.map((section) => (
                            <div key={section.title} className="space-y-2">
                                <h3 className="px-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40 mb-4">{section.title}</h3>
                                <nav className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20'
                                                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                <span className="font-bold text-xs">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-pill"
                                                        className="ml-auto w-1 h-3 bg-white rounded-full shadow-[0_0_8px_white]"
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Section */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center font-bold text-primary shadow-inner">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                            <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full group flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 rounded-xl transition-all duration-300 border border-white/5"
                    >
                        <HiLogout className="group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 flex flex-col min-w-0 z-20 relative">
                {/* Internal Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-background/20 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 group"
                        >
                            <HiOutlineArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Switch to Staff View</span>
                        </button>
                        <div className="w-px h-8 bg-white/5" />
                        <div>
                            {/* <AdminBreadcrumbs /> */}
                            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">{currentItem.label}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* System Status */}
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">Matrix Online</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary relative border border-white/5">
                                <HiOutlineBell className="text-xl" />
                                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent rounded-full border border-background" />
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                <HiOutlineStatusOnline className="text-primary" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-10 relative scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

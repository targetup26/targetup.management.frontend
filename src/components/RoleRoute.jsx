import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Restricts access to specific roles.
 * Usage: <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']} />}>
 * 
 * If user's role is not in allowedRoles, redirects to fallback (default: /).
 */
export default function RoleRoute({ allowedRoles = [], fallback = '/' }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check user.role (legacy string) against allowed roles
    const userRole = user.role || '';
    if (!allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white flex-col gap-4">
                <h1 className="text-4xl font-bold text-red-500">403</h1>
                <p className="text-text-secondary">Access Denied</p>
                <p className="text-xs text-text-muted">Your role ({userRole}) does not have permission to view this page.</p>
                <button
                    onClick={() => window.location.href = fallback}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return <Outlet />;
}

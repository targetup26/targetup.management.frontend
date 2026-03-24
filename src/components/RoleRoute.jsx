import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Restricts access by role and/or permissions.
 * 
 * Props:
 *   allowedRoles: ['SUPER_ADMIN', 'MANAGER'] — user must have one of these roles
 *   requiredPermissions: ['sales.access'] — user must have ALL of these permissions
 *   fallback: '/' — redirect path on denial
 * 
 * Either prop can be used alone or together.
 */
export default function RoleRoute({ allowedRoles = [], requiredPermissions = [], fallback = '/' }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role || '';
    const userPermissions = user.permissions || [];

    // Check role (if allowedRoles specified)
    const roleOk = allowedRoles.length === 0 || allowedRoles.includes(userRole);

    // Check permissions (if requiredPermissions specified, ALL must be present)
    const permOk = requiredPermissions.length === 0 || requiredPermissions.every(p => userPermissions.includes(p));

    if (!roleOk || !permOk) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white flex-col gap-4">
                <h1 className="text-4xl font-bold text-red-500">403</h1>
                <p className="text-text-secondary">Access Denied</p>
                <p className="text-xs text-text-muted">Your role ({userRole}) does not have permission to view this page.</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        );
    }

    return <Outlet />;
}

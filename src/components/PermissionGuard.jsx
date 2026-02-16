import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PermissionGuard({ permission, children, fallback = null }) {
    const { user } = useAuth();

    // Placeholder permission logic
    // In a full implementation, this would check a permissions array dynamically
    const hasPermission = () => {
        if (!user) return false;

        // Grant full access to admins for now
        if (['admin', 'super_admin', 'manager'].includes(user.role?.toLowerCase())) {
            return true;
        }

        return false;
    };

    if (hasPermission()) {
        return <>{children}</>;
    }

    return fallback;
}

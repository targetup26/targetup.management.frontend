import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            // Skip auth verification on public pages
            const publicPaths = ['/share', '/share-folder', '/join'];
            const isPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p));
            if (isPublicPage) {
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Verify token by fetching profile
                const res = await api.get('/profile');
                // /profile returns { success, user: {...}, profile, presence }
                const userData = res.data.user || res.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                console.error('Session verification failed:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const updateProfile = async (data) => {
        const res = await api.put('/auth/profile', data);
        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

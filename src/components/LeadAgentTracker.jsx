import { useEffect } from 'react';
import api from '../services/api';

const LeadAgentTracker = () => {
    useEffect(() => {
        // Send heartbeat every 5 minutes
        const interval = setInterval(async () => {
            try {
                await api.post('/leads/heartbeat');
            } catch (error) {
                // Silent fail
                console.debug('Agent heartbeat failed', error);
            }
        }, 5 * 60 * 1000);

        // Send initial heartbeat
        api.post('/leads/heartbeat').catch(() => { });

        return () => clearInterval(interval);
    }, []);

    return null; // Interface-less component
};

export default LeadAgentTracker;

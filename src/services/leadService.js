import api from './api';

const leadService = {
    // Start a new extraction job
    extractLeads: (data) => api.post('/leads/extract', data),

    // Get status of a specific job
    getJobStatus: (jobId) => api.get(`/leads/job/${jobId}`),

    // Get history of all jobs
    getJobHistory: () => api.get('/leads/history'),

    // Get fetched leads (with optional filters)
    getLeads: (params) => api.get('/leads', { params }),

    // Export leads to CSV
    exportLeads: () => api.post('/leads/export'),

    // Send agent heartbeat
    sendHeartbeat: () => api.post('/leads/heartbeat'),
};

export default leadService;

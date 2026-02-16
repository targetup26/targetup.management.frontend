import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { ProfilePrint, JoinFormPrint, FormSubmissionPrint } from '../../components/PrintLayouts';

export default function PrintPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'full';
    const type = searchParams.get('type') || 'employee'; // 'employee' or 'submission'

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrintData = async () => {
            try {
                let res;
                if (type === 'submission') {
                    // Fetch form submission data
                    res = await api.get(`/forms/submissions/${id}/print`);
                    setData(res.data.submission);
                } else {
                    // Fetch employee data (existing functionality)
                    res = await api.get(`/employees/${id}/print`);
                    setData(res.data);
                }

                // Trigger print after a short delay to allow images/render
                setTimeout(() => {
                    window.print();
                }, 1000);

            } catch (err) {
                console.error('Fetch print data error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrintData();
    }, [id, type]);

    if (loading) return <div>Preparing document for output...</div>;
    if (!data) return <div>Error: Record not found.</div>;

    // Render based on type
    if (type === 'submission') {
        return (
            <div className="bg-white min-h-screen">
                <FormSubmissionPrint submission={data} />
            </div>
        );
    }

    // Original employee print logic
    return (
        <div className="bg-white min-h-screen">
            {(mode === 'profile' || mode === 'full') && <ProfilePrint employee={data} />}
            {(mode === 'join_form' || mode === 'full') && (
                <div className={mode === 'full' ? 'page-break' : ''}>
                    <JoinFormPrint employee={data} />
                </div>
            )}
        </div>
    );
}

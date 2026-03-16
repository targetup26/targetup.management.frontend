import React from 'react';

export const ProfilePrint = ({ employee }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto border border-gray-200 m-8">
            <h1 className="text-2xl font-bold mb-4">Employee Profile: {employee?.full_name}</h1>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-bold">ID:</p>
                    <p>{employee?.employee_id}</p>
                </div>
                <div>
                    <p className="font-bold">Department:</p>
                    <p>{employee?.department?.name}</p>
                </div>
                <div>
                    <p className="font-bold">Role:</p>
                    <p>{employee?.role}</p>
                </div>
                <div>
                    <p className="font-bold">Email:</p>
                    <p>{employee?.email}</p>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-xs text-gray-500 text-center">
                Printed from Targetup System
            </div>
        </div>
    );
};

export const JoinFormPrint = ({ employee }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto border border-gray-200 m-8">
            <h1 className="text-2xl font-bold mb-4">Join Form: {employee?.full_name}</h1>
            <p className="mb-4">This is a placeholder for the official joining form print layout.</p>
            <div className="mt-8 border text-center p-12">
                <p className="text-gray-400">Official Form Template</p>
            </div>
        </div>
    );
};

export const FormSubmissionPrint = ({ submission }) => {
    const formData = typeof submission?.form_data === 'string'
        ? JSON.parse(submission.form_data)
        : (submission?.form_data || {});

    const template = submission?.Template;
    const schema = typeof template?.schema === 'string'
        ? JSON.parse(template.schema)
        : (template?.schema || {});

    const sections = schema?.sections || [];
    const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const submittedDate = submission?.submitted_at
        ? new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '---';

    // Skip file fields
    const fileFields = ['id_card_scan', 'cv_upload', 'personal_photo'];

    // Get label from template
    const getFieldLabel = (fieldName) => {
        for (const section of sections) {
            for (const field of (section.fields || [])) {
                if (field.name === fieldName) return field.label || field.name;
            }
        }
        return fieldName.replace(/_/g, ' ');
    };

    // Get option label for select fields
    const getDisplayValue = (fieldName, value) => {
        if (!value && value !== 0) return '---';
        for (const section of sections) {
            for (const field of (section.fields || [])) {
                if (field.name === fieldName && field.options) {
                    const opt = field.options.find(o => String(o.value) === String(value));
                    if (opt) return opt.label;
                }
            }
        }
        return String(value);
    };

    // API base for images — match the config in services/api.js
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    const token = localStorage.getItem('token');

    const statusLabel = {
        pending: 'Pending', submitted: 'Submitted', approved: 'Approved',
        rejected: 'Rejected', draft: 'Draft', cancelled: 'Cancelled',
        returned_for_edit: 'Returned', archived: 'Archived'
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", color: '#111', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #111', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        {template?.name || 'Form Submission'}
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Submission #{submission?.id} · {template?.type?.toUpperCase() || 'FORM'}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{printDate}</p>
                    <span style={{
                        display: 'inline-block', marginTop: '4px', padding: '3px 12px', fontSize: '10px',
                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                        border: '2px solid #111', borderRadius: '4px'
                    }}>
                        {statusLabel[submission?.status] || submission?.status || '---'}
                    </span>
                </div>
            </div>

            {/* Meta Info Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px', background: '#f8f8f8', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888' }}>Submitted By</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>
                        {submission?.Submitter?.full_name || formData?.full_name || '---'}
                    </p>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888' }}>Submitted On</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>{submittedDate}</p>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888' }}>Reviewed By</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>
                        {submission?.Reviewer?.full_name || '---'}
                    </p>
                </div>
            </div>

            {/* Form Data — Grouped by Sections */}
            {sections.length > 0 ? (
                sections.map((section, sIdx) => {
                    const sectionFields = (section.fields || []).filter(f => !fileFields.includes(f.name));
                    if (sectionFields.length === 0) return null;
                    return (
                        <div key={sIdx} style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '12px' }}>
                                {section.title || `Section ${sIdx + 1}`}
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {sectionFields.map((field, fIdx) => (
                                        <tr key={fIdx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'capitalize', width: '35%', verticalAlign: 'top' }}>
                                                {field.label || field.name?.replace(/_/g, ' ')}
                                            </td>
                                            <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: '#111' }}>
                                                {getDisplayValue(field.name, formData[field.name])}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })
            ) : (
                /* Fallback: No schema — just show key/value */
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '12px' }}>
                        Form Data
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {Object.entries(formData).filter(([k]) => !fileFields.includes(k)).map(([key, value], idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'capitalize', width: '35%', verticalAlign: 'top' }}>
                                        {getFieldLabel(key)}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: '#111' }}>
                                        {typeof value === 'object' ? JSON.stringify(value) : (String(value) || '---')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Attachments */}
            {submission?.Attachments?.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '12px' }}>
                        Documents
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {submission.Attachments.map((att, idx) => {
                            const isImage = att.FileMetadata?.mime_type?.startsWith('image/');
                            const label = att.field_name?.replace(/_/g, ' ') || `Document ${idx + 1}`;
                            return (
                                <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>{label}</p>
                                    {isImage ? (
                                        <img
                                            src={`${apiBase}/api/storage/download/${att.file_metadata_id}?token=${token}`}
                                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                                            alt={label}
                                        />
                                    ) : (
                                        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '4px', fontSize: '28px' }}>📄</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Signatures */}
            {submission?.Signatures?.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '6px', marginBottom: '12px' }}>
                        Signatures
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {submission.Signatures.map((sig, idx) => (
                            <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>
                                    {sig.signer_role?.replace(/_/g, ' ')}
                                </p>
                                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700 }}>
                                    {sig.Signer?.full_name || '---'}
                                </p>
                                <p style={{ margin: 0, fontSize: '10px', color: sig.status === 'signed' ? 'green' : '#888', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {sig.status === 'signed' ? '✓ Signed' : '○ Pending'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviewer Notes */}
            {submission?.reviewer_notes && (
                <div style={{ marginBottom: '24px', background: '#fffbe6', border: '1px solid #f5e6a3', padding: '16px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Reviewer Notes</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{submission.reviewer_notes}</p>
                </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '2px solid #111', paddingTop: '12px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>Printed from Targetup System</span>
                <span>Page 1</span>
            </div>
        </div>
    );
};

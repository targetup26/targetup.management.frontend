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
    return (
        <div className="p-8 max-w-4xl mx-auto border border-gray-200 m-8">
            <h1 className="text-2xl font-bold mb-4">Form Submission: {submission?.id}</h1>
            <div className="bg-gray-50 p-4 rounded mb-4">
                <pre className="text-xs overflow-auto">{JSON.stringify(submission, null, 2)}</pre>
            </div>
        </div>
    );
};

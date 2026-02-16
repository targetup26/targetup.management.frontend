import React from 'react';

export default function AttendanceHistory({ employeeId }) {
    return (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg font-bold mb-4">Attendance History</h3>
            <div className="text-sm text-gray-400 text-center py-8">
                Attendance records for Employee #{employeeId} will appear here.
            </div>
        </div>
    );
}

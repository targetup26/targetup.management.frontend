import clsx from 'clsx';
import { HiDeviceMobile, HiPencilAlt, HiShieldCheck, HiPencil } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ t, status }) => {
    const styles = {
        PRESENT: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.1)]',
        LATE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.1)]',
        ABSENT: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]',
        LEAVE: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]',
    };
    return (
        <span className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border transition-all duration-300", styles[status] || styles.ABSENT)}>
            {t(status.toLowerCase()) || status}
        </span>
    );
};

export default function AttendanceTable({ data, onEdit }) {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel-pro p-12 text-center text-text-secondary">
                <p className="animate-pulse">{t('noRecords')}</p>
            </div>
        );
    }

    return (
        <div className="glass-panel-pro overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.03] text-primary text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="p-5 font-bold">{t('date')}</th>
                            <th className="p-5 font-bold">{t('employee')}</th>
                            <th className="p-5 font-bold">{t('role')}</th>
                            <th className="p-5 font-bold">{t('timeIn')}</th>
                            <th className="p-5 font-bold">{t('timeOut')}</th>
                            <th className="p-5 font-bold">{t('status')}</th>
                            <th className="p-5 font-bold">{t('source')}</th>
                            <th className="p-5 font-bold">{t('violations')}</th>
                            <th className="p-5 text-right font-bold">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((entry) => (
                            <tr key={entry.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                <td className="p-5 text-sm font-mono text-white/50">{entry.date}</td>
                                <td className="p-5">
                                    <div className="font-bold text-white group-hover:text-primary transition-colors">{entry.Employee?.full_name}</div>
                                    <div className="text-[10px] text-text-secondary uppercase tracking-wider">{entry.Employee?.Department?.name}</div>
                                </td>
                                <td className="p-5">
                                    <span className="text-xs text-text-secondary px-2 py-0.5 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">
                                        {entry.Employee?.JobRole?.name}
                                    </span>
                                </td>
                                <td className="p-5 text-sm font-mono text-white">
                                    {entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </td>
                                <td className="p-5 text-sm font-mono text-white">
                                    {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </td>
                                <td className="p-5">
                                    <StatusBadge t={t} status={entry.status} />
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col gap-1 text-[10px] text-text-secondary">
                                        <div className="flex items-center gap-1.5">
                                            {entry.source === 'DEVICE' ? (
                                                <><HiDeviceMobile className="text-primary" /> <span className="uppercase font-bold tracking-tighter">{t('device')}</span></>
                                            ) : entry.source === 'DESKTOP' || entry.source === 'DESKTOP_APP' ? (
                                                <><HiDeviceMobile className="text-blue-400" /> <span className="uppercase font-bold tracking-tighter text-blue-400">DESKTOP</span></>
                                            ) : (
                                                <><HiPencilAlt className="text-warning" /> <span className="uppercase font-bold tracking-tighter">{t('manual')}</span></>
                                            )}
                                        </div>
                                        <div className="font-mono text-white/30 truncate max-w-[120px]">
                                            {entry.device_ip || 'N/A'}
                                        </div>
                                        {entry.manual_override && <span className="text-warning font-bold italic">({t('edited')})</span>}
                                    </div>
                                </td>
                                <td className="p-5">
                                    {entry.violation_points > 0 ? (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
                                            <span className="text-danger text-xs font-bold tracking-tighter uppercase">{entry.violation_points} pts</span>
                                        </div>
                                    ) : (
                                        <span className="text-success/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><HiShieldCheck /> {t('clean')}</span>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    <button
                                        onClick={() => onEdit && onEdit(entry)}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                                        title={t('edit') || 'Edit'}
                                    >
                                        <HiPencil className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

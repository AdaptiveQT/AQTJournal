import { Trade } from '../types';

export const useDataExport = () => {
    const exportToCSV = (trades: Trade[], filename: string = 'aqt-trades.csv') => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const headers = ['Date', 'Pair', 'Direction', 'Entry', 'Exit', 'Setup', 'Emotion', 'Lots', 'P&L'];
        const rows = trades.map(t => [
            t.date,
            t.pair,
            t.direction,
            t.entry,
            t.exit,
            t.setup,
            t.emotion,
            t.lots.toString(),
            t.pnl.toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToJSON = (data: any, filename: string = 'aqt-backup.json') => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return { exportToCSV, exportToJSON };
};

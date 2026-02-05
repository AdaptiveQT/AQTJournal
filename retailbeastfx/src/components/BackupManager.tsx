'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    Download,
    Upload,
    Clock,
    AlertCircle,
    CheckCircle,
    Trash2,
    HardDrive,
} from 'lucide-react';
import { Trade, UserSettings } from '../types';

interface BackupData {
    version: string;
    timestamp: number;
    balance: number;
    trades: Trade[];
    settings: any;
    tags?: any[];
    strategies?: any[];
}

interface BackupVersion {
    id: string;
    timestamp: number;
    size: number;
    tradesCount: number;
}

interface BackupManagerProps {
    balance: number;
    trades: Trade[];
    settings: Record<string, any>; // Accept any settings object
    tags?: any[];
    strategies?: any[];
    onRestore: (data: BackupData) => void;
}

const BACKUP_STORAGE_KEY = 'aqt_backup_versions';
const MAX_BACKUPS = 5;

const BackupManager: React.FC<BackupManagerProps> = ({
    balance,
    trades,
    settings,
    tags = [],
    strategies = [],
    onRestore,
}) => {
    const [backupVersions, setBackupVersions] = useState<BackupVersion[]>([]);
    const [lastBackupTime, setLastBackupTime] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadBackupVersions();
        checkAutoBackup();
    }, []);

    const loadBackupVersions = () => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (stored) {
                const versions: BackupVersion[] = JSON.parse(stored);
                setBackupVersions(versions.sort((a, b) => b.timestamp - a.timestamp));
            }
        } catch (error) {
            console.error('Failed to load backup versions:', error);
        }
    };

    const checkAutoBackup = () => {
        if (typeof window === 'undefined') return;

        if (settings.autoBackup) {
            const lastBackup = settings.lastBackupDate || 0;
            const now = Date.now();
            const frequency = settings.backupFrequency || 'weekly';

            let shouldBackup = false;
            const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);

            switch (frequency) {
                case 'daily':
                    shouldBackup = daysSinceBackup >= 1;
                    break;
                case 'weekly':
                    shouldBackup = daysSinceBackup >= 7;
                    break;
                case 'monthly':
                    shouldBackup = daysSinceBackup >= 30;
                    break;
            }

            if (shouldBackup) {
                performBackup(true);
            }
        }
    };

    const performBackup = (isAutoBackup = false) => {
        if (typeof window === 'undefined') return;

        const backupData: BackupData = {
            version: '3.0',
            timestamp: Date.now(),
            balance,
            trades,
            settings: {
                ...settings,
                lastBackupDate: Date.now(),
            },
            tags,
            strategies,
        };

        const backupId = `backup_${Date.now()}`;
        const backupString = JSON.stringify(backupData);

        // Store backup in localStorage
        try {
            localStorage.setItem(backupId, backupString);

            // Update version history
            const newVersion: BackupVersion = {
                id: backupId,
                timestamp: backupData.timestamp,
                size: new Blob([backupString]).size,
                tradesCount: trades.length,
            };

            const updatedVersions = [newVersion, ...backupVersions].slice(0, MAX_BACKUPS);
            setBackupVersions(updatedVersions);
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updatedVersions));

            // Clean up old backups
            const oldVersions = backupVersions.slice(MAX_BACKUPS);
            oldVersions.forEach(v => localStorage.removeItem(v.id));

            setLastBackupTime(Date.now());

            if (!isAutoBackup) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }

        } catch (error) {
            console.error('Backup failed:', error);
            alert('Backup failed. Your browser storage may be full.');
        }
    };

    const downloadBackup = (versionId?: string) => {
        if (typeof window === 'undefined') return;

        let backupData: BackupData;

        if (versionId) {
            // Download specific version
            const stored = localStorage.getItem(versionId);
            if (!stored) {
                alert('Backup version not found');
                return;
            }
            backupData = JSON.parse(stored);
        } else {
            // Download current state
            backupData = {
                version: '3.0',
                timestamp: Date.now(),
                balance,
                trades,
                settings,
                tags,
                strategies,
            };
        }

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aqt_backup_${new Date(backupData.timestamp).toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const restoreBackup = (versionId: string) => {
        if (typeof window === 'undefined') return;

        const confirmed = window.confirm(
            'Restore this backup? Your current data will be replaced.\n\nMake sure to download a backup of your current state first!'
        );

        if (!confirmed) return;

        try {
            const stored = localStorage.getItem(versionId);
            if (!stored) {
                alert('Backup not found');
                return;
            }

            const backupData: BackupData = JSON.parse(stored);
            onRestore(backupData);
            alert('Backup restored successfully!');
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Failed to restore backup');
        }
    };

    const deleteBackup = (versionId: string) => {
        if (typeof window === 'undefined') return;

        const confirmed = window.confirm('Delete this backup version?');
        if (!confirmed) return;

        try {
            localStorage.removeItem(versionId);
            const updated = backupVersions.filter(v => v.id !== versionId);
            setBackupVersions(updated);
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                const confirmed = window.confirm(
                    'Restore from file? This will replace all current data.'
                );

                if (confirmed) {
                    onRestore(data);
                    alert('Data restored successfully!');
                }
            } catch (error) {
                alert('Invalid backup file');
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <HardDrive className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backup Manager</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {backupVersions.length}/{MAX_BACKUPS} backups stored
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Backup created successfully!
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <button
                    onClick={() => performBackup()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Save size={18} />
                    Create Backup
                </button>

                <button
                    onClick={() => downloadBackup()}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Download size={18} />
                    Download Current
                </button>

                <label className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer">
                    <Upload size={18} />
                    Restore from File
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Auto-backup Info */}
            {settings.autoBackup && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Auto-backup is enabled</p>
                        <p>Frequency: {settings.backupFrequency || 'weekly'}</p>
                        {settings.lastBackupDate && (
                            <p>Last auto-backup: {formatDate(settings.lastBackupDate)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Backup Versions */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Backup History
                </h3>

                {backupVersions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No backup versions yet</p>
                        <p className="text-xs mt-1">Create your first backup to get started</p>
                    </div>
                ) : (
                    backupVersions.map((version, index) => (
                        <div
                            key={version.id}
                            className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                            v{index + 1}
                                        </span>
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">
                                            {formatDate(version.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{version.tradesCount} trades</span>
                                        <span>•</span>
                                        <span>{formatBytes(version.size)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => downloadBackup(version.id)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => restoreBackup(version.id)}
                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Restore"
                                    >
                                        <Upload size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteBackup(version.id)}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BackupManager;

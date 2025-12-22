'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Mic,
    Square,
    Play,
    Pause,
    Trash2,
    Upload,
    Volume2,
    AlertCircle,
} from 'lucide-react';

interface VoiceNoteRecorderProps {
    onSave: (audioBlob: Blob) => Promise<string>; // Returns URL
    existingUrl?: string;
    onDelete?: () => void;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
    onSave,
    existingUrl,
    onDelete,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl && !existingUrl) URL.revokeObjectURL(audioUrl);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Auto-upload
                if (onSave) {
                    setIsUploading(true);
                    try {
                        const uploadedUrl = await onSave(audioBlob);
                        setAudioUrl(uploadedUrl);
                    } catch (err) {
                        setError('Failed to upload voice note');
                        console.error(err);
                    } finally {
                        setIsUploading(false);
                    }
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            setError('Microphone access denied. Please allow microphone permissions.');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } else {
                mediaRecorderRef.current.pause();
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
            setIsPaused(!isPaused);
        }
    };

    const playAudio = () => {
        if (audioRef.current && audioUrl) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const deleteRecording = () => {
        const confirmed = window.confirm('Delete this voice note?');
        if (!confirmed) return;

        if (audioUrl && !existingUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setRecordingTime(0);

        if (onDelete) {
            onDelete();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Mic size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Voice Note</h3>
            </div>

            {error && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {!audioUrl && !isRecording && (
                <button
                    onClick={startRecording}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Mic size={18} />
                    Start Recording
                </button>
            )}

            {isRecording && (
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {formatTime(recordingTime)}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={pauseRecording}
                            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={stopRecording}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Square size={16} />
                            Stop
                        </button>
                    </div>
                </div>
            )}

            {audioUrl && !isRecording && (
                <div className="space-y-3">
                    {isUploading ? (
                        <div className="py-4 text-center">
                            <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />

                            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <Volume2 size={20} className="text-purple-600 dark:text-purple-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Voice Note</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {recordingTime > 0 ? formatTime(recordingTime) : 'Recorded'}
                                    </p>
                                </div>
                                <button
                                    onClick={playAudio}
                                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors"
                                    title={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={deleteRecording}
                                    className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                                <button
                                    onClick={startRecording}
                                    className="flex-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                                >
                                    <Mic size={14} />
                                    Re-record
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                {!audioUrl ? 'Record quick trade notes hands-free' : 'Your voice note has been saved'}
            </p>
        </div>
    );
};

export default VoiceNoteRecorder;

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Clipboard, Image as ImageIcon } from 'lucide-react';

interface ScreenshotUploadProps {
    /** Current image URL (base64 data URL) */
    imageUrl: string;
    /** Callback when image changes */
    onChange: (imageUrl: string) => void;
    /** Optional className for container */
    className?: string;
    /** Whether the component is disabled */
    disabled?: boolean;
}

/**
 * Screenshot upload component with clipboard paste and file upload support.
 * Stores images as base64 data URLs for local storage compatibility.
 */
export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
    imageUrl,
    onChange,
    className = '',
    disabled = false
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Convert file to base64 data URL
    const fileToDataUrl = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                reject(new Error('Please select an image file'));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('Image must be under 5MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }, []);

    // Handle file selection
    const handleFile = useCallback(async (file: File) => {
        if (disabled) return;

        setIsProcessing(true);
        try {
            const dataUrl = await fileToDataUrl(file);
            onChange(dataUrl);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to process image');
        } finally {
            setIsProcessing(false);
        }
    }, [disabled, fileToDataUrl, onChange]);

    // Handle clipboard paste
    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (disabled) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) handleFile(file);
                break;
            }
        }
    }, [disabled, handleFile]);

    // Set up paste listener on the container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Make container focusable and listen for paste
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // The paste event will be handled by the paste listener
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        // Global paste listener when this component is focused
        const handleGlobalPaste = (e: ClipboardEvent) => {
            if (document.activeElement === container || container.contains(document.activeElement)) {
                handlePaste(e);
            }
        };

        document.addEventListener('paste', handleGlobalPaste);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('paste', handleGlobalPaste);
        };
    }, [handlePaste]);

    // Handle drag events
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [disabled, handleFile]);

    // Handle file input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset input so same file can be selected again
        e.target.value = '';
    }, [handleFile]);

    // Handle click to open file picker
    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    // Handle remove image
    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    }, [onChange]);

    // If image exists, show preview
    if (imageUrl) {
        return (
            <div className={`relative group ${className}`}>
                <img
                    src={imageUrl}
                    alt="Trade Screenshot"
                    className="w-full h-32 object-cover rounded-lg border border-beast-green/30 shadow-lg shadow-beast-green/10"
                />
                {!disabled && (
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        title="Remove Screenshot"
                        type="button"
                    >
                        <X size={14} />
                    </button>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                    <ImageIcon size={12} />
                    Screenshot attached
                </div>
            </div>
        );
    }

    // Empty state - upload zone
    return (
        <div
            ref={containerRef}
            tabIndex={0}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                transition-all duration-200 outline-none
                ${isDragOver
                    ? 'border-beast-green bg-beast-green/10 scale-[1.02]'
                    : 'border-slate-600 hover:border-beast-green/50 hover:bg-beast-green/5'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isProcessing ? 'animate-pulse' : ''}
                focus:ring-2 focus:ring-beast-green/50 focus:border-beast-green
                ${className}
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
            />

            {isProcessing ? (
                <div className="text-beast-green font-medium animate-pulse">
                    Processing...
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-center gap-3 text-slate-400 mb-2">
                        <Upload size={20} className="text-beast-green/70" />
                        <span className="text-sm">or</span>
                        <Clipboard size={20} className="text-beast-green/70" />
                    </div>
                    <div className="text-sm text-slate-400">
                        <span className="text-beast-green font-medium">Click to upload</span>
                        {' '}or drag & drop
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
                        {' '}to paste from clipboard
                    </div>
                </>
            )}
        </div>
    );
};

export default ScreenshotUpload;

// Tag System Types
export interface Tag {
    id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: number;
    usageCount: number;
}

export interface TagPreset {
    id: string;
    name: string;
    tags: string[]; // Array of tag IDs
    description?: string;
}

// Common tag colors
export const TAG_COLORS = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#84cc16', // lime
] as const;

export type TagColor = typeof TAG_COLORS[number];

// Default tags for new users
export const DEFAULT_TAGS: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>[] = [
    { name: 'Perfect Setup', color: '#10b981', description: 'Trade followed all rules perfectly' },
    { name: 'Revenge Trade', color: '#ef4444', description: 'Emotional trade after a loss' },
    { name: 'FOMO', color: '#f59e0b', description: 'Fear of missing out trade' },
    { name: 'Overtrading', color: '#ec4899', description: 'Exceeded daily trade limit' },
    { name: 'A+ Trade', color: '#8b5cf6', description: 'Exceptional execution' },
    { name: 'Lesson Learned', color: '#3b82f6', description: 'Important learning experience' },
];

'use client';

import React, { useState, useEffect } from 'react';
import {
    Tag as TagIcon,
    X,
    Plus,
    Edit3,
    Trash2,
    Check,
    TrendingUp,
} from 'lucide-react';
import { Tag, TAG_COLORS, DEFAULT_TAGS, TagColor } from '../../types/tags';

interface TagManagerProps {
    tags: Tag[];
    onAddTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => void;
    onUpdateTag: (id: string, updates: Partial<Tag>) => void;
    onDeleteTag: (id: string) => void;
    selectedTags?: string[]; // For filtering/selection
    onToggleTag?: (tagId: string) => void; // For multi-select
}

const TagManager: React.FC<TagManagerProps> = ({
    tags,
    onAddTag,
    onUpdateTag,
    onDeleteTag,
    selectedTags = [],
    onToggleTag,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTag, setNewTag] = useState({
        name: '',
        color: TAG_COLORS[0],
        description: '',
    });

    const handleAdd = () => {
        if (!newTag.name.trim()) {
            alert('Tag name is required');
            return;
        }

        onAddTag({
            name: newTag.name.trim(),
            color: newTag.color,
            description: newTag.description.trim(),
        });

        setNewTag({ name: '', color: TAG_COLORS[0], description: '' });
        setIsAdding(false);
    };

    const handleUpdate = (tag: Tag) => {
        if (!tag.name.trim()) {
            alert('Tag name is required');
            return;
        }

        onUpdateTag(tag.id, {
            name: tag.name.trim(),
            color: tag.color,
            description: tag.description?.trim(),
        });

        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        const tag = tags.find(t => t.id === id);
        if (!tag) return;

        const confirmed = window.confirm(
            `Delete "${tag.name}"?\n\n${tag.usageCount > 0 ? `This tag is used on ${tag.usageCount} trade(s). The tag will be removed from those trades.` : 'This tag is not currently used.'}`
        );

        if (confirmed) {
            onDeleteTag(id);
        }
    };

    const sortedTags = [...tags].sort((a, b) => {
        // Sort by usage count (descending), then by name
        if (b.usageCount !== a.usageCount) {
            return b.usageCount - a.usageCount;
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TagIcon className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tag Manager</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {tags.length} tags • {tags.reduce((sum, t) => sum + t.usageCount, 0)} total uses
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 font-medium text-sm"
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                    {isAdding ? 'Cancel' : 'New Tag'}
                </button>
            </div>

            {/* Add New Tag Form */}
            {isAdding && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                                Tag Name *
                            </label>
                            <input
                                type="text"
                                value={newTag.name}
                                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                placeholder="e.g., Perfect Setup"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={newTag.description}
                                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                                placeholder="Optional description"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-2">
                                Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TAG_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewTag({ ...newTag, color: color as any })}
                                        className={`w-8 h-8 rounded-full transition-all ${newTag.color === color
                                            ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800 scale-110'
                                            : 'hover:scale-110'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleAdd}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium text-sm"
                            >
                                Create Tag
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewTag({ name: '', color: TAG_COLORS[0], description: '' });
                                }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tag List */}
            <div className="space-y-2">
                {sortedTags.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <TagIcon size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No tags yet</p>
                        <p className="text-sm mt-1">Create your first tag to get started</p>
                    </div>
                ) : (
                    sortedTags.map(tag => (
                        <TagItem
                            key={tag.id}
                            tag={tag}
                            isEditing={editingId === tag.id}
                            isSelected={selectedTags.includes(tag.id)}
                            onEdit={(updatedTag) => {
                                handleUpdate(updatedTag);
                            }}
                            onStartEdit={() => setEditingId(tag.id)}
                            onCancelEdit={() => setEditingId(null)}
                            onDelete={() => handleDelete(tag.id)}
                            onToggle={onToggleTag ? () => onToggleTag(tag.id) : undefined}
                        />
                    ))
                )}
            </div>

            {/* Usage Stats */}
            {tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <TrendingUp size={16} />
                        <span>
                            Most used:{' '}
                            <span className="font-medium" style={{ color: sortedTags[0]?.color }}>
                                {sortedTags[0]?.name}
                            </span>
                            {sortedTags[0]?.usageCount > 0 && ` (${sortedTags[0].usageCount} times)`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Individual Tag Item Component
interface TagItemProps {
    tag: Tag;
    isEditing: boolean;
    isSelected: boolean;
    onEdit: (tag: Tag) => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onDelete: () => void;
    onToggle?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({
    tag,
    isEditing,
    isSelected,
    onEdit,
    onStartEdit,
    onCancelEdit,
    onDelete,
    onToggle,
}) => {
    const [editedTag, setEditedTag] = useState(tag);

    React.useEffect(() => {
        setEditedTag(tag);
    }, [tag]);

    if (isEditing) {
        return (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editedTag.name}
                        onChange={(e) => setEditedTag({ ...editedTag, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                    />
                    <input
                        type="text"
                        value={editedTag.description || ''}
                        onChange={(e) => setEditedTag({ ...editedTag, description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                    />
                    <div className="flex flex-wrap gap-2">
                        {TAG_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setEditedTag({ ...editedTag, color })}
                                className={`w-7 h-7 rounded-full transition-all ${editedTag.color === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-700' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(editedTag)}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <Check size={14} />
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`group p-3 rounded-lg border transition-all ${isSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Color Indicator */}
                <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                />

                {/* Tag Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {tag.name}
                        </span>
                        {tag.usageCount > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                                {tag.usageCount}
                            </span>
                        )}
                    </div>
                    {tag.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {tag.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onToggle && (
                        <button
                            onClick={onToggle}
                            className={`p-1.5 rounded transition-colors ${isSelected
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                                }`}
                            title={isSelected ? 'Deselect' : 'Select'}
                        >
                            <Check size={14} />
                        </button>
                    )}
                    <button
                        onClick={onStartEdit}
                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                        title="Edit"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagManager;

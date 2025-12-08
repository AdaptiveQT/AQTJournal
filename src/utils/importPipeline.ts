/**
 * Import Pipeline for AQT Journal
 * Supports CSV parsing with column auto-detection and MT4/MT5 format handling
 */

import { Trade } from '../types';

// ============= TYPES =============

export interface ColumnMapping {
    source: string;      // Column name in imported file
    target: keyof Trade | null;  // Mapped Trade field or null if skipped
    sampleValues: string[];      // First 3 values for preview
}

export interface ImportValidationError {
    row: number;
    column: string;
    value: string;
    message: string;
}

export interface ImportResult {
    success: boolean;
    trades: Trade[];
    errors: ImportValidationError[];
    warnings: string[];
    skippedRows: number;
}

export interface ParsedRow {
    [key: string]: string;
}

// ============= COLUMN DETECTION =============

const COLUMN_PATTERNS: Record<keyof Trade, RegExp[]> = {
    id: [/^id$/i, /^trade.?id$/i, /^ticket$/i, /^order$/i],
    pair: [/^pair$/i, /^symbol$/i, /^instrument$/i, /^market$/i, /^currency$/i],
    direction: [/^direction$/i, /^side$/i, /^type$/i, /^buy.?sell$/i, /^action$/i],
    entry: [/^entry$/i, /^open.?price$/i, /^entry.?price$/i, /^price$/i],
    exit: [/^exit$/i, /^close.?price$/i, /^exit.?price$/i, /^take.?profit$/i],
    date: [/^date$/i, /^open.?date$/i, /^trade.?date$/i, /^time$/i],
    time: [/^time$/i, /^open.?time$/i, /^trade.?time$/i],
    ts: [/^timestamp$/i, /^unix$/i, /^epoch$/i],
    lots: [/^lot/i, /^size$/i, /^volume$/i, /^qty$/i, /^quantity$/i, /^units$/i],
    pnl: [/^pnl$/i, /^p&l$/i, /^profit$/i, /^net.?profit$/i, /^result$/i, /^gain$/i],
    setup: [/^setup$/i, /^strategy$/i, /^pattern$/i, /^playbook$/i],
    emotion: [/^emotion$/i, /^mood$/i, /^feeling$/i, /^mental$/i],
    notes: [/^note/i, /^comment/i, /^remark/i, /^description$/i],
    stopLoss: [/^stop/i, /^sl$/i, /^stop.?loss$/i],
    takeProfit: [/^take.?profit$/i, /^tp$/i, /^target$/i],
    imageUrl: [/^image$/i, /^screenshot$/i, /^chart$/i],
    sessionType: [/^session$/i, /^market.?session$/i],
    tags: [/^tag/i, /^label/i, /^category$/i],
    strategyId: [/^strategy.?id$/i],
    riskRewardRatio: [/^r[:/]?r$/i, /^risk.?reward$/i],
    timestamp: [/^timestamp$/i],
    voiceNoteUrl: [/^voice$/i, /^audio$/i],
    mood: [/^mood$/i],
};

/**
 * Auto-detect column mappings based on header names
 */
export function detectColumnMappings(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];
    const usedTargets = new Set<string>();

    headers.forEach(header => {
        let bestMatch: keyof Trade | null = null;

        // Check each pattern
        for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
            if (usedTargets.has(field)) continue;

            for (const pattern of patterns) {
                if (pattern.test(header.trim())) {
                    bestMatch = field as keyof Trade;
                    usedTargets.add(field);
                    break;
                }
            }
            if (bestMatch) break;
        }

        mappings.push({
            source: header,
            target: bestMatch,
            sampleValues: []
        });
    });

    return mappings;
}

/**
 * Add sample values to mappings for preview
 */
export function addSampleValues(mappings: ColumnMapping[], rows: ParsedRow[]): ColumnMapping[] {
    return mappings.map(mapping => ({
        ...mapping,
        sampleValues: rows.slice(0, 3).map(row => row[mapping.source] || '').filter(Boolean)
    }));
}

// ============= CSV PARSING =============

/**
 * Parse CSV string into rows
 */
export function parseCSV(csvContent: string): { headers: string[]; rows: ParsedRow[] } {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    // Detect delimiter (comma, semicolon, tab)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t') && !firstLine.includes(',')) {
        delimiter = '\t';
    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
        delimiter = ';';
    }

    // Parse header row
    const headers = parseCSVLine(firstLine, delimiter);

    // Parse data rows
    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        const row: ParsedRow = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
        });
        rows.push(row);
    }

    return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

// ============= VALUE PARSING =============

/**
 * Parse direction value from various formats
 */
export function parseDirection(value: string): 'Long' | 'Short' | null {
    const v = value.toLowerCase().trim();
    if (['long', 'buy', 'b', '1', 'up'].includes(v)) return 'Long';
    if (['short', 'sell', 's', '-1', 'down'].includes(v)) return 'Short';
    return null;
}

/**
 * Parse number value safely
 */
export function parseNumber(value: string): number | null {
    if (!value || value.trim() === '') return null;
    const cleaned = value.replace(/[,$€£¥]/g, '').replace(/\s/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Parse date value into ISO format
 */
export function parseDate(value: string): string | null {
    if (!value || value.trim() === '') return null;

    // Try various date formats
    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})/, // ISO: 2024-01-15
        /^(\d{2})\/(\d{2})\/(\d{4})/, // US: 01/15/2024
        /^(\d{2})\.(\d{2})\.(\d{4})/, // EU: 15.01.2024
        /^(\d{2})-(\d{2})-(\d{4})/, // Alt: 15-01-2024
    ];

    for (const format of formats) {
        const match = value.match(format);
        if (match) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
    }

    // Fallback: try native parsing
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return null;
}

// ============= TRADE CONVERSION =============

/**
 * Convert parsed rows to Trade objects using column mappings
 */
export function convertToTrades(
    rows: ParsedRow[],
    mappings: ColumnMapping[]
): ImportResult {
    const trades: Trade[] = [];
    const errors: ImportValidationError[] = [];
    const warnings: string[] = [];
    let skippedRows = 0;

    // Build mapping lookup
    const mappingLookup = new Map<keyof Trade, string>();
    mappings.forEach(m => {
        if (m.target) {
            mappingLookup.set(m.target, m.source);
        }
    });

    // Convert each row
    rows.forEach((row, rowIndex) => {
        const getValue = (field: keyof Trade): string => {
            const sourceCol = mappingLookup.get(field);
            return sourceCol ? row[sourceCol] || '' : '';
        };

        // Required fields
        const pairValue = getValue('pair');
        const directionValue = getValue('direction');
        const entryValue = getValue('entry');
        const pnlValue = getValue('pnl');

        // Validate required fields
        const direction = parseDirection(directionValue);
        const entry = parseNumber(entryValue);
        const pnl = parseNumber(pnlValue);

        if (!pairValue) {
            errors.push({ row: rowIndex + 2, column: 'pair', value: pairValue, message: 'Missing pair/symbol' });
        }
        if (!direction) {
            errors.push({ row: rowIndex + 2, column: 'direction', value: directionValue, message: 'Invalid direction (expected Long/Short)' });
        }
        if (entry === null) {
            errors.push({ row: rowIndex + 2, column: 'entry', value: entryValue, message: 'Invalid entry price' });
        }
        if (pnl === null) {
            errors.push({ row: rowIndex + 2, column: 'pnl', value: pnlValue, message: 'Invalid P&L value' });
        }

        // Skip row if missing critical fields
        if (!pairValue || !direction || entry === null || pnl === null) {
            skippedRows++;
            return;
        }

        // Parse optional fields
        const exit = parseNumber(getValue('exit'));
        const lots = parseNumber(getValue('lots')) || 0.01;
        const date = parseDate(getValue('date')) || new Date().toISOString().split('T')[0];
        const time = getValue('time') || '09:00';

        const trade: Trade = {
            id: getValue('id') || `import-${Date.now()}-${rowIndex}`,
            pair: pairValue.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6),
            direction,
            entry,
            exit: exit || entry,
            pnl,
            lots,
            date,
            time,
            ts: new Date(`${date}T${time}`).getTime() || Date.now(),
            setup: getValue('setup') || 'Imported',
            emotion: getValue('emotion') || 'Neutral',
            notes: getValue('notes') || '',
            stopLoss: getValue('stopLoss') || undefined,
            takeProfit: getValue('takeProfit') || undefined,
        };

        trades.push(trade);
    });

    // Generate warnings
    if (skippedRows > 0) {
        warnings.push(`${skippedRows} rows skipped due to missing required fields`);
    }
    if (errors.length > 0) {
        warnings.push(`${errors.length} validation errors found`);
    }

    return {
        success: errors.length === 0,
        trades,
        errors,
        warnings,
        skippedRows
    };
}

// ============= MT4/MT5 HTML PARSING =============

/**
 * Parse MT4/MT5 HTML trade history export
 */
export function parseMT4HTML(htmlContent: string): { headers: string[]; rows: ParsedRow[] } {
    // Extract table rows
    const tableMatch = htmlContent.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    if (!tableMatch) {
        return { headers: [], rows: [] };
    }

    // Find the history table (usually the largest one)
    let bestTable = '';
    let maxRows = 0;

    tableMatch.forEach(table => {
        const rowCount = (table.match(/<tr/gi) || []).length;
        if (rowCount > maxRows) {
            maxRows = rowCount;
            bestTable = table;
        }
    });

    if (!bestTable) {
        return { headers: [], rows: [] };
    }

    // Extract rows
    const rowMatches = bestTable.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

    // First row should be headers
    const headerRow = rowMatches[0];
    const headerCells = headerRow.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    const headers = headerCells.map(cell => {
        return cell.replace(/<[^>]+>/g, '').trim();
    });

    // Data rows
    const rows: ParsedRow[] = [];
    for (let i = 1; i < rowMatches.length; i++) {
        const dataCells = rowMatches[i].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
        const values = dataCells.map(cell => cell.replace(/<[^>]+>/g, '').trim());

        if (values.length === headers.length) {
            const row: ParsedRow = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            rows.push(row);
        }
    }

    return { headers, rows };
}

// ============= FILE TYPE DETECTION =============

export type ImportFileType = 'csv' | 'html' | 'unknown';

export function detectFileType(content: string, filename: string): ImportFileType {
    const lowName = filename.toLowerCase();

    if (lowName.endsWith('.csv') || lowName.endsWith('.txt')) {
        return 'csv';
    }
    if (lowName.endsWith('.html') || lowName.endsWith('.htm')) {
        return 'html';
    }

    // Content-based detection
    if (content.trim().startsWith('<') && content.includes('</')) {
        return 'html';
    }
    if (content.includes(',') || content.includes('\t')) {
        return 'csv';
    }

    return 'unknown';
}

/**
 * Main import function - handles both CSV and HTML
 */
export function importFile(
    content: string,
    filename: string
): { headers: string[]; rows: ParsedRow[]; fileType: ImportFileType } {
    const fileType = detectFileType(content, filename);

    if (fileType === 'html') {
        return { ...parseMT4HTML(content), fileType };
    }

    return { ...parseCSV(content), fileType };
}

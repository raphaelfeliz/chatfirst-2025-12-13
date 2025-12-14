/**
 * Structured Console Logger
 * Provides grouped, labeled, and styled console logs with caller identification.
 */

import { CODEBASE_MAP } from '../../code_control/codebaseMap.js';

const STYLES = {
    'APP': 'background: #007bff; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    'FACET': 'background: #6f42c1; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    'UI': 'background: #fd7e14; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    'DATA': 'background: #28a745; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    'CHAT': 'background: #17a2b8; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    'DEFAULT': 'background: #6c757d; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
};

const EMOJIS = {
    'APP': '🚀',
    'FACET': '💎',
    'UI': '🎨',
    'DATA': '💾',
    'CHAT': '💬',
    'DEFAULT': '📝'
};

class Logger {
    constructor() {
        this.enabledLabels = new Set(['APP', 'FACET', 'UI', 'DATA', 'CHAT']);
        this.enabled = true;
    }

    /**
     * Enable a specific label
     * @param {string} label 
     */
    enableLabel(label) {
        this.enabledLabels.add(label);
    }

    /**
     * Disable a specific label
     * @param {string} label 
     */
    disableLabel(label) {
        this.enabledLabels.delete(label);
    }

    /**
     * Toggle global logging
     * @param {boolean} state 
     */
    setGlobalState(state) {
        this.enabled = state;
    }

    /**
     * Get style string for a label
     * @param {string} label 
     */
    _getStyle(label) {
        return STYLES[label] || STYLES['DEFAULT'];
    }

    /**
     * Get emoji for a label
     * @param {string} label 
     */
    _getEmoji(label) {
        return EMOJIS[label] || EMOJIS['DEFAULT'];
    }

    /**
     * Extract caller info from stack trace
     */
    _getCaller() {
        try {
            throw new Error();
        } catch (e) {
            // Stack format varies by browser. This is a best-effort parser for Chrome/V8.
            // Stack usually looks like: Error \n at Logger._getCaller \n at Logger.log \n at callingFunction ...
            const stackLines = e.stack.split('\n');
            // We want the caller of the method that called _getCaller (e.g. log/group/track)
            // 0: Error
            // 1: _getCaller
            // 2: Logger method (log, group, etc.)
            // 3: The actual caller we want
            if (stackLines.length >= 4) {
                const callerLine = stackLines[3].trim();
                // Extract function name if possible
                const match = callerLine.match(/at\s+(.*)\s+\(/) || callerLine.match(/at\s+(.*)/);
                if (match && match[1]) {
                    return match[1];
                }
                return callerLine;
            }
        }
        return 'unknown';
    }

    /**
     * Get details from codebase map
     * @param {string} callerName 
     */
    _getCallerInfo(callerName) {
        // Remove prefixes like "Object." or "Proxy." or "Logger."
        const cleanName = callerName.replace(/^(Object\.|Proxy\.|Logger\.)/, '');
        return CODEBASE_MAP.elements.find(e => e.name === cleanName);
    }

    /**
     * Log caller details with expandable group
     * @param {string} callerName 
     */
    _logCallerDetails(callerName) {
        console.log(`%cCaller: ${callerName}`, 'color: #888; font-style: italic;');

        const info = this._getCallerInfo(callerName);
        if (info) {
            console.groupCollapsed(`%cℹ️ Function Details: ${info.name}`, 'color: #666; font-weight: normal; font-size: 0.9em;');
            console.log(`%cName:`, 'font-weight: bold', info.name);
            console.log(`%cFile:`, 'font-weight: bold', info.file);
            console.log(`%cType:`, 'font-weight: bold', info.type);
            console.log(`%cSignature:`, 'font-weight: bold', info.signature);
            console.log(`%cDescription:`, 'font-weight: bold', info.description || '(none)');
            if (info.categories && info.categories.length) console.log(`%cCategories:`, 'font-weight: bold', info.categories.join(', '));
            if (info.dependencies && info.dependencies.length) console.log(`%cDependencies:`, 'font-weight: bold', info.dependencies.join(', '));
            if (info.sideEffects !== undefined) console.log(`%cSide Effects:`, 'font-weight: bold', info.sideEffects);
            console.groupEnd();
        }
    }

    /**
     * Helper to log objects in a readable, collapsed format
     * @param {string} label 
     * @param {any} data 
     * @param {string} color 
     */
    _logObject(label, data, color = '#888') {
        if (typeof data === 'object' && data !== null) {
            console.groupCollapsed(`%c${label}`, `color: ${color}; font-weight: bold;`);
            Object.entries(data).forEach(([key, value]) => {
                // Format value for better readability if it's null or a string
                let displayValue = value;
                if (value === null) displayValue = 'null';
                else if (value === undefined) displayValue = 'undefined';
                else if (typeof value === 'string') displayValue = `"${value}"`;

                console.log(`${key}:`, displayValue);
            });
            console.groupEnd();
        } else {
            console.log(`%c${label}:`, `color: ${color}; font-weight: bold;`, data);
        }
    }

    /**
     * Standard log with label
     * Supports: log(label, message, data) OR log(message, data) [Auto-label]
     */
    // @desc Standard logging method. \n    // Supports explicit labeling (e.g., logger.log('UI', 'Msg')) or auto-labeling based on caller. \n    // Logs are grouped, styled, and include caller details.
    log(arg1, arg2, arg3 = null) {
        if (!this.enabled) return;

        const caller = this._getCaller();
        let label, message, data;

        // Check if arg1 is a known label
        if (STYLES[arg1] || (this.enabledLabels.has(arg1))) {
            label = arg1;
            message = arg2;
            data = arg3;
        } else {
            // Auto-label mode
            const info = this._getCallerInfo(caller);
            label = (info && info.categories && info.categories.length > 0) ? info.categories[0] : 'DEFAULT';
            message = arg1;
            data = arg2;
        }

        if (!this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);

        console.groupCollapsed(`%c${emoji} [${label}] ${message}`, style);
        this._logCallerDetails(caller);
        if (data !== null && data !== undefined) {
            this._logObject('Data', data);
        }
        console.groupEnd();
    }

    /**
     * Start a collapsed group
     * Supports: group(label, title) OR group(title) [Auto-label]
     */
    // @desc Starts a collapsed console group with a label. \n    // Useful for organizing related logs (e.g., during a complex calculation or flow).
    group(arg1, arg2) {
        if (!this.enabled) return;

        const caller = this._getCaller();
        let label, title;

        if (STYLES[arg1] || (this.enabledLabels.has(arg1))) {
            label = arg1;
            title = arg2;
        } else {
            const info = this._getCallerInfo(caller);
            label = (info && info.categories && info.categories.length > 0) ? info.categories[0] : 'DEFAULT';
            title = arg1;
        }

        if (!this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);

        console.groupCollapsed(`%c${emoji} [${label}] ${title}`, style);
        this._logCallerDetails(caller);
    }

    /**
     * End current group
     */
    groupEnd(label) {
        // Note: groupEnd doesn't take arguments in standard console API, 
        // but checking label state is tricky if nested. 
        // We'll just call it if global enabled for simplicity, 
        // or we'd need a stack of open groups to track if we should actually close one we opened.
        // For now, assuming balanced calls by user.
        if (this.enabled && (label ? this.enabledLabels.has(label) : true)) {
            console.groupEnd();
        }
    }

    /**
     * Track variable change
     * Supports: track(label, varName, old, new) OR track(varName, old, new) [Auto-label]
     */
    // @desc Specialized logger for tracking variable state changes (diffing). \n    // visually compares 'old' and 'new' values with color coding (Red/Green).
    track(arg1, arg2, arg3, arg4) {
        if (!this.enabled) return;

        const caller = this._getCaller();
        let label, variableName, oldValue, newValue;

        if (STYLES[arg1] || (this.enabledLabels.has(arg1))) {
            label = arg1;
            variableName = arg2;
            oldValue = arg3;
            newValue = arg4;
        } else {
            const info = this._getCallerInfo(caller);
            label = (info && info.categories && info.categories.length > 0) ? info.categories[0] : 'DEFAULT';
            variableName = arg1;
            oldValue = arg2;
            newValue = arg3;
        }

        if (!this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);

        console.groupCollapsed(`%c${emoji} [${label}] UPDATE: ${variableName}`, style);
        this._logCallerDetails(caller);

        this._logObject('Previous', oldValue, '#dc3545');
        this._logObject('New', newValue, '#28a745');

        console.groupEnd();
    }
    /**
     * Log a warning
     */
    warn(arg1, arg2, arg3) {
        if (!this.enabled) return;

        let label = 'DEFAULT';
        let message = '';
        let data = null;

        if (STYLES[arg1] || (this.enabledLabels.has(arg1))) {
            label = arg1;
            message = arg2;
            data = arg3;
        } else {
            const caller = this._getCaller();
            const info = this._getCallerInfo(caller);
            label = (info && info.categories && info.categories.length > 0) ? info.categories[0] : 'DEFAULT';
            message = arg1;
            data = arg2;
        }

        if (!this.enabledLabels.has(label)) return;

        const style = 'background: #ffc107; color: black; padding: 2px 5px; border-radius: 3px; font-weight: bold;';
        console.groupCollapsed(`%c⚠️ [${label}] WARN: ${message}`, style);

        const caller = this._getCaller();
        this._logCallerDetails(caller);

        if (data) this._logObject('Data', data, '#ffc107');
        console.groupEnd();
    }

    /**
     * Log an error
     */
    error(arg1, arg2, arg3) {
        if (!this.enabled) return;

        let label = 'DEFAULT';
        let message = '';
        let data = null;

        if (STYLES[arg1] || (this.enabledLabels.has(arg1))) {
            label = arg1;
            message = arg2;
            data = arg3;
        } else {
            const caller = this._getCaller();
            const info = this._getCallerInfo(caller);
            label = (info && info.categories && info.categories.length > 0) ? info.categories[0] : 'DEFAULT';
            message = arg1;
            data = arg2;
        }

        const style = 'background: #dc3545; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;';
        // Check if message is Error object
        if (message instanceof Error) {
            message = message.message;
            if (!data) data = arg1; // assign error obj to data if not separate
        }

        console.groupCollapsed(`%c❌ [${label}] ERROR: ${message}`, style);

        const caller = this._getCaller();
        this._logCallerDetails(caller);

        if (data) this._logObject('Error Details', data, '#dc3545');
        console.groupEnd();
    }
}

// @desc Structured console logger providing grouped, labeled, and styled console logs with caller identification
export const logger = new Logger();

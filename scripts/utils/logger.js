/**
 * Structured Console Logger
 * Provides grouped, labeled, and styled console logs with caller identification.
 */

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
     * @param {string} label 
     * @param {string} message 
     * @param {any} data 
     */
    log(label, message, data = null) {
        if (!this.enabled || !this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);
        const caller = this._getCaller();

        console.groupCollapsed(`%c${emoji} [${label}] ${message}`, style);
        console.log(`%cCaller: ${caller}`, 'color: #888; font-style: italic;');
        if (data !== null) {
            this._logObject('Data', data);
        }
        console.groupEnd();
    }

    /**
     * Start a collapsed group
     * @param {string} label 
     * @param {string} title 
     */
    group(label, title) {
        if (!this.enabled || !this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);
        const caller = this._getCaller();

        console.groupCollapsed(`%c${emoji} [${label}] ${title}`, style);
        console.log(`%cCaller: ${caller}`, 'color: #888; font-style: italic;');
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
     * @param {string} label 
     * @param {string} variableName 
     * @param {any} oldValue 
     * @param {any} newValue 
     */
    track(label, variableName, oldValue, newValue) {
        if (!this.enabled || !this.enabledLabels.has(label)) return;

        const style = this._getStyle(label);
        const emoji = this._getEmoji(label);
        const caller = this._getCaller();

        console.groupCollapsed(`%c${emoji} [${label}] UPDATE: ${variableName}`, style);
        console.log(`%cCaller: ${caller}`, 'color: #888; font-style: italic;');

        this._logObject('Previous', oldValue, '#dc3545');
        this._logObject('New', newValue, '#28a745');

        console.groupEnd();
    }
}

export const logger = new Logger();

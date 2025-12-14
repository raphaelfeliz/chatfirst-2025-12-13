/**
 * ------------------------------------------------------------------
 * MODULE: Main Application Orchestrator
 * ------------------------------------------------------------------
 */
import { FACET_ORDER } from './constants.js';
import { calculateNextSelections, runFacetLoop } from './logic.js';
import * as UI from './ui/index.js';
import { logger } from './utils/logger.js';
import { session } from './data/session.js';

export const TEST_UPDATE_VARIABLE = "I should appear in the map";
// @desc Variable used to confirm update and mapping in codebase.

export const APP_INFO = {
    module: "Main Application",
    versionName: "Orchestrator",
    versionNumber: "1.0.0"
};
// @desc Metadata object for the main application orchestrator.

// --- State ---
let currentSelections = {
    categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null
};

// --- Handlers ---

// @desc Updates state based on user selection and triggers UI refresh.
function handleSelection(facet, value) {
    logger.group('FACET', 'Selection Update');
    logger.log('FACET', `User selected: ${facet} = ${value}`);

    const oldSelections = { ...currentSelections };
    currentSelections = calculateNextSelections(currentSelections, facet, value);

    logger.track('FACET', 'currentSelections', oldSelections, currentSelections);

    updateUI();
    logger.groupEnd('FACET');
}

// @desc Resets selections to a specific point when a breadcrumb is clicked.
function handleBreadcrumbClick(facet, index) {
    logger.log('UI', `Breadcrumb clicked: ${facet}`);
    const next = { ...currentSelections };
    next[facet] = null;
    for (let i = index + 1; i < FACET_ORDER.length; i++) {
        next[FACET_ORDER[i]] = null;
    }
    currentSelections = next;
    updateUI();
}

// @desc Resets the application state to initial defaults.
function handleRestart() {
    logger.log('APP', 'Restart Triggered');
    currentSelections = { categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null };
    updateUI();
}

// @desc Calculates logic state and updates the UI view.
function updateUI() {
    const engineResult = runFacetLoop(currentSelections);

    UI.updateView(currentSelections, engineResult, {
        onOptionSelect: handleSelection,
        onBreadcrumbClick: handleBreadcrumbClick
    });

    // Validated Checkpoint 3.2: Persist state to server
    session.updateSelection(currentSelections);
}

// --- Initialization ---

// @desc Initializes the application, session, and event listeners.
function init() {
    logger.log('APP', 'App Initialized', APP_INFO);

    // Initialize Session
    session.init((remoteData) => {
        // Optional: Rehydrate state from remote if needed
        logger.log('APP', 'Remote State Received', remoteData);
    });

    UI.initEventListeners({
        onRestart: handleRestart
    });

    // Initial Render
    updateUI();
}

// Start the app
init();

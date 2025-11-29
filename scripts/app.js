/**
 * ------------------------------------------------------------------
 * MODULE: Main Application Orchestrator
 * ------------------------------------------------------------------
 */
import { FACET_ORDER } from './constants.js';
import { calculateNextSelections, runFacetLoop } from './logic.js';
import * as UI from './ui/index.js';

export const TEST_UPDATE_VARIABLE = "I should appear in the map";

export const APP_INFO = {
    module: "Main Application",
    versionName: "Orchestrator",
    versionNumber: "1.0.0"
};

// --- State ---
let currentSelections = {
    categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null
};

// --- Handlers ---

function handleSelection(facet, value) {
    currentSelections = calculateNextSelections(currentSelections, facet, value);
    updateUI();
}

function handleBreadcrumbClick(facet, index) {
    const next = { ...currentSelections };
    next[facet] = null;
    for (let i = index + 1; i < FACET_ORDER.length; i++) {
        next[FACET_ORDER[i]] = null;
    }
    currentSelections = next;
    updateUI();
}

function handleRestart() {
    currentSelections = { categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null };
    updateUI();
}

function updateUI() {
    const engineResult = runFacetLoop(currentSelections);

    UI.updateView(currentSelections, engineResult, {
        onOptionSelect: handleSelection,
        onBreadcrumbClick: handleBreadcrumbClick
    });
}

// --- Initialization ---

function init() {
    UI.initEventListeners({
        onRestart: handleRestart
    });

    // Initial Render
    updateUI();
}

// Start the app
init();

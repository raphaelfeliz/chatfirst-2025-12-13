/**
 * ------------------------------------------------------------------
 * MODULE: Logic Engine
 * ------------------------------------------------------------------
 */
import { FACET_ORDER, FACET_DEFINITIONS, FIELD_MAP } from './constants.js';
import { PRODUCT_CATALOG } from './productCatalog.js';

export const LOGIC_INFO = {
    module: "Logic Engine",
    versionName: "Core",
    versionNumber: "1.0.0"
};

export function getProductField(product, uiFacet) {
    const productField = FIELD_MAP[uiFacet];
    return product[productField];
}

export function calculateNextSelections(current, facet, value) {
    const idx = FACET_ORDER.indexOf(facet);
    // Copy current
    const next = { ...current };
    next[facet] = value;
    // Reset subsequent fields
    for (let i = idx + 1; i < FACET_ORDER.length; i++) {
        next[FACET_ORDER[i]] = null;
    }
    // Logic: if persiana is not 'sim', force motorizada to null
    if (next.persiana && next.persiana !== 'sim') {
        next.motorizada = null;
    }
    return next;
}

export function applyFilters(selections, catalog) {
    return catalog.filter((p) => {
        for (const facet of FACET_ORDER) {
            const sel = selections[facet];
            if (sel == null) continue;
            // Skip motorizada check if persiana is not sim
            if (facet === 'motorizada' && selections.persiana !== 'sim') continue;

            const val = getProductField(p, facet);
            // Loose equality for numbers/strings
            if (val == null || String(val) !== String(sel)) {
                return false;
            }
        }
        return true;
    });
}

export function getUniqueOptions(attribute, products) {
    const set = new Set();
    for (const p of products) {
        const v = getProductField(p, attribute);
        if (v !== null && v !== undefined) set.add(v);
    }
    const arr = Array.from(set);
    if (attribute === 'folhas') {
        return arr.map(Number).sort((a, b) => a - b);
    }
    return arr.map(String).sort();
}

export function runFacetLoop(selections) {
    let workingSelections = { ...selections };

    for (const facet of FACET_ORDER) {
        // Logic skip
        if (facet === 'motorizada' && workingSelections.persiana !== 'sim') continue;

        // If already selected, skip
        if (workingSelections[facet] !== null) continue;

        let currentFiltered = applyFilters(workingSelections, PRODUCT_CATALOG);

        if (currentFiltered.length <= 1) {
            return { selections: workingSelections, finalProduct: true, finalProducts: currentFiltered, currentQuestion: null };
        }

        const options = getUniqueOptions(facet, currentFiltered);

        if (options.length > 1) {
            const def = FACET_DEFINITIONS[facet];
            return {
                selections: workingSelections,
                finalProduct: false,
                finalProducts: currentFiltered,
                currentQuestion: { attribute: facet, title: def.title, options }
            };
        }

        if (options.length === 1) {
            workingSelections[facet] = options[0];
        } else {
            // 0 options - stuck
            return { selections: workingSelections, finalProduct: true, finalProducts: [], currentQuestion: null };
        }
    }

    const finalFiltered = applyFilters(workingSelections, PRODUCT_CATALOG);
    return { selections: workingSelections, finalProduct: true, finalProducts: finalFiltered, currentQuestion: null };
}

import { FACET_ORDER, FACET_DEFINITIONS, FIELD_MAP } from './constants.js';
import { PRODUCT_CATALOG } from './productCatalog.js';
import { logger } from './utils/logger.js';

// @desc Resolves the mapping between UI facet names (e.g., 'categoria') and internal product catalog fields.
export function getProductField(product, uiFacet) {

    // @desc Calculates the next state of selections. \n// It handles cascading resets (clearing downstream selections when an upstream one changes) \n// and implements specific business logic dependencies (e.g., if 'persiana' != 'sim', 'motorizada' is null).
    export function calculateNextSelections(current, facet, value) {
        logger.log('FACET', `Calculating next selections for ${facet} = ${value}`);
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
    // @desc Calculates the next selection state after a user choice.

    // @desc Filters the product catalog based on current user selections. \n// It iterates through facets, skipping undefined selections and handling conditional logic (like motorizada dependency). \n// Uses loose equality to match mixed string/number types.
    export function applyFilters(selections, catalog) {
        const filtered = catalog.filter((p) => {
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
        logger.log('DATA', `Filtered products: ${filtered.length} remaining`);
        return filtered;
    }
    // @desc Filters the product catalog based on user selections.

    // @desc Extracts unique, valid options for a specific attribute from the filtered product list. \n// Handles numerical sorting for 'folhas' and alphabetical for others.
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
    // @desc Gets unique options for a facet from the filtered products.

    // @desc The core decision engine. \n// Iterates through facets in order to find the next unresolved question. \n// Handles auto-selection (single option), deadlocks (0 options), and termination (valid product found).
    export function runFacetLoop(selections) {
        logger.group('FACET', 'Running Facet Loop');
        let workingSelections = { ...selections };

        for (const facet of FACET_ORDER) {
            // Logic skip
            if (facet === 'motorizada' && workingSelections.persiana !== 'sim') continue;

            // If already selected, skip
            if (workingSelections[facet] !== null) continue;

            let currentFiltered = applyFilters(workingSelections, PRODUCT_CATALOG);

            if (currentFiltered.length <= 1) {
                logger.log('FACET', 'Loop End: <= 1 product found');
                logger.groupEnd('FACET');
                return { selections: workingSelections, finalProduct: true, finalProducts: currentFiltered, currentQuestion: null };
            }

            const options = getUniqueOptions(facet, currentFiltered);

            if (options.length > 1) {
                const def = FACET_DEFINITIONS[facet];
                logger.log('FACET', `Next Question: ${facet} (${options.length} options)`);
                logger.groupEnd('FACET');
                return {
                    selections: workingSelections,
                    finalProduct: false,
                    finalProducts: currentFiltered,
                    currentQuestion: { attribute: facet, title: def.title, options }
                };
            }

            if (options.length === 1) {
                workingSelections[facet] = options[0];
                logger.log('FACET', `Auto-selecting ${facet} = ${options[0]}`);
            } else {
                // 0 options - stuck
                logger.log('FACET', 'Loop End: 0 options found (Stuck)');
                logger.groupEnd('FACET');
                return { selections: workingSelections, finalProduct: true, finalProducts: [], currentQuestion: null };
            }
        }

        const finalFiltered = applyFilters(workingSelections, PRODUCT_CATALOG);
        logger.log('FACET', 'Loop End: All facets processed');
        logger.groupEnd('FACET');
        return { selections: workingSelections, finalProduct: true, finalProducts: finalFiltered, currentQuestion: null };
    }
// @desc Runs the facet selection loop to determine next questions or final products.

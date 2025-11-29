/**
 * UI Components Module
 * Handles creation of DOM elements for options and products.
 */
import { FACET_DEFINITIONS, FIELD_MAP, FACET_ORDER } from '../constants.js';
import { BASE_PRODUCT_URL, PRODUCT_CATALOG } from '../productCatalog.js';
import { applyFilters } from '../logic.js';

export function getIconForValue(facet, value) {
    const def = FACET_DEFINITIONS[facet];
    return (def && def.iconMap && def.iconMap[value]) ? def.iconMap[value] : 'fa-check';
}

export function createOptionCard(facet, value, onSelect, selections = {}) {
    const def = FACET_DEFINITIONS[facet];
    const label = def.labelMap[value] || value;

    // Logic to find image
    let imageUrl = '';
    let iconClass = getIconForValue(facet, value);

    // 1. Create a temporary selection state including this option
    const tempSelections = { ...selections, [facet]: value };

    // 2. Filter catalog to see what products match this path
    const matchingProducts = applyFilters(tempSelections, PRODUCT_CATALOG);

    console.log(`[OptionCard] Facet: ${facet}, Value: ${value}, Matches: ${matchingProducts.length}`);

    if (matchingProducts.length > 0) {
        // 3. Pick the first match
        const firstMatch = matchingProducts[0];
        imageUrl = `images/${firstMatch.image}`;
        console.log(`   -> Using image: ${imageUrl}`);
    } else {
        console.log(`   -> No match, using icon: ${iconClass}`);
    }

    const card = document.createElement('div');
    card.className = "option-card rounded-xl p-1 cursor-pointer group flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex-grow min-w-[165px] basis-[calc(50%-0.75rem)] md:basis-[calc(33.333%-1.25rem)]";

    const imageContainer = document.createElement('div');
    imageContainer.className = "relative h-32 md:h-48 rounded-lg overflow-hidden w-full flex items-center justify-center mb-2 md:mb-4 bg-gray-50";

    if (imageUrl) {
        imageContainer.innerHTML = `
            <div class="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105" 
                 style="background-image: url('${imageUrl}');">
            </div>
        `;
    } else {
        imageContainer.innerHTML = `
            <i class="fa-solid ${iconClass} text-4xl md:text-6xl text-gray-700 group-hover:text-starlight transition-colors duration-300 z-0"></i>
        `;
    }

    const content = document.createElement('div');
    content.className = "p-3 md:p-4 flex-grow flex items-center justify-between";
    content.innerHTML = `
        <h3 id="option-label-${value}" class="text-base md:text-xl font-bold text-gray-900 group-hover:text-starlight transition-colors">${label}</h3>
        <i class="fa-solid fa-chevron-right text-gray-400 group-hover:text-starlight transform group-hover:translate-x-1 transition-all"></i>
    `;

    card.appendChild(imageContainer);
    card.appendChild(content);

    card.addEventListener('click', () => {
        if (onSelect) onSelect(facet, value);
    });

    return card;
}

export function createProductCard(product) {
    const card = document.createElement('div');
    // Flex column on mobile, row on desktop
    card.className = "flex flex-col md:flex-row w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 group bg-white p-6 gap-6 items-center";

    // Use local image from the images folder
    const bgImage = `images/${product.image}`;

    // Create a safe ID for elements
    const safeId = product.slug.replace(/[^a-zA-Z0-9-_]/g, '-');

    // Chips Generation
    const chipsHtml = FACET_ORDER.map(facet => {
        const field = FIELD_MAP[facet];
        const value = product[field];
        if (value) {
            const def = FACET_DEFINITIONS[facet];
            const label = def.labelMap[value] || value;
            return `<span id="product-chip-${safeId}-${facet}" class="px-4 py-2 bg-white text-void border border-starlight/30 text-sm rounded-full font-bold shadow-sm whitespace-nowrap text-center">${label}</span>`;
        }
        return '';
    }).join('');

    card.innerHTML = `
        <!-- Left: Facet Chips (Order 2 on Mobile, 1 on Desktop) -->
        <div id="stack-chips-${safeId}" class="flex flex-col gap-3 justify-center w-full md:w-auto md:min-w-max z-20 bg-starlight p-6 rounded-xl md:h-full order-2 md:order-1">
            <span class="text-void font-bold mb-1 text-center">Aqui está seu produto:</span>
            ${chipsHtml}
        </div>

        <!-- Center: Product Image (Order 1 on Mobile, 2 on Desktop) -->
        <div class="relative w-full h-48 md:h-full md:flex-1 order-1 md:order-2">
            <div class="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105" 
                 style="background-image: url('${bgImage}');">
            </div>
        </div>

        <!-- Right: Buttons (Order 3) -->
        <div class="flex flex-col gap-4 justify-center w-full md:w-auto md:min-w-max z-20 order-3 md:order-3">
            <a id="product-detail-link-${safeId}" href="${BASE_PRODUCT_URL}${product.slug}" target="_blank" 
               class="bg-starlight hover:bg-starlight/80 text-void font-bold py-3 px-6 rounded-xl text-center transition-all shadow-lg hover:shadow-starlight/20 transform hover:-translate-y-1 w-full md:w-48">
                Ver Produto
            </a>
            <button id="product-quote-btn-${safeId}" 
               class="bg-void hover:bg-void/80 text-white font-bold py-3 px-6 rounded-xl text-center transition-all shadow-lg hover:shadow-void/20 transform hover:-translate-y-1 w-full md:w-48">
                Orçamento
            </button>
        </div>
    `;
    return card;
}

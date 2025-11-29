/**
 * ------------------------------------------------------------------
 * DATA STORE (productCatalog.js embedded)
 * ------------------------------------------------------------------
 */
const BASE_PRODUCT_URL = "https://fabricadoaluminio.com.br/produto/";

const PRODUCT_CATALOG = [
    { "slug": "janelasa/janela-de-correr-2-folhas-com-persiana-integrada-motorizada-30.php", "image": "janela_correr_persiana-sim_motorizada_2folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "sim", "persianaMotorizada": "motorizada", "material": "vidro", "folhas": 2 },
    { "slug": "janelasa/janela-de-correr-2-folhas-com-persiana-integrada-manual-18.php", "image": "janela_correr_persiana-sim_manual_2folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "sim", "persianaMotorizada": "manual", "material": "vidro", "folhas": 2 },
    { "slug": "janelasa/janela-de-correr-2-folhas-com-vidro-temperado-6mm-6.php", "image": "janela_correr_persiana-nao_manual_2folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 2 },
    { "slug": "janelasa/janela-de-correr-3-folhas-com-vidro-temperado-6mm-37.php", "image": "janela_correr_persiana-nao_manual_3folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 3 },
    { "slug": "janelasa/janela-de-correr-4-folhas-com-vidro-temperado-6mm-14.php", "image": "janela_correr_persiana-nao_manual_4folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 4 },
    { "slug": "janelasa/janela-veneziana-3-folhas-com-vidro-temperado-6mm--17.php", "image": "janela_correr_persiana-nao_veneziana_2folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 3 },
    { "slug": "janelasa/janela-de-correr-6-folhas-veneziana-veneziana-vidro.php", "image": "janela_correr_persiana-nao_veneziana_6folhas.webp", "categoria": "janela", "sistema": "janela-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 6 },
    { "slug": "janelasa/janela-maxim-ar-com-1-modulo-com-vidro-13.php", "image": "janela_maxim-ar_persiana-nao_blank_1folhas.webp", "categoria": "janela", "sistema": "maxim-ar", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 1 },
    { "slug": "janelasa/janela-maxim-ar-2-modulos-com-vidro-9.php", "image": "janela_maxim-ar_persiana-nao_blank_2folhas.webp", "categoria": "janela", "sistema": "maxim-ar", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 2 },
    { "slug": "janelasa/janela-maxim-ar-com-3-modulos-simetricos-com-vidro-46.php", "image": "janela_maxim-ar_persiana-nao_blank_3folhas.webp", "categoria": "janela", "sistema": "maxim-ar", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 3 },
    { "slug": "portas/porta-de-correr-2-folhas-com-persiana-integrada-motorizada-32.php", "image": "porta_correr_persiana-sim_motorizada_2folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "sim", "persianaMotorizada": "motorizada", "material": "vidro", "folhas": 2 },
    { "slug": "portas/porta-de-correr-2-folhas-com-persiana-integrada-manual-29.php", "image": "porta_correr_persiana-sim_manual_2folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "sim", "persianaMotorizada": "manual", "material": "vidro", "folhas": 2 },
    { "slug": "portas/porta-de-correr-2-folhas-com-vidro-temperado-6mm--27.php", "image": "porta_correr_persiana-nao_manual_2folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 2 },
    { "slug": "portas/porta-de-correr-3-folhas-sequenciais-com-vidro-temperado-6mm--33.php", "image": "porta_correr_persiana-nao_manual_3folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 3 },
    { "slug": "portas/porta-de-correr-4-folhas-com-vidro-temperado-6mm-38.php", "image": "porta_correr_persiana-nao_blank_4folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 4 },
    { "slug": "portas/porta-veneziana-de-correr-3-folhas-2-venezianas-e-1-com-vidro-temperado-6mm--31.php", "image": "porta_correr_persiana-nao_veneziana_2folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 3 },
    { "slug": "portas/porta-6-folhas-sendo-2-venezianas-cegas-2-venezianas-perfuradas-e-2-com-vidro-temperado-6mm--45.php", "image": "porta_correr_persiana-nao_blank_6folhas.webp", "categoria": "porta", "sistema": "porta-correr", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 6 },
    { "slug": "portas/porta-de-giro-1-folha-com-lambris-horizontais-34.php", "image": "porta_giro_persiana-nao_lambris_1folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "lambri", "folhas": 1 },
    { "slug": "portas/porta-de-giro-2-folhas-em-lambris-horizontais-40.php", "image": "porta_giro_persiana-nao_lambris_2folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "lambri", "folhas": 2 },
    { "slug": "portas/porta-de-giro-1-folha-veneziana-8.php", "image": "porta_giro_persiana-nao_veneziana_1folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "veneziana", "folhas": 1 },
    { "slug": "portas/porta-de-giro-2-folhas-veneziana-20.php", "image": "porta_giro_persiana-nao_veneziana_2folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "veneziana", "folhas": 2 },
    { "slug": "portas/porta-de-giro-1-folha-com-vidro-temperado-6mm-10.php", "image": "porta_giro_persiana-nao_blank_1folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 1 },
    { "slug": "portas/porta-de-giro-2-folhas-com-vidro-temperado-6mm-23.php", "image": "porta_giro_persiana-nao_blank_2folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro", "folhas": 2 },
    { "slug": "portas/porta-de-giro-metade-lambris-horizontais-e-metade-com-vidro-temperado-6mm-1-folha-36.php", "image": "porta_giro_persiana-nao_metade-lambris_1folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + lambri", "folhas": 1 },
    { "slug": "portas/porta-de-giro-2-folhas-metade-em-lambris-horizontais-e-metade-com-vidro-temperado-6mm--39.php", "image": "porta_giro_persiana-nao_metade-lambris_2folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + lambri", "folhas": 2 },
    { "slug": "portas/porta-de-giro-metade-veneziana-e-metade-vidro-temperado-6mm--11.php", "image": "porta_giro_persiana-nao_metade-veneziana_1folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 1 },
    { "slug": "portas/porta-de-giro-2-folhas-metade-veneziana-e-metade-com-vidro-temperado-6mm-22.php", "image": "porta_giro_persiana-nao_metade-veneziana_2folhas.webp", "categoria": "porta", "sistema": "giro", "persiana": "nao", "persianaMotorizada": null, "material": "vidro + veneziana", "folhas": 2 }
];

/**
 * ------------------------------------------------------------------
 * LOGIC ENGINE
 * ------------------------------------------------------------------
 */
const FACET_ORDER = ['categoria', 'sistema', 'persiana', 'motorizada', 'material', 'folhas'];

const FACET_DEFINITIONS = {
    categoria: { title: 'O que você procura?', labelMap: { janela: 'Janela', porta: 'Porta' }, iconMap: { janela: 'fa-table-columns', porta: 'fa-door-open' } },
    sistema: { title: 'Qual sistema de abertura?', labelMap: { 'janela-correr': 'De Correr', 'porta-correr': 'De Correr', 'maxim-ar': 'Maxim-ar', 'giro': 'De Giro' }, iconMap: { 'janela-correr': 'fa-arrows-left-right', 'porta-correr': 'fa-arrows-left-right', 'maxim-ar': 'fa-up-right-and-down-left-from-center', 'giro': 'fa-rotate' } },
    persiana: { title: 'Precisa de persiana integrada?', labelMap: { sim: 'Com Persiana', nao: 'Sem Persiana' }, iconMap: { sim: 'fa-layer-group', nao: 'fa-ban' } },
    motorizada: { title: 'Persiana motorizada ou manual?', labelMap: { motorizada: 'Motorizada', manual: 'Manual' }, iconMap: { motorizada: 'fa-bolt', manual: 'fa-hand' } },
    material: { title: 'Qual material de preenchimento?', labelMap: { 'vidro': 'Vidro', 'vidro + veneziana': 'Vidro + Veneziana', 'lambri': 'Lambri', 'veneziana': 'Veneziana', 'vidro + lambri': 'Vidro + Lambri' }, iconMap: { 'vidro': 'fa-border-all', 'vidro + veneziana': 'fa-grip-vertical', 'lambri': 'fa-bars', 'veneziana': 'fa-align-justify', 'vidro + lambri': 'fa-table-cells-large' } },
    folhas: { title: 'Quantas folhas?', labelMap: { 1: '1 Folha', 2: '2 Folhas', 3: '3 Folhas', 4: '4 Folhas', 6: '6 Folhas' }, iconMap: { 1: 'fa-1', 2: 'fa-2', 3: 'fa-3', 4: 'fa-4', 6: 'fa-6' } }
};

const FIELD_MAP = {
    categoria: 'categoria',
    sistema: 'sistema',
    persiana: 'persiana',
    motorizada: 'persianaMotorizada',
    material: 'material',
    folhas: 'folhas'
};

let currentSelections = {
    categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null
};

function getProductField(product, uiFacet) {
    const productField = FIELD_MAP[uiFacet];
    return product[productField];
}

function calculateNextSelections(current, facet, value) {
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

function applyFilters(selections, catalog) {
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

function getUniqueOptions(attribute, products) {
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

function runFacetLoop(selections) {
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

/**
 * ------------------------------------------------------------------
 * UI RENDERING
 * ------------------------------------------------------------------
 */

// Element Refs
const titleEl = document.getElementById('question-title');
const gridEl = document.getElementById('option-grid');
const breadcrumbEl = document.getElementById('breadcrumb-container');
const resultAreaEl = document.getElementById('result-area');
const productResultsEl = document.getElementById('product-results');
const restartBtn = document.getElementById('restart-button');
const chatMessagesEl = document.getElementById('chat-messages');

// Mobile Tabs Refs
const tabWizard = document.getElementById('tab-wizard');
const tabChat = document.getElementById('tab-chat');
const wizardColumn = document.getElementById('wizard-column');
const chatSidebar = document.getElementById('chat-sidebar');

// Mobile Tab Logic
function switchTab(tab) {
    if (tab === 'wizard') {
        // Show Wizard, Hide Chat
        wizardColumn.classList.remove('hidden');
        chatSidebar.classList.add('hidden');

        // Update Tab Styles
        tabWizard.classList.add('text-white', 'border-[#36C0F2]');
        tabWizard.classList.remove('text-gray-400', 'border-transparent');

        tabChat.classList.remove('text-white', 'border-[#36C0F2]');
        tabChat.classList.add('text-gray-400', 'border-transparent');
    } else {
        // Show Chat, Hide Wizard
        wizardColumn.classList.add('hidden');
        chatSidebar.classList.remove('hidden');

        // Update Tab Styles
        tabChat.classList.add('text-white', 'border-[#36C0F2]');
        tabChat.classList.remove('text-gray-400', 'border-transparent');

        tabWizard.classList.remove('text-white', 'border-[#36C0F2]');
        tabWizard.classList.add('text-gray-400', 'border-transparent');
    }
}

if (tabWizard && tabChat) {
    tabWizard.addEventListener('click', () => switchTab('wizard'));
    tabChat.addEventListener('click', () => switchTab('chat'));
}

function getIconForValue(facet, value) {
    const def = FACET_DEFINITIONS[facet];
    return (def && def.iconMap && def.iconMap[value]) ? def.iconMap[value] : 'fa-check';
}

function createOptionCard(facet, value) {
    const def = FACET_DEFINITIONS[facet];
    const label = def.labelMap[value] || value;
    const iconClass = getIconForValue(facet, value);

    const card = document.createElement('div');
    card.className = "option-card rounded-xl p-1 cursor-pointer group flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all";

    const imageContainer = document.createElement('div');
    imageContainer.className = "relative h-48 rounded-lg overflow-hidden w-full flex items-center justify-center mb-4 bg-gray-50";
    imageContainer.innerHTML = `
        <i class="fa-solid ${iconClass} text-6xl text-gray-700 group-hover:text-starlight transition-colors duration-300 z-0"></i>
    `;

    const content = document.createElement('div');
    content.className = "p-4 flex-grow flex items-center justify-between";
    content.innerHTML = `
        <h3 id="option-label-${value}" class="text-xl font-bold text-gray-900 group-hover:text-starlight transition-colors">${label}</h3>
        <i class="fa-solid fa-chevron-right text-gray-400 group-hover:text-starlight transform group-hover:translate-x-1 transition-all"></i>
    `;

    card.appendChild(imageContainer);
    card.appendChild(content);

    card.addEventListener('click', () => {
        handleSelection(facet, value);
    });

    return card;
}

function createProductCard(product) {
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

function renderBreadcrumbs(selections) {
    breadcrumbEl.innerHTML = '';
    let hasItems = false;

    FACET_ORDER.forEach((facet, index) => {
        const val = selections[facet];
        if (val) {
            hasItems = true;
            const def = FACET_DEFINITIONS[facet];
            const label = def.labelMap[val] || val;

            const chip = document.createElement('button');
            chip.id = `breadcrumb-chip-${facet}`;
            chip.className = "flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all hover:border-nebula/50 animate-fade-in";
            chip.innerHTML = `<span id="breadcrumb-text-${facet}">${label}</span> <i class="fa-solid fa-xmark text-xs opacity-50 hover:opacity-100"></i>`;

            chip.addEventListener('click', () => {
                const next = { ...selections };
                next[facet] = null;
                for (let i = index + 1; i < FACET_ORDER.length; i++) {
                    next[FACET_ORDER[i]] = null;
                }
                currentSelections = next;
                updateUI();
            });

            breadcrumbEl.appendChild(chip);
        }
    });

    breadcrumbEl.style.opacity = hasItems ? '1' : '0';
}

/**
 * ------------------------------------------------------------------
 * CHAT LOGIC (New)
 * ------------------------------------------------------------------
 */
function addChatMessage(text, type, icon = 'fa-comment') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type} mb-4 flex items-start gap-3`;

    if (type === 'ai') {
        bubble.innerHTML = `
            <div class="mt-0.5"><i class="fa-solid fa-robot text-nebula"></i></div>
            <div>${text}</div>
         `;
    } else {
        bubble.innerHTML = `
            <div>${text}</div>
         `;
    }
    chatMessagesEl.appendChild(bubble);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function renderChat(selections, engineResult) {
    chatMessagesEl.innerHTML = ''; // Clear chat to rebuild based on current state (mimic logic)

    // 1. Initial Greeting
    addChatMessage("Olá! Sou o assistente virtual da AluConfig. Vou te ajudar a encontrar a esquadria perfeita.", 'ai');

    // 2. Replay history based on selections
    FACET_ORDER.forEach(facet => {
        // If we have a selection for this facet, it means the question was asked AND answered
        if (selections[facet]) {
            const def = FACET_DEFINITIONS[facet];

            // The Question (AI)
            addChatMessage(def.title, 'ai');

            // The Answer (User)
            const answerLabel = def.labelMap[selections[facet]] || selections[facet];
            addChatMessage(answerLabel, 'user');
        }
    });

    // 3. Current State
    if (engineResult.finalProduct) {
        if (engineResult.finalProducts.length > 0) {
            addChatMessage(`Ótima notícia! Encontrei <strong>${engineResult.finalProducts.length}</strong> produtos que combinam com o que você precisa. Dê uma olhada nas opções ao lado.`, 'ai');
        } else {
            addChatMessage("Hmm, parece que não encontrei nenhum produto exato com essa combinação. Tente mudar algumas das opções anteriores.", 'ai');
        }
    } else if (engineResult.currentQuestion) {
        // Show the current pending question
        addChatMessage(engineResult.currentQuestion.title, 'ai');
    }
}

function handleSelection(facet, value) {
    currentSelections = calculateNextSelections(currentSelections, facet, value);
    updateUI();
}

function updateUI() {
    const engineResult = runFacetLoop(currentSelections);

    // Clear Grid
    gridEl.innerHTML = '';
    productResultsEl.innerHTML = '';

    // Update Breadcrumbs
    renderBreadcrumbs(currentSelections);

    // Update Chat
    renderChat(currentSelections, engineResult);

    if (engineResult.finalProduct) {
        // Show Result View
        gridEl.classList.add('hidden');
        resultAreaEl.classList.remove('hidden');

        if (engineResult.finalProducts.length > 0) {
            // Title is now handled inside the product card overlay

            engineResult.finalProducts.forEach(prod => {
                productResultsEl.appendChild(createProductCard(prod));
            });
        } else {
            titleEl.textContent = "Nenhum produto encontrado";
            titleEl.nextElementSibling.classList.remove('hidden');
            titleEl.nextElementSibling.textContent = "Tente alterar algumas opções no filtro acima.";
        }

    } else {
        // Show Question View
        gridEl.classList.remove('hidden');
        resultAreaEl.classList.add('hidden');

        const q = engineResult.currentQuestion;
        titleEl.textContent = q.title;
        titleEl.nextElementSibling.classList.remove('hidden');
        titleEl.nextElementSibling.textContent = "";

        q.options.forEach((optValue, idx) => {
            const card = createOptionCard(q.attribute, optValue);
            // Add staggered animation delay
            card.style.animation = `fadeIn 0.4s ease-out forwards ${idx * 0.1}s`;
            // card.style.opacity = '0'; // Removed to prevent visibility issues
            gridEl.appendChild(card);
        });
    }
}

// Init
restartBtn.addEventListener('click', () => {
    currentSelections = { categoria: null, sistema: null, persiana: null, motorizada: null, material: null, folhas: null };
    updateUI();
});

// Start
updateUI();

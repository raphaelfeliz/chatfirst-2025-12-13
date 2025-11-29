/**
 * ------------------------------------------------------------------
 * MODULE: UI Renderer & Components
 * ------------------------------------------------------------------
 */
import { FACET_DEFINITIONS, FACET_ORDER, FIELD_MAP } from './constants.js';
import { BASE_PRODUCT_URL } from './productCatalog.js';

export const UI_INFO = {
    module: "UI Renderer",
    versionName: "Standard",
    versionNumber: "1.0.0"
};

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

// --- Helper Functions ---

export function getIconForValue(facet, value) {
    const def = FACET_DEFINITIONS[facet];
    return (def && def.iconMap && def.iconMap[value]) ? def.iconMap[value] : 'fa-check';
}

// --- Component Creation ---

export function createOptionCard(facet, value, onSelect) {
    const def = FACET_DEFINITIONS[facet];
    const label = def.labelMap[value] || value;
    const iconClass = getIconForValue(facet, value);

    const card = document.createElement('div');
    card.className = "option-card rounded-xl p-1 cursor-pointer group flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex-grow min-w-[165px] basis-[calc(50%-0.75rem)] md:basis-[calc(33.333%-1.25rem)]";

    const imageContainer = document.createElement('div');
    imageContainer.className = "relative h-32 md:h-48 rounded-lg overflow-hidden w-full flex items-center justify-center mb-2 md:mb-4 bg-gray-50";
    imageContainer.innerHTML = `
        <i class="fa-solid ${iconClass} text-4xl md:text-6xl text-gray-700 group-hover:text-starlight transition-colors duration-300 z-0"></i>
    `;

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

// --- Rendering Logic ---

export function renderBreadcrumbs(selections, onReset) {
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
                if (onReset) onReset(facet, index);
            });

            breadcrumbEl.appendChild(chip);
        }
    });

    breadcrumbEl.style.opacity = hasItems ? '1' : '0';
}

export function addChatMessage(text, type, icon = 'fa-comment') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type} mb-4`;

    if (type === 'ai') {
        bubble.innerHTML = `
            <div class="flex-1">
                ${text}
            </div>
         `;
    } else {
        bubble.innerHTML = `
            <div>${text}</div>
         `;
    }
    chatMessagesEl.appendChild(bubble);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

export function renderChat(selections, engineResult) {
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

export function updateView(selections, engineResult, callbacks) {
    // Clear Grid
    gridEl.innerHTML = '';
    productResultsEl.innerHTML = '';

    // Update Breadcrumbs
    renderBreadcrumbs(selections, callbacks.onBreadcrumbClick);

    // Update Chat
    renderChat(selections, engineResult);

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
            const card = createOptionCard(q.attribute, optValue, callbacks.onOptionSelect);
            // Add staggered animation delay
            card.style.animation = `fadeIn 0.4s ease-out forwards ${idx * 0.1}s`;
            gridEl.appendChild(card);
        });
    }
}

// --- Tab Logic ---

export function switchTab(tab) {
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

export function initEventListeners(callbacks) {
    if (tabWizard && tabChat) {
        tabWizard.addEventListener('click', () => switchTab('wizard'));
        tabChat.addEventListener('click', () => switchTab('chat'));
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', callbacks.onRestart);
    }
}

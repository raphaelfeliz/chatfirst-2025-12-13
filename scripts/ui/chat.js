/**
 * UI Chat Module
 * Handles chat interface rendering and interactions.
 */
import { chatMessagesEl, chatInput, chatSendBtn } from './elements.js';
import { FACET_DEFINITIONS, FACET_ORDER } from '../constants.js';
import { logger } from '../utils/logger.js';
import { session } from '../data/session.js';

let messageCount = 0;

// @desc Appends a message bubble to the chat history. \n// Supports multiple types: 'text', 'product-chips', 'product-image', and 'button'. \n// Handles HTML rendering and styling based on message type.
export function addChatMessage(text, type, icon = 'fa-comment') {
    logger.log('CHAT', `Adding message (${type}): "${typeof text === 'string' ? text.substring(0, 30) : 'Object'}..."`);

    messageCount++;
    const bubble = document.createElement('div');
    bubble.id = `chat-message-${messageCount}`;

    // Map 'ai' to 'filter-bot' for backward compatibility if needed, though we should use specific types
    const displayType = type === 'ai' ? 'filter-bot' : type;

    // Adjust margin based on type to group related elements closer (chips, image, buttons)
    // User requested ~5px gap. Tailwind mb-1 is 4px, mb-1.5 is 6px. Let's use arbitrary value for precision or mb-1.
    const isProductElement = ['product-chips', 'product-image', 'button'].includes(displayType);
    const marginBottom = isProductElement ? 'mb-0' : 'mb-4';

    bubble.className = `chat-bubble ${displayType} ${marginBottom}`;

    // Bot types (filter-bot, gemini-bot) share similar left-aligned styling
    if (displayType === 'filter-bot' || displayType === 'gemini-bot') {
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1">
                ${text}
            </div>
         `;
    } else if (displayType === 'product-chips') {
        // Chips Display
        // text is expected to be an array of strings (the chips)
        const chips = Array.isArray(text) ? text : [];
        const chipsHtml = chips.map(chip =>
            `<span class="inline-block bg-starlight/10 text-starlight border border-starlight/20 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">${chip}</span>`
        ).join('');

        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1">
                <p class="mb-2 font-semibold text-white">Encontrei! Segue o resumo:</p>
                <div class="flex flex-wrap">
                    ${chipsHtml}
                </div>
            </div>
        `;
    } else if (displayType === 'product-image') {
        // Product Image Display
        // text is expected to be the image URL
        // Use w-fit to wrap image tightly, remove w-full from img to allow natural aspect ratio
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1 w-fit overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <img src="${text}" alt="Product Image" class="block max-w-full h-auto max-h-60 object-contain">
            </div>
        `;
    } else if (displayType === 'button') {
        // Button Display
        // text is expected to be an object: { label, url, variant }
        const { label, url, variant } = text;
        const isPrimary = variant === 'primary';

        const btnClasses = isPrimary
            ? "bg-starlight hover:bg-starlight/80 text-void"
            : "bg-void hover:bg-void/80 text-white border border-white/20";

        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1">
                <a href="${url}" target="_blank" class="block w-full text-center font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${btnClasses}">
                    ${label}
                </a>
            </div>
        `;
    } else {
        // User type
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}">${text}</div>
         `;
    }
    chatMessagesEl.appendChild(bubble);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// @desc Processes text input from the user. \n// Handles special simulation commands (e.g., /sim-contact). \n// Logs messages to storage and triggers a simulated bot response (placeholder).
function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // --- SIMULATION COMMANDS ---
    if (text === '/sim-contact') {
        chatInput.value = '';
        addChatMessage("Simulating Contact Info Extraction...", 'filter-bot');

        const dummyUser = {
            userName: "John Doe",
            userPhone: "5511999998888",
            userEmail: "john@example.com",
            talkToHuman: true
        };

        session.saveUserData(dummyUser);

        setTimeout(() => {
            addChatMessage("Contact info saved! (Check server console)", 'filter-bot');
        }, 800);
        return;
    }
    // ---------------------------

    // 1. Add User Message
    addChatMessage(text, 'user');
    chatInput.value = '';

    // 2. Log User Message to Firestore
    session.logMessage('user', text);

    // 3. Simulate Bot Response (Placeholder for now)
    // In future, this is where we'd call the Gemini API
    setTimeout(() => {
        const botText = "Ainda estou aprendendo a conversar livremente! Por enquanto, por favor use os filtros ao lado para encontrar seu produto.";
        addChatMessage(botText, 'gemini-bot');
        session.logMessage('assistant', botText);
    }, 600);
}

// @desc Initializes event listeners for the chat input field and send button. \n// Enables input interactions and binds Enter key press.
export function initChatListeners() {
    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', handleUserMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });

        // Enable input
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.placeholder = "Digite sua dúvida...";
        chatInput.classList.remove('cursor-not-allowed');
    }
}

// @desc Rebuilds the chat interface based on the entire conversation state. \n// 1. Renders initial greeting. \n// 2. Replays Q&A pairs from facet selections. \n// 3. Displays the final result (chips, image, buttons) or the next pending question.
export function renderChat(selections, engineResult) {
    chatMessagesEl.innerHTML = ''; // Clear chat to rebuild based on current state
    messageCount = 0; // Reset counter on re-render

    // 1. Initial Greeting
    addChatMessage("Olá! Sou o assistente virtual da AluConfig. Vou te ajudar a encontrar a esquadria perfeita.", 'filter-bot');

    // 2. Replay history based on selections
    FACET_ORDER.forEach(facet => {
        // If we have a selection for this facet, it means the question was asked AND answered
        if (selections[facet]) {
            const def = FACET_DEFINITIONS[facet];

            // The Question (Bot)
            addChatMessage(def.title, 'filter-bot');

            // The Answer (User)
            const answerLabel = def.labelMap[selections[facet]] || selections[facet];
            addChatMessage(answerLabel, 'user');
        }
    });

    // 3. Current State
    if (engineResult.finalProduct) {
        if (engineResult.finalProducts.length > 0) {
            // Phase 1: Chips
            const product = engineResult.finalProducts[0];
            const chips = [];
            FACET_ORDER.forEach(facet => {
                if (selections[facet]) {
                    const def = FACET_DEFINITIONS[facet];
                    chips.push(def.labelMap[selections[facet]] || selections[facet]);
                }
            });

            addChatMessage(chips, 'product-chips');

            // Phase 2: Product Image
            const imageUrl = `images/${product.image}`;
            addChatMessage(imageUrl, 'product-image');

            // Phase 3: Buttons
            const baseUrl = "https://fabricadoaluminio.com.br/produto/";

            addChatMessage({
                label: "Ver Produto",
                url: `${baseUrl}${product.slug}`,
                variant: 'primary'
            }, 'button');

            addChatMessage({
                label: "Orçamento",
                url: "#", // Placeholder for now
                variant: 'secondary'
            }, 'button');

        } else {
            addChatMessage("Hmm, parece que não encontrei nenhum produto exato com essa combinação. Tente mudar algumas das opções anteriores.", 'filter-bot');
        }
    } else if (engineResult.currentQuestion) {
        // Show the current pending question
        addChatMessage(engineResult.currentQuestion.title, 'filter-bot');
    }

    // Ensure listeners are active (idempotent)
    initChatListeners();
}

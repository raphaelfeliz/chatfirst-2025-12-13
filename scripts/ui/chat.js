/**
 * UI Chat Module
 * Handles chat interface rendering and interactions.
 */
import { chatMessagesEl, chatInput, chatSendBtn } from './elements.js';
import { FACET_DEFINITIONS, FACET_ORDER } from '../constants.js';
import { logger } from '../utils/logger.js';

let messageCount = 0;

// @desc Adds a chat message bubble to the chat interface.
export function addChatMessage(text, type, icon = 'fa-comment') {
    logger.log('CHAT', `Adding message (${type}): "${text.substring(0, 30)}..."`);

    messageCount++;
    const bubble = document.createElement('div');
    bubble.id = `chat-message-${messageCount}`;

    // Map 'ai' to 'filter-bot' for backward compatibility if needed, though we should use specific types
    const displayType = type === 'ai' ? 'filter-bot' : type;

    bubble.className = `chat-bubble ${displayType} mb-4`;

    // Bot types (filter-bot, gemini-bot) share similar left-aligned styling
    if (displayType === 'filter-bot' || displayType === 'gemini-bot') {
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1">
                ${text}
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

// @desc Handles user message input.
function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addChatMessage(text, 'user');
    chatInput.value = '';

    // 2. Simulate Bot Response (Placeholder for now)
    // In future, this is where we'd call the Gemini API
    setTimeout(() => {
        addChatMessage("Ainda estou aprendendo a conversar livremente! Por enquanto, por favor use os filtros ao lado para encontrar seu produto.", 'gemini-bot');
    }, 600);
}

// @desc Initializes chat input event listeners.
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

// @desc Renders the chat interface with messages based on selections and engine results.
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
            addChatMessage(`Ótima notícia! Encontrei <strong>${engineResult.finalProducts.length}</strong> produtos que combinam com o que você precisa. Dê uma olhada nas opções ao lado.`, 'filter-bot');
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

/**
 * UI Chat Module
 * Handles chat interface rendering and interactions.
 */
import { chatMessagesEl } from './elements.js';
import { FACET_DEFINITIONS, FACET_ORDER } from '../constants.js';
import { logger } from '../utils/logger.js';

let messageCount = 0;

// @desc Adds a chat message bubble to the chat interface.
export function addChatMessage(text, type, icon = 'fa-comment') {
    logger.log('CHAT', `Adding message (${type}): "${text.substring(0, 30)}..."`);

    messageCount++;
    const bubble = document.createElement('div');
    bubble.id = `chat-message-${messageCount}`;
    bubble.className = `chat-bubble ${type} mb-4`;

    if (type === 'ai') {
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}" class="flex-1">
                ${text}
            </div>
         `;
    } else {
        bubble.innerHTML = `
            <div id="chat-message-content-${messageCount}">${text}</div>
         `;
    }
    chatMessagesEl.appendChild(bubble);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// @desc Renders the chat interface with messages based on selections and engine results.
export function renderChat(selections, engineResult) {
    chatMessagesEl.innerHTML = ''; // Clear chat to rebuild based on current state
    messageCount = 0; // Reset counter on re-render

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

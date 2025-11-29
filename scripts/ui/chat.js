/**
 * UI Chat Module
 * Handles chat interface rendering and interactions.
 */
import { chatMessagesEl } from './elements.js';
import { FACET_DEFINITIONS, FACET_ORDER } from '../constants.js';

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

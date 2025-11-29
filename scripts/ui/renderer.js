/**
 * UI Renderer Module
 * Orchestrates the overall view updates and event initialization.
 */
import { gridEl, productResultsEl, resultAreaEl, titleEl, restartBtn, tabWizard, tabChat } from './elements.js';
import { renderBreadcrumbs, switchTab } from './navigation.js';
import { renderChat } from './chat.js';
import { createOptionCard, createProductCard } from './components.js';

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

export function initEventListeners(callbacks) {
    if (tabWizard && tabChat) {
        tabWizard.addEventListener('click', () => switchTab('wizard'));
        tabChat.addEventListener('click', () => switchTab('chat'));
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', callbacks.onRestart);
    }
}

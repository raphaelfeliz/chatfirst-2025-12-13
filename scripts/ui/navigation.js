/**
 * UI Navigation Module
 * Handles breadcrumbs and tab switching.
 */
import { breadcrumbEl, tabWizard, tabChat, wizardColumn, chatSidebar } from './elements.js';
import { FACET_ORDER, FACET_DEFINITIONS } from '../constants.js';

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
            chip.innerHTML = `<span id="breadcrumb-text-${facet}">${label}</span> <i id="breadcrumb-remove-${facet}" class="fa-solid fa-xmark text-xs opacity-50 hover:opacity-100"></i>`;

            chip.addEventListener('click', () => {
                if (onReset) onReset(facet, index);
            });

            breadcrumbEl.appendChild(chip);
        }
    });

    breadcrumbEl.style.opacity = hasItems ? '1' : '0';
}

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

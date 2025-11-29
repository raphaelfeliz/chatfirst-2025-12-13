# Mobile Transition Plan

## Objective
Transform the current desktop-centric layout into a responsive, mobile-first application without compromising the premium desktop design. The key feature is a mobile-specific navigation to toggle between the "Wizard" (Filtros) and "Chat" views.

## 1. Mobile Navigation (The "Tab Switcher")
**Current State:** The Chat Sidebar is hidden on mobile (`hidden lg:flex`).
**Goal:** Allow users to access both the Wizard and Chat on mobile via a top navigation bar.

*   **Implementation:**
    *   Insert a new Tab Navigation Bar below the main Navbar (visible only on mobile/tablet).
    *   **Tabs:** "Filtros" (Wizard) and "Chat".
    *   **Styling:** Glassmorphism style, active state highlighted with the Brand Blue (`#36C0F2`).
    *   **Behavior:** Clicking a tab toggles the visibility of `#wizard-column` and `#chat-sidebar`.

## 2. Layout & Visibility Logic
**Current State:**
*   `#wizard-column`: Always visible, `flex-1`.
*   `#chat-sidebar`: Hidden on mobile, fixed width on desktop.

**Mobile Changes:**
*   **Container:** Both columns will effectively take 100% width on mobile.
*   **Visibility Classes:**
    *   `#wizard-column`: Visible by default on mobile. Hidden when "Chat" tab is active.
    *   `#chat-sidebar`: Hidden by default on mobile. Visible (taking full width) when "Chat" tab is active.
    *   **Desktop (`lg:`):** Revert to original behavior (Wizard `flex-1`, Chat visible `w-[400px]`, Tab Bar hidden).

## 3. Component Optimization
### A. Product Cards
*   **Current:** Flex-row (Chips | Image | Buttons).
*   **Mobile Issue:** Too cramped for vertical phone screens.
*   **Solution:** Switch to `flex-col` on mobile.
    *   **Order:** Image (Top) -> Chips (Middle, horizontal scroll or wrapped) -> Buttons (Bottom).
    *   **Styling:** Ensure full width and comfortable touch targets.

### B. Option Cards (Grid)
*   **Current:** `grid-cols-1 sm:grid-cols-2`.
*   **Mobile:** `grid-cols-1` is already good, but we need to check vertical spacing and touch areas.
*   **Action:** Ensure `min-height` for touch targets is at least 44px (already likely covered by card size).

### C. Typography & Spacing
*   **Padding:** Reduce `#wizard-content-padding` from `p-8` to `p-4` on mobile to maximize screen real estate.
*   **Fonts:** Adjust `h1` sizes if they are too dominating on small screens (currently `text-3xl`, which is decent, but we'll verify).

## 4. Implementation Steps
1.  **HTML Structure:** Add the Mobile Tab Bar in `index.html`.
2.  **CSS/Tailwind:**
    *   Add utility classes for showing/hiding based on state.
    *   Adjust `flex-direction` for Product Cards (`flex-col` mobile, `flex-row` desktop).
3.  **JavaScript Logic (`script.js`):**
    *   Add event listeners for the Tab Bar.
    *   Implement `switchTab(tabName)` function to toggle visibility.
    *   Ensure state is preserved when switching (don't reset the wizard).

## 5. Visual Reference (Mental Model)
*   **Top:** Brand Navbar (Logo).
*   **Sub-Top:** Tab Bar [ **Filtros** | Chat ].
*   **Content:**
    *   If **Filtros**: The standard Wizard flow.
    *   If **Chat**: The Chat interface taking the full screen.

## Approval Required
Please confirm if this plan aligns with your vision, specifically the "Top Tab Bar" approach and the stacking of Product Card elements on mobile.

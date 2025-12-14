# Data Storage Findings
The configurator keeps almost everything inside the browser during a session. Facet picks, matching products, and the reconstructed chat transcript all live in one in-memory object that disappears on refresh, while the Gemini Cloud Function stays stateless and only reacts to whatever productChoice and userData payloads the caller sends. Firestore scaffolding exists to persist those structures, but it is not yet wired into the active UI, so handoff intent and contact fields only exist in planning documents and backend expectations.

## Where option selections live
The only live record of a visitor's choices is the currentSelections map inside scripts/app.js, which starts with empty slots for every facet, updates every time an option card is clicked, and is wiped by the Restart action (scripts/app.js:22-55). No browser storage or database write occurs today, so closing or refreshing the page clears all selections. Each update immediately re-runs the facet engine so that UI widgets always reflect the latest in-memory state (scripts/app.js:59-63).

## How the final product is determined
runFacetLoop continuously filters the static PRODUCT_CATALOG until it can either auto-fill the remaining slots or present the next best question, then returns the matching product list when all constraints are satisfied (scripts/logic.js:31-113). Because every call re-filters the catalog, there is no saved “final product” record; the matching cards, hero image, and action buttons shown in the right panel are regenerated from scratch on each render via the UI renderer (scripts/ui/components.js:16-78, scripts/ui/renderer.js:8-51).

## Chat view as a reflection of selections
renderChat clears the message area and rebuilds the conversation history every time selections change. It replays the friendly bot prompt, each facet question, the user's answer, and, when a product is available, adds the chips, image, and action buttons derived from the current selections (scripts/ui/chat.js:121-190). Because the conversation is rebuilt purely from the latest currentSelections, any free-form text typed by the visitor is discarded the moment another option card is clicked, matching the limitation noted in storedInformation.md:30-48.

## User data and handoff intent
The reference material in storedInformationGoal.md:3-90 and storedInformationInvestigation.md:18-45 defines the desired structure: a userData map carrying talkToHuman, userName, userPhone, and userEmail alongside product-choice inside a Firestore document per chat session. The Firestore session controller is already capable of creating that document with both maps and watching it for changes (scripts/data/session.js:12-74), but no active module imports it yet, so the live app still lacks any UI for capturing contact details or honoring the talkToHuman flag. As a result, human handoff remains a conceptual flow rather than a persisted state.

## Backend expectations
The deployed Gemini function takes whatever productChoice and userData objects the frontend sends, injects them into a structured system prompt, and instructs Gemini to respond with a JSON object whose data.target tells the caller whether it should update product facets or user records (gemini-endpoint/main.py:70-185). Priority rules declare that explicit requests for a person, a price conversation, or negotiation should flip talkToHuman to true, after which every reply should focus on collecting contact information instead of product configuration (gemini-endpoint/main.py:84-103). Because the backend is stateless, the caller must keep the authoritative copy of both maps and include them in each request; the README reinforces that expectation for the frontend integration (gemini-endpoint/README.md:1-35). The endpoint URL is already exposed in the frontend config for when that wiring is added (scripts/config.js:1-11).

## Current gaps to resolve
- The production UI still follows the in-memory model described in storedInformation.md, so persistence, replayable chat history, and user-data capture are missing despite the Firestore plan.
- session.js can create and sync a chats/{chatId} document with product-choice and user-data, but it is not imported anywhere, so the data store never receives updates from option selections or handoff events.
- Gemini expects to receive — and to return updates for — talkToHuman, userName, userPhone, and userEmail, yet there is no frontend logic to parse, validate, or forward those fields.
- The requested docs/mobile_transition.md reference was not present in the repository, so any mobile-specific storage considerations remain undocumented.

Bridging these gaps requires wiring the frontend state manager to Firestore, persisting the currentSelections map under product-choice, collecting user contact info into user-data, and ensuring every Gemini call includes and reconciles both maps so that the human handoff flow survives beyond a single page view.

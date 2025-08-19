User Interface Description Document: Shopify Quiz Builder (Multi-Mode)
Core Principles & Shared Components
This document outlines a multi-mode user interface. While each mode offers a unique layout and interaction model, they all share a core set of principles and components to ensure a cohesive experience.

Mode Switcher: A persistent dropdown or segmented control in the Top Navigation Bar labeled "View" or "Editor Mode" allows the user to switch between Guided, List, and Canvas modes at any time. The underlying quiz data (questions, answers, logic) remains consistent across all modes; only the presentation and editing interface change.

Inspector Panel: A context-sensitive panel that contains all the detailed settings for a selected item (a question, an answer, or the quiz itself). While its position may change between modes, its function and internal layout remain consistent.

Top Navigation Bar: A header that is always visible. It contains the quiz title, the Mode Switcher, a save status indicator, and primary action buttons for "Preview" and "Publish."

Visual Design & Accessibility: All modes will adhere to the same visual design (Shopify Polaris), typography, and accessibility standards as outlined in the sections below.

Mode 1: The Guided Builder (Beginner Mode)
This mode is designed for new users or those who need to create a simple, linear quiz quickly. It abstracts away complexity by presenting the creation process as a linear, step-by-step wizard.

Layout Structure: A single-column, focused layout. A "Stepper" component is displayed prominently at the top (e.g., 1. Add Questions -> 2. Customize Design -> 3. Set Up Integrations). The user progresses through each step sequentially.

Core Components:

Stepper: A visual indicator of the user's progress through the quiz creation process.

Question List: A simple, re-orderable list of questions. Clicking "Add Question" brings up a modal to choose a question type.

Configuration Forms: Each step presents a clean form for its specific task (e.g., a list of questions in step 1, theme and color options in step 2).

Interaction Patterns:

Sequential Navigation: The primary interaction is clicking "Next" and "Back" buttons to move between steps.

Simplified Logic: Conditional logic is handled via a simple dropdown within each question's settings (e.g., "After this question, jump to..."), rather than visual connectors.

Mode 2: The Visual Canvas (Advanced Mode)
This is the power-user mode, designed for creating complex, multi-branching quizzes. It provides a free-form, visual workspace for mapping out the entire quiz flow.

Layout Structure: A three-column layout.

Left Sidebar (Toolbox): A list of draggable question types.

Center Panel (Canvas): The main workspace for building the visual flow.

Right Sidebar (Inspector): Displays the settings for the selected node on the canvas.

Core Components:

Question Node: A card on the canvas representing a question.

Logic Connector: A directional arrow drawn between nodes to define the quiz path.

Interaction Patterns:

Drag and Drop: Users drag question types from the Toolbox onto the Canvas.

Connect by Dragging: Users visually create logic by dragging connectors between nodes.

Pan and Zoom: Users can easily navigate large quiz maps.

Mode 3: The Shopify Native List (Quick Edit Mode)
This mode is for users who are highly comfortable with the standard Shopify Admin interface and prefer working with lists and forms. It's ideal for quizzes with straightforward logic or for making quick content edits.

Layout Structure: A two-column layout that mimics interfaces like Shopify's menu builder.

Main Column: A re-orderable list of all questions. Each list item shows the question title and type.

Inspector Column: Clicking a question in the list opens its details in the right-hand Inspector panel for editing.

Core Components:

Sortable List: Each question is an item in a vertical list that can be re-ordered via drag-and-drop.

Expandable Items: Items in the list can be expanded to show key details without fully opening the Inspector.

Interaction Patterns:

Click to Edit: Users click an item in the list to load its full configuration in the Inspector.

Rule-Based Logic: Conditional logic is managed in a dedicated "Logic" tab within the Inspector, where rules are defined in sentence-like statements (e.g., IF answer to 'Skin Type' IS 'Oily' THEN JUMP to 'Oily Skin Questions').

Visual Design Elements & Color Scheme
(This section remains the same for all modes, ensuring a consistent brand feel.)

The visual design will adhere to Shopify's Polaris Design System.

Color Scheme: Primary use of neutral backgrounds (light gray/off-white) with Shopify's standard dark grays and blues for UI elements. Green will be used for primary CTAs ("Save," "Publish") and Red for destructive actions.

Iconography: Clean, minimalist line icons from the Polaris library.

Spacing: Generous white space will be used to maintain a clean, uncluttered interface across all modes.

Mobile, Web App, Desktop considerations
Builder Interface (All Modes): The quiz builder is a desktop-first application. All three editing modes are optimized for larger screens and are not designed for use on mobile devices.

Published Quiz (End-User View): The customer-facing quiz will be fully responsive and mobile-first, ensuring a seamless experience on any device.

Typography
(This section remains the same for all modes.)

Font Family: A clean, legible sans-serif font (e.g., Inter) to align with the Shopify ecosystem.

Hierarchy: Clear and consistent typographic hierarchy will be used for headings, labels, and body text across all modes.

Accessibility
(This section remains the same for all modes.)

All modes will be designed to meet WCAG 2.1 AA compliance.

Keyboard Navigation: All three editor interfaces will be fully operable via keyboard.

Screen Reader Support: All interactive elements across all modes will have appropriate ARIA labels and roles.

Focus States: Clear and visible focus states will be consistent across all modes.

Color Contrast: All color combinations will meet contrast ratio requirements.
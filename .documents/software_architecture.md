Software Requirements Specification: Shopify Quiz Builder
System Design
The system will be architected as an embedded Shopify App. It consists of three primary components:

Admin Frontend: A Single Page Application (SPA) where merchants build, manage, and analyze their quizzes. It will be built with React and use the Shopify Polaris design system for seamless integration.

Backend API: A stateless service that handles business logic, data persistence, and communication with the Shopify API and other third-party services.

Quiz Storefront Component: A highly optimized, lightweight JavaScript snippet that fetches quiz data and renders the quiz for shoppers.

Standard Views: Supports multiple pre-built, high-conversion layouts (e.g., Classic, Chat-Based).

Custom Views: Allows the injection of merchant-provided custom CSS and JavaScript to completely override the default styling and behavior for a unique look and feel.

Event Emitter / Developer Callbacks: Dispatches standard JavaScript CustomEvents at key lifecycle moments, allowing developers to hook into the quiz's behavior for custom integrations.

JavaScript Event Callbacks
The Storefront Quiz component will dispatch CustomEvents on the quiz's main container element to allow developers to execute custom code. The event detail object will contain relevant data.

quiz:load: Fired once the quiz is fully loaded, rendered, and ready for interaction.

quiz:questionSubmit: Fired after a user submits an answer to a question. The detail object will contain the question ID and the user's answer(s).

quiz:emailSubmit: Fired specifically when a user submits the email capture step. The detail object will contain the email address provided.

quiz:finish: Fired after the final quiz submission is successfully sent to the backend. The detail object will contain the full submission payload and product recommendations.

quiz:resultsRendered: Fired when the results page is fully rendered and displayed to the user.

Architecture pattern
Backend: A Monolithic API service architecture using NestJS. It will expose a RESTful API for internal communication.

Frontend (Admin): A Component-Based SPA using Next.js with React.

Frontend (Storefront): A lightweight Web Component designed to be "headless-capable," exposing data attributes and a clear DOM structure for easy customization.

State management
Admin Frontend: A client-side state management library such as Zustand or Redux Toolkit is required to manage the complex state of the quiz builder.

Storefront Quiz: State will be managed locally within the component to maintain high performance.

Data flow
Quiz Creation: A merchant creates/updates a quiz in the Admin Frontend, optionally adding custom CSS/JS. The configuration is saved to the database via the Backend API.

Quiz Rendering: A shopper loads a page with the quiz. The Storefront Component fetches the quiz configuration. Once rendered, it dispatches the quiz:load event.

Quiz Interaction: As the user interacts with the quiz, the component dispatches events like quiz:questionSubmit and quiz:emailSubmit.

Quiz Submission: The shopper completes the quiz. The component sends the submission data to the Backend API. Upon a successful response, it dispatches the quiz:finish event.

Data Processing: The backend saves the submission, updates customer tags via the Shopify GraphQL API, and sends data to integrations.

Analytics: The merchant views the analytics dashboard, which fetches aggregated data from the Backend API.

Technical Stack
Frontend (Admin): Next.js (with React), TypeScript, Shopify Polaris, Zustand.

Backend: Node.js, NestJS, TypeScript, Prisma.

Database: PostgreSQL.

Deployment: Vercel (Frontend), AWS or Heroku (Backend).

Authentication Process
Authentication will be handled exclusively through the Shopify OAuth 2.0 flow for a secure and seamless merchant experience. Session management will be handled via JWTs verified by Shopify App Bridge.

Route Design
Admin App Routes (Frontend):

/: Dashboard / List of quizzes

/quiz/new: Opens the quiz builder

/quiz/:id: Opens an existing quiz in the builder

/quiz/:id/style: Dedicated editor for custom CSS/JS

/analytics: Analytics dashboard

/settings: App settings and integration management

Storefront Routes (Public):

/quiz/:id/standalone: Renders the quiz on a dedicated page.

API Design
Internal Communication: RESTful API.

Endpoints:

GET /api/quizzes: Get all quizzes.

GET /api/quizzes/:id: Get a single quiz configuration for the builder.

POST /api/quizzes: Create a new quiz.

PUT /api/quizzes/:id: Update an existing quiz.

DELETE /api/quizzes/:id: Delete a quiz.

GET /api/public/quizzes/:id: Get public-safe quiz configuration (including custom code).

POST /api/quizzes/:id/submissions: Submit a completed quiz.

GET /api/analytics?quizId=:id: Get aggregated analytics data.

Database Design ERD
Shops: Stores shop domain, access tokens, and subscription plan.

Quizzes: Stores quiz title, status, settings (JSONB), customCss (TEXT), and customJs (TEXT).

Questions: Stores question type, content (JSONB), and order, linked to a Quiz.

LogicRules: Defines the conditional branching logic within a quiz.

Submissions: Stores quiz answers (JSONB), customer info, and recommendations.

AnalyticsEvents: Stores individual interaction events for detailed analysis.

Data structures
Quiz JSON Structure (Simplified Example):

JSON

{
  "id": "quiz_123",
  "title": "Skincare Finder",
  "settings": {
    "layout": "classic"
  },
  "customCode": {
    "css": ".quiz-container { border: 2px solid blue; }",
    "js": "document.addEventListener('quiz:finish', e => console.log(e.detail));"
  },
  "questions": [
    // ... question objects
  ],
  "logic": [
    // ... logic rule objects
  ]
}
Required Integrations
Shopify APIs (External): Communication with Shopify will primarily use their GraphQL API for its efficiency and power.

Admin API: To manage customers (create profiles, add tags).

Storefront API/AJAX Cart API: For "Add to Cart" functionality.

Theme App Extensions: For native theme integration.

Third-Party Marketing: Deep integrations with Klaviyo, Mailchimp, Postscript, and Attentive.

Tracking & Analytics: Support for merchant-provided pixels (Meta, Google Analytics, TikTok).

Advanced: Triggers for Shopify Flow based on quiz completion.
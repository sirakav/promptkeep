# PromptKeep - A Modern Prompt Management Application

PromptKeep is a user-friendly web application designed to help users efficiently manage, categorize, and utilize their collection of prompts for various AI models or other text-based tasks. The application prioritizes ease of use, quick access to prompts, and a clean, modern user interface. All data is stored locally in the user's browser using `localStorage`.

## Core Technologies

- **Framework:** Next.js (App Router)
- **UI Components:** Shadcn/ui
- **Language:** TypeScript
- **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)
- **Styling:** Tailwind CSS
- **Persistence:** Browser `localStorage`
- **Icons:** Lucide React

## Core Features

1.  **Prompt Creation & Editing:**
    - Intuitive form to add new prompts or edit existing ones.
    - Fields: Name (required), Content (required, textarea), Category (required, supports existing or new categories).
2.  **Prompt Listing & Viewing:**
    - Displays prompts as cards in a responsive grid.
    - Each card shows prompt name, category, and a snippet of the content.
3.  **Quick Copy:**
    - One-click "Copy Prompt" button on each card to copy its content to the clipboard.
    - Visual feedback (toast notification) on successful copy.
4.  **Categorization:**
    - Assign categories to prompts for better organization.
    - Filter prompts by category using a dropdown selector.
    - New categories can be created on-the-fly via the prompt form.
5.  **Search & Filtering:**
    - Search prompts by name, content, or category using the search bar.
    - Combine search with category filtering for refined results.
6.  **Deletion:**
    - Secure deletion of prompts with a confirmation modal.
7.  **Local Storage Persistence:**
    - All prompt and category data is saved in the browser's `localStorage`.
    - Data persists across browser sessions and restarts.
8.  **Responsive Design:**
    - Fully responsive interface for desktop, tablet, and mobile devices.
9.  **Modern UI/UX:**
    - Clean, dark-themed interface built with Shadcn/ui.
    - Toast notifications for user feedback.
10. **No Backend Requirement:**
    - Fully client-side application.

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (or yarn/pnpm)

### Installation & Setup

1.  **Clone the repository (if applicable) or download the source code.**
    ```bash
    # git clone <repository_url>
    # cd promptkeep
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    _If you use yarn or pnpm, use `yarn install` or `pnpm install` respectively._

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Building for Production

To create a production build:

```bash
npm run build
```
This will create an optimized build in the `.next` directory. To run the production build locally:

```bash
npm start
```

## Potential Future Enhancements

- Import/Export prompts (JSON).
- Advanced tagging system.
- Light theme / Theme switcher.
- More robust form validation (e.g., using Zod).

---

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and built with Shadcn/ui.

# Project README

## Development Guidelines

### Branching Strategy
- **Do not push directly to the `main` branch.**
- Always create your own working branch for any new feature, bugfix, or improvement.
- Branch naming suggestion: `feature/your-name/description`, `fix/your-name/description`, or `chore/your-name/description`.

### Merge Requests
- **Each push requires a Merge Request (MR) / Pull Request (PR)** for code review.
- No code should be merged into `main` without a successful code review.
- MRs should include:
  - Clear description of changes
  - Any relevant issue/ticket numbers
  - Screenshots or logs (if UI/backend relevant)

## Tech Stack

### Frontend
- **Vue.js** (latest stable version)
  - Options: Vue 3 with Composition API recommended
  - State management: Pinia (or Vuex if preferred)
  - Routing: Vue Router
  - Build tool: Vite

### Backend
- **To be researched by the developer** based on project requirements.
- Possible options (not limited to):
  - Node.js + Express / NestJS
  - Python + Django / FastAPI
  - PHP + Laravel
  - Java + Spring Boot
  - Go + Gin
  - Ruby on Rails
- Documentation for chosen backend stack must be added here once decided.

## Getting Started

### 1. Scaffold a new Vue project with Vite

Run the following command in your terminal:

```bash
npm create vite@latest .


You will be prompted to:

Select a framework: Choose Vue

Select a variant: Choose JavaScript or TypeScript (recommended)

Alternatively, you can scaffold with one command (non-interactive):

# For Vue + JavaScript
npm create vite@latest . -- --template vue

# For Vue + TypeScript
npm create vite@latest . -- --template vue-ts

2. Install dependencies
npm install

3. Create your working branch
git checkout -b feature/your-name/initial-setup

4. Run the development server
npm run dev

Your app will be available at http://localhost:5173


Code Review Process
Push your branch to remote:

git push origin feature/your-name/description

Open a Merge Request on GitHub

Request reviewers

Address feedback

Merge only after approval

Rules Summary
Do
Work on your own branch
Open MRs for every push
Wait for code review before merging
Directly push to main if explicitly instructed to do so

Don't
Push directly to main
Merge without review

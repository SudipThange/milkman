# PuneMilkman User Site

Customer-facing React frontend for PuneMilkman.

## Stack
- React + Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion

## Setup
1. `cd frontend/user_site`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5174/`

## Tailwind Setup (already configured)
- `tailwind.config.js` content paths include `src/**/*`
- `postcss.config.js` includes `tailwindcss` + `autoprefixer`
- `src/index.css` has:
  - `@tailwind base;`
  - `@tailwind components;`
  - `@tailwind utilities;`

## Env
Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

## Folder Structure
- `src/components`
- `src/pages`
- `src/layouts`
- `src/services`
- `src/hooks`

## Fully Implemented Page Example
- `src/pages/Home.jsx`: Hero background slider with fade transitions, overlay gradient, CTA buttons, and responsive layout.

# Captus Frontend — Integración mínima de Tailwind

Este frontend usa Vite + React y Tailwind con una configuración mínima para mantener simplicidad.

## Estructura clave

- Configuración:
  - [`tailwind.config.js`](./tailwind.config.js)
  - [`postcss.config.js`](./postcss.config.js)

- Entrada CSS global:
  - [`src/index.css`](./src/index.css) con:
    - `@tailwind base;`
    - `@tailwind components;`
    - `@tailwind utilities;`
    - Reglas globales del proyecto movidas a `@layer base { ... }`

- Entradas de la app:
  - [`src/main.jsx`](./src/main.jsx)
  - [`src/App.jsx`](./src/App.jsx)

- Layout principal:
  - [`src/features/dashboard/components/MainLayout.jsx`](./src/features/dashboard/components/MainLayout.jsx)
  - [`src/features/dashboard/components/Sidebar.jsx`](./src/features/dashboard/components/Sidebar.jsx)

## Scripts

- Dev: `npm run dev` (puerto Vite típico: 5173)
- Build: `npm run build`
- Preview: `npm run preview`

Ejecutar desde el directorio [`Captus/frontend`](./).

## Backend proxy

[`vite.config.js`](./vite.config.js) ya expone proxy para `/api` a `http://localhost:4000`.

## Decisiones de diseño

- Integración incremental: se mantuvieron estilos existentes pero se migraron gradualmente a utilidades Tailwind.
- Se evitó añadir librerías UI complejas (p.ej., shadcn, animate), priorizando la simplicidad.
- Se consolidó un Layout principal con Sidebar que envuelve las vistas protegidas.

Rutas envueltas por Layout (protegidas):

- Home [`HomePage.jsx`](./src/features/dashboard/components/HomePage.jsx)
- Tasks [`TaskPage.jsx`](./src/features/tasks/TaskPage.jsx)
- Chatbot [`ChatBotPage.jsx`](./src/features/chatbot/ChatBotPage.jsx)
- Notes [`NotesPage.jsx`](./src/features/notes/NotesPage.jsx)
- Profile [`ProfilePage.jsx`](./src/features/profile/ProfilePage.jsx)
- Calendar [`CalendarPage.jsx`](./src/features/calendar/CalendarPage.jsx)
- Groups [`GroupsPage.jsx`](./src/features/groups/GroupsPage.jsx)

## Cambios relevantes realizados

- Tailwind instalado como devDependency con PostCSS y Autoprefixer.
- [`tailwind.config.js`](./tailwind.config.js): `darkMode: 'class'`, globs Vite (`index.html`, `src/**/*.{js,jsx,ts,tsx}`) y color `primary`.
- [`src/index.css`](./src/index.css): agregado encabezado Tailwind y movidas reglas globales a `@layer base`.
- [`src/App.jsx`](./src/App.jsx):
  - Rutas protegidas envueltas en `MainLayout`.
  - Eliminado import de `App.css` y badge temporal de verificación.
- [`src/main.jsx`](./src/main.jsx): se expone `window.React` en dev para evitar ciertos avisos de librerías.
- Vistas adaptadas/normalizadas a Tailwind:
  - Login con formulario semántico accesible [`LoginForm.jsx`](./src/features/auth/components/LoginForm.jsx)
  - Home fondo `bg-green-50` [`HomePage.jsx`](./src/features/dashboard/components/HomePage.jsx)
  - Tasks fondo normalizado, limpieza de color “honeydew” y uso de paleta consistente [`TaskListView.jsx`](./src/features/tasks/components/TaskListView.jsx)
  - Ajustes de color (indigo → green) en TaskPage/TaskForm/TaskCard/Dashboard.
  - Otras vistas ya estilizadas con Tailwind se integraron al layout (ChatBot, Notes, Profile, Calendar, Groups).

## Guía de verificación rápida

1. Arranca backend:
   - Desde raíz del monorepo: `npm run backend:dev` (o desde carpeta backend)

2. Arranca frontend:
   - `cd Captus/frontend && npm run dev`
   - Abre `http://localhost:5173`

3. Verifica:
   - Login renderiza con estilo Tailwind (form semántico).
   - Navegación a `/home`, `/tasks`, `/calendar`, etc. dentro de `MainLayout`.
   - En Tasks, filtros y formularios muestran focos verdes (no indigo).

## Retirar estilos legacy

- `App.css` ya no se importa. Puedes eliminar [`src/App.css`](./src/App.css) si lo deseas.
- El archivo `src/components/Login.jsx` no se usa; puede eliminarse o actualizarse si se decide reutilizar.

## Dark mode (opcional)

- Habilitado con estrategia `class`. Para probar:
  - Agregar `class="dark"` en `<html>` o `<body>` y definir tokens CSS si se desea.

## Rollback simple (si se requiere)

1. Desinstalar Tailwind y PostCSS (en frontend):
   - `npm rm -D tailwindcss postcss autoprefixer`

2. Remover archivos de configuración:
   - Eliminar [`tailwind.config.js`](./tailwind.config.js) y [`postcss.config.js`](./postcss.config.js)

3. Restaurar CSS:
   - En [`src/index.css`](./src/index.css), quitar `@tailwind ...` y volver a las reglas anteriores si fuera necesario.
   - Si lo preferías, restaurar import de `./App.css` en [`src/App.jsx`](./src/App.jsx) y reactivar su uso.

## Notas finales

- La integración se mantuvo simple y escalable.
- Cualquier afinamiento visual posterior puede hacerse componente por componente, conservando la base minimal.

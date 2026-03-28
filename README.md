<div align="center">
  <img src="https://via.placeholder.com/150x150/0f172a/3b82f6?text=TARGETUP" alt="Targetup Logo" />
  <h1>Targetup - Web Frontend Dashboard</h1>
  <p>The centralized Single Page Application (SPA) for Targetup Administrators, Sales Teams, and HR.</p>
</div>

<hr />

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Environment Configuration (ENV)](#environment-configuration-env)
4. [Installation & Setup](#installation--setup)
5. [Architecture & State Management](#architecture--state-management)
6. [Core Modules (47 Pages)](#core-modules-47-pages)
7. [UI & Component Design](#ui--component-design)
8. [Deployment & Build](#deployment--build)

---

## 🏗️ System Overview
This progressive web app (PWA) operates as the primary user interface for managing the Targetup ecosystem. It interfaces directly with the Core Backend API, consuming RESTful endpoints while maintaining a background WebSocket connection for real-time presence, notifications, and analytics updates. The architecture completely separates concerns between Admin management, CRM Sales dashboards, and raw Data visualization.

---

## 🚀 Technology Stack
* **Core Framework**: React 19 (Hooks, Suspense, Error Boundaries)
* **Build Tool**: Vite (esbuild for sub-second HMR)
* **Styling & Animation**: TailwindCSS v3.4, Framer Motion (Page transitions, orchestrations)
* **State Management**: Redux Toolkit (Session caching/Auth), React Query v5 (Server-state caching, optimistic updates)
* **Routing**: React Router DOM v7 (Data routers, lazy loading)
* **Localization**: i18next (Dynamic Arabic/English toggling)
* **Real-time Engine**: Socket.IO-Client
* **Other Tools**: React Hook Form (Form validation), React Icons, React Hot Toast (Notifications)

---

## ⚙️ Environment Configuration (`.env`)
Create a `.env` file in the root of the `frontend` directory.

```ini
# Core API Endpoints
VITE_API_BASE_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050

# Application Metadata
VITE_APP_NAME="Targetup Dashboard"
VITE_APP_VERSION="1.0.0"
VITE_DEFAULT_LANGUAGE="en"
```

---

## 🛠️ Installation & Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/targetup26/targetup.management.frontend.git
   cd targetup.management.frontend
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The local server spins up instantly on `http://localhost:5173`. Hot Module Replacement (HMR) allows instant UI updates without maintaining page state.

---

## 🧠 Architecture & State Management

### 1. **Server-State (React Query)**
We use `@tanstack/react-query` to handle all API syncing. Every entity (Employees, Leads, Forms) has dedicated custom hooks (e.g., `useEmployees()`, `useLeadMutations()`). This provides:
* Automatic background refetching on window focus.
* Built-in pagination and infinite scrolling cache logic.
* Optimistic UI updates (e.g., when a user submits a form, the UI updates instantly before the backend physically confirms it).

### 2. **Client-State (Redux Toolkit)**
Reserved strictly for synchronous, globally shared UI states:
* `authSlice`: Stores the resolved JWT, User Identity, and flattened Permissions arrays.
* `uiSlice`: Manages Sidebar toggle states, active Themes (Dark/Light), and Language preferences.

### 3. **Socket Integration**
The `SocketProvider` context wraps the root application. It authenticates on mount and listens for `presence:update` to glow user avatars dynamically across data tables.

---

## 🗂️ Core Modules (47 Pages)

The routing tree (`src/App.jsx`) is massively scaled into distinct zones, protected by `ProtectedRoute` components that check Role-Based Access Controls (RBAC).

* **Dashboard Widgets**: Interactive charts for Employee Turnover, Attendance Ratios, and CRM Pipeline Health.
* **Organization Control**:
  * `EmployeesPage.jsx`: Filterable data tables with dynamic bulk actions.
  * `DepartmentsPage.jsx` & `JobRoleController.jsx`: Visual hierarchy builders.
* **CRM & Sales**:
  * `CategoryDashboard.jsx`: Explores the Taxonomy extracted by the Lead Engine.
  * `LeadsDashboardPage.jsx`: Pipeline tracking, statuses (NEW, CONTACTED, CONVERTED).
* **Storage Vault**:
  * `FileManagerPage.jsx`: Visual interactive folder structure fetching dynamically from the Storage Agent Microservice.
* **Forms Engine**:
  * `FormTemplateEditor.jsx`: A drag-and-drop JSON schema builder for creating dynamic HR forms.
* **Security & Platform**:
  * `UserManagementPage.jsx`, `RoleManagementPage.jsx`, `GlobalSettingsPage.jsx`.

---

## 🎨 UI & Component Design

We utilize a **Premium Dark Aesthetic** via Tailwind classes (`bg-slate-900`, `glassmorphism` panels).
* **Base Components** (`/src/components/common`): Buttons, Inputs, Modals, Spinners. Completely decoupled from business logic.
* **Layouts**: `AdminLayout.jsx` creates the classic Sidebar/Topbar shell.
* **Transitions**: `<motion.div>` wrappers ensure every route navigation interpolates smoothly rather than flashing white.

---

## 🚀 Deployment & Build

To compile for production, Vite creates highly minified, chunk-split static files.

```bash
npm run build
```
The output is written to `/dist`. This folder can be securely and synchronously served by Nginx, Vercel, Netlify, or statically embedded into the Express Backend's `express.static()` middleware.

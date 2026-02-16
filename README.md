# <p align="center">💎 TargetUp - Sales Intelligence Interface</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
</p>

---

## 🏗️ Technical Ecosystem (A to Z)

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Foundation** | `React 19` | The core UI framework using modern Concurrent rendering. |
| **Build Engine** | `Vite 7` | Next-generation frontend tooling for ultra-fast HMR. |
| **State (Global)** | `Redux Toolkit` | Centralized store for auth, global settings, and lead states. |
| **State (Server)** | `React Query` | Advanced caching and synchronization with the Backend. |
| **Routing** | `React Router 7` | Declarative routing with integrated Layout systems. |
| **Styling** | `Tailwind CSS` | Utility-first CSS for high-performance and custom UI. |
| **Animations** | `Framer Motion` | Fluid, professional micro-interactions and page transitions. |
| **Communication** | `Axios` | Standardized HTTP client with interceptors for JWT Auth. |
| **Real-time** | `Socket.io Client` | Live bi-directional connection for status heartbeats. |
| **Localization** | `i18next` | Full multi-language support system. |
| **Date Mgmt** | `date-fns` | Lightweight and precise date manipulation. |

---

## 📡 API Interaction Layer (A to Z)

The frontend consumes the following core services from the TargetUp API.

### 🔐 Authentication System
- `POST /auth/login`: Identity verification and JWT acquisition.
- `PUT /auth/profile`: Real-time user metadata updates.

### 🎯 Lead Management (Lead Engine Proxy)
- `GET /leads`: Fetches extracted leads with multi-vector filtering.
- `POST /leads/extract`: High-priority trigger for the scraping engine.
- `GET /leads/job/:id`: Real-time polling for background task progress.
- `GET /leads/history`: Historical analysis of extraction cycles.
- `POST /leads/export`: Generation of high-utility CSV/JSON report files.

### 🛡️ Administrative Suite
- `GET /admin/dashboard-stats`: Real-time operational reporting.
- `GET /admin/users`: Personnel directory management.
- `GET /admin/audit-logs`: Security ledger for tracking system modulation.
- `GET /admin/forms/templates`: Low-code engine for custom data collection.

---

## � Project Anatomy

- **`/src/components`**: Atomic UI units (Cards, Tables, Modals).
- **`/src/pages`**: Composite views organized by Personnel, Admin, and Sales modules.
- **`/src/context`**: React Context for zero-configuration app-wide state (Auth).
- **`/src/services`**: The "Brain" of the communication layer, defining all API calls.
- **`/src/utils`**: Tactical helper functions (Formatting, Clipboard, Math).

---

## �️ Performance & UX Philosophy
- **Glassmorphism**: A sleek, premium design language using `backdrop-blur` and high-contrast typography.
- **Zero-Latency Data Fetching**: Utilizes optimistic UI updates and smart caching via React Query.
- **Mobile-First**: Fully responsive layouts ensuring a 1:1 experience on Desktop and Mobile PWA.

---
<p align="center">*The UI Layer of the TargetUp Ecosystem*</p>

# Targetup - Web Dashboard (Frontend)

The main progressive web application (PWA) for the Targetup ecosystem. This provides the comprehensive interface for Administrators to manage employees, view organization charts, build dynamic forms, interact with the CRM/Lead Taxonomy, and configure global system settings.

## 🚀 Technology Stack
* **Framework**: React 19 + Vite
* **Styling**: Tailwind CSS, Framer Motion (Animations)
* **State Management**: Redux Toolkit, React Query (Data Fetching/Caching)
* **Routing**: React Router DOM (v7)
* **Localization**: i18next (Multi-language support)
* **Icons**: React Icons
* **Real-time**: Socket.IO-Client (Presence & Dashboard live updates)

---

## ⚙️ Environment Variables (`.env`)
Create a `.env` file in the root of the `frontend` directory.

```ini
# Core API Endpoints
VITE_API_BASE_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050

# App Metadata
VITE_APP_NAME="Targetup Dashboard"
VITE_APP_VERSION="1.0.0"
```

---

## 🛠️ Installation & Setup

1. **Prerequisites**: Ensure you have Node.js (v18+) installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will compile instantly via Vite and run on `http://localhost:5173`.

4. **Production Build**:
   ```bash
   npm run build
   ```
   This generates an optimized static bundle in the `/dist` directory. The NodeJS backend server is configured to serve this static production build out-of-the-box if deployed synchronously.

---

## 📁 Key Directories
* `/src/pages/admin`: Complete suite of Admin configuration views (Global Settings, Taxonomies, Role Management, Dashboards).
* `/src/pages/sales`: Dedicated CRM dashboard views (Category exploring, Lead details).
* `/src/components`: Reusable UI elements (Modals, Tables, Forms, Layouts, Topbar, Sidebar).
* `/src/store`: Redux slices and authentication state management.
* `/public`: Static assets, manifests, and PWA configuration files.

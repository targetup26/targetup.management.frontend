# <p align="center">🎨 TargetUp Frontend</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
</p>

---

## 💎 Overview
The modern, high-performance web interface for the **TargetUp Sales Intelligence Platform**. Built with React and Vite, this dashboard provides real-time analytics, lead management, and automated extraction status.

### ⚡ Key Features
- **Dynamic Dashboards**: Real-time sales insights and agent performance tracking.
- **Lead Intelligence**: Integrated status monitoring for the Lead Generation Engine.
- **Responsive Design**: Mobile-first UI powered by Tailwind CSS.
- **Micro-Animations**: Smooth UI transitions using Framer Motion.
- **State Management**: Optimized data fetching and global state synchronization.

---

## 🏗️ Technical Architecture

- **Framework**: `React 18` (Functional Components & Hooks)
- **Build Tool**: `Vite` (Lighting fast HMR)
- **Styling**: `Tailwind CSS` + `Modular CSS`
- **Routing**: `React Router 6`
- **Animations**: `Framer Motion`
- **Icons**: `React Icons` + `Lucide React`
- **Notifications**: `React Hot Toast`

---

## 📡 Core Integrations

| Module | Integration | Purpose |
| :--- | :--- | :--- |
| **Lead Engine** | Axios / HTTP | Triggers extraction jobs and polls progress. |
| **Auth System** | JWT / Cookies | Secure session management. |
| **Real-time** | Socket.io | Live updates for extraction status and heartbeats. |

---

## 📡 Lead Tracking System
The frontend includes a custom `LeadAgentTracker` that monitors background extraction tasks and provides visual feedback to the user via the `LeadJobStatus` progress bars.

---
<p align="center">*Part of the TargetUp Intelligent Ecosystem*</p>

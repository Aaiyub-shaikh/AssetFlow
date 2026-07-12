# 🏢 AssetFlow – Enterprise Asset Management

AssetFlow is a modern, enterprise-grade asset management platform built with React, TypeScript, and Vite. It provides comprehensive tools for tracking, allocating, and managing organizational assets across departments.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router v7
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Credentials

Use these credentials to explore different role-based views:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@assetflow.io` | `admin123` | Full system access — manage users, departments, assets, audits, reports, and settings |
| **Manager** (Dept. Head) | `manager@assetflow.io` | `manager123` | Department-level access — manage department assets, approve transfers, view reports |
| **Employee** | `employee@assetflow.io` | `employee123` | Personal access — view assigned assets, request transfers, book resources |

### Role Hierarchy

- **Admin**: Full control. Can create/promote Department Heads and Asset Managers from the Employee Directory.
- **Manager**: Department-scoped. Can manage assets within their department, approve/reject transfers, and view department reports.
- **Employee**: Self-service. Can view their own assets, make booking requests, and submit transfer requests. This is the default role assigned during signup.

> **Note**: Signup creates an **Employee** account only. Admins promote users to Manager or Admin roles through the Employee Directory.

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── auth/          # Auth-related components (logo, protected routes)
│   ├── layout/        # App layout (sidebar, header)
│   ├── shared/        # Shared components
│   └── ui/            # Base UI primitives (button, input, select, etc.)
├── config/            # App configuration (routes, navigation)
├── data/              # Mock data
├── lib/               # Utilities (cn, formatters, motion presets)
├── pages/             # Page components
│   ├── auth/          # Login, Signup, Forgot Password
│   ├── assets/        # Asset list, register, details
│   └── ...            # Dashboard, departments, employees, etc.
├── stores/            # Zustand state stores
└── types/             # TypeScript type definitions
```

## ✨ Key Features

- **Asset Lifecycle Management** — Track assets from procurement to retirement
- **Role-Based Access Control** — Admin, Manager, and Employee permission levels
- **Department Management** — Organize assets and employees by department
- **Asset Allocation & Returns** — Assign and track asset assignments
- **Inter-Department Transfers** — Request and approve asset transfers
- **Resource Booking** — Reserve shared assets with scheduling
- **Maintenance Tracking** — Schedule and monitor preventive/corrective maintenance
- **Audit Management** — Plan and execute asset audits
- **Real-Time Dashboard** — KPIs, charts, and activity feeds
- **Reports & Analytics** — Generate comprehensive asset reports



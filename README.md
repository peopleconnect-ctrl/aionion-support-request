# Aionion Support Request Portal

A modern, responsive support ticket request system with React + Vite frontend and Frappe Cloud / API backend integration.

---

## 📂 Segregated Folder Structure

```
aionion-support-request/
├── frontend/                     <-- React + Vite Custom User Interface
│   ├── public/                   <-- Static public assets
│   ├── src/                      <-- React components, views & API services
│   │   ├── components/           <-- UI components
│   │   ├── lib/                  <-- API helpers (Frappe REST client)
│   │   ├── App.jsx               <-- Main Application UI
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      <-- Backend Services & Custom Frappe App
│   ├── frappe_app/              <-- Frappe Custom App & DocType Definitions
│   │   ├── doctype/              <-- Support Request DocType schema & python controller
│   │   ├── workflow/             <-- Manager Approval workflow configuration
│   │   └── README.md             <-- Frappe Cloud deployment guide
│   │
│   └── legacy_services/         <-- Backup Serverless & SQL Scripts
│       ├── api/                  <-- Vercel serverless API handlers
│       ├── google-apps-script.js
│       └── supabase-schema.sql
│
├── package.json                  <-- Root workspace runner
└── README.md
```

---

## 🛠️ Quick Start

### Frontend (Development)

Run from the root directory:

```bash
# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

Or navigate into `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Backend Integration

See [backend/frappe_app/README.md](file:///e:/aionion-support-request/backend/frappe_app/README.md) for detailed steps on connecting Frappe Cloud to the React frontend.

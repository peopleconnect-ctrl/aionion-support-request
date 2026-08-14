# Frappe Backend App for Aionion Support Requests

This folder contains the backend custom app definitions for **Frappe Cloud / ERPNext**.

---

## 📁 Directory Structure

```
backend/
├── frappe_app/                          <-- Frappe Custom App Specs
│   ├── doctype/
│   │   └── support_request/
│   │       ├── support_request.json     <-- DocType Schema
│   │       └── support_request.py       <-- Python Controller & Hierarchy Hooks
│   └── workflow/                        <-- Approval Workflows
│
└── legacy_services/                     <-- Legacy Serverless/Supabase Code
    ├── api/                             <-- Vercel serverless API handlers
    ├── google-apps-script.js
    └── supabase-schema.sql
```

---

## 🚀 How to Import into Frappe Cloud

1. Log into your **Frappe Cloud Console**.
2. Create a Custom App named `aionion_support` or import this directory into your custom bench.
3. Import the `Support Request` DocType from `doctype/support_request/support_request.json`.
4. Enable the REST API key & secret for headless access from your React frontend.

---

## 🔌 API Endpoints Exposed for React Frontend

- **Create Request**: `POST https://your-site.frappe.cloud/api/resource/Support Request`
- **List Requests**: `GET https://your-site.frappe.cloud/api/resource/Support Request`
- **Team-Wise Requests**: `GET https://your-site.frappe.cloud/api/method/backend.frappe_app.doctype.support_request.support_request.get_user_department_requests`

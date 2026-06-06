# VendorBridge

A procurement and vendor management platform built to replace the spreadsheet-and-email workflows that most organizations still rely on. Built during a hackathon as a working MVP.

---

## Why We Built It

Most procurement workflows look something like this: someone sends an email asking for quotes, vendors reply with PDFs or Excel sheets, a procurement officer manually compares them in a spreadsheet, then chases three people for approval over Slack, and eventually generates a PO in a separate system nobody fully understands.

It works until it doesn't — and when it breaks, it's usually because something fell through the cracks in someone's inbox.

We wanted to build something that puts the entire procurement cycle — from vendor onboarding to invoice delivery — in one place, with actual visibility into what's happening and where things are stuck.

---

## What It Does

VendorBridge centralizes procurement into a single platform. Organizations can onboard vendors, issue RFQs, collect and compare quotations, run approval workflows, generate purchase orders, and send invoices — all without leaving the app.

The platform has four user roles (Admin, Procurement Officer, Manager, Vendor), each with scoped access and a purpose-built interface. Vendors get their own portal to respond to RFQs and track their submissions. Internal teams get dashboards, approval queues, and activity logs.

---

## Core Workflow

```
Vendor Onboarding
      │
      ▼
RFQ Creation (by Procurement Officer)
      │
      ▼
RFQ Sent to Shortlisted Vendors
      │
      ▼
Vendors Submit Quotations
      │
      ▼
Quotation Comparison (side-by-side view)
      │
      ▼
Approval Workflow (Manager / Admin review)
      │
      ├── Rejected → Vendor notified
      │
      └── Approved
            │
            ▼
      Purchase Order Generated
            │
            ▼
      Invoice Generated
            │
            ├── PDF Download
            └── Email to Vendor
```

---

## Features

**Vendor Management**
- Onboard and manage vendor profiles
- Track vendor status and procurement history
- Associate vendors with specific RFQs

**RFQ Management**
- Create RFQs with line items, deadlines, and requirements
- Send to one or multiple vendors
- Track response status per vendor

**Quotation Handling**
- Vendors submit quotations through their portal
- Side-by-side comparison view for procurement officers
- Highlights pricing differences across vendors

**Approval Workflow**
- Configurable approval chain (Procurement Officer → Manager → Admin)
- Comment and rejection support at each stage
- Full audit trail per approval decision

**Purchase Orders**
- Auto-generated from approved quotations
- Linked to the originating RFQ and vendor
- Status tracking through fulfillment

**Invoicing**
- Generate invoices from purchase orders
- Download as PDF
- Send directly to vendor via email

**Analytics & Logs**
- Procurement spend over time
- Vendor performance metrics
- Full activity log per user and per document

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend**
- Node.js
- Express.js

**Database**
- PostgreSQL
- Prisma ORM

**Auth**
- JWT-based authentication
- Role-Based Access Control (RBAC)

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│              Next.js + TypeScript + Tailwind         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│                  Express.js API Server               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │   Auth   │  │  Routes  │  │    Middleware       │ │
│  │  (JWT)   │  │ (Modular)│  │  (RBAC, Validate)  │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│                    PostgreSQL                         │
└─────────────────────────────────────────────────────┘
```

---

## Database Overview

The schema is organized around the procurement lifecycle:

```
users
  └── roles (admin, procurement_officer, manager, vendor)

vendors
  └── linked to users with vendor role

rfqs
  ├── rfq_vendors (junction: which vendors received this RFQ)
  └── line_items

quotations
  ├── belongs to rfq + vendor
  └── quotation_line_items

approvals
  └── belongs to quotation (with status, comments, reviewer)

purchase_orders
  └── generated from approved quotations

invoices
  └── linked to purchase_orders

activity_logs
  └── append-only log of all actions with actor, entity, and timestamp
```

---

## API Overview

All routes are prefixed with `/api/v1`.

| Module | Base Path | Description |
|---|---|---|
| Auth | `/auth` | Login, register, token refresh |
| Vendors | `/vendors` | CRUD for vendor profiles |
| RFQs | `/rfqs` | Create, update, send RFQs |
| Quotations | `/quotations` | Submit and review quotations |
| Approvals | `/approvals` | Approve or reject quotations |
| Purchase Orders | `/purchase-orders` | Generate and track POs |
| Invoices | `/invoices` | Generate, download, email invoices |
| Analytics | `/analytics` | Spend, vendor stats, trends |
| Activity Logs | `/activity-logs` | Audit trail per entity or user |

Authentication is required on all routes except `/auth/login` and `/auth/register`. Role checks are enforced per route via middleware.

---

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/vendorbridge.git
cd vendorbridge

# Install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vendorbridge
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=5000

# Email (for invoice sending)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password
```

Create a `.env.local` in `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Database Setup

```bash
cd backend

# Run Prisma migrations
npx prisma migrate dev

# Seed initial data (roles, admin user)
npx prisma db seed
```

### Start Development Servers

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

### Default Admin Credentials (after seed)

```
Email: admin@vendorbridge.com
Password: admin123
```

Change these immediately if you're running this anywhere beyond localhost.

---

## Future Improvements

Things we didn't get to during the hackathon but have thought about:

- **Multi-tenancy** — right now the schema assumes a single organization. Supporting multiple organizations with proper data isolation is the biggest structural change needed before this could be used as a SaaS product.
- **Real-time notifications** — approval status changes and new quotation submissions currently require a page refresh. WebSocket support would make the workflow feel a lot more responsive.
- **Vendor scoring** — track historical delivery times, pricing trends, and quote acceptance rates to surface vendor reliability metrics.
- **Contract management** — a natural extension of the PO workflow. Once a PO is fulfilled, managing contracts and renewals is the next logical step.
- **Bulk RFQ handling** — the current UI works well for one-off RFQs but gets tedious for organizations running procurement at scale.
- **Document attachments** — vendors often need to attach spec sheets or certifications to quotations. File upload support is on the list.
- **Audit log exports** — the activity log is stored but there's no export functionality yet.

---

## Team Notes

This project came out of a conversation we had about how surprisingly manual procurement is, even inside companies that consider themselves tech-forward. The tools exist, but they're either enterprise systems that cost a lot and require consultants to configure, or they're just Excel with a few extra columns.

We wanted to see how far a small team could get in a hackathon timeframe toward something that actually addresses the workflow — not just the data storage problem. The approval workflow and quotation comparison views ended up being where we spent most of our time, and they're also where the product feels most complete.

There's a lot we'd do differently on a second pass — particularly around the data model for multi-tenancy and separating concerns more cleanly on the backend. But as a proof of concept that a better version of this workflow is buildable, we're happy with where it landed.

If you're looking at this code and have feedback or want to build on it, feel free to open an issue.

# 🌿 VendorBridge

> Transforming Procurement from Emails & Spreadsheets into a Unified Digital Workflow

![VendorBridge Banner](https://via.placeholder.com/1200x400?text=VendorBridge)

## 🚀 Overview

VendorBridge is a modern Procurement & Vendor Management ERP built to simplify how organizations manage vendors, RFQs, quotations, approvals, purchase orders, and invoices.

Traditional procurement often involves endless email chains, spreadsheets, and manual approvals. VendorBridge centralizes the entire procurement lifecycle into one streamlined platform, providing transparency, efficiency, and control.

---

## 🎯 Problem Statement

Organizations struggle with:

* Scattered vendor information
* Manual quotation comparisons
* Slow approval processes
* Poor procurement visibility
* Difficult audit tracking
* Time-consuming invoice management

VendorBridge solves these challenges through a centralized procurement ecosystem.

---

## ✨ Key Features

### 👥 Vendor Management

* Vendor registration & onboarding
* GST and compliance tracking
* Vendor categorization
* Vendor performance monitoring

### 📋 RFQ Management

* Create and publish RFQs
* Assign RFQs to vendors
* Manage deadlines
* Track RFQ lifecycle

### 💰 Quotation Management

* Vendor quotation submission
* Side-by-side comparison
* Lowest price identification
* Delivery timeline comparison

### ✅ Approval Workflow

* Multi-stage approvals
* Approval remarks
* Status tracking
* Audit-ready workflow history

### 📦 Purchase Orders

* Automatic PO generation
* Approval-based workflow
* Vendor-linked procurement records

### 🧾 Invoice Management

* Invoice generation
* PDF export
* Print support
* Email delivery

### 📊 Analytics & Reports

* Procurement trends
* Spending insights
* Vendor performance analytics
* Procurement activity dashboards

---

# 🏗️ System Architecture

```text
Vendor
   │
   ▼
Quotation Submission
   │
   ▼
RFQ Comparison
   │
   ▼
Approval Workflow
   │
   ▼
Purchase Order
   │
   ▼
Invoice Generation
   │
   ▼
Analytics & Reporting
```

---

# ⚙️ Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Query
* Zustand
* React Hook Form
* Zod

## Backend

* Node.js
* Express.js
* REST API

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* JWT Authentication
* Role-Based Access Control

## Additional Services

* Nodemailer
* PDF Generation
* Activity Logging

---

# 🗄️ Database Design

Core entities:

```text
User
Role
Vendor
RFQ
Quotation
Approval
PurchaseOrder
Invoice
Notification
ActivityLog
```

Relationships:

```text
Vendor
   │
   ├── RFQs
   │
   ├── Quotations
   │
   └── Purchase Orders

RFQ
   │
   ├── Quotations
   │
   └── Approvals

Purchase Order
   │
   └── Invoice
```

---

# 🔐 User Roles

## Admin

* Manage users
* Manage vendors
* Access analytics

## Procurement Officer

* Create RFQs
* Compare quotations
* Generate purchase orders
* Generate invoices

## Vendor

* Submit quotations
* Track RFQ status
* View purchase orders

## Manager

* Approve or reject procurement requests
* Monitor workflow progress

---

# 🎨 Design Philosophy

VendorBridge combines:

✅ Enterprise-grade workflows

✅ Modern SaaS experience

✅ Clean dashboard architecture

✅ Fast procurement decisions

✅ Audit-friendly tracking

Theme Colors:

```css
Primary: #415B06
Background: #F0E6DA
```

---

# 📡 API Modules

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Vendors

```http
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:id
PATCH  /api/vendors/:id
DELETE /api/vendors/:id
```

### RFQs

```http
GET    /api/rfqs
POST   /api/rfqs
GET    /api/rfqs/:id
PATCH  /api/rfqs/:id
POST   /api/rfqs/:id/publish
POST   /api/rfqs/:id/close
```

### Quotations

```http
GET   /api/rfqs/:id/quotations
POST  /api/rfqs/:id/quotations
GET   /api/rfqs/:id/quotations/compare
PATCH /api/quotations/:id
```

### Approvals

```http
POST /api/approvals
GET  /api/approvals/:id
POST /api/approvals/:id/approve
POST /api/approvals/:id/reject
```

### Purchase Orders

```http
POST /api/purchase-orders
GET  /api/purchase-orders
GET  /api/purchase-orders/:id
```

### Invoices

```http
POST /api/invoices
GET  /api/invoices/:id
GET  /api/invoices/:id/pdf
POST /api/invoices/:id/email
```

---

# 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment

```env
DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Start Development Server

```bash
npm run dev
```

---

# 📈 Future Enhancements

* AI-powered vendor recommendations
* Smart quotation ranking
* Predictive procurement analytics
* Multi-level approval chains
* Vendor portal enhancements
* Procurement forecasting

---

# 🏆 Hackathon Vision

VendorBridge isn't just an ERP.

It's a procurement command center that turns fragmented purchasing processes into a transparent, data-driven, and scalable workflow.

**Procure Smarter. Approve Faster. Grow Better.**

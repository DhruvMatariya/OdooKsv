# VendorBridge

VendorBridge is a procurement and vendor management platform that helps organizations manage the complete purchasing workflow from a single system.

The application covers vendor onboarding, RFQ management, quotation collection, approval workflows, purchase order generation, invoice management, and procurement analytics.

Instead of managing procurement through spreadsheets, email threads, and manual approvals, VendorBridge provides a structured workflow where every step can be tracked and audited.

---

## Why We Built It

Procurement is often handled across multiple tools.

Vendor information lives in spreadsheets, quotations arrive through email, approvals happen in chat messages, and purchase records are scattered across different systems.

This creates a few common problems:

* Vendor information becomes difficult to maintain
* Quotation comparison takes unnecessary time
* Approval processes lack visibility
* Procurement activities are difficult to audit
* Teams spend time on manual follow-ups instead of decision-making

VendorBridge was built to bring these processes together into a single workflow.

---

## What It Does

VendorBridge manages the procurement lifecycle from start to finish.

A procurement officer creates an RFQ and assigns vendors.

Vendors receive the request and submit quotations through the platform.

Procurement teams compare vendor responses, select a quotation, and send it for approval.

Once approved, the system generates a purchase order and invoice while keeping a complete history of actions performed throughout the process.

---

## Core Workflow

```text
Create RFQ
    │
    ▼
Assign Vendors
    │
    ▼
Receive Quotations
    │
    ▼
Compare Responses
    │
    ▼
Approval Process
    │
    ▼
Generate Purchase Order
    │
    ▼
Generate Invoice
    │
    ▼
Track Activities & Analytics
```

---

## Features

### Vendor Management

* Register and manage vendors
* Store GST and contact information
* Categorize vendors
* Maintain vendor status

### RFQ Management

* Create procurement requests
* Assign vendors
* Manage deadlines
* Upload supporting documents
* Publish and close RFQs

### Quotation Management

* Vendor quotation submission
* Editable quotations
* Delivery timeline tracking
* Vendor notes and comments

### Quotation Comparison

* Side-by-side comparison
* Price comparison
* Delivery comparison
* Vendor evaluation

### Approval Workflow

* Approval requests
* Approval remarks
* Status tracking
* Workflow history

### Purchase Orders

* Purchase order generation
* Procurement tracking
* Status management

### Invoice Management

* Invoice generation
* PDF export
* Printing support
* Email delivery

### Activity Logs

* RFQ activity tracking
* Approval tracking
* Purchase order updates
* Invoice updates

### Analytics Dashboard

* Procurement trends
* Spending summaries
* Vendor performance
* Approval statistics

---

## User Roles

### Admin

* Manage users
* Manage vendors
* View analytics

### Procurement Officer

* Create RFQs
* Compare quotations
* Generate purchase orders
* Generate invoices

### Vendor

* Submit quotations
* Track RFQ status
* View purchase orders

### Manager

* Approve or reject procurement requests
* Monitor procurement workflows

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* JWT Authentication
* Role-Based Access Control (RBAC)

---

## System Architecture

```text
┌──────────────┐
│   Frontend   │
│   Next.js    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Express API │
│   Node.js   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Prisma    │
│     ORM      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

---

## Database Overview

The application is built around the following core entities:

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

Entity relationships:

```text
Vendor
 ├── RFQs
 ├── Quotations
 └── PurchaseOrders

RFQ
 ├── Vendors
 ├── Quotations
 └── Approvals

PurchaseOrder
 └── Invoice
```

Prisma is used for schema management, migrations, and database access.

---

## API Overview

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

### Additional Modules

```http
GET /api/dashboard
GET /api/activity-logs
GET /api/analytics
```

---

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd vendorbridge
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=8h
PORT=3001
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=VendorBridge
CLIENT_URL=http://localhost:5173

```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

---

## Future Improvements

A few areas we would continue working on:

* Multi-level approval chains
* Real-time notifications
* Vendor performance scoring
* Advanced reporting and exports
* Procurement forecasting
* ERP integrations
* Role-based dashboard customization

---

## Team Notes

One thing we learned while building VendorBridge is that procurement systems are less about individual features and more about workflow design.

Creating vendors, RFQs, quotations, and invoices is relatively straightforward. The challenge is making sure every stage connects cleanly to the next while maintaining visibility, accountability, and traceability throughout the process.

This project gave us practical experience designing business workflows, modeling relational data with Prisma, building role-based systems, and connecting multiple modules into a single application that feels cohesive rather than a collection of separate features.

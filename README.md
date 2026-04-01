Alright — this is now a **real product doc for a focused MVP demo**, not just feature dumping.

I’m structuring this like something you can:

* send to clients
* build from directly
* not overbuild

---

# 📄 ISP AUTO-PILOT — DEMO SYSTEM DOCUMENTATION (MVP)

## 🎯 Purpose

This demo showcases a **focused operational ISP system** built around:

> **Subscription Renewal → Customer Support → Role-Based Dashboards**

The goal is to simulate how an ISP can:

* automate subscription management
* handle customer support efficiently
* manage users and network states centrally

---

# 🧩 SYSTEM OVERVIEW

The system consists of **4 core roles**:

1. Customer
2. Admin
3. Support Agent
4. Technician

Each role has a **separate dashboard** with specific responsibilities.

---

# 🔐 AUTHENTICATION SYSTEM

### Scope:

* Fully functional login/register
* Role-based access control

### Roles:

* `customer`
* `admin`
* `support`
* `technician`

### Behavior:

* Users are redirected to their respective dashboards after login
* Protected routes per role

---

# 👤 CUSTOMER DASHBOARD

## Core Features

### 1. Subscription Overview

* Current Plan
* Status:

  * Active
  * Suspended
  * Pending
* Expiry Date

---

### 2. 🔁 Renewal System (CORE FEATURE)

#### Flow:

* User clicks **“Renew Subscription”**
* Payment modal appears (simulated)
* On success:

  * Expiry date extends (+30 days)
  * Status → Active

#### States:

* If expired:

  * Status = Suspended
  * Button → “Renew Now”

---

### 3. 📡 Upgrade Speed

* User selects higher plan
* Payment simulation triggers
* Plan updates after success

---

### 4. 🛠 Track Installation

* Status:

  * Pending
  * Assigned
  * In Progress
  * Completed

* Display technician assignment (mocked or DB)

---

### 5. 🎫 Support System

* Create Ticket:

  * Subject
  * Message

* View Tickets:

  * Open
  * In Progress
  * Resolved

---

### 6. 📊 Usage Display (Simulated)

* Data usage bar (fake/static)
* Connection status

---

# ⚙️ ADMIN DASHBOARD

## Core Features

### 1. 📊 Overview Metrics

* Total Users
* Active vs Suspended users
* Total Revenue (mock calculation)

---

### 2. 👥 User Management

* View all users

* Status control:

  * Pending
  * Verified
  * Suspended

* Actions:

  * Verify user
  * Suspend user
  * Reactivate user

---

### 3. 💳 Subscription Control

* View user subscription
* Manually:

  * Renew
  * Suspend
  * Change plan

---

### 4. 🛠 Technician Assignment

* Assign technician to installation
* Update installation status

---

### 5. 🌐 Network Control (SIMULATED)

* Activate user
* Suspend user
* Change bandwidth/speed plan

> NOTE: No real router integration — state is simulated in system

---

# 💬 SUPPORT DASHBOARD

## Core Features

### 1. 🎫 Ticket Management

* View all tickets
* Filter by:

  * Open
  * In Progress
  * Resolved

---

### 2. 💬 Chat System (REAL-TIME SIMULATION)

* Open ticket → chat interface
* Messages:

  * Customer ↔ Support

### Behavior:

* Messages stored in DB
* Real-time feel (polling or websockets optional)

---

### 3. Ticket Actions

* Change status:

  * Open → In Progress → Resolved

---

# 🛠 TECHNICIAN DASHBOARD

## Core Features

### 1. 📅 Job Schedule

* View assigned installations
* Status:

  * Pending
  * In Progress
  * Completed

---

### 2. 📍 Job Details

* Customer info
* Address (mocked)
* Notes

---

### 3. Status Update

* Update installation progress

---

# 💳 PAYMENT SYSTEM (SIMULATED)

## Scope:

* No real gateway integration

## Behavior:

* “Pay Now” → modal
* Click “Confirm Payment”:

  * Creates payment record
  * Updates subscription
  * Triggers renewal logic

---

# 🧠 CORE SYSTEM LOGIC

## Subscription Model

Fields:

* user_id
* plan_id
* status
* expiry_date

---

## Rules

### Expiry Check:

```
if (today > expiry_date) → status = suspended
```

### Renewal:

```
expiry_date += 30 days
status = active
```

---

## Payment Effect:

* Updates subscription
* Logs payment (optional)

---

# 🧱 DATA STRUCTURE (MINIMAL)

## Tables

### Users

* id
* name
* email
* password
* role
* status

---

### Plans

* id
* name
* speed
* price

---

### Subscriptions

* id
* user_id
* plan_id
* status
* expiry_date

---

### Payments

* id
* user_id
* amount
* status
* created_at

---

### Tickets

* id
* user_id
* subject
* status

---

### Messages

* id
* ticket_id
* sender_id
* message

---

### Installations

* id
* user_id
* technician_id
* status

---

# 🎬 DEMO WALKTHROUGH FLOW

## Step 1 — Customer

* Login
* View expired subscription
* Click **Renew**
* Payment success
* Status → Active
* Expiry updated

---

## Step 2 — Admin

* View user
* Confirm status change
* Manage subscription
* Assign technician

---

## Step 3 — Support

* Customer creates ticket
* Support replies via chat
* Status updated

---

## Step 4 — Technician

* View assigned job
* Update installation status

---

# ⚠️ DEMO LIMITATIONS (INTENTIONAL)

* No real ISP network integration
* No real payment gateway
* No SMS/email notifications
* No advanced analytics

> This is a **functional simulation MVP**, not full production system

---

# 🎯 POSITIONING STATEMENT

Use this when presenting:

> “Based on your feedback, this demo focuses on the key operational areas — subscription renewal, customer support, and clear role-based dashboards. The system simulates real-world ISP workflows and can be extended to integrate directly with your network and billing infrastructure.”

---

# ⏱️ BUILD SCOPE SUMMARY

### Fully Functional:

* Auth system
* Role-based dashboards
* Renewal logic
* Ticket system (with chat)
* Admin controls
* Technician scheduling

### Simulated:

* Payments
* Network control
* Usage data

---

# 🚀 FINAL NOTE (IMPORTANT)

This is not a “demo UI”.

This is:

> **a controlled simulation of an ISP operations system**

If you build this cleanly:

* it looks real
* it behaves real
* it sells

---

## If you want next:

I can give you:

* exact **Laravel migrations + models**
* or **Next.js page/component breakdown**
* or **real-time chat implementation approach (fastest way)**

Pick and we go straight into build mode.

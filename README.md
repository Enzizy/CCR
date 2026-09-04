# CCR Business Management System

A tailored business operations and accounting management application built for **CCR Construction Supply** in Poblacion, Barili, Cebu.

Developed with **Vue 3**, **Vite**, **Tailwind CSS**, **Pinia**, and **Lucide Icons**.

---

## Features

- **Dashboard**: Reference-accurate financial hero section with weekly performance bar chart, vertical KPI metrics stack, and corporate remittance card (`#a8d08d`).
- **Purchase Orders & Deliveries**: Track client commitments (ordered vs delivered vs remaining), create partial deliveries, and auto-generate Delivery Receipts (DR) and Statements of Account (SOA).
- **Official Documents**: 1:1 reproduction of the official CCR Statement of Account with sage green headers, Metrobank Barili remittance info, and print-ready (`@media print`) layout.
- **Delivery Trips & Auto Fuel Expenses**: Group multi-customer drop-offs onto single truck runs and automatically log fuel expenses directly to Central Expenses.
- **Delivery Issues & Replacements**: Log damaged/lost items and dispatch free replacement DRs without inflating billable revenue.
- **Billing & Accounts Receivable**: Aging buckets (Current, Due Soon, Overdue) and payment recording for cash, checks, and bank deposits.
- **Central Expenses**: Company-wide expense tracking across Materials, Gas/Fuel, Labor, Utilities, and Equipment.
- **Payroll & Worker Advances**: Manage worker cash advances with automated salary deductions.
- **Financial Summary**: Comprehensive monthly breakdown of Delivered Revenue, Cash Collections, Expenses, Operating Profit, and Net Cash Liquidity.
- **AI Business Assistant**: Integrated chat drawer with natural language queries and interactive action cards.

---

## Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Custom `#a8d08d` brand palette & typography)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Icons**: Lucide Icons
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Enzizy/CCR.git

# Navigate into the project directory
cd CCR

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

-- ==============================================================================
-- CCR BUSINESS MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Project Reference: tgzrytgoyyeztkiprrqy
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT ('cust-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    short_name TEXT,
    address TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    payment_terms TEXT DEFAULT '30 Days upon delivery',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || floor(extract(epoch from now()) * 1000)::text),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT DEFAULT 'set',
    default_price NUMERIC(12, 2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY DEFAULT ('po-' || floor(extract(epoch from now()) * 1000)::text),
    po_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    payment_terms TEXT DEFAULT '30 Days upon delivery',
    project TEXT,
    status TEXT DEFAULT 'Open',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DELIVERY TRIPS (Multi-customer drop-off runs)
CREATE TABLE IF NOT EXISTS delivery_trips (
    id TEXT PRIMARY KEY DEFAULT ('trip-' || floor(extract(epoch from now()) * 1000)::text),
    trip_number TEXT UNIQUE NOT NULL,
    driver_name TEXT NOT NULL,
    truck_plate TEXT NOT NULL,
    date DATE NOT NULL,
    fuel_expense NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Completed',
    notes TEXT,
    dr_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DELIVERY RECEIPTS (DR)
CREATE TABLE IF NOT EXISTS delivery_receipts (
    id TEXT PRIMARY KEY DEFAULT ('dr-' || floor(extract(epoch from now()) * 1000)::text),
    dr_number TEXT UNIQUE NOT NULL,
    po_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    trip_id TEXT REFERENCES delivery_trips(id) ON DELETE SET NULL,
    delivered_by TEXT,
    received_by TEXT,
    status TEXT DEFAULT 'Delivered',
    is_replacement BOOLEAN DEFAULT FALSE,
    original_dr_number TEXT,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DELIVERY ISSUES & REPLACEMENTS
CREATE TABLE IF NOT EXISTS delivery_issues (
    id TEXT PRIMARY KEY DEFAULT ('iss-' || floor(extract(epoch from now()) * 1000)::text),
    issue_number TEXT UNIQUE NOT NULL,
    dr_number TEXT NOT NULL,
    po_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit TEXT DEFAULT 'pc',
    reason TEXT,
    status TEXT DEFAULT 'Pending Replacement',
    replacement_dr_number TEXT,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STATEMENTS OF ACCOUNT (SOA)
CREATE TABLE IF NOT EXISTS statements_of_account (
    id TEXT PRIMARY KEY DEFAULT ('soa-' || floor(extract(epoch from now()) * 1000)::text),
    soa_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    po_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    dr_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending Payment',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT ('pay-' || floor(extract(epoch from now()) * 1000)::text),
    payment_number TEXT UNIQUE NOT NULL,
    soa_id TEXT REFERENCES statements_of_account(id) ON DELETE CASCADE,
    soa_number TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Check',
    bank_name TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CENTRAL EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY DEFAULT ('exp-' || floor(extract(epoch from now()) * 1000)::text),
    expense_number TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT DEFAULT 'General',
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    supplier TEXT DEFAULT 'Internal / Direct',
    payment_method TEXT DEFAULT 'Cash',
    receipt_no TEXT DEFAULT 'N/A',
    source_type TEXT DEFAULT 'MANUAL',
    reference_id TEXT,
    receipt_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMPLOYEES & WORKERS
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY DEFAULT ('emp-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    pay_type TEXT DEFAULT 'Daily',
    rate NUMERIC(10, 2) NOT NULL,
    phone TEXT,
    start_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CASH ADVANCES (VALE)
CREATE TABLE IF NOT EXISTS cash_advances (
    id TEXT PRIMARY KEY DEFAULT ('ca-' || floor(extract(epoch from now()) * 1000)::text),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    deducted_amount NUMERIC(10, 2) DEFAULT 0.00,
    balance NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Open',
    reason TEXT DEFAULT 'Vale',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SETTINGS & CONFIGURATION
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements_of_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full read/write access (and anon for internal intranet if configured)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename IN ('customers', 'products', 'purchase_orders', 'delivery_trips', 
                            'delivery_receipts', 'delivery_issues', 'statements_of_account', 
                            'payments', 'expenses', 'employees', 'cash_advances', 'settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_for_internal_app" ON %I;', t);
        EXECUTE format('CREATE POLICY "allow_all_for_internal_app" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

# CCR business workflow

The customer's purchase order is the starting point. CCR receives it; CCR does not issue it to a supplier.

1. Record the customer PO number, customer, project, ordered items, quantities and agreed prices.
2. Record each delivery against that PO. A billable delivery creates a DR and an SOA for the delivered items. Multiple deliveries can fulfill one PO.
3. Record customer payments against their SOAs. Partial payments leave an unpaid SOA balance.

## Damages and replacements

Report damage against the original DR and delivered item. Dispatch a replacement with a separate DR linked to the original delivery and customer PO.

- Replacement quantity is tracked separately from PO fulfillment.
- Replacement items have zero charge and generate no SOA.
- Replacements do not change PO delivered quantity, remaining quantity, billed amount or unpaid balance.
- Example: 50 doors delivered, 2 damaged, 2 replacements sent = 50 delivered against the PO and 2 replacement units recorded separately.

## Navigation

- Customer orders: Customer POs; Deliveries & replacements (receipts, damages, trips); SOAs & payments (statements, payments, unpaid balances).
- Business spending: Expenses; Salaries & cash advances (payroll and employee records).
- Reports: Monthly summary.
- Business records: Customers, Products, Company & settings.

The PO history distinguishes the value still to deliver from unpaid SOA balances. Expenses retain categories for materials, utilities, fuel, vehicle maintenance, labor and other operating costs. Trips are optional supporting records.

These rules reflect the owner's latest clarifications and take priority over conflicting ideas in the earlier product plan.

## Verification

Run `npm run build` and `node scripts/test-order-workflow.js`.
The workflow test uses a temporary SQLite database outside the workspace. It checks partial deliveries, zero-charge replacements, unchanged fulfillment and billing, saved record IDs, damage resolution, payments and printable PO/DR references. It does not modify or validate the live Supabase database.

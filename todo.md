# MDA Platform TODO

## Phase 1: Database Schema
- [x] Create roles table (Client, Admin, Finance, Logistique, Ambassadeur)
- [x] Extend users table with phone, address, referral fields
- [x] Create products table (nom, prix_client, prix_fournisseur, stock, category)
- [x] Create cotisation_plans table (tontine payment plans)
- [x] Create cotisation_payments table (individual payments tracking)
- [x] Create transactions table (all financial movements)
- [x] Create flux_comptable table (accounting classification)
- [x] Create commissions table (referral commissions)
- [x] Create deliveries table (logistics tracking)
- [x] Create avoir_client table (client credit from contract breaks)

## Phase 2: Backend API (tRPC Procedures)
- [x] Auth procedures (role-based access control)
- [x] Product management procedures (CRUD for catalog)
- [x] Cotisation plan procedures (create, list, update status)
- [x] Payment procedures (add payment, calculate progress)
- [x] Contract liquidation procedure (1/3 penalty, 2/3 credit)
- [x] Delivery procedures (trigger, validate, track)
- [x] Financial reports procedures (revenue classification)
- [x] Commission calculation procedures
- [x] Avoir client procedures (credit management)
- [x] Admin procedures (user management, vault access)

## Phase 3: Frontend - Client Space
- [x] Client dashboard (cotisation progress, active plans)
- [x] Product catalog browsing
- [x] Create new cotisation plan
- [x] Make payment on plan
- [x] View payment history
- [x] Request contract liquidation
- [ ] Track deliveries
- [ ] Referral/parrainage interface
- [x] View avoir client balance

## Phase 4: Frontend - Management Space
- [x] Admin dashboard (global overview)
- [x] Finance dashboard (revenue reports, contract liquidations)
- [x] Logistics dashboard (product management, deliveries)
- [x] User role management (Admin only)
- [x] Coffre-fort numérique (Admin only - financial vault)
- [ ] Commission validation (Finance)
- [x] Delivery validation (Logistics)
- [ ] Stock management (Logistics)

## Phase 5: Role-Based Access Control
- [x] Implement role enum (client, admin, finance, logistique, ambassadeur)
- [x] Create role-based procedure middleware
- [x] Frontend route guards by role
- [x] Dynamic menu rendering based on user role
- [x] Admin-only features protection

## Phase 6: Simulations (No Real Integration)
- [x] Simulate payment gateway (MoMo, T-money, PayPal)
- [x] Simulate AES encryption (store plain text with flag)
- [x] Mock OTP/2FA validation

## Phase 7: Testing & Seed Data
- [x] Create test users for each role
- [x] Seed product catalog
- [ ] Create sample cotisation plans
- [ ] Add sample transactions
- [x] Test complete cotisation flow
- [x] Test contract liquidation flow
- [x] Test delivery flow
- [ ] Test referral commission flow

## Phase 8: Documentation
- [x] Document test credentials
- [x] Create user guide for each role
- [x] Document API endpoints
- [x] Add deployment notes for React Native

## Phase 9: Corrections
- [x] Create test users for each role in database
- [x] Allow admin to access Finance dashboard
- [x] Allow admin to access Logistics dashboard
- [x] Update role-based access control for admin

## Phase 10: Authentication System Overhaul
- [x] Add password field to users table
- [x] Create register endpoint (email/password)
- [x] Create login endpoint (email/password with JWT)
- [x] Hash passwords with bcrypt
- [x] Update test users with default passwords
- [x] Create login page with email/password form
- [x] Create register page
- [x] Keep Manus OAuth as optional alternative
- [ ] Prepare Google OAuth integration structure
- [x] Update documentation with new login credentials

## Phase 11: Bug Fixes
- [x] Fix tRPC server returning HTML instead of JSON
- [x] Verify backend server is running correctly
- [x] Check tRPC routes configuration
- [x] Test all API endpoints
- [x] Add JWT token support in tRPC client
- [x] Update context.ts to verify JWT tokens
- [x] Add getUserByEmail helper function
- [x] Update useAuth hook to clear tokens on logout
- [x] Create and pass JWT authentication tests

## Phase 12: Fix Persistent tRPC Errors
- [x] Identify which tRPC procedures are returning HTML
- [x] Check server logs for errors
- [x] Fix server-side errors in procedures
- [x] Test all admin dashboard queries
- [x] Add enabled flag to AdminDashboard queries
- [x] Add enabled flag to ClientDashboard queries
- [x] Add enabled flag to FinanceDashboard queries
- [x] Add enabled flag to LogisticsDashboard queries

## Phase 13: Add OAuth Login Option
- [x] Add "Se connecter avec Manus" button to login page
- [x] Add "Se connecter avec Manus" button to register page
- [x] Update login page UI to show both options

## Phase 14: Fix Finance Dashboard Revenue Reporting
- [x] Investigate why revenue report shows 0
- [x] Check if flux_comptable entries are created when payments are made
- [x] Create flux comptable for every payment (not just completed plans)
- [x] Update makePayment procedure to record all payments
- [x] Test payment flow and verify finance dashboard updates in real-time

## Phase 15: Documentation for Developers
- [x] Create comprehensive README.md
- [x] Document environment variables
- [x] Add installation instructions
- [x] Document database setup
- [x] Add test credentials
- [x] Document project structure

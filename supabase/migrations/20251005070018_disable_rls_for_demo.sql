/*
  # Disable RLS for demo mode

  This migration temporarily disables RLS on key tables to allow demo mode to work.
  
  IMPORTANT: This is for development/demo purposes only. 
  In production, you should create a proper demo user account instead.

  1. Changes
    - Disable RLS on equipment table
    - Disable RLS on rentals table
    - Disable RLS on rental_items table
    - Disable RLS on clients table
    - Disable RLS on articles table
    - Disable RLS on quotes table
    - Disable RLS on invoices table
    - Disable RLS on credits table

  2. Security Note
    - This makes ALL data in these tables publicly accessible
    - Only use this in a controlled environment
    - Re-enable RLS before production deployment
*/

-- Disable RLS on all main tables
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits DISABLE ROW LEVEL SECURITY;

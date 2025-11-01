/*
  # Email Tracking and Document Sharing System

  1. New Tables
    - `document_shares`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `document_type` (text: 'quote', 'invoice', 'credit')
      - `document_id` (uuid)
      - `share_token` (text, unique) - unique token for sharing link
      - `recipient_email` (text)
      - `recipient_name` (text)
      - `subject` (text)
      - `message` (text)
      - `sent_at` (timestamptz)
      - `first_viewed_at` (timestamptz, nullable)
      - `last_viewed_at` (timestamptz, nullable)
      - `view_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Disable RLS for demo mode
    - Add indexes for performance

  3. Notes
    - share_token is a unique identifier for each shared document
    - Tracks when document was sent and viewed
    - Multiple views are tracked with view_count
*/

-- Create document_shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('quote', 'invoice', 'credit')),
  document_id uuid NOT NULL,
  share_token text UNIQUE NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  message text,
  sent_at timestamptz DEFAULT now(),
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disable RLS for demo mode
ALTER TABLE document_shares DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON document_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_document_shares_document ON document_shares(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_sent_at ON document_shares(sent_at DESC);

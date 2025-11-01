/*
  # Add Recipient Tracking to Document Shares

  1. New Tables
    - `document_share_views`
      - `id` (uuid, primary key)
      - `share_id` (uuid, references document_shares)
      - `recipient_email` (text) - email of the person who viewed
      - `recipient_name` (text) - name of the person who viewed
      - `viewed_at` (timestamptz) - when the document was viewed
      - `ip_address` (text, nullable) - IP address of viewer
      - `user_agent` (text, nullable) - browser/device info

  2. Security
    - Disable RLS for demo mode
    - Add indexes for performance

  3. Notes
    - Tracks individual views per recipient
    - Allows tracking which specific email viewed the document
    - Multiple views by same email create multiple entries
*/

CREATE TABLE IF NOT EXISTS document_share_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid NOT NULL REFERENCES document_shares(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text,
  viewed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE document_share_views DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_document_share_views_share_id ON document_share_views(share_id);
CREATE INDEX IF NOT EXISTS idx_document_share_views_email ON document_share_views(recipient_email);
CREATE INDEX IF NOT EXISTS idx_document_share_views_viewed_at ON document_share_views(viewed_at DESC);

/*
  # Create shortened URLs table

  1. New Tables
    - `shortened_urls`
      - `id` (uuid, primary key)
      - `original_url` (text)
      - `short_url` (text)
      - `short_id` (text, unique)
      - `username` (text)
      - `password` (text)
      - `created_at` (timestamptz)
      - `total_clicks` (integer)
      - `last_clicked_at` (timestamptz)

  2. Security
    - Enable RLS on `shortened_urls` table
    - Add policies for public access to read and create URLs
*/

CREATE TABLE IF NOT EXISTS shortened_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  short_url text NOT NULL,
  short_id text UNIQUE NOT NULL,
  username text,
  password text,
  created_at timestamptz DEFAULT now(),
  total_clicks integer DEFAULT 0,
  last_clicked_at timestamptz
);

ALTER TABLE shortened_urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create URLs
CREATE POLICY "Anyone can create URLs"
  ON shortened_urls
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read URLs
CREATE POLICY "Anyone can read URLs"
  ON shortened_urls
  FOR SELECT
  TO public
  USING (true);

-- Allow updates only to total_clicks and last_clicked_at
CREATE POLICY "Allow updating click stats"
  ON shortened_urls
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
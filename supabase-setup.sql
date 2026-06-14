-- Run this in Supabase SQL Editor
-- Full reset with show_in field

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  category TEXT,
  price_inr NUMERIC(12,2) DEFAULT 0,
  dimensions_cm TEXT,
  description TEXT,
  image_url TEXT,
  show_in TEXT DEFAULT 'both' CHECK (show_in IN ('both', 'domestic', 'importer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON products FOR SELECT USING (true);
CREATE POLICY "Public insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON products FOR DELETE USING (true);

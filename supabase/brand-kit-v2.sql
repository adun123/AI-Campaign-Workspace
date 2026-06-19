-- Brand Kit v2: Add toggles, logo overlay, typography, brand values
-- Run this migration in Supabase SQL Editor

-- Logo overlay settings
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS logo_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS logo_position text NOT NULL DEFAULT 'bottom-right'
  CHECK (logo_position IN ('top-left', 'top-center', 'top-right', 'center', 'bottom-left', 'bottom-center', 'bottom-right'));
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS logo_size_percent integer NOT NULL DEFAULT 15
  CHECK (logo_size_percent BETWEEN 5 AND 50);

-- Field toggles
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS voice_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS colors_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS guardrails_enabled boolean NOT NULL DEFAULT true;

-- New fields
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS typography text;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS typography_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS brand_values text[] DEFAULT '{}';
ALTER TABLE brand_kits ADD COLUMN IF NOT EXISTS brand_values_enabled boolean NOT NULL DEFAULT false;

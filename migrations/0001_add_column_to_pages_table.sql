    -- migrations/0001_add_column_to_pages_table.sql

    ALTER TABLE Pages
    ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private'));

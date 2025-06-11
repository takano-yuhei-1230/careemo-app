    -- Sites Table
    CREATE TABLE Sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT DEFAULT NULL
    );

    -- Unique index for active sites' slugs
    CREATE UNIQUE INDEX idx_sites_slug_unique_if_not_deleted
    ON Sites(slug)
    WHERE deleted_at IS NULL;

    -- Pages Table
    CREATE TABLE Pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        html_content TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT DEFAULT NULL,
        FOREIGN KEY (site_id) REFERENCES Sites(id) -- Removed ON DELETE CASCADE
    );

    -- Unique index for active pages' slugs within a site
    CREATE UNIQUE INDEX idx_pages_site_id_slug_unique_if_not_deleted
    ON Pages(site_id, slug)
    WHERE deleted_at IS NULL;

    -- Triggers to update `updated_at` timestamp
    CREATE TRIGGER IF NOT EXISTS sites_updated_at
    AFTER UPDATE ON Sites
    FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at -- Avoid infinite loop if updated_at is manually set
    BEGIN
        UPDATE Sites SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS pages_updated_at
    AFTER UPDATE ON Pages
    FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at -- Avoid infinite loop
    BEGIN
        UPDATE Pages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    -- Styles Table
    CREATE TABLE Styles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER NOT NULL,
        css_content TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT DEFAULT NULL,
        FOREIGN KEY (site_id) REFERENCES Sites(id) -- Removed ON DELETE CASCADE
    );

    -- Unique index for active styles within a site
    CREATE UNIQUE INDEX idx_styles_site_id_unique_when_not_deleted
    ON Styles (site_id)
    WHERE deleted_at IS NULL;

    -- Triggers to update `updated_at` timestamp
    CREATE TRIGGER IF NOT EXISTS styles_updated_at
    AFTER UPDATE ON Styles
    FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at -- Avoid infinite loop
    BEGIN
        UPDATE Styles SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

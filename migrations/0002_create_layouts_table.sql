    -- Layouts Table
    CREATE TABLE Layouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        html_content TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT DEFAULT NULL,
        FOREIGN KEY (site_id) REFERENCES Sites(id) -- Removed ON DELETE CASCADE
    );

    -- Unique index for active layouts' slugs within a site
    CREATE UNIQUE INDEX idx_layouts_site_id_name_unique_when_not_deleted
    ON Layouts (site_id, name)
    WHERE deleted_at IS NULL;

    -- Triggers to update `updated_at` timestamp
    CREATE TRIGGER IF NOT EXISTS layouts_updated_at
    AFTER UPDATE ON Layouts
    FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at -- Avoid infinite loop
    BEGIN
        UPDATE Layouts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

-- Add folder sharing table
CREATE TABLE IF NOT EXISTS folder_shares (
    id BIGSERIAL PRIMARY KEY,
    folder_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    permissions VARCHAR(50) NOT NULL DEFAULT 'read',
    message TEXT,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    password_hash VARCHAR(255),
    requires_password BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    responded_at TIMESTAMP,
    
    CONSTRAINT fk_folder_shares_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_folder_shares_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_folder_shares_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_folder_user_share UNIQUE (folder_id, target_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_folder_shares_folder_id ON folder_shares(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_shares_owner_id ON folder_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_folder_shares_target_user_id ON folder_shares(target_user_id);
CREATE INDEX IF NOT EXISTS idx_folder_shares_status ON folder_shares(status);

-- Add comments
COMMENT ON TABLE folder_shares IS 'Table to manage folder sharing between users';
COMMENT ON COLUMN folder_shares.permissions IS 'Permission level: read, write, admin';
COMMENT ON COLUMN folder_shares.status IS 'Share status: pending, accepted, rejected, revoked';

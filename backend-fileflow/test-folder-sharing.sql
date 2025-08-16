-- Test script for folder sharing functionality

-- Check if folder_shares table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'folder_shares'
) AS table_exists;

-- If table exists, show structure
\d folder_shares;

-- Show sample data if any
SELECT fs.*, f.name as folder_name, u1.email as owner_email, u2.email as target_email 
FROM folder_shares fs
LEFT JOIN folders f ON fs.folder_id = f.id
LEFT JOIN users u1 ON fs.owner_id = u1.id
LEFT JOIN users u2 ON fs.target_user_id = u2.id
ORDER BY fs.shared_at DESC
LIMIT 10;

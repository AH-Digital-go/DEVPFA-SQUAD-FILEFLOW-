-- FileFlow Database Setup Script
-- Run this script to set up the PostgreSQL database for FileFlow

-- Create database
CREATE DATABASE fileflow;

-- Create user
CREATE USER fileflow_user WITH PASSWORD 'fileflow_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fileflow TO fileflow_user;

-- Connect to the fileflow database
\c fileflow;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO fileflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fileflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fileflow_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fileflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fileflow_user;

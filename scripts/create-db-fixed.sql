-- Create database and user for Shopify Quiz Builder
-- Run this script as a PostgreSQL superuser

-- Create the database
CREATE DATABASE shopify_quiz_builder;

-- Create the user
CREATE USER quiz_builder_server_user WITH PASSWORD '6409b7447d251b211049';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE shopify_quiz_builder TO quiz_builder_server_user;

-- Connect to the new database
\c shopify_quiz_builder;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quiz_builder_server_user;

-- Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quiz_builder_server_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quiz_builder_server_user;

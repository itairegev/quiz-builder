-- Step 1: Create database and user
-- Run this as a PostgreSQL superuser

CREATE DATABASE shopify_quiz_builder;
CREATE USER quiz_builder_server_user WITH PASSWORD '6409b7447d251b211049';
GRANT ALL PRIVILEGES ON DATABASE shopify_quiz_builder TO quiz_builder_server_user;

-- Step 2: Connect to the new database and set up schema privileges
-- Run this after connecting to shopify_quiz_builder database

GRANT ALL ON SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quiz_builder_server_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quiz_builder_server_user;

-- Step 3: Set default privileges for future objects
-- Run this after the above commands

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quiz_builder_server_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quiz_builder_server_user;

-- Shopify Quiz Builder Database Initialization Script
-- This script sets up the initial database structure and sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE question_type AS ENUM (
    'single_choice',
    'multiple_choice',
    'free_text',
    'range_slider',
    'number_input',
    'email_input',
    'phone_input',
    'image_upload',
    'autocomplete_text'
);

CREATE TYPE quiz_status AS ENUM (
    'draft',
    'published',
    'archived'
);

CREATE TYPE submission_status AS ENUM (
    'in_progress',
    'completed',
    'abandoned'
);

-- Create tables
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status quiz_status DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    custom_css TEXT,
    custom_js TEXT,
    template_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logic_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    condition JSONB NOT NULL,
    action JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    answers JSONB NOT NULL,
    recommendations JSONB,
    status submission_status DEFAULT 'in_progress',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_shop_id ON quizzes(shop_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_logic_rules_quiz_id ON logic_rules(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_shop_id ON submissions(shop_id);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_email ON submissions(customer_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_quiz_id ON analytics_events(quiz_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logic_rules_updated_at BEFORE UPDATE ON logic_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO shops (domain, access_token, scope, subscription_plan) VALUES
('dev-store.myshopify.com', 'shpat_dev_token_123', 'read_products,write_products,read_customers,write_customers', 'premium')
ON CONFLICT (domain) DO NOTHING;

-- Create sample quiz
INSERT INTO quizzes (shop_id, title, description, status, template_id) VALUES
((SELECT id FROM shops LIMIT 1), 'Skincare Quiz', 'Find your perfect skincare routine', 'draft', 'skincare-finder')
ON CONFLICT DO NOTHING;

-- Create sample questions
INSERT INTO questions (quiz_id, type, content, order_index, is_required) VALUES
((SELECT id FROM quizzes LIMIT 1), 'single_choice', '{"text": "What is your skin type?", "options": ["Oily", "Dry", "Combination", "Sensitive", "Normal"]}', 1, true),
((SELECT id FROM quizzes LIMIT 1), 'single_choice', '{"text": "What are your main skin concerns?", "options": ["Acne", "Aging", "Hyperpigmentation", "Redness", "Dryness"]}', 2, true),
((SELECT id FROM quizzes LIMIT 1), 'range_slider', '{"text": "What is your budget range?", "min": 25, "max": 200, "step": 25}', 3, false)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quiz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quiz_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO quiz_user;

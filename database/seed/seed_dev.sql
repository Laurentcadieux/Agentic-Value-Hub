-- Seed data for development
-- Run: psql -U avh -h <db-vm-ip> -d avh -f seed/seed_dev.sql

INSERT INTO users (email, name) VALUES
    ('admin@laurentcadieux.online', 'Admin User'),
    ('demo@laurentcadieux.online', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Migration: Add configurable recovery days to users table
-- Created: 2025-10-27
-- OpenSpec Change: implement-configurable-recovery-system

-- Add recovery_days_to_full column with default of 5 days
ALTER TABLE users ADD COLUMN recovery_days_to_full INTEGER DEFAULT 5;

-- Update any existing users to have the default value explicitly set
UPDATE users SET recovery_days_to_full = 5 WHERE recovery_days_to_full IS NULL;

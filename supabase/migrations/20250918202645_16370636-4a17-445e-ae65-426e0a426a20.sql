-- Add super_admin to user_role enum (must be in separate transaction)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
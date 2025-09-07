-- Add payment method fields to users table
ALTER TABLE users ADD COLUMN venmo_id VARCHAR(255);
ALTER TABLE users ADD COLUMN cashapp_id VARCHAR(255);
ALTER TABLE users ADD COLUMN zelle_id VARCHAR(255);
ALTER TABLE users ADD COLUMN payment_qr_code TEXT;
ALTER TABLE users ADD COLUMN preferred_payment_method VARCHAR(50) DEFAULT 'venmo';
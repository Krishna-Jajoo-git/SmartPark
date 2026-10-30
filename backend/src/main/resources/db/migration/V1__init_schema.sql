-- V1__init_schema.sql: Initialize SmartPark schema

CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    floor VARCHAR(50) DEFAULT 'Ground Floor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_slot_status CHECK (status IN ('AVAILABLE', 'OCCUPIED'))
);

CREATE INDEX IF NOT EXISTS idx_parking_slots_status ON parking_slots(status);
CREATE INDEX IF NOT EXISTS idx_parking_slots_number ON parking_slots(slot_number);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    vehicle_number VARCHAR(30) NOT NULL,
    slot_id BIGINT NOT NULL REFERENCES parking_slots(id),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_status CHECK (status IN ('ACTIVE', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_entry_time ON bookings(entry_time);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    payment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI/CASH',
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID'))
);

CREATE INDEX IF NOT EXISTS idx_payments_time ON payments(payment_time);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

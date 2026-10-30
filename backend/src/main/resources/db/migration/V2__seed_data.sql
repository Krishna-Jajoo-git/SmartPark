-- V2__seed_data.sql: Seed initial parking slots for SmartPark

INSERT INTO parking_slots (slot_number, status, floor) VALUES
('A-01', 'AVAILABLE', 'Ground Floor (North)'),
('A-02', 'AVAILABLE', 'Ground Floor (North)'),
('A-03', 'AVAILABLE', 'Ground Floor (North)'),
('A-04', 'AVAILABLE', 'Ground Floor (North)'),
('A-05', 'AVAILABLE', 'Ground Floor (North)'),
('A-06', 'AVAILABLE', 'Ground Floor (North)'),
('A-07', 'AVAILABLE', 'Ground Floor (North)'),
('A-08', 'AVAILABLE', 'Ground Floor (North)'),
('A-09', 'AVAILABLE', 'Ground Floor (North)'),
('A-10', 'AVAILABLE', 'Ground Floor (North)'),
('B-01', 'AVAILABLE', 'Ground Floor (South)'),
('B-02', 'AVAILABLE', 'Ground Floor (South)'),
('B-03', 'AVAILABLE', 'Ground Floor (South)'),
('B-04', 'AVAILABLE', 'Ground Floor (South)'),
('B-05', 'AVAILABLE', 'Ground Floor (South)'),
('B-06', 'AVAILABLE', 'Ground Floor (South)'),
('B-07', 'AVAILABLE', 'Ground Floor (South)'),
('B-08', 'AVAILABLE', 'Ground Floor (South)'),
('B-09', 'AVAILABLE', 'Ground Floor (South)'),
('B-10', 'AVAILABLE', 'Ground Floor (South)'),
('C-01', 'AVAILABLE', 'Basement (VIP/EV)'),
('C-02', 'AVAILABLE', 'Basement (VIP/EV)'),
('C-03', 'AVAILABLE', 'Basement (VIP/EV)'),
('C-04', 'AVAILABLE', 'Basement (VIP/EV)'),
('C-05', 'AVAILABLE', 'Basement (VIP/EV)')
ON CONFLICT (slot_number) DO NOTHING;

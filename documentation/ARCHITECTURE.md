# SmartPark System Architecture & Engineering Specifications

SmartPark is a production-grade Smart Parking Management System designed to handle high-concurrency parking slot allocations, real-time duration tracking, dynamic fare calculation, transactional checkout, simulated payment processing, and revenue analytics.

---

## 1. High-Level Architectural Diagram

```
+------------------------------------------------------------------------+
|                          MOBILE CLIENT (EXPO)                          |
|  [Dashboard]   [Slot Grid]   [Booking Form]   [Checkout]   [Analytics] |
|             \           |           |           /                      |
|              +----------+-----------+----------+                       |
|                                 |                                      |
|                       Axios HTTP REST Client                           |
+---------------------------------|--------------------------------------+
                                  | HTTP / JSON (Port 8080)
                                  v
+------------------------------------------------------------------------+
|                          SPRING BOOT BACKEND                           |
|                                                                        |
|  [REST Controllers]                                                    |
|    - SlotController (/api/slots)                                       |
|    - BookingController (/api/bookings)                                 |
|    - PaymentController (/api/payments)                                 |
|    - AnalyticsController (/api/analytics)                             |
|                                 |                                      |
|  [Business Service Layer]       v                                      |
|    - FareCalculator (ceil(duration/10800)*50)                          |
|    - SlotService                                                       |
|    - BookingService (Pessimistic Concurrency Lock)                     |
|    - PaymentService                                                    |
|    - AnalyticsService (UTC Calendar Aggregation)                       |
|                                 |                                      |
|  [Data Access Layer (JPA)]      v                                      |
|    - ParkingSlotRepository                                             |
|    - BookingRepository                                                 |
|    - PaymentRepository                                                 |
+---------------------------------|--------------------------------------+
                                  | JDBC
                                  v
+------------------------------------------------------------------------+
|                        POSTGRESQL 16/17 DATABASE                       |
|  - parking_slots (25 initial spaces, unique constraints, status check) |
|  - bookings (vehicle, slot FK, timestamps, amount, status check)       |
|  - payments (booking FK 1:1, status check, amount, transaction ref)    |
|  - flyway_schema_history (V1 schema, V2 seed data)                     |
+------------------------------------------------------------------------+
```

---

## 2. Core Entities & Database Schema

### 2.1 ParkingSlot (`parking_slots`)
- `id` (BIGSERIAL PRIMARY KEY)
- `slot_number` (VARCHAR(20) NOT NULL UNIQUE): Identifier like "A-01", "B-05", "C-01".
- `status` (VARCHAR(20) NOT NULL): Constrained to `AVAILABLE` or `OCCUPIED`.
- `floor` (VARCHAR(50)): Building zone or floor level (e.g., "Ground Floor (North)", "Basement (VIP/EV)").
- `created_at`, `updated_at`: UTC timestamps.
- **Indexes**: `idx_parking_slots_status`, `idx_parking_slots_number`.

### 2.2 Booking (`bookings`)
- `id` (BIGSERIAL PRIMARY KEY)
- `vehicle_number` (VARCHAR(30) NOT NULL): Normalized alphanumeric registration plate (e.g., "MH12AB1234").
- `slot_id` (BIGINT NOT NULL REFERENCES `parking_slots(id)`): Many-to-One mapping.
- `entry_time` (TIMESTAMP WITH TIME ZONE NOT NULL): Exact UTC entry timestamp.
- `exit_time` (TIMESTAMP WITH TIME ZONE): UTC exit timestamp, populated on checkout.
- `total_amount` (NUMERIC(10, 2) DEFAULT 0.00): Accrued / final settled fare in INR.
- `status` (VARCHAR(20) NOT NULL): Constrained to `ACTIVE` or `COMPLETED`.
- **Indexes**: `idx_bookings_status`, `idx_bookings_vehicle`, `idx_bookings_slot_id`, `idx_bookings_entry_time`.

### 2.3 Payment (`payments`)
- `id` (BIGSERIAL PRIMARY KEY)
- `booking_id` (BIGINT NOT NULL UNIQUE REFERENCES `bookings(id)`): One-to-One strict foreign key.
- `amount` (NUMERIC(10, 2) NOT NULL): Settled amount in INR.
- `payment_status` (VARCHAR(20) NOT NULL): `PENDING` or `PAID`.
- `payment_time` (TIMESTAMP WITH TIME ZONE NOT NULL): Exact payment settlement time.
- `payment_method` (VARCHAR(50)): "UPI", "CASH", "CARD".
- `transaction_reference` (VARCHAR(100)): Globally unique reference code (e.g. `TXN-1793083084653-1`).
- **Indexes**: `idx_payments_time`, `idx_payments_status`.

---

## 3. Concurrency Control & Double Booking Prevention

Simultaneous slot allocation attempts on high-traffic lots are handled via multiple protective layers:
1. **Pessimistic Database Write Locks**:
   ```java
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("SELECT s FROM ParkingSlot s WHERE s.id = :id")
   Optional<ParkingSlot> findByIdWithLock(@Param("id") Long id);
   ```
   When a thread initiates a booking for a specific or auto-allocated slot, the corresponding row in `parking_slots` is exclusively locked for update (`SELECT ... FOR UPDATE`). Concurrent transactions are queued until the first transaction commits or rolls back.
2. **Vehicle Uniqueness Active Booking Rule**:
   Before allocating any slot, the service checks:
   `bookingRepository.existsByVehicleNumberAndStatus(vehicleNumber, BookingStatus.ACTIVE)`
   If the vehicle is already parked, a `VehicleAlreadyParkedException` (HTTP 409 Conflict) is thrown immediately.
3. **Database Constraints**:
   Unique index on `booking_id` in `payments` prevents duplicate checkout/payment creation. Check constraints enforce valid state values.

---

## 4. Tariff Calculation Engine

The dedicated `FareCalculator` component strictly implements the project fee formula:
$$\text{Fare (INR)} = \left\lceil \frac{\text{duration in seconds}}{10800} \right\rceil \times 50$$

### Exact Edge Cases & Rules:
- **Zero Duration ($0$ seconds)**: Yields **₹0.00**.
- **Any Positive Duration ($> 0$ seconds)**: Costs at least **₹50.00**.
- **$1$ minute ($60$s)**: $\lceil 60 / 10800 \rceil \times 50 = 1 \times 50 =$ **₹50.00**.
- **$2$ hours $15$ minutes ($8100$s)**: $\lceil 8100 / 10800 \rceil \times 50 = 1 \times 50 =$ **₹50.00**.
- **Exactly $3$ hours ($10800$s)**: $\lceil 10800 / 10800 \rceil \times 50 = 1 \times 50 =$ **₹50.00**.
- **$3$ hours $5$ minutes ($11100$s)**: $\lceil 11100 / 10800 \rceil \times 50 = 2 \times 50 =$ **₹100.00**.
- **Exactly $6$ hours ($21600$s)**: $\lceil 21600 / 10800 \rceil \times 50 = 2 \times 50 =$ **₹100.00**.
- **$6$ hours $1$ minute ($21660$s)**: $\lceil 21660 / 10800 \rceil \times 50 = 3 \times 50 =$ **₹150.00**.
- **Null Timestamp Validation**: Throws `IllegalArgumentException` ("Timestamps cannot be null").
- **Time Inversion**: If exit time is earlier than entry time, throws `IllegalArgumentException`.

---

## 5. Transactional Integrity Strategy

- `@Transactional(isolation = Isolation.READ_COMMITTED)` is applied to all mutating operations (`createBooking`, `checkout`).
- The `checkout` operation performs:
  1. Validation that booking is ACTIVE.
  2. Calculation of final duration and fee.
  3. Updating booking (`COMPLETED`, `exitTime`, `totalAmount`).
  4. Updating parking slot (`AVAILABLE`).
  5. Creating and inserting payment record (`PAID`, timestamp, transaction reference).
  If any step encounters an error, the entire operation is rolled back, preserving state consistency.

---

## 6. Timezone Architecture

- **Global Standard**: UTC (`ZoneOffset.UTC`).
- Configured in Spring Boot entry point: `TimeZone.setDefault(TimeZone.getTimeZone("UTC"))`.
- Jackson configured to serialize ISO-8601 strings with trailing `'Z'` (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`).
- Daily analytics intervals: `[date.atStartOfDay(UTC), date.plusDays(1).atStartOfDay(UTC))` guaranteeing accurate 24-hour financial aggregates without daylight-saving shifts.

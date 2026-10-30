# SmartPark REST API Specification

Base URL: `http://localhost:8080/api`  
Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`  
OpenAPI JSON Specification: `http://localhost:8080/api-docs`

---

## Standard Error Response Format

All API errors return a standardized JSON body conforming to `ErrorResponse`:

```json
{
  "timestamp": "2026-10-27T06:38:04.580Z",
  "status": 409,
  "error": "Conflict",
  "message": "Vehicle MH12AB1234 is already parked with an active booking",
  "path": "/api/bookings",
  "fieldErrors": null
}
```

HTTP Status Codes:
- `200 OK`: Successful retrieval or completion.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Payload validation error or invalid lifecycle operation.
- `404 Not Found`: Resource ID not found.
- `409 Conflict`: Slot already occupied or vehicle already active.
- `500 Internal Server Error`: Unexpected internal error (stack traces hidden from client).

---

## 1. Parking Slots API

### 1.1 Get All Parking Slots
- **Endpoint**: `GET /api/slots`
- **Description**: Returns all 25 parking spaces with live occupancy status and vehicle assignments.
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "slotNumber": "A-01",
    "status": "AVAILABLE",
    "floor": "Ground Floor (North)",
    "currentBookingId": null,
    "currentVehicleNumber": null,
    "currentEntryTime": null
  }
]
```

### 1.2 Get Available Parking Slots
- **Endpoint**: `GET /api/slots/available`
- **Description**: Filters only vacant parking spaces.
- **Response**: `200 OK`

### 1.3 Get Slot by ID
- **Endpoint**: `GET /api/slots/{id}`
- **Parameters**: `id` (Long, path parameter)
- **Response**: `200 OK` or `404 Not Found`

---

## 2. Vehicle Bookings API

### 2.1 Allocate Slot (Create Booking)
- **Endpoint**: `POST /api/bookings`
- **Headers**: `Content-Type: application/json`
- **Request Body (Auto-Allocation)**:
```json
{
  "vehicleNumber": "MH12AB1234"
}
```
- **Request Body (Specific Slot)**:
```json
{
  "vehicleNumber": "MH12AB1234",
  "slotId": 2
}
```
- **Response**: `201 Created`
```json
{
  "id": 1,
  "vehicleNumber": "MH12AB1234",
  "slotId": 1,
  "slotNumber": "A-01",
  "slotFloor": "Ground Floor (North)",
  "entryTime": "2026-10-27T06:38:04.580Z",
  "exitTime": null,
  "totalAmount": 0.00,
  "status": "ACTIVE",
  "paymentId": null,
  "accruedFare": 0.00
}
```
- **Error Cases**:
  - `400 Bad Request`: Invalid vehicle number format.
  - `409 Conflict`: Vehicle already parked or slot already occupied.

### 2.2 Get Active Bookings
- **Endpoint**: `GET /api/bookings/active`
- **Description**: Retrieves all vehicles currently parked with real-time accrued fare.
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "vehicleNumber": "MH12AB1234",
    "slotId": 1,
    "slotNumber": "A-01",
    "slotFloor": "Ground Floor (North)",
    "entryTime": "2026-10-27T04:30:00.000Z",
    "status": "ACTIVE",
    "accruedFare": 50.00
  }
]
```

### 2.3 Get Booking by ID
- **Endpoint**: `GET /api/bookings/{id}`
- **Response**: `200 OK` or `404 Not Found`

### 2.4 Get Booking by Vehicle Number
- **Endpoint**: `GET /api/bookings/vehicle/{number}`
- **Example**: `GET /api/bookings/vehicle/MH12AB1234`
- **Response**: `200 OK` or `404 Not Found`

---

## 3. Billing & Checkout API

### 3.1 Calculate Accrued Fare
- **Endpoint**: `GET /api/bookings/{id}/fare`
- **Description**: Estimates current accrued fare and duration without mutating database state.
- **Response**: `200 OK`
```json
{
  "bookingId": 1,
  "vehicleNumber": "MH12AB1234",
  "slotNumber": "A-01",
  "entryTime": "2026-10-27T04:30:00.000Z",
  "currentTime": "2026-10-27T06:45:00.000Z",
  "durationInSeconds": 8100,
  "durationFormatted": "2h 15m 0s",
  "accruedFare": 50.00
}
```

### 3.2 Process Checkout
- **Endpoint**: `POST /api/bookings/{id}/checkout`
- **Description**: Atomically marks booking COMPLETED, calculates final fee, saves payment record, and releases the slot.
- **Response**: `200 OK`
```json
{
  "bookingId": 1,
  "vehicleNumber": "MH12AB1234",
  "slotId": 1,
  "slotNumber": "A-01",
  "slotFloor": "Ground Floor (North)",
  "entryTime": "2026-10-27T04:30:00.000Z",
  "exitTime": "2026-10-27T06:45:00.000Z",
  "durationInSeconds": 8100,
  "durationFormatted": "2h 15m 0s",
  "finalAmount": 50.00,
  "paymentId": 1,
  "paymentStatus": "PAID",
  "paymentTime": "2026-10-27T06:45:00.000Z",
  "paymentMethod": "UPI/CASH",
  "transactionReference": "TXN-1793083084653-1"
}
```
- **Error Cases**:
  - `409 Conflict`: Booking is already completed / checked out.
  - `404 Not Found`: Booking ID not found.

### 3.3 Get Payment Details
- **Endpoint**: `GET /api/payments/{id}`
- **Response**: `200 OK` or `404 Not Found`

---

## 4. Analytics API

### 4.1 Overall Parking Summary
- **Endpoint**: `GET /api/analytics/summary`
- **Response**: `200 OK`
```json
{
  "totalSlots": 25,
  "availableSlots": 24,
  "occupiedSlots": 1,
  "occupancyRatePercentage": 4.0,
  "totalBookings": 1,
  "activeBookings": 1,
  "completedBookings": 0,
  "totalRevenue": 0.00,
  "todayRevenue": 0.00,
  "currency": "INR"
}
```

### 4.2 Revenue Aggregate by Date
- **Endpoint**: `GET /api/analytics/revenue?date=YYYY-MM-DD`
- **Example**: `GET /api/analytics/revenue?date=2026-10-27`
- **Response**: `200 OK`
```json
{
  "date": "2026-10-27",
  "totalRevenue": 150.00,
  "paidTransactionsCount": 3,
  "currency": "INR"
}
```

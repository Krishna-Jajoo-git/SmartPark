# SmartPark — Smart Parking Management System

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F17-blue.svg)](https://www.postgresql.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev)
[![Tests](https://img.shields.io/badge/Tests-38%20Passed-success.svg)]()

**SmartPark** is a production-quality, full-stack Smart Parking Management System engineered for enterprise facilities. It features transactional slot allocation, pessimistic locking to prevent double bookings, real-time accrued billing, simulated payment receipts, and automated revenue analytics.

---

## 🏛️ Repository Structure

```
SmartPark/
├── backend/                             # Spring Boot 3.3.4 (Java 21) REST Backend
│   ├── .mvn/                            # Maven wrapper files
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/SmartPark/
│   │   │   │   ├── config/              # OpenApiConfig, CorsConfig
│   │   │   │   ├── controller/          # SlotController, BookingController, PaymentController, AnalyticsController
│   │   │   │   ├── dto/                 # BookingRequest, Responses, ErrorResponse
│   │   │   │   ├── entity/              # ParkingSlot, Booking, Payment, Enums
│   │   │   │   ├── exception/           # Custom Exceptions & GlobalExceptionHandler
│   │   │   │   ├── repository/          # JpaRepositories with Pessimistic Locking
│   │   │   │   ├── service/             # FareCalculator, BookingService, SlotService, PaymentService, AnalyticsService
│   │   │   │   └── SmartParkApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/        # Flyway V1 (Schema) and V2 (25 Seed Slots)
│   │   └── test/                        # 38 JUnit 5 + Mockito Unit & Integration Tests
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── .env.example
├── frontend/                            # React Native with Expo Mobile Application
│   ├── src/
│   │   ├── api/                         # Axios client & modular API services
│   │   ├── components/                  # Header, SlotCard, BookingCard, StatCard, Button, EmptyState
│   │   ├── constants/                   # Theme (Navy/Blue/Emerald/Crimson Design System)
│   │   ├── navigation/                  # Bottom Tab & Native Stack Navigators
│   │   ├── screens/                     # Dashboard, Slots, Booking, Active, Checkout, Receipt, Analytics
│   │   └── utils/                       # Currency (INR ₹) & Timestamp formatters
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── .env.example
├── documentation/                       # Comprehensive System Documentation
│   ├── RUN_GUIDE.md                     # Step-by-step Run Guide (Web & Android Studio)
│   ├── SETUP_GUIDE.md                   # Environment & Installation Reference
│   ├── ARCHITECTURE.md                  # Schema, Concurrency Locking, Fare Engine
│   └── API_DOCUMENTATION.md             # REST API specifications & Swagger guides
├── RUN_GUIDE.md                         # Quick-access Run Guide at repo root
├── SmartPark_API_Testing_Manual.docx # Complete Word Document for testing every API
├── docker-compose.yml                   # PostgreSQL 16 container definition
└── README.md
```

---

## ⚡ Key Highlights & Business Rules Implemented

- 🛡️ **Pessimistic Locking & Idempotent Allocation**: Prevents simultaneous double booking using `@Lock(LockModeType.PESSIMISTIC_WRITE)` and transactional boundaries.
- 🚫 **Vehicle Exclusivity**: A vehicle cannot have multiple active bookings simultaneously.
- ⏱️ **Accrued Fare Engine**: Dedicated `FareCalculator` adhering strictly to:
  $$\text{Fare (INR)} = \left\lceil \frac{\text{duration in seconds}}{10800} \right\rceil \times 50$$
  *(0s costs ₹0; any positive duration costs at least ₹50 per 3-hour block or fraction thereof).*
- 🔒 **Transactional Consistency**: Slot release, payment persistence, and booking completion are coupled inside `@Transactional` database boundaries.
- 🌐 **Global UTC Strategy**: Standardized timestamp strategy avoiding timezone ambiguities.
- 📈 **Auditable Revenue Analytics**: Financial aggregates computed from settled `PAID` records for any given calendar date.
- 📱 **Mobile UI**: Clean navy-blue theme, emerald green / crimson status indicators, pull-to-refresh, live accrued fares, and ticket receipt screen.

---

## 🚀 Quick Start Guide (One Command)

Run the entire application stack (**PostgreSQL + Spring Boot Backend + React Native Web Frontend**) with a single command:

```bash
docker compose up --build
```

That's it! Docker automatically:
1. Starts **PostgreSQL 16** with health checks (mapped to host port `5433` to prevent conflicts with any existing local PostgreSQL on 5432).
2. Builds and starts the **Spring Boot 3.3.4 (Java 21)** backend service on port `8080`.
3. Runs Flyway migrations automatically, creating all schemas and seeding 25 parking spaces.
4. Builds the **React Native Expo** application bundle and serves it through **Nginx** on port `3000`.

### 🌐 Accessing the Services
- **Web App (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **REST API Base (Backend)**: [http://localhost:8080/api](http://localhost:8080/api)
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **PostgreSQL Database**: `localhost:5433` (DB: `SmartPark`, User: `SmartPark`, Password: `SmartPark_secret`)

---

## 🛠️ Alternative: Running Natively without Docker

### 1. Database
```bash
docker compose up postgres -d
```

### 2. Backend (Spring Boot 3.3.4)
```bash
cd backend
# Set JAVA_HOME (if not already set in system environment):
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"

# Run the 38 automated tests:
.\mvnw.cmd test

# Launch backend server:
.\mvnw.cmd spring-boot:run
```

### 3. Frontend (React Native with Expo)
```bash
cd frontend
npm install --legacy-peer-deps
npx expo start --web
```
*For Android Emulator, requests automatically route to `http://10.0.2.2:8080/api`.*

---

## 🧪 Testing Summary

The project includes **38 comprehensive automated tests** with 100% pass rate:
- **`FareCalculatorTest`** (21 tests): Parameterized boundary checks, 0s, 1s, 10799s, 10800s, 10801s, 21599s, 21600s, 21601s, null handling, time inversion exceptions.
- **`BookingServiceTest`** (7 tests): Pessimistic lock verification, vehicle active conflict checks, slot occupied conflict checks, transactional checkout.
- **`SlotServiceTest`** (4 tests): Slot filtering, status mapping, 404 validation.
- **`BookingControllerTest`** (5 tests): MockMvc REST endpoint assertions, JSON validations, HTTP status mapping (201, 404, 409).
- **`SmartParkApplicationTests`** (1 test): Full Spring Boot context initialization.

```
[INFO] Results:
[INFO] Tests run: 38, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📖 API Testing Manual (Word Document)

All API endpoints can be tested directly without any UI or Postman installation using the included Word document:
- **File**: `SmartPark_API_Testing_Manual.docx`
- **Contents**:
  1. Complete endpoint URLs, HTTP methods, and required headers.
  2. Desirable request payloads (JSON) and query parameters.
  3. Expected responses with status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`).
  4. Edge cases & error handling rules (e.g. duplicate booking, double parking, slot mismatch).
  5. Ready-to-copy **cURL** and **PowerShell** commands for instant execution.

---

## 📄 License
Licensed under Apache 2.0. Built for production-ready smart parking operations.
#   S m a r t P a r k  
 
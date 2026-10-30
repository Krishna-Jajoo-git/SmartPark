# 🚗 SmartPark — Enterprise Smart Parking Management System

<div align="center">

[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo 51](https://img.shields.io/badge/Expo-51.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Tests Passing](https://img.shields.io/badge/Tests-38%20Passed-success?style=for-the-badge&logo=checkmarx&logoColor=white)](#-automated-testing-suite)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-quick-start-with-docker)

<p align="center">
  <b>A production-grade, full-stack Smart Parking Management System designed for enterprise facilities.</b><br>
  Featuring transactional slot allocation, database-level pessimistic locking, real-time accrued fare billing, automated analytics, and a cross-platform mobile & web client.
</p>

[Quick Start](#-quick-start-with-docker) • [Native Setup](#-alternative-running-natively-without-docker) • [Architecture](#-key-features--business-rules) • [API Reference](#-api-endpoints-summary) • [Testing](#-automated-testing-suite)

</div>

---

## 🏛️ Repository Architecture

```
SmartPark/
├── backend/                             # Spring Boot 3.3.4 (Java 21) REST Backend
│   ├── .mvn/                            # Maven wrapper files
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/SmartPark/
│   │   │   │   ├── config/              # OpenApiConfig, CorsConfig
│   │   │   │   ├── controller/          # SlotController, BookingController, PaymentController, AnalyticsController
│   │   │   │   ├── dto/                 # BookingRequest, Response DTOs, ErrorResponse
│   │   │   │   ├── entity/              # ParkingSlot, Booking, Payment, Enums
│   │   │   │   ├── exception/           # Custom Exceptions & GlobalExceptionHandler
│   │   │   │   ├── repository/          # JpaRepositories with Pessimistic Locking
│   │   │   │   ├── service/             # FareCalculator, BookingService, SlotService, PaymentService, AnalyticsService
│   │   │   │   └── SmartParkApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/        # Flyway V1 (Schema) and V2 (25 Seed Slots)
│   │   └── test/                        # 38 JUnit 5 + Mockito Unit & Integration Tests
│   ├── Dockerfile                       # Multi-stage Eclipse Temurin JDK 21 build
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── .env.example
├── frontend/                            # React Native with Expo (Web + Android)
│   ├── src/
│   │   ├── api/                         # Axios client & modular API services
│   │   ├── components/                  # Header, SlotCard, BookingCard, StatCard, Button, EmptyState
│   │   ├── constants/                   # Theme (Navy/Blue/Emerald/Crimson Design System)
│   │   ├── navigation/                  # Bottom Tab & Native Stack Navigators
│   │   ├── screens/                     # Dashboard, Slots, Booking, Active, Checkout, Receipt, Analytics
│   │   └── utils/                       # Currency (INR ₹) & Timestamp formatters
│   ├── Dockerfile                       # Production web bundle served via Nginx Alpine
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── .env.example
├── documentation/                       # Comprehensive System Documentation
│   ├── RUN_GUIDE.md                     # Step-by-step Run Guide (Web & Android Studio)
│   ├── SETUP_GUIDE.md                   # Environment & Installation Reference
│   ├── ARCHITECTURE.md                  # Schema, Concurrency Locking, Fare Engine
│   └── API_DOCUMENTATION.md             # REST API specifications & Swagger guides
├── SmartPark_API_Testing_Manual.docx   # Complete Word Document for testing every API
├── docker-compose.yml                   # Orchestration for PostgreSQL 16 + Backend + Frontend
└── README.md
```

---

## ⚡ Key Features & Business Rules

- 🛡️ **Pessimistic Locking & Idempotent Allocation**: Prevents race conditions and double bookings under concurrent check-ins using `@Lock(LockModeType.PESSIMISTIC_WRITE)`.
- 🚫 **Vehicle Exclusivity**: Strict business invariant ensuring a vehicle number cannot hold multiple active parking bookings simultaneously.
- ⏱️ **Accrued Tiered Fare Engine**: Implements strict 3-hour tier calculation:
  $$\text{Fare (INR)} = \left\lceil \frac{\text{duration in seconds}}{10800} \right\rceil \times 50$$
  - *0s duration costs ₹0.*
  - *Any positive parking duration costs ₹50 for the initial 3-hour block, plus ₹50 for each subsequent 3-hour block or fraction thereof.*
- 🔒 **ACID Transaction Boundaries**: Slot release, payment receipt generation, and booking termination occur atomically within `@Transactional` boundaries.
- 🌐 **Standardized UTC Strategy**: All database entities and API serialization enforce ISO-8601 UTC timestamps (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`) to eliminate timezone drift.
- 📈 **Auditable Financial Analytics**: Real-time aggregation of total revenue, occupied capacity, completed checkouts, and active durations.
- 📱 **Modern Cross-Platform UI**: Sleek navy-blue palette, live occupancy status badges, pull-to-refresh feeds, and simulated payment receipt slips.

---

## 🚀 Quick Start with Docker

Run the entire stack (**PostgreSQL 16 + Spring Boot Backend + React Native Web**) with one command:

```bash
docker compose up --build
```

> **Note**: Be sure to use `docker compose up --build` (or `docker-compose up --build`), not `docker build up`.

### 📦 Services Started:
1. **PostgreSQL 16 (`smartpark-db`)**: Runs on host port `5433` (preventing conflicts with any existing local PostgreSQL running on `5432`). Health checks ensure backend waits until DB is ready.
2. **Spring Boot Backend (`smartpark-backend`)**: Runs on port `8080`, executes Flyway migrations automatically, and seeds 25 parking slots.
3. **React Native Frontend (`smartpark-frontend`)**: Built and served via high-performance Nginx on port `3000`.

### 🌐 Access Points
| Service | URL | Notes |
|---|---|---|
| **Web Frontend** | [http://localhost:3000](http://localhost:3000) | Full responsive mobile/desktop web app |
| **Backend REST API** | [http://localhost:8080/api](http://localhost:8080/api) | API Base URL |
| **Interactive Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Live interactive documentation |
| **OpenAPI Schema** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) | JSON OpenAPI schema |
| **PostgreSQL Database** | `localhost:5433` | DB: `smartpark` • User: `smartpark` • Pass: `smartpark_secret` |

---

## 🛠️ Alternative: Running Natively without Docker

If you prefer running services directly on your host machine:

### 1. Database (PostgreSQL)
Start only the database container:
```bash
docker compose up postgres -d
```
*(Or use your own local PostgreSQL instance on port 5432/5433 matching `backend/src/main/resources/application.properties`).*

### 2. Backend (Spring Boot 3.3.4, Java 21)
```bash
cd backend

# (Optional on Windows PowerShell) Set JAVA_HOME if not already in system path:
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"

# Run tests to verify setup:
.\mvnw.cmd test

# Launch backend application:
.\mvnw.cmd spring-boot:run
```

### 3. Frontend (React Native with Expo)
```bash
cd frontend

# Install dependencies:
npm install --legacy-peer-deps

# Launch web app:
npx expo start --web
```
> For **Android Studio Emulator**, the app automatically configures API calls to `http://10.0.2.2:8080/api`.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/slots` | Fetch all 25 parking slots with occupancy info | `200 OK` |
| `GET` | `/api/slots/available` | Filter only currently vacant parking slots | `200 OK` |
| `GET` | `/api/slots/{id}` | Get detailed slot info by ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/bookings` | Create check-in booking (`slotId`, `vehicleNumber`) | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/bookings/active` | List all currently active in-progress bookings | `200 OK` |
| `GET` | `/api/bookings/{id}` | Get booking details with live accrued fare | `200 OK`, `404 Not Found` |
| `POST` | `/api/payments/checkout` | Process checkout and release slot (`bookingId`, `paymentMethod`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/api/analytics/daily` | Get financial metrics for a specific date (`?date=YYYY-MM-DD`) | `200 OK`, `400 Bad Request` |
| `GET` | `/api/analytics/summary` | Get lifetime system performance & revenue summary | `200 OK` |

---

## 🧪 Automated Testing Suite

The backend contains **38 automated unit & integration tests** executed with **100% pass rate**:

```
[INFO] Results:
[INFO] Tests run: 38, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

- **`FareCalculatorTest` (21 tests)**: Boundary assertions across 0s, 1s, 10799s, 10800s, 10801s, 21599s, 21600s, 21601s, null arguments, and inverted timestamps.
- **`BookingServiceTest` (7 tests)**: Concurrency lock isolation, duplicate vehicle conflicts, slot collision handling, and transactional checkout.
- **`SlotServiceTest` (4 tests)**: Slot filtering, occupancy mapping, and 404 validation.
- **`BookingControllerTest` (5 tests)**: MockMvc REST endpoint assertions, JSON payloads, and HTTP error mappings (201, 400, 404, 409).
- **`SmartParkApplicationTests` (1 test)**: Full Spring Boot application context load test.

To execute tests anytime:
```bash
cd backend
.\mvnw.cmd test
```

---

## 📄 Documentation Reference

For more comprehensive guides, check the `documentation/` directory:
- [ANDROID_EMULATOR_GUIDE.md](documentation/ANDROID_EMULATOR_GUIDE.md) — Dedicated Android Emulator execution and debugging guide.
- [RUN_GUIDE.md](documentation/RUN_GUIDE.md) — Complete execution instructions for Web, Docker, and Android Studio.
- [SETUP_GUIDE.md](documentation/SETUP_GUIDE.md) — Detailed software prerequisites and troubleshooting guide.
- [ARCHITECTURE.md](documentation/ARCHITECTURE.md) — Deep dive into DB schema, concurrency locks, and fare calculations.
- [API_DOCUMENTATION.md](documentation/API_DOCUMENTATION.md) — Detailed payloads, headers, and error schema specifications.
- **`SmartPark_API_Testing_Manual.docx`** — Ready-to-copy cURL and PowerShell commands for every endpoint.

---

## 📜 License
This project is licensed under the **Apache License 2.0**.

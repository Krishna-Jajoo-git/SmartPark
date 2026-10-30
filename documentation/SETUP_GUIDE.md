# SmartPark Installation & Setup Guide

This guide details steps to configure, build, test, and run the backend Spring Boot service and the React Native Expo frontend mobile application.

---

## 1. Prerequisites

- **Java Development Kit (JDK)**: Java 21 LTS installed.
- **Node.js**: Node 18+ (Node 20 or 24 recommended) and `npm`.
- **PostgreSQL**: PostgreSQL 15, 16, or 17 (or Docker).

---

## 2. Quick Start: Full Application in Docker (Recommended)

Run the entire stack with a single command from the project root:
```bash
docker compose up --build
```

This automatically orchestrates:
- **Database**: PostgreSQL 16 on internal network (exposed to host at port `5433` to prevent collision with any existing host Postgres).
- **Backend**: Spring Boot 3.3.4 (Java 21) on port `8080`, applying Flyway migrations and seeding 25 parking spaces.
- **Frontend**: React Native Expo Web application served via high-performance Nginx on port `3000`.

### Service URLs:
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **REST API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 3. Alternative: Running Services Natively

### 3.1 Navigate to Backend Directory
```bash
cd backend
```

### 3.2 Run Automated Tests
Execute the full test suite (38 JUnit 5 + Mockito tests covering `FareCalculator`, `BookingService`, `SlotService`, `BookingController`, and `SpringBootTest`):
```bash
# On Windows PowerShell:
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
.\mvnw.cmd test

# On Linux / macOS:
./mvnw test
```

### 3.3 Start Backend Service
```bash
# On Windows PowerShell:
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

The service will:
1. Connect to PostgreSQL.
2. Automatically execute Flyway migrations (`V1__init_schema.sql` and `V2__seed_data.sql`).
3. Seed 25 parking spaces across Ground North, Ground South, and Basement.
4. Start Tomcat HTTP server on port `8080`.

### 3.4 Verify Backend
- Health check: `http://localhost:8080/api/slots`
- Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Schema: `http://localhost:8080/api-docs`

---

## 4. Frontend Setup (React Native with Expo)

### 4.1 Navigate to Frontend Directory
```bash
cd frontend
```

### 4.2 Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4.3 Configure Network Host for Mobile Devices
Open `frontend/src/api/client.js` or configure `EXPO_PUBLIC_API_URL`:

- **Web Browser (Local Testing)**:  
  Default: `http://localhost:8080/api`

- **Android Emulator**:  
  Uses the standard Android loopback bridge: `http://10.0.2.2:8080/api`. The app automatically detects Android and routes to `10.0.2.2`.

- **Physical Android or iOS Device (Expo Go)**:  
  Ensure your phone and PC are connected to the same Wi-Fi network. Find your PC's IP address (`ipconfig` on Windows or `ifconfig` on Linux/macOS, e.g. `192.168.1.100`), then launch:
  ```bash
  $env:EXPO_PUBLIC_API_URL="http://192.168.1.100:8080/api"
  npx expo start
  ```

### 4.4 Launch Expo Application
```bash
# Run web client:
npx expo start --web

# Run on Android emulator:
npx expo start --android

# Run interactive Expo Go QR code server:
npx expo start
```

---

## 5. API Testing Manual (Word Document)

For testing each REST API endpoint with desirable inputs, parameters, and error scenarios, refer to the included Word document:
- **File**: `SmartPark_API_Testing_Manual.docx`
- Contains:
  - Complete endpoint specifications, headers, and HTTP methods.
  - Desirable request payloads (JSON).
  - Expected response samples and status codes.
  - Edge-case validation scenarios (e.g., duplicate booking, already occupied slot, expired booking).
  - Ready-to-copy **cURL** and **PowerShell** commands for instant execution without any external UI.


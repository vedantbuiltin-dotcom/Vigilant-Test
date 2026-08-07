# Vigilant Test - Project Architecture and Analysis Report

## 1. Executive Summary
**Vigilant Test** is an enterprise-grade online examination platform designed for robust assessment management, live monitoring, and detailed performance analytics. It offers a complete end-to-end flow from exam creation, question bank management, student exam attempt tracking, to automated grading and analytics.

The platform is split into two primary applications:
1. **Frontend (online-exam-portal):** A React 18 SPA built with Material-UI (MUI), providing two distinct experiences: an Admin Dashboard and a Student Exam Portal.
2. **Backend (online-exam-api):** A Node.js and Express REST API coupled with Socket.io for real-time bidirectional communication, utilizing a pluggable database architecture (currently configured with an in-memory data store for rapid development).

---

## 2. Technology Stack

### Frontend Architecture
- **Framework:** React 18
- **Styling & Components:** Material-UI (MUI) v5
- **Routing:** React Router DOM v6
- **State Management:** React Context API (AuthContext)
- **Real-time Communication:** Socket.io-client
- **HTTP Client:** Axios
- **Data Parsing:** PapaParse (for CSV bulk imports)

### Backend Architecture
- **Runtime:** Node.js v18+
- **Web Framework:** Express.js
- **Real-time Engine:** Socket.io
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **Database:** Pluggable Architecture (Supports MongoDB, PostgreSQL, MSSQL, and In-Memory JSON store).
- **Security:** Helmet, CORS, standard Express security practices.

---

## 3. Core Features & Functional Modules

### 3.1 Administrator Capabilities
1. **Exam Management (`ExamManagement.js` & `ExamFormDrawer.js`):**
   - Create, draft, and publish exams.
   - Configure duration, passing scores, and examination windows (start/end dates).
   - Assign exams to specific student batches.
2. **Global Question Bank (`QuestionBank.js`):**
   - Manage a centralized repository of questions categorized by topic and difficulty.
   - Support for bulk importing questions via CSV using PapaParse.
3. **Student & Batch Management (`Roster.js`):**
   - Register students and group them into logical "Batches" (e.g., Morning Batch, IT Department).
4. **Live Proctoring & Monitoring (`LiveMonitor.js`):**
   - Real-time dashboard powered by WebSockets to monitor active student sessions.
   - Tracks current question progress, time remaining, and system flags (e.g., Tab switching detected).
   - Features a global broadcast messaging system to communicate with active students.
5. **Results & Analytics (`Results.js`):**
   - View aggregated scores, completion rates, and individual student submissions.
6. **Audit Logging (`AuditLog.js`):**
   - Tracks all critical administrative actions (Exam Creation, Student Deletion, Force Submits) in a persistent log for compliance and security monitoring.

### 3.2 Student Experience
1. **Secure Exam Portal (`ExamPage.js`):**
   - A distraction-free, locked-down testing environment.
   - **Anti-Cheat Mechanisms:** Visibility API integration detects when a student switches browser tabs or minimizes the window. This triggers a "Flag Event" sent in real-time to the Admin Live Monitor via WebSockets.
2. **Real-time Progress & Sync:**
   - Client-side countdown timers synced with server-issued time extensions.
   - Automatic background submission of answers to prevent data loss.
   - Support for force-submission commands triggered remotely by administrators.

---

## 4. Backend Architectural Flow

### 4.1 Request Lifecycle
1. **Client Request:** Frontend (Axios) sends HTTP request to Express API.
2. **Middleware Layer:** 
   - Requests are authenticated via `requireAuth` middleware using JWT validation.
   - Role-based access control enforces `admin` vs `student` privileges.
3. **Controller Layer:** Handlers (e.g., `examController.js`, `adminController.js`) process the business logic.
4. **Service Layer:** Encapsulates core business rules (e.g., `examService.js`, `authService.js`).
5. **Repository Layer:** Abstracted data access (e.g., `userRepository.js`). The active driver (Memory store via `store.js` and `data.json`) executes the CRUD operations.

### 4.2 WebSocket Integration (`socketHandler.js`)
The `socketHandler` acts as a crucial bridging component for real-time functionality.
- **Namespaces & Rooms:** Students join rooms named `exam_{examId}`.
- **Emissions:**
  - `join_exam`: Registers the student's active attempt.
  - `flag_event`: Reports suspicious behavior (tab switching).
  - `extend_time`: Admin command pushing extra time to specific or all students.
  - `force_submit`: Admin command forcing a student's client to finalize and submit their exam.
  - `broadcast`: Pushes global announcements to students.

---

## 5. Security & Best Practices Implemented
- **Data Encapsulation:** Strict separation between Controller, Service, and Repository layers.
- **Environment Driven:** Configuration driven by `.env` variables ensuring safe credential management.
- **Audit Logging:** Administrative traceability implemented via `auditLogger.js`.
- **Authorization Scopes:** APIs explicitly validate `req.user.role` to prevent privilege escalation.

## 6. Conclusion
Vigilant Test is a resilient, horizontally scalable platform. By leveraging a pluggable repository pattern, it is highly modular and ready for production deployment (e.g., swapping the memory driver for MongoDB Atlas) while retaining a rich, responsive user experience driven by React and WebSockets.

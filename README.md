# Vigilant Test - Online Exam Portal

A full-stack, enterprise-grade online examination platform designed for robust assessment management, live monitoring, and detailed performance analytics.

## 🚀 Features

### For Administrators
* **Advanced Dashboard:** Real-time metrics including active exams, pending grading, and system alerts.
* **Exam Management:** Create, schedule, and publish exams with customizable parameters (duration, passing scores, auto-submit rules).
* **Global Question Bank:** 
  * Rich library of reusable questions across various topics and difficulties.
  * Seamless **Bulk Import** functionality using CSV or Excel files.
* **Live Proctoring & Monitoring:** Monitor active exam sessions in real-time. Automatically flag suspicious activities.
* **Results & Analytics:** Detailed per-student report cards, grading queues, and CSV/PDF export options.
* **Audit Logging:** Comprehensive tracking of all administrative actions for security and compliance.

### For Students (Examinees)
* **Intuitive Exam Interface:** Distraction-free test-taking environment.
* **Real-time Synchronization:** Auto-saving of progress to prevent data loss.

## 🛠 Technology Stack

### Frontend (`/online-exam-portal`)
* **React 18** for dynamic UI rendering.
* **Material-UI (MUI)** for a polished, responsive, and accessible component system.
* **PapaParse** for lightning-fast client-side CSV processing.
* **Axios** for API communication.

### Backend (`/online-exam-api`)
* **Node.js & Express** providing a secure RESTful API.
* **Pluggable Database Architecture:**
  * **MongoDB:** Fully integrated MongoDB Atlas driver for production deployments.
  * **Memory:** In-memory store for instant zero-configuration local development.
  * *(Also supports Postgres and MSSQL drivers)*
* **Authentication:** Secure JWT-based auth with bcrypt password hashing.

---

## 💻 Getting Started

### Prerequisites
* Node.js (v18.0.0 or higher)
* npm or yarn
* (Optional) A MongoDB Atlas Cluster for production deployment.

### 1. Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
# Install backend dependencies
cd online-exam-api
npm install

# Install frontend dependencies
cd ../online-exam-portal
npm install
```

### 2. Configuration (Backend)
Navigate to the backend directory and set up your environment variables:

```bash
cd online-exam-api
cp .env.example .env
```

**Database Setup (`.env`)**
By default, the backend is configured to run entirely in-memory for easy testing:
```env
REPOSITORY_DRIVER=memory
```

**To use MongoDB:**
1. Change `REPOSITORY_DRIVER` to `mongodb`
2. Add your MongoDB Atlas connection string:
```env
REPOSITORY_DRIVER=mongodb
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```
*(Make sure your IP Address is whitelisted in your MongoDB Atlas Network Access settings!)*

### 3. Running the Application

You will need two terminal windows to run both the frontend and backend simultaneously.

**Terminal 1: Start the Backend API**
```bash
cd online-exam-api
npm run dev
```
*The API will start on `http://localhost:8081`.*
*Note: If `SEED_ON_BOOT` is enabled in your `.env`, it will automatically create demo student and admin accounts.*

**Terminal 2: Start the Frontend Portal**
```bash
cd online-exam-portal
npm start
```
*The portal will open in your browser at `http://localhost:3000`.*

---

## 🧪 Default Test Accounts
If the database is freshly seeded, you can use the following credentials to test the platform:

**Administrator**
* Email: `admin@example.com`
* Password: `Admin@12345`

**Student**
* Email: `student@example.com`
* Password: `Student@12345`

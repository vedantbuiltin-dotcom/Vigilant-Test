<div align="center">

# 🛡️ Vigilant Test

### Enterprise-Grade Online Examination Platform

*Robust assessment management, live proctoring, and deep performance analytics — all in one place.*

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20MUI-f59e0b?style=for-the-badge&logo=react&logoColor=white)](#)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-10b981?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Postgres%20%7C%20MSSQL-334155?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-f59e0b?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](#)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration-backend)
- [Running the Application](#-running-the-application)
- [Default Test Accounts](#-default-test-accounts)
- [Project Structure](#-project-structure)

---

## 🧭 About

**Vigilant Test** is a full-stack, enterprise-grade online examination platform built for robust assessment management, live monitoring, and detailed performance analytics — from question bank to grading queue, all under one roof.

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🧑‍💼 For Administrators

**📊 Advanced Dashboard**
Real-time metrics — active exams, pending grading, system alerts.

**📝 Exam Management**
Create, schedule, and publish exams with customizable parameters (duration, passing scores, auto-submit rules).

**📚 Global Question Bank**
- Rich, reusable library across topics and difficulties
- Seamless **bulk import** via CSV or Excel

**🔴 Live Proctoring & Monitoring**
Watch active exam sessions in real time and auto-flag suspicious activity.

**📈 Results & Analytics**
Per-student report cards, grading queues, CSV/PDF export.

**🔍 Audit Logging**
Full tracking of admin actions for security and compliance.

</td>
<td width="50%" valign="top">

### 🎓 For Students (Examinees)

**🎯 Intuitive Exam Interface**
A clean, distraction-free test-taking environment.

**💾 Real-time Synchronization**
Progress auto-saves continuously to prevent data loss.

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<div align="center">

| Layer | Location | Technology |
|:-----:|:--------:|:-----------|
| 🎨 **Frontend** | `/online-exam-portal` | React 18 · Material-UI (MUI) · PapaParse · Axios |
| ⚙️ **Backend** | `/online-exam-api` | Node.js · Express · JWT + bcrypt |
| 🗄️ **Database** | Pluggable | MongoDB Atlas · In-memory (dev) · Postgres · MSSQL |

</div>

> **Pluggable database architecture** — spin up instantly with the zero-config in-memory store, or point straight at MongoDB Atlas for production.

---

## 💻 Getting Started

### Prerequisites

- Node.js `v18.0.0` or higher
- npm or yarn
- *(Optional)* A MongoDB Atlas cluster for production deployment

### 1️⃣ Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
# Install backend dependencies
cd online-exam-api
npm install

# Install frontend dependencies
cd ../online-exam-portal
npm install
```

---

## ⚙️ Configuration (Backend)

Navigate to the backend directory and set up your environment variables:

```bash
cd online-exam-api
cp .env.example .env
```

**Default — in-memory (zero config, great for testing):**

```env
REPOSITORY_DRIVER=memory
```

**To use MongoDB instead:**

1. Set `REPOSITORY_DRIVER` to `mongodb`
2. Add your MongoDB Atlas connection string:

```env
REPOSITORY_DRIVER=mongodb
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

> ⚠️ Make sure your IP address is whitelisted in your MongoDB Atlas **Network Access** settings!

---

## ▶️ Running the Application

You'll need two terminal windows — one for the backend, one for the frontend.

<table>
<tr>
<td width="50%">

**Terminal 1 — Backend API**
```bash
cd online-exam-api
npm run dev
```
📍 Runs on `http://localhost:8081`

*If `SEED_ON_BOOT` is enabled, demo student and admin accounts are created automatically.*

</td>
<td width="50%">

**Terminal 2 — Frontend Portal**
```bash
cd online-exam-portal
npm start
```
📍 Opens at `http://localhost:3000`

</td>
</tr>
</table>

---

## 🧪 Default Test Accounts

If the database is freshly seeded, use these credentials to test the platform:

<div align="center">

| Role | Email | Password |
|:----:|:------|:---------|
| 🧑‍💼 **Administrator** | `admin@example.com` | `Admin@12345` |
| 🎓 **Student** | `student@example.com` | `Student@12345` |

</div>

---

## 📁 Project Structure

```
vigilant-test/
├── online-exam-portal/     # React 18 + MUI frontend
│   ├── src/
│   └── package.json
├── online-exam-api/        # Node.js + Express backend
│   ├── src/
│   ├── .env.example
│   └── package.json
└── README.md
```

---

<div align="center">

**Assessment, monitored end to end.**

⭐ Star this repo if Vigilant Test made exam management easier!

</div>

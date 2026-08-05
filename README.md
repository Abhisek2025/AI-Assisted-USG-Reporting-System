# Apex USG Diagnostic & Radiology Workspace

An enterprise-grade Ultrasound (USG) Diagnostic Center & Radiology Reporting System built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **PostgreSQL** (Drizzle ORM), **Firebase Firestore**, and **Google Gemini AI**.

---

## 🌟 Key Features

- **Multi-Role Workspace**: Tailored views for Radiologists, Sonographers, Administrators, and Patients.
- **USG Study Management**: DICOM/USG image viewer, measurement annotation tools, and study status workflow (`SCHEDULED` ➔ `IN_PROGRESS` ➔ `AI_PROCESSING` ➔ `REPORT_DRAFT` ➔ `APPROVED`).
- **AI-Powered Radiology Analysis**: Integration with Google Gemini AI for automated preliminary radiological findings, anomaly detection, and draft impression generation.
- **Dual Data Persistence**:
  - **Firebase Firestore**: High-speed, real-time sync for patient queues, study statuses, and appointments.
  - **PostgreSQL**: Relational schema for audit logging, structured reporting metrics, user accounts, and billing metadata.
- **Real-Time WebSockets**: Live event broadcasting for urgent study alerts, status changes, and notifications.
- **PDF Report Generation**: Professional medical report exporter with print and download capability.
- **Analytics & Dashboard**: Interactive visual stats (study distributions, turnaround times, radiologist workload).

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express, WebSockets (`ws`)
- **Databases**: PostgreSQL (Drizzle ORM), Firebase Firestore
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite & esbuild

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14 or higher) or a cloud PostgreSQL database (e.g. Supabase, Neon, AWS RDS)
- **Firebase Project** (Firestore & Auth enabled)

---

## ⚙️ Step-by-Step Local Setup

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/your-username/apex-diagnostic-system.git
cd apex-diagnostic-system
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your local credentials:

```env
# Server Port
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Required for AI Medical Analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web API Key
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# PostgreSQL Database Connection
# Option A: Full Connection String
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/apex_diagnostic_db

# Option B: Individual Parameters
SQL_HOST=localhost
SQL_PORT=5432
SQL_USER=postgres
SQL_PASSWORD=your_password
SQL_DB_NAME=apex_diagnostic_db
```

### 3. Initialize the PostgreSQL Database

1. Start your local PostgreSQL server and create the database:

```sql
CREATE DATABASE apex_diagnostic_db;
```

2. Run the database initialization schema script:

```bash
psql -U postgres -d apex_diagnostic_db -f backend/database/schema.sql
```

*(Alternatively, you can run `npx drizzle-kit push` if using Drizzle ORM migrations)*

### 4. Configure Firebase Credentials

Ensure `firebase-applet-config.json` in the root directory contains your Firebase project configuration:

```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "firestoreDatabaseId": "(default)"
}
```

---

## 🚀 Running the Application

### Development Mode (Full Stack)

To launch the dev server with hot reload for both frontend and Express backend on port `3000`:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Run

To compile and launch the production build:

```bash
# 1. Build client static files and server bundle
npm run build

# 2. Start the production Node server
npm start
```

---

## 📁 Project Structure (Client & Server Separation)

The project is structured into clear **Client** (Frontend) and **Server** (Backend) directories for easy maintenance, local development, and deployment:

```
apex-diagnostic-system/
├── src/                          # 💻 CLIENT (React Frontend)
│   ├── components/               # UI Components (Navbar, Sidebar, Viewer, Forms)
│   ├── context/                  # React Contexts (Auth, Socket)
│   ├── pages/                    # Page Views (Dashboard, Patients, Reports, AI)
│   ├── services/                 # Axios Client API Services
│   ├── utils/                    # Frontend helpers and formats
│   ├── App.jsx                   # Main Client App Router
│   ├── index.css                 # Tailwind CSS Styles
│   └── main.tsx                  # Client Entry Point
│
├── backend/                      # ⚙️ SERVER (Node.js / Express Backend)
│   └── src/
│       ├── app.js                # Modular Express App Routes & Middlewares
│       ├── config/               # Database connectors (MySQL & Firebase)
│       ├── controllers/          # Business logic controllers
│       ├── middlewares/          # Authentication & file uploads
│       ├── routes/               # Express API Routes (/api/auth, /api/reports...)
│       ├── services/             # Firestore, MySQL & Gemini AI services
│       ├── utils/                # Audit logs & PDF generation
│       └── realtime.js           # Socket.IO & Realtime SSE server
│
├── api/                          # ⚡ VERCEL Serverless Entrypoint
│   └── index.js                  # Exports Express app as Vercel Function
│
├── vercel.json                   # Vercel Serverless & Routing Config
├── railway.json                  # Railway.app Nixpacks Config
├── Procfile                      # Heroku / Railway Process File
├── server.js                     # 🚀 Standalone Express Server & Vite Bridge
├── package.json                  # Root dependencies & scripts
└── .env.example                  # Environment configuration template
```

---

## 🚀 Deployment Guides

### Option 1: Vercel Deployment (Serverless Full-Stack)

The project includes built-in Vercel configuration (`vercel.json` and `api/index.js`):

1. **Import Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Import your GitHub repository.
2. **Framework Preset**:
   - Vercel automatically detects Vite (`Vite` framework preset).
3. **Build & Output Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - Add your environment variables in Vercel settings:
     - `GEMINI_API_KEY`: your Gemini API key
     - `JWT_SECRET`: secret key for authorization tokens
     - `FIREBASE_*`: Firebase configuration credentials
5. **Click Deploy**: Vercel will serve the React SPA directly from edge CDN and convert the `/api/*` Express routes into serverless functions via `api/index.js`.

---

### Option 2: Railway Deployment (Containerized Server)

1. **Import Repository to Railway**:
   - Go to [railway.app](https://railway.app) -> **New Project** -> Deploy from GitHub repo.
2. **Configuration**:
   - Railway reads `railway.json` and `Procfile` automatically.
3. **Environment Variables**:
   - Add `PORT=3000` or let Railway assign it dynamically.
   - Set `NODE_ENV=production`.
   - Add your database and AI API keys.

---

### Option 3: Render or Docker / Cloud Run

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm run start`
3. **Port**: Set `PORT` (defaults to 3000).
   - Add environment variable `VITE_API_BASE_URL=https://your-backend-api.onrender.com`.

---

## 🧪 Testing & Code Quality

Run the linter to verify TypeScript types and syntax:

```bash
npm run lint
```
# 📸 Project Overview

Explore the key modules and interfaces of the **AI-Assisted USG Reporting System**.

| 🏠 Home Dashboard | 👨‍⚕️ Patient Management |
|------------------|-------------------------|
| <img src="https://github.com/user-attachments/assets/98462944-e73c-4525-92be-af116e29ba8f" width="100%"> | <img src="https://github.com/user-attachments/assets/0a74040b-6936-40cf-b71c-6700e3c838dd" width="100%"> |

| 📄 Report Management | 🖼️ USG Image Upload |
|----------------------|---------------------|
| <img src="https://github.com/user-attachments/assets/7dfc6de6-18ad-4f4c-b4d6-e8a0cdafc64b" width="100%"> | <img src="https://github.com/user-attachments/assets/c246ea10-a203-463c-9d35-b40be30f39d6" width="100%"> |

| 📊 Reports Dashboard | 📋 Report History |
|---------------------|-------------------|
| <img src="https://github.com/user-attachments/assets/f7236b8e-ea80-460d-b609-a0875fc0ab04" width="100%"> | <img src="https://github.com/user-attachments/assets/79f25f84-dc64-4b28-b02e-c994bd74f29c" width="100%"> |

---

# 🔐 Admin Dashboard

Manage users, monitor reports, and oversee the complete workflow from a centralized administrative panel.

<p align="center">
<img src="https://github.com/user-attachments/assets/855842c9-4f47-4003-8609-711d07a6cf12" width="95%">
</p>

---

# 🔥 Firebase Integration

Secure cloud storage, authentication, and real-time data synchronization powered by Firebase.

<p align="center">
<img src="https://github.com/user-attachments/assets/278be9de-6988-4602-8b02-8e1c10b2c218" width="95%">
</p>

---

# 🤖 AI Analysis Report

Automatically generate intelligent ultrasound report suggestions using Google Gemini AI.

<p align="center">
<img src="https://github.com/user-attachments/assets/50e63b88-9b0f-4365-8ba7-944c4154c583" width="95%">
</p>

---

## ✨ Key Highlights

- 🧠 AI-Assisted Ultrasound Report Generation
- 👨‍⚕️ Patient & Radiologist Management
- 📤 USG Image Upload & Analysis
- 📋 Report Generation & History
- 🔐 JWT Authentication & Role-Based Access
- 🔥 Firebase Cloud Integration
- 📊 Interactive Admin Dashboard
- 📱 Responsive UI with React & Tailwind CSS
- ⚡ RESTful APIs using Node.js & Express.js
- 🗄️ MySQL Database Integration










---

## 📄 License

This project is licensed under the MIT License.

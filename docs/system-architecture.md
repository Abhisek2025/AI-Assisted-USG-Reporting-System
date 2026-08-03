# AI-Assisted USG Reporting System — System Architecture Specification

## Executive Overview
The **AI-Assisted Ultrasound (USG) Reporting System** is a enterprise-grade diagnostic reporting platform engineered for diagnostic centers and hospital radiology departments. The platform accelerates ultrasound workflows by automatically processing uploaded USG imagery through an AI microservice to synthesize draft findings, while keeping the radiologist strictly in the loop for review, modification, approval, and final PDF report generation.

---

## 1. High-Level System Architecture

```
                                  +---------------------------------------+
                                  |         React Single Page App         |
                                  |      (Web Browser / Mobile Tab)       |
                                  +-------------------+-------------------+
                                                      |
                                          HTTP / REST | Socket.IO (Real-time)
                                                      v
                                  +-------------------+-------------------+
                                  |     Express.js API Gateway Backend    |
                                  |    (Auth, RBAC, Worklists, Reports)   |
                                  +---------+-----------------+-----------+
                                            |                 |
                         MySQL SQL Queries  |                 | HTTP REST API
                                            v                 v
                 +--------------------------+----+   +--------+------------------+
                 |    MySQL Primary Database     |   |   Python FastAPI Service  |
                 |  (ACID, Foreign Keys, RBAC)   |   |   (OpenCV/PyTorch AI)     |
                 +-------------------------------+   +---------------------------+
```

---

## 2. Directory & Component Structure

```
ai-assisted-usg-system/
├── backend/
│   ├── src/
│   │   ├── config/              # DB, JWT, AWS S3, Socket.IO configs
│   │   ├── controllers/         # Auth, Patient, Study, Report, AI, Admin controllers
│   │   ├── middlewares/         # JWT Auth, RBAC, Error Handler, Upload middleware
│   │   ├── models/              # Data Access Layer / MySQL Query Repositories
│   │   ├── routes/              # Express Router definitions
│   │   ├── services/            # Business logic (AI Client, PDF Generator, Email)
│   │   ├── utils/               # UHID Generator, Logger, Response Formatter
│   │   └── validators/          # Express Validator schemas
│   ├── database/
│   │   └── schema.sql           # Production MySQL Schema DDL script
│   ├── uploads/                 # Local image staging storage
│   ├── app.js                   # Express app setup & middleware pipeline
│   ├── server.js                 # Entry point with Socket.IO HTTP server binding
│   └── package.json
├── ai-service/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── routes/              # /ai/analyze-image & /ai/analyze-study
│   │   ├── services/            # Computer vision & inference pipelines
│   │   ├── models/              # ML model loading / PyTorch/TensorFlow wrappers
│   │   └── schemas/             # Pydantic request & response schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/              # Logos, default avatars, icons
│   │   ├── components/          # Reusable UI (Viewer, Table, Modal, Toast)
│   │   ├── context/             # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/               # Custom React hooks (useAuth, useSocket, useStudy)
│   │   ├── layouts/             # AppLayout, AuthLayout, WorklistLayout
│   │   ├── pages/               # Login, Dashboard, Patients, Workspace, Reports
│   │   ├── routes/              # Protected & Role-based React Routes
│   │   ├── services/            # Axios API client modules
│   │   └── utils/               # Date formatters, Status color mappings
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

---

## 3. Core Workflow & Security Protocols

### A. Role-Based Access Control (RBAC) Matrix
| Module / Action | Admin | Receptionist / Technician | Radiologist |
| :--- | :---: | :---: | :---: |
| User & System Admin | ✅ | ❌ | ❌ |
| Register / Edit Patient | ✅ | ✅ | 👁️ (Read Only) |
| Create Study & Upload Images | ✅ | ✅ | 👁️ (Read Only) |
| Trigger AI Microservice | ✅ | ✅ (Automatic) | ✅ |
| Access Radiologist Workspace | 👁️ (Read Only) | ❌ | ✅ |
| Edit Findings & Accept AI Draft | ❌ | ❌ | ✅ |
| Approve Medical Report & Generate PDF | ❌ | ❌ | ✅ |
| Audit Logs & System Analytics | ✅ | ❌ | ❌ |

### B. Human-in-the-Loop AI Assurance
1. **Assistive Nature**: AI findings are created with status `AI_COMPLETED` and findings status `PENDING`.
2. **Acceptance Tracking**: Radiologist explicitly marks each finding as `ACCEPTED`, `MODIFIED`, or `REJECTED`.
3. **Mandatory Disclaimer**: Every draft screen and final report includes: *"AI-generated draft — not a final diagnosis. Radiologist review required."*
4. **Approval Shield**: Reports CANNOT transition to `APPROVED` without digital verification by an authorized radiologist.

---

## 4. Deployment Architecture

```
[ Frontend: React SPA ] ---> CloudFront / AWS S3
[ Backend API: Express ] ---> Containerized on AWS ECS / Docker
[ AI Microservice ]    ---> Containerized PyTorch/FastAPI Service
[ Database ]           ---> AWS RDS MySQL 8.0 Engine with multi-AZ replication
```

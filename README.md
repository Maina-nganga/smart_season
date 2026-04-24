 SMARTSEASON

> A full-stack agricultural field monitoring platform for tracking crop progress across multiple fields during a growing season.

Built with **Flask** 
· **React** 
· **MySQL** 
· Deployed via **Docker**

---

## Contents

- [Demo Credentials](#demo-credentials)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Docker Setup](#docker-setup)
- [API Reference](#api-reference)
- [Status Logic](#status-logic)
- [Design Decisions](#design-decisions)
- [Assumptions & Scope](#assumptions--scope)

---

## Demo Credentials

| Role        | Email                     | Password    |
|-------------|---------------------------|-------------|
| Admin       | admin@smartseason.com     | `password123`  |
| Field Agent | james@smartseason.com     | `password123`  |
| Field Agent | amina@smartseason.com     | `password123`  |
| Field Agent | peter@smartseason.com     | `password123`  |

---

## Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Backend    | Flask 3, Flask-SQLAlchemy, Flask-JWT-Extended       |
| Database   | MySQL 8 via PyMySQL                                 |
| Auth       | JWT (access + refresh tokens), Flask-Bcrypt         |
| Frontend   | React 18, Vite, React Router v6                     |
| Charts     | Recharts                                            |
| HTTP       | Axios with auto-refresh interceptor                 |
| Styling    | CSS custom properties (design token system)         |
| Toasts     | react-hot-toast                                     |
| Deployment | Docker, Docker Compose, Nginx                       |

---

## Project Structure

```
smartseason/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py           
│   │   │   ├── field.py          
│   │   │   └── note.py          
│   │   ├── routes/
│   │   │   ├── auth.py           
│   │   │   ├── fields.py         
│   │   │   ├── notes.py          
│   │   │   ├── users.py         
│   │   │   └── dashboard.py     
│   │   ├── utils/
│   │   │   ├── auth.py          
│   │   │   └── responses.py      
│   │   └── __init__.py           
│   ├── migrations/
│   ├── config.py
│   ├── run.py                    
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              
│   │   │   ├── common/         
│   │   │   ├── fields/         
│   │   │   └── layout/           
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx      
│   │   │   └── useFields.js     
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FieldsPage.jsx
│   │   │   └── AgentsPage.jsx
│   │   ├── services/
│   │   │   └── api.js         
│   │   ├── styles/
│   │   │   └── globals.css       
│   │   └── utils/
│   │       └── helpers.js        
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- MySQL 8 running locally

### 1. Backend

```bash
cd smartseason/backend

1. Create and activate virtual environment:
python -m venv venv
source venv/bin/activate       

2. Install dependencies:
pip install -r requirements.txt

3.Configure environment variables:
cp .env.example .env

4. Create the database:
mysql -u root -p -e "CREATE DATABASE smartseason CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

5. Run migrations:
flask db init
flask db migrate -m "initial"
flask db upgrade

6. Seed demo data
flask seed

7. Start dev server
python run.py
```

Backend runs at `http://localhost:5000`

### 2. Frontend

```bash
cd smartseason/frontend

1. Install dependencies:
npm install

2. Configure environment:
cp .env.example .env


3 Start dev server
npm run dev


Frontend runs at `http://localhost:5173`


 Docker Setup

```bash
 From the project root
docker-compose up --build
```

The first run seeds the database automatically.

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:3000            |
| Backend  | http://localhost:5000            |
| Health   | http://localhost:5000/api/health |

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint       | Access | Description             |
|--------|----------------|--------|-------------------------|
| POST   | /auth/login    | Public | Login, returns JWT pair |
| POST   | /auth/refresh  | Public | Refresh access token    |
| GET    | /auth/me       | Auth   | Get current user        |
| PUT    | /auth/me       | Auth   | Update profile/password |
| POST   | /auth/logout   | Auth   | Logout (stateless)      |

### Fields

| Method | Endpoint           | Access     | Description          |
|--------|--------------------|------------|----------------------|
| GET    | /fields            | Auth       | List fields (scoped) |
| POST   | /fields            | Admin      | Create field         |
| GET    | /fields/:id        | Auth+Scope | Get field detail     |
| PUT    | /fields/:id        | Admin      | Update field         |
| PATCH  | /fields/:id/stage  | Auth+Scope | Update stage only    |
| DELETE | /fields/:id        | Admin      | Soft-delete field    |

### Notes

| Method | Endpoint                | Access     | Description |
|--------|-------------------------|------------|-------------|
| GET    | /notes/fields/:id/notes | Auth+Scope | List notes  |
| POST   | /notes/fields/:id/notes | Auth+Scope | Add note    |
| DELETE | /notes/notes/:id        | Auth       | Delete note |

### Users / Agents

| Method | Endpoint      | Access | Description     |
|--------|---------------|--------|-----------------|
| GET    | /users        | Admin  | List all users  |
| GET    | /users/agents | Auth   | List agents     |
| POST   | /users        | Admin  | Create user     |
| PUT    | /users/:id    | Admin  | Update user     |
| DELETE | /users/:id    | Admin  | Deactivate user |

### Dashboard

| Method | Endpoint         | Access | Description          |
|--------|------------------|--------|----------------------|
| GET    | /dashboard/admin | Admin  | Full season overview |
| GET    | /dashboard/agent | Auth   | Personal dashboard   |

---

## Status Logic

Each field has a computed **status** derived from its current data. Status is evaluated at query time as a Python property and returned with every field response.

```
Completed  →  stage == "Harvested"

At Risk    →  ANY of the following:
              • A note contains a risk keyword
                (drought, pest, infestation, disease, wilting, stunted,
                 fungal, irrigation requested, aphid, locust, yellowing,
                 blight, rot, flood, mold, …)
              • Field is in Planted or Growing stage AND has not been
                updated in 14+ days
              • Field is in Ready stage AND was planted 180+ days ago

Active     →  Everything else
```

**Rationale:**
- The **14-day staleness rule** surfaces fields that agents have stopped monitoring.
- **Keyword detection** flags fields with documented problems in notes.
- The **180-day Ready rule** catches fields stuck in "Ready" that should have been harvested.

---



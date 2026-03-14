# 🚨 Disaster Relief Coordination System

> A full-stack platform for coordinating disaster response — enabling NGOs, volunteers, and agencies to manage affected zones, dispatch resources, track supplies, and monitor relief operations.

---

## 🖥️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express.js     |
| Database  | MySQL 8.0               |
| Auth      | JWT + bcrypt            |
| DevOps    | Docker, Docker Compose  |

---

## 🗃️ Database Highlights

This project showcases **intermediate-to-advanced MySQL** concepts:

| Feature | Implementation |
|---|---|
| **Normalized Schema** | 13 tables, proper foreign keys, ON DELETE rules |
| **Transactions** | Supply transfers use ACID transactions via stored procedures |
| **Stored Procedures** | `dispatch_volunteer()`, `transfer_supplies()` |
| **Triggers** | Auto-deduct inventory after transfer; auto-update volunteer status on dispatch |
| **Views** | `active_disaster_summary`, `zone_resource_status` |
| **JSON Columns** | Volunteer skills stored as JSON array |
| **Indexes** | On status, severity, disaster_id for performance |
| **Audit Log** | Append-only table recording all critical actions |

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended)

```bash
git clone https://github.com/yourusername/disaster-relief-system.git
cd disaster-relief-system
docker-compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

### Option 2 — Manual

**Database**
```bash
mysql -u root -p < backend/db/schema.sql
mysql -u root -p disaster_relief < backend/db/seed.sql
```

**Backend**
```bash
cd backend
cp .env.example .env        # fill in DB credentials + JWT_SECRET
npm install
npm run dev                 # starts on port 5000
```

**Frontend**
```bash
cd frontend
npm install
npm start                   # starts on port 3000
```

---

## 🔐 Demo Credentials

| Role      | Email                  | Password    |
|-----------|------------------------|-------------|
| Admin     | admin@relief.org       | password123 |
| NGO       | ngo@helpfound.org      | password123 |
| Volunteer | rahul@volunteer.in     | password123 |
| Agency    | ops@ndrf.gov.in        | password123 |

---

## 📁 Project Structure

```
disaster-relief-system/
├── backend/
│   ├── db/
│   │   ├── schema.sql          ← Full MySQL schema (tables, triggers, SPs, views)
│   │   └── seed.sql            ← Sample disaster data
│   ├── config/db.js            ← MySQL connection pool
│   ├── middleware/auth.js      ← JWT protect + role-based authorise()
│   ├── controllers/            ← Business logic (6 controllers)
│   ├── routes/                 ← Express routers
│   └── server.js               ← Entry point
├── frontend/
│   └── src/
│       ├── api/index.js        ← All Axios calls in one place
│       ├── context/AuthContext.js
│       ├── components/Layout.js
│       └── pages/              ← Dashboard, Disasters, Volunteers, Supply, etc.
├── docker-compose.yml
└── README.md
```

---

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/disasters
POST   /api/disasters               [admin, agency]
GET    /api/disasters/:id
PATCH  /api/disasters/:id/status    [admin, agency]
GET    /api/disasters/:id/zones
GET    /api/disasters/:id/announcements

POST   /api/zones                   [admin, agency, ngo]
GET    /api/zones/:id
GET    /api/zones/:id/reports
POST   /api/zones/reports

GET    /api/volunteers
GET    /api/volunteers/available
POST   /api/volunteers/dispatch     [admin, agency, ngo]
POST   /api/volunteers/return/:id   [admin, agency, ngo]

GET    /api/supply/warehouses
GET    /api/supply/inventory/:warehouseId
GET    /api/supply/requests
POST   /api/supply/requests
POST   /api/supply/transfers        [admin, agency]
GET    /api/supply/transfers

GET    /api/announcements
POST   /api/announcements           [admin, agency, ngo]

GET    /api/dashboard/stats
```

---

## ✨ Features

- [x] Role-based access control (admin / NGO / volunteer / agency)
- [x] Disaster declaration and lifecycle management
- [x] Affected zone tracking with population data
- [x] Volunteer dispatch via stored procedure (transaction-safe)
- [x] Supply chain: inventory → requests → atomic transfers
- [x] Triggers auto-update inventory and volunteer status
- [x] Real-time dashboard with KPI cards
- [x] Announcement broadcasting per disaster
- [x] Full audit log of all critical actions
- [x] Dockerised for one-command deployment

---

## 📸 Pages

| Page | Description |
|---|---|
| `/` | Operations dashboard with KPI stats and activity feed |
| `/disasters` | All disasters with severity badges; create new |
| `/disasters/:id` | Detail view with zones, announcements, and controls |
| `/volunteers` | Roster with dispatch/return management |
| `/supply` | Inventory, supply requests, and transfer history |
| `/announcements` | Global announcement feed |
| `/audit` | Platform audit trail |

---

## 🤝 Contributing

Pull requests welcome. For major changes, open an issue first.

---

## 📄 License

MIT

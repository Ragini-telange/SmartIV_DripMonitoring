# 🪜 PHASE 3 — Step by Step Guide
# MediFlow Backend Setup

---

## 📁 STEP 1 — Copy these files to your computer

Your folder structure should look like this:

```
mediflow/
└── server/
    ├── server.js              ← main file
    ├── db.js                  ← database connection
    ├── .env                   ← your passwords (secret!)
    ├── package.json           ← dependencies list
    ├── middleware/
    │   └── authMiddleware.js  ← login checker
    └── routes/
        ├── auth.js            ← login routes
        ├── nurses.js          ← nurse management
        ├── patients.js        ← patient management
        ├── alerts.js          ← alert logging
        └── readings.js        ← sensor history
```

---

## ⚙️ STEP 2 — Edit your .env file

Open `server/.env` and change the password:

```
DB_PASSWORD=root123   ← change this to YOUR MySQL password
```

---

## 📦 STEP 3 — Install packages

Open Command Prompt (cmd).
Navigate to your server folder:

```bash
cd C:\Users\YourName\mediflow\server
```

(Change path to wherever you put the folder)

Then run:
```bash
npm install
```

Wait for it to finish. You should see a `node_modules` folder appear.

---

## ▶️ STEP 4 — Start the server

In the same Command Prompt:

```bash
node server.js
```

You should see:
```
✅ MySQL Database Connected Successfully!
========================================
  🏥 MediFlow Server Started!
  📡 URL: http://localhost:3000
========================================
```

If you see an error, check:
- Is MySQL running? (Open MySQL Workbench and check)
- Is your password in .env correct?

---

## 🧪 STEP 5 — Test the server

Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "MediFlow Server is running! ✅"
}
```

✅ If you see this, your server works!

---

## 👤 STEP 6 — Create Admin Account

Open Postman. (Install from https://postman.com/downloads if needed)

### 6a. Open Postman
- Click "New" → "HTTP Request"

### 6b. Create Admin
- Method: POST
- URL: `http://localhost:3000/api/auth/register-admin`
- Click "Body" → select "raw" → select "JSON"
- Paste this:
```json
{
  "name": "Admin",
  "email": "admin@mediflow.com",
  "password": "admin123"
}
```
- Click Send
- You should see: `"Admin account created!"`

### 6c. Test Login
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body → raw → JSON:
```json
{
  "email": "admin@mediflow.com",
  "password": "admin123"
}
```
- Click Send
- You should see a long `"token"` string
- COPY that token — you need it for next steps!

---

## 🏥 STEP 7 — Test Adding a Nurse

In Postman:
- Method: POST
- URL: `http://localhost:3000/api/nurses`
- Headers tab → Add:
  - Key: `Authorization`
  - Value: `Bearer PASTE_YOUR_TOKEN_HERE`
- Body → raw → JSON:
```json
{
  "name": "Sarah Johnson",
  "email": "nurse1@mediflow.com",
  "password": "nurse123",
  "employee_id": "N001",
  "phone": "9876543210",
  "ward": "ICU Ward 3B"
}
```
- Click Send
- Should say: `"Nurse Sarah Johnson added successfully!"`

---

## 🛏️ STEP 8 — Test Adding a Patient

- Method: POST
- URL: `http://localhost:3000/api/patients`
- Same Authorization header
- Body:
```json
{
  "name": "Ramesh Patil",
  "age": 62,
  "bed_number": "3B-01",
  "ward": "ICU",
  "diagnosis": "Post surgery recovery",
  "thingspeak_channel_id": "YOUR_CHANNEL_ID",
  "thingspeak_read_key": "YOUR_READ_KEY"
}
```

---

## ✅ STEP 9 — Verify in MySQL Workbench

Open MySQL Workbench → connect → run:

```sql
USE mediflow;
SELECT * FROM users;
SELECT * FROM nurses;
SELECT * FROM patients;
```

You should see your admin, nurse, and patient in the tables!

---

## 🔥 STEP 10 — Keep server running while building frontend

Leave the Command Prompt window open with server running.
Open a NEW Command Prompt for other things.

Or install nodemon for auto-restart when you edit files:
```bash
npm install -g nodemon
nodemon server.js
```

---

## ❗ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` | MySQL is not running. Open MySQL Workbench and connect first |
| `ER_ACCESS_DENIED` | Wrong password in .env file |
| `Cannot find module` | Run `npm install` again |
| `Port 3000 in use` | Change PORT=3001 in .env |
| `JWT_SECRET not defined` | Check .env file is saved properly |

---

## 📋 All API Endpoints Summary

| Method | URL | Who can use | What it does |
|--------|-----|-------------|--------------|
| POST | /api/auth/login | Everyone | Login |
| GET | /api/auth/me | Logged in | Get my info |
| GET | /api/nurses | Admin | List all nurses |
| POST | /api/nurses | Admin | Add nurse |
| PUT | /api/nurses/:id | Admin | Edit nurse |
| DELETE | /api/nurses/:id | Admin | Delete nurse |
| GET | /api/patients | Admin | All patients |
| GET | /api/patients/mine | Nurse | My patients only |
| GET | /api/patients/:id | Both | One patient |
| POST | /api/patients | Admin | Add patient |
| PUT | /api/patients/:id | Admin | Edit patient |
| PUT | /api/patients/:id/assign | Admin | Assign nurse |
| DELETE | /api/patients/:id | Admin | Delete patient |
| POST | /api/alerts | Both | Save alert |
| GET | /api/alerts | Admin | All alerts |
| GET | /api/alerts/mine | Nurse | My alerts |
| GET | /api/alerts/patient/:id | Both | Patient alerts |
| POST | /api/readings | Both | Save reading |
| GET | /api/readings/patient/:id | Both | Reading history |

---

## ✅ Phase 3 Complete Checklist

- [ ] Files copied to your computer
- [ ] .env password updated
- [ ] npm install done
- [ ] node server.js runs without error
- [ ] /api/health returns success in browser
- [ ] Admin account created via Postman
- [ ] Admin login returns token in Postman
- [ ] Nurse added via Postman
- [ ] Patient added via Postman
- [ ] MySQL Workbench shows data in all tables

When ALL boxes are checked → You are ready for Phase 4 (Frontend)!

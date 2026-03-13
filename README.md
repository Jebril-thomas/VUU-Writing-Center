# VUU Writing Center — Backend

Node.js/Express API server for the VUU Writing Center website.

## Requirements

- Node.js 18 or higher (`node --version`)
- npm 9 or higher

## Quick Start

```bash
# 1. Clone / download the backend folder
cd vuu-backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env with your real values (see Configuration below)

# 4. Run setup check
node src/setup.js

# 5. Start the server
npm start
```

The server starts on **http://localhost:3001** by default.

---

## Configuration (.env)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_ORIGIN` | Yes | Your website URL (for CORS), e.g. `https://writingcenter.vuu.edu` |
| `ADMIN_PASSWORD` | **Yes** | Password for the admin dashboard — make it strong! |
| `EMAIL_HOST` | Yes | SMTP host, e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | Yes | Usually `587` for TLS |
| `EMAIL_SECURE` | No | `true` for port 465, `false` for 587 |
| `EMAIL_USER` | **Yes** | Email address used to send (Gmail recommended) |
| `EMAIL_PASS` | **Yes** | Gmail App Password (not your real password) |
| `STAFF_EMAIL` | Yes | Where staff notification emails go |
| `FROM_NAME` | No | Display name for outbound emails |
| `FROM_EMAIL` | No | From address for outbound emails |
| `UPLOAD_DIR` | No | Where to store uploaded files (default: `./uploads`) |
| `MAX_FILE_SIZE_MB` | No | Max upload size in MB (default: 10) |
| `DB_PATH` | No | SQLite database path (default: `./data/vuu_writing_center.db`) |

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to **Google Account → Security → App Passwords**
3. Create a new App Password for "Mail"
4. Use that 16-character password as `EMAIL_PASS` in `.env`

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/drafts` | Submit a draft (multipart/form-data with `draft_file`) |
| `POST` | `/api/contact` | Send a contact message (JSON) |
| `GET` | `/health` | Health check |
| `GET` | `/admin` | Admin dashboard UI |

### Admin (requires `Authorization: Bearer <ADMIN_PASSWORD>` header)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Submission counts |
| `GET` | `/api/admin/drafts` | List all drafts (`?status=pending` to filter) |
| `GET` | `/api/admin/drafts/:ref` | Single draft detail |
| `PATCH` | `/api/admin/drafts/:ref` | Update status + tutor notes |
| `GET` | `/api/admin/drafts/:ref/file` | Download uploaded file |
| `GET` | `/api/admin/contacts` | List all contact messages |
| `GET` | `/api/admin/contacts/:ref` | Single message (auto-marks read) |
| `PATCH` | `/api/admin/contacts/:ref` | Update status + staff notes |

---

## Draft Submission Fields

`POST /api/drafts` — `multipart/form-data`

| Field | Required | Description |
|---|---|---|
| `student_name` | Yes | Student full name |
| `student_email` | Yes | Student email address |
| `course` | Yes | Course name/number |
| `instructor` | Yes | Instructor name |
| `assignment_type` | Yes | Type of assignment |
| `citation_style` | No | Citation style required |
| `tutor_comments` | No | Student's note for tutor |
| `assignment_prompt` | No | Instructor's assignment prompt |
| `draft_file` | Yes | The draft file (.docx, .pdf, .txt, max 10 MB) |

---

## Contact Form Fields

`POST /api/contact` — `application/json`

| Field | Required |
|---|---|
| `first_name` | Yes |
| `last_name` | Yes |
| `email` | Yes |
| `role` | No |
| `subject` | Yes |
| `message` | Yes |

---

## Deployment (Render / Railway / VPS)

### Render (free tier works)

1. Push this folder to a GitHub repo
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables under **Environment**
6. Copy the deployed URL as `FRONTEND_ORIGIN`

### VPS (Ubuntu/Debian with PM2)

```bash
npm install -g pm2
cd vuu-backend
npm install
cp .env.example .env && nano .env
pm2 start src/server.js --name vuu-backend
pm2 save && pm2 startup
```

Nginx reverse proxy to port 3001, then update `FRONTEND_ORIGIN` and the `API_BASE` variable in `submit-draft.html` and `contact.html`.

---

## Directory Structure

```
vuu-backend/
├── src/
│   ├── server.js          Main Express app
│   ├── db.js              SQLite schema + prepared statements
│   ├── mailer.js          Nodemailer email templates
│   ├── setup.js           One-time setup script
│   └── routes/
│       ├── drafts.js      POST /api/drafts
│       ├── contact.js     POST /api/contact
│       └── admin.js       GET/PATCH /api/admin/*
├── public/
│   └── admin.html         Admin dashboard UI
├── uploads/               Uploaded student files (auto-created)
├── data/                  SQLite database (auto-created)
├── logs/                  Log files (auto-created)
├── .env.example           Config template
└── package.json
```

# VUU Writing Center — Full Stack Application

A production-ready web application for Virginia Union University's Writing Center.
Students submit drafts for tutor review. Staff manage submissions via an admin dashboard.

---

## Project Structure

```
vuu-writing-center/
├── frontend/               ← Static site → deploy to Vercel
│   ├── index.html
│   ├── drafts.html
│   ├── contact.html
│   ├── admin.html
│   ├── vercel.json
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── navbar.js
│       ├── drafts.js
│       ├── contact.js
│       └── admin.js
│
└── backend/                ← Express API → deploy to Render
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── render.yaml
    └── src/
        ├── server.js
        ├── setup.js
        ├── db.js
        ├── mailer.js
        └── routes/
            ├── drafts.js
            ├── contact.js
            └── admin.js
```

---

## Step 1 — Connect Your Backend URL to the Frontend

Before deploying, you need to tell your frontend JavaScript where the backend lives.

In each of these files, find this line near the top:

```js
const API_BASE = window.VUU_API_BASE || 'https://vuu-writing-center-api.onrender.com';
```

**Replace** `https://vuu-writing-center-api.onrender.com` with your actual Render URL.
It will look like: `https://YOUR-SERVICE-NAME.onrender.com`

Files to update:
- `frontend/js/drafts.js`
- `frontend/js/contact.js`
- `frontend/js/admin.js`

---

## BACKEND DEPLOYMENT — Render

### Prerequisites
- A free account at https://render.com
- Your code pushed to a GitHub repository

### Step-by-step

1. **Push backend to GitHub**
   ```bash
   cd vuu-writing-center
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vuu-writing-center.git
   git push -u origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repo
   - Set the **Root Directory** to: `backend`

3. **Configure the service**
   | Setting | Value |
   |---|---|
   | Name | `vuu-writing-center-api` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

4. **Add Environment Variables** (under "Environment" tab):

   | Key | Value |
   |---|---|
   | `ADMIN_PASSWORD` | A secure password you choose |
   | `ADMIN_SECRET` | A random 32+ character string |
   | `FRONTEND_ORIGIN` | Your Vercel URL (add after step below) |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | Your Gmail App Password (see below) |
   | `STAFF_EMAIL` | Email where notifications go |
   | `DB_PATH` | `./data/writing_center.db` |
   | `UPLOADS_PATH` | `./uploads` |

5. **Click "Create Web Service"** and wait for the build to complete.

6. **Copy your Render URL** — it will be something like:
   `https://vuu-writing-center-api.onrender.com`

### Gmail App Password (for email)
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Search for "App Passwords"
4. Generate a new App Password for "Mail"
5. Use that 16-character password as `EMAIL_PASS`

> **Note:** On Render's free tier, the service "spins down" after 15 minutes of inactivity.
> The first request after inactivity may take 30–60 seconds. Upgrade to a paid plan to avoid this.

---

## FRONTEND DEPLOYMENT — Vercel

### Prerequisites
- A free account at https://vercel.com
- GitHub repo from the step above

### Step-by-step

1. **Go to** https://vercel.com/new

2. **Import your GitHub repository**

3. **Configure the project:**
   | Setting | Value |
   |---|---|
   | Framework Preset | `Other` |
   | Root Directory | `frontend` |
   | Build Command | *(leave empty)* |
   | Output Directory | `.` |

4. **Click "Deploy"**

5. **Copy your Vercel URL** (e.g., `https://vuu-writing-center.vercel.app`)

6. **Go back to Render** and update the `FRONTEND_ORIGIN` environment variable with your Vercel URL.
   Then trigger a redeploy on Render (Manual Deploy → Deploy Latest Commit).

---

## LOCAL DEVELOPMENT

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

Backend runs at: http://localhost:4000

### Frontend

Open `frontend/index.html` in a browser using a local server:

```bash
# Using VS Code Live Server extension — right-click index.html → "Open with Live Server"

# Or using Python:
cd frontend
python3 -m http.server 5500

# Or using npx:
npx serve frontend
```

For local dev, the frontend JS files default to looking for the backend at:
`https://vuu-writing-center-api.onrender.com`

Change the `API_BASE` constant in each JS file to `http://localhost:4000` for local testing.

---

## TESTING

### Test Draft Submission

1. Open `http://localhost:5500/drafts.html`
2. Fill in:
   - Name: `Test Student`
   - Email: `test@vuu.edu`
   - Upload any PDF or DOCX file
3. Click **"Submit Draft"**
4. Expected: Green success screen appears
5. Check backend console — you should see: `Draft insert successful`
6. Check your staff email — a notification email should arrive

**Verify in database:**
```bash
cd backend
node -e "const db = require('./src/db').getDb(); console.log(db.prepare('SELECT * FROM drafts').all());"
```

### Test Contact Form

1. Open `http://localhost:5500/contact.html`
2. Fill in all fields
3. Click **"Send Message"**
4. Expected: Green success screen appears
5. Check your staff email for notification

**Verify in database:**
```bash
cd backend
node -e "const db = require('./src/db').getDb(); console.log(db.prepare('SELECT * FROM contacts').all());"
```

### Test Admin Dashboard

1. Open `http://localhost:5500/admin.html`
2. Enter the `ADMIN_PASSWORD` from your `.env` file
3. Expected: Dashboard loads showing stats and tables
4. Check the **Draft Submissions** tab — your test draft should appear
5. Check the **Contact Messages** tab — your test message should appear
6. Click **"Complete"** on any entry — status badge should change to green "completed"
7. Click **"⬇ Download"** on a draft — file should download

**Test wrong password:**
- Enter an incorrect password → should show "Incorrect password." error

**Test file download:**
- Submit a draft with a PDF
- In admin, click "⬇ Download"
- File should download to your computer

---

## API ENDPOINTS

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/drafts` | No | Submit a draft (multipart) |
| `POST` | `/api/contact` | No | Submit contact message |
| `POST` | `/api/admin/login` | No | Get admin token |
| `GET` | `/api/admin/drafts` | Token | List all drafts |
| `PATCH` | `/api/admin/drafts/:id` | Token | Update draft status |
| `GET` | `/api/admin/contact` | Token | List all messages |
| `PATCH` | `/api/admin/contact/:id` | Token | Update message status |
| `GET` | `/api/admin/files/:filename` | Token | Download uploaded file |

---

## SECURITY NOTES

- Admin tokens are stored in `sessionStorage` (cleared when browser tab closes)
- Tokens expire after 8 hours
- All inputs are sanitized and length-limited
- File uploads are restricted to PDF/DOC/DOCX, max 10MB
- Rate limiting: 100 req/15min general, 10 submissions/hour for forms
- CORS restricted to your Vercel frontend origin
- Helmet adds standard security headers
- Timing-safe password comparison prevents timing attacks

---

## EXPANDING LATER

The codebase is intentionally simple. Here are easy expansion points:

- **Add more file types:** Edit the `fileFilter` in `backend/src/routes/drafts.js`
- **Add more form fields:** Add columns to SQLite schema in `setup.js`, update route and HTML
- **Add email to student:** In `drafts.js` route, send a second email to `cleanEmail`
- **Add pagination to admin:** Query `drafts` with `LIMIT` and `OFFSET`
- **Add search/filter:** Add a `WHERE` clause to the admin queries
- **Persistent admin sessions:** Replace in-memory Map with a `sessions` SQLite table

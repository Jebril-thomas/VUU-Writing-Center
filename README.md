# VUU Writing Center — Backend

Node.js / Express API server.  
**Frontend → Vercel · Backend → Render · Database → SQLite on Render disk**

---

## Architecture

```
Browser (Vercel CDN)
  └─ fetch() → https://YOUR-APP.onrender.com
                  ├─ POST /api/drafts       (file upload → DB + email)
                  ├─ POST /api/contact      (JSON → DB + email)
                  └─ /admin                 (admin dashboard SPA)
                         │
                    SQLite DB  +  Gmail SMTP
```

---

## Step 1 — Deploy the backend to Render

### 1a. Push to GitHub

```bash
# From inside the vuu-backend folder
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOUR-ORG/vuu-backend.git
git push -u origin main
```

### 1b. Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Fill in:
   | Field | Value |
   |---|---|
   | **Environment** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or Starter for a persistent disk) |

### 1c. Add a Render Disk (persistent SQLite + uploads)

> Free instances have an ephemeral filesystem — the DB resets on restart.
> For a production writing center, add a Render **Disk**:

1. In your Web Service → **Disks** → Add Disk
2. Set **Mount Path** to `/var/data`
3. Then set these env vars (step 1d) pointing to that path

### 1d. Set Environment Variables on Render

In your Web Service → **Environment** tab, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `FRONTEND_ORIGIN` | `https://your-project.vercel.app` ← fill in after step 2 |
| `ADMIN_PASSWORD` | A strong password of your choice |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | your Gmail **App Password** (see below) |
| `STAFF_EMAIL` | where staff notifications go |
| `FROM_NAME` | `VUU Writing Center` |
| `FROM_EMAIL` | your Gmail address |
| `UPLOAD_DIR` | `/var/data/uploads` (or `/tmp/vuu-uploads` on free tier) |
| `DB_PATH` | `/var/data/vuu.db` (or `/tmp/vuu.db` on free tier) |
| `MAX_FILE_SIZE_MB` | `10` |

**Gmail App Password setup:**
1. Enable 2-Factor Authentication on the Gmail account
2. Go to **myaccount.google.com → Security → App Passwords**
3. Create a password for "Mail" → copy the 16-character code
4. Paste it as `EMAIL_PASS`

### 1e. Note your Render URL

After deploy, your backend is live at:  
`https://YOUR-APP-NAME.onrender.com`

Test it: `curl https://YOUR-APP-NAME.onrender.com/health`

---

## Step 2 — Deploy the frontend to Vercel

### 2a. Set your Render URL in the frontend files

In **both** `submit-draft.html` and `contact.html`, find this line and replace:

```js
// Before:
return 'https://YOUR-APP-NAME.onrender.com';

// After (example):
return 'https://vuu-writing-center-api.onrender.com';
```

Also in `public/admin.html`, the `API` constant auto-detects `window.location.origin`
so the admin panel works out of the box from `https://YOUR-APP-NAME.onrender.com/admin`.

### 2b. Add vercel.json to your frontend folder

Copy the included `vercel.json` into the root of your frontend folder (the folder
containing `index.html`, `about.html`, etc.).

### 2c. Push frontend to GitHub & import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your frontend GitHub repo
3. Framework: **Other** (static site)
4. Root directory: wherever your HTML files live
5. No build command needed — Vercel serves static files directly
6. Deploy

Your frontend is now live at `https://your-project.vercel.app`

### 2d. Update FRONTEND_ORIGIN on Render

Go back to Render → your Web Service → Environment:  
Set `FRONTEND_ORIGIN` = `https://your-project.vercel.app`  
Then **Manual Deploy → Deploy latest commit** to pick up the change.

---

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and email credentials
node src/setup.js    # verifies config, creates directories
npm run dev          # starts with nodemon (auto-restarts on change)
```

Frontend can be served with any static server, e.g.:
```bash
cd ../frontend
npx serve .          # serves on http://localhost:3000
```

The `BACKEND_URL` in the HTML files already falls back to `http://localhost:3001`
when running on localhost — no changes needed for local dev.

---

## Admin Dashboard

Once deployed, visit:  
`https://YOUR-APP-NAME.onrender.com/admin`

Sign in with the `ADMIN_PASSWORD` you set in Render's environment variables.

Features:
- Live stats (pending drafts, unread messages)
- Filter / search draft submissions by status
- View full draft details, download submitted files, add tutor notes, update status
- View contact messages, add staff notes, update status
- One-click "email student / sender" links

---

## API Reference

### Public endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/drafts` | `multipart/form-data` | Submit a draft |
| `POST` | `/api/contact` | `application/json` | Send a contact message |
| `GET` | `/health` | — | Health check |
| `GET` | `/admin` | — | Admin dashboard UI |

### Admin endpoints (require `Authorization: Bearer <ADMIN_PASSWORD>`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Counts by status |
| `GET` | `/api/admin/drafts` | All drafts (`?status=pending`) |
| `GET` | `/api/admin/drafts/:ref` | Single draft |
| `PATCH` | `/api/admin/drafts/:ref` | Update status + notes |
| `GET` | `/api/admin/drafts/:ref/file` | Download submitted file |
| `GET` | `/api/admin/contacts` | All messages |
| `GET` | `/api/admin/contacts/:ref` | Single message |
| `PATCH` | `/api/admin/contacts/:ref` | Update status + notes |

---

## File Structure

```
vuu-backend/
├── src/
│   ├── server.js          Express app, CORS, rate limiting
│   ├── db.js              SQLite schema + queries
│   ├── mailer.js          Email templates (Nodemailer)
│   ├── setup.js           One-time setup check script
│   └── routes/
│       ├── drafts.js      Draft submission handler
│       ├── contact.js     Contact form handler
│       └── admin.js       Admin API (CRUD + file download)
├── public/
│   └── admin.html         Admin dashboard (single-page app)
├── .env.example           Config template
├── .gitignore
├── package.json
└── README.md
```

---

## Upgrading from free tier

| Feature | Free tier | Upgrade path |
|---|---|---|
| **DB persistence** | Resets on restart | Add Render Disk → set `DB_PATH=/var/data/vuu.db` |
| **File persistence** | Resets on restart | Add Render Disk → set `UPLOAD_DIR=/var/data/uploads` |
| **Cold starts** | ~30s spin-up delay | Upgrade to Render Starter ($7/mo) |
| **Large file storage** | Limited | Use AWS S3 + multer-s3 |

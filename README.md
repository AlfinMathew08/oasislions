# Dubai Oasis Lions Club — Lions Year 2026–2027
### Motto: We Serve.

A production-oriented, Apple-inspired website and administrative management portal built for **Dubai Oasis Lions Club**.

---

## 1. Project Overview & Architecture
- **Motto**: *We Serve.*
- **Lions Year**: 2026–2027
- **Aesthetic**: Premium Apple-inspired refinement, glassmorphism, refined typography, and the official Lions International Blue and Gold color palette.
- **Dual Logo Mandate**:
  1. Official Lions International logo on the **LEFT**.
  2. Dubai Oasis Lions Club on the **RIGHT**.

---

## 2. Technology Stack
- **Frontend**: Plain HTML5, CSS3, Vanilla Modern JavaScript (ES Modules). No React/Next/Vue framework overhead.
- **Backend / Database**: Supabase PostgreSQL.
- **Authentication**: Supabase Auth (Email & Password).
- **Security**: PostgreSQL Row Level Security (RLS) on all tables; zero anonymous exposure of drafts, private enquiries, or credentials.
- **Storage**: Supabase Storage (`club-media` bucket).

---

## 3. Directory Structure
```text
~/Desktop/LIONS/
├── index.html                   # 11-section homepage with required order
├── about.html                   # Mission, vision, Lions affiliation
├── projects.html                # Searchable service projects directory
├── project-detail.html          # Individual project deep-dive
├── leadership.html              # Year 2026–27 office bearers
├── members.html                 # Full searchable member directory
├── member-profile.html          # Public member profiles
├── news.html                    # News bulletins & announcements
├── news-detail.html             # Full article reading experience
├── gallery.html                 # Moments of Service photo gallery
├── events.html                  # Upcoming activities in GST timezone
├── contact.html                 # Direct Supabase enquiry forms
├── privacy.html                 # Official privacy disclosure
├── 404.html                     # Custom 404 error page
├── admin/
│   ├── login.html               # Admin portal authentication
│   ├── index.html               # Dashboard KPI overview
│   ├── projects.html            # Projects CRUD
│   ├── media.html               # Supabase Storage media library
│   ├── leadership.html          # Year-specific office bearer assignments
│   ├── members.html             # Member roster & privacy toggles
│   ├── news.html                # Editorial & announcement publishing
│   ├── events.html              # Event scheduling (GST)
│   ├── enquiries.html           # Private contact inbox
│   ├── pages.html               # Announcement banner & page text editor
│   ├── settings.html            # Verified impact metrics & site settings
│   └── users.html               # Role-based access control (RBAC)
├── css/
│   ├── variables.css            # Lions blue & gold design tokens
│   ├── reset.css                # Base normalization
│   ├── components.css           # Glass panels, cards, buttons, badges
│   ├── style.css                # Layout & section styling
│   ├── responsive.css           # Tablet & mobile optimizations
│   └── admin.css                # Administration dashboard layout
├── js/
│   ├── config.js                # App config & Supabase credentials
│   ├── supabase.js              # Supabase client wrapper
│   ├── public-data.js           # Verified starter dataset
│   ├── utils.js                 # Formatters, sanitizers & toasts
│   ├── main.js                  # Public portal initialization
│   └── admin/
│       └── auth.js              # Session & role validation
├── assets/
│   └── logos/
│       ├── lions-international.png  # Genuine Lions International emblem
│       └── lions-international.jpg  # Source image preservation
├── supabase/
│   ├── schema.sql               # PostgreSQL tables, relations, triggers
│   ├── policies.sql             # Row Level Security (RLS) policies
│   ├── seed.sql                 # Baseline starter data
│   └── README.md                # Backend architecture guide
├── tests/
│   └── verify-site.js           # Automated file integrity & QA test
├── package.json
├── SUPABASE_SETUP.md            # Step-by-step Supabase deployment guide
└── PROJECT_STATUS.md            # QA and audit report
```

---

## 4. How to Run Locally

### Option A: Using Node.js
From `~/Desktop/LIONS`:
```bash
npm start
# or
npx serve -l 3000 .
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Using Python
```bash
python3 -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000).

### Option C: In Visual Studio Code
Run in Terminal:
```bash
code ~/Desktop/LIONS
```
Use the **Live Server** extension to preview.

---

## 5. Security & Row Level Security (RLS)
- Anonymous users can only query published projects, published news, upcoming events, approved public members, and active banners.
- Anonymous users can **INSERT** contact enquiries, but **CANNOT SELECT, UPDATE or DELETE** them.
- All administrative operations require authenticated roles (`admin` or `editor`).

---

## 6. Lions Year 2026–2027 Governance
Leadership assignments are decoupled from the general member directory. This allows office bearers to rotate annually (e.g., 2026–27 to 2027–28) without modifying member biographies or disrupting historical records.
# oasislions
# oasislions

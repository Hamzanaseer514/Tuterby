## TutorNearBy – Admin Manual (Layman-Friendly Guide)

This guide explains how an Admin uses TutorNearBy: how to sign in, what’s on the Admin Dashboard, and how each tab works.

### Who is this for?
- Admins who manage tutors, students, and parents
- Team members who review sessions, payments, reviews, and messages

---

## 1) Getting Started

- Admin Login: Click Login and sign in with an Admin account. Non-admins cannot access admin pages.
- Admin Area URLs (after admin login):
  - Dashboard: `/admin`
  - Users (Tutors/Students/Parents): `/admin/users`
  - Messages (Chats): `/admin/chats`
  - Tutor Sessions: `/admin/tutor-sessions`
  - Tutor Payments: `/admin/tutor-payments`
  - Tutor Reviews: `/admin/tutor-reviews`
  - Settings: `/admin/settings`

Use the left sidebar to navigate. The active item is highlighted.

---

## 2) Admin Dashboard (Overview)

Path: `/admin`

What you see:
- Totals for Tutors, Students, Parents and how many are inactive
- Quick links to user lists, sessions, payments, reviews, and chats

What you can do:
- Get a quick health check of the platform
- Jump to details via the sidebar

---

## 3) User Management

Path: `/admin/users`

Tabs:
- Tutors
- Students
- Parents

Common controls:
- Search by name or email
- Filter and Sort (e.g., by status, location, name)
- Paginated tables (5/10/25/50 rows)

Switching user type: Use the sidebar (Tutors, Students, Parents). The list updates accordingly.

### 3.1 Tutors tab
You’ll see:
- Photo, name, email, location
- Subjects taught
- Status (active/inactive/pending)
- Documents summary (Approved/Total) with an icon for overall state

Actions:
- Click a row or the eye icon to view tutor details
- Filter by status/location; sort by name/date/status/rating

Typical admin tasks:
- Approve, partial-approve, or reject tutor applications
- Verify individual documents (ID, qualifications, background checks)
- Add application notes
- Assign interview slots (preferred times)
- Update tutor status (active/inactive/verified/unverified)

### 3.2 Students tab
You’ll see:
- Photo, name, email
- Preferred subjects
- Sessions completed and rating (if any)

Actions:
- Click a row to view details
- Search, filter, sort like in Tutors

### 3.3 Parents tab
You’ll see:
- Photo, name, email
- Children list (first few shown, +N if more)

Actions:
- Click a row to view details
- Search and sort

Note: When you go back from a detail page, the system remembers which tab you were on.

---

## 4) Messages (Chats)

Path: `/admin/chats`

Purpose:
- Review user messages for safety and quality

Usage:
- Open the page to view conversations and participants
- Treat this as read-only oversight unless your policy says otherwise

---

## 5) Tutor Sessions Management

Path: `/admin/tutor-sessions`

Shows:
- Sessions across the platform (tutor, students, subject, level, date/time, status, related payments)

You can:
- Filter by status, date range, tutor; search by notes/names
- Audit attendance and investigate disputes

---

## 6) Tutor Payments

Path: `/admin/tutor-payments`

Purpose:
- View payments related to tutors and sessions

You can:
- Review payment history for compliance and finance tracking
- Cross-check with sessions

Note: Actual payouts depend on your payment provider; this page is for review/reporting.

---

## 7) Tutor Reviews

Path: `/admin/tutor-reviews`

Purpose:
- Review tutor ratings and feedback

You can:
- Browse, filter, and spot trends or inappropriate content to moderate

---

## 8) Settings

Path: `/admin/settings`

Common items:
- Turn OTP rule on/off
- Manage Education Levels (add/update/delete)
- Manage Subjects and Subject Types (add/update/delete)

Use cases:
- Add new subjects/levels before campaigns
- Toggle OTP during rollout/testing

Warning: Changes impact what users can select during onboarding and profiles.

---

## 9) Common Admin Workflows

Approve a Tutor:
1. Users → Tutors
2. Search and open the tutor
3. Review profile, documents, notes
4. Approve (or partial-approve/reject)

Verify a Tutor Document:
1. Open the tutor detail page
2. Find the specific document type
3. Mark Verified/Rejected

Assign Interview Slots:
1. Tutor detail page → set preferred times
2. Save; the tutor is notified accordingly

Update a User’s Status:
1. Find user in Users
2. Open details and set status (active/inactive/verified/unverified)

Review Sessions in a Date Range:
1. Tutor Sessions → set start/end dates
2. Filter by status if needed and review entries

Check a Tutor’s Payments:
1. Tutor Payments → search tutor
2. Cross-check with Sessions if needed

---

## 10) Glossary

- Tutor: Teacher offering lessons
- Student: Learner receiving lessons
- Parent: Adult managing a child’s learning
- Session: Scheduled lesson between tutor and student(s)
- Status: User standing (active/inactive/verified)
- Verification: Admin checks for identity/qualifications/documents
- Interview: Evaluation meeting before approval

---

## 11) Tips

- Use search to quickly narrow large lists
- Badges/chips convey status at a glance; hover for tooltips where available
- Adjust rows-per-page at the bottom for easier browsing
- If redirected to Login, your session expired—log in again

---

## 12) Troubleshooting

- Can’t access Admin pages → You must log in as an Admin
- Sidebar counts look old → Refresh or navigate away and back
- Missing tutor subjects → The profile may be incomplete; check documents/notes
- Payments look off → Cross-check with Tutor Sessions
- Need admin actions → Open the user’s detail page for approve/reject/verify/status

---

## 13) Security & Privacy

- Only Admins have access to Admin pages
- Don’t share Admin accounts
- Handle documents and personal data per your privacy policy

---

## 14) Behind the Scenes (optional)

- Admin pages use server Admin APIs for users, stats, sessions, payments, and reviews
- Counts refresh when data changes
- If an action fails (e.g., network), try again or re-login

If you want screenshots or a PDF version, let us know—we can add visuals.



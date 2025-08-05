# Admin Dashboard Setup Guide

## Quick Setup

### 1. Create Admin User

Run the following command in the server directory to create an admin user:

```bash
cd server
node createAdminUser.js
```

This will create an admin user with these credentials:
- **Email**: admin@tutornearby.com
- **Password**: admin123

### 2. Start the Server

Make sure your server is running:

```bash
cd server
npm start
```

### 3. Start the Client

In another terminal:

```bash
cd client
npm run dev
```

### 4. Login as Admin

1. Go to `http://localhost:5173/login`
2. Use the admin credentials:
   - Email: admin@tutornearby.com
   - Password: admin123
3. You should be redirected to `/admin` automatically

## Troubleshooting

### Issue: "Keeps loading and doesn't go to admin portal"

**Solution**: The admin dashboard requires authentication. Make sure:

1. **You're logged in as admin**: Check that you're using admin credentials, not regular user credentials
2. **Server is running**: Ensure the backend server is running on port 5000
3. **Database is connected**: Check that MongoDB is running and connected
4. **Admin user exists**: Run the `createAdminUser.js` script if you haven't already

### Issue: "Access denied" or "Unauthorized"

**Solution**: 
1. Clear your browser storage (localStorage/sessionStorage)
2. Log out and log back in with admin credentials
3. Check that the admin user has `role: "admin"` in the database

### Issue: "Failed to load dashboard data"

**Solution**: The dashboard will fall back to mock data if the API is unavailable. This is normal for development.

## Admin Dashboard Features

### User Management
- View all tutors, students, and parents
- Approve/reject tutor applications
- Verify tutor documents
- Add application notes

### Interview Scheduling
- Schedule interviews for pending tutors
- Record interview results (Pass/Fail/Conditional)
- Manage available interview slots
- Send email notifications

### Document Verification
- Verify ID documents, degree certificates, references
- Add verification notes
- Track verification status

## API Endpoints

The admin dashboard uses these endpoints (all require admin authentication):

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tutors/:tutorId` - Get tutor details
- `PUT /api/admin/documents/verify` - Verify documents
- `POST /api/admin/interviews/schedule` - Schedule interviews
- `POST /api/admin/tutors/approve` - Approve tutor
- `POST /api/admin/tutors/reject` - Reject tutor

## Development Notes

- The dashboard uses mock data as fallback when API is unavailable
- Authentication is handled via JWT tokens
- Admin users bypass OTP verification
- All admin routes require `protect` and `adminOnly` middleware

## Security

- Admin routes are protected by authentication middleware
- Only users with `role: "admin"` can access admin functions
- JWT tokens are used for session management
- Failed authentication redirects to login page 
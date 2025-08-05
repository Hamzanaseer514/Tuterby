# Admin Dashboard

## Overview
The Admin Dashboard provides comprehensive user management and interview scheduling capabilities for the tutoring platform administrators.

## Features

### User Management
- **Tutor Management**: View, approve, reject, and manage tutor applications
- **Student Management**: View student profiles and activity
- **Parent Management**: View parent profiles and booking history
- **Document Verification**: Verify tutor documents (ID proof, degree certificates, references, background checks)
- **Application Notes**: Add and manage notes for tutor applications

### Interview Scheduling
- **Available Slots**: View and manage available interview time slots
- **Schedule Interviews**: Schedule interviews for pending tutor applications
- **Interview Results**: Record interview results (Pass/Fail/Conditional) with notes
- **Email Notifications**: Automatic email notifications to tutors for interview scheduling and results

### Dashboard Statistics
- **Real-time Stats**: View total tutors, students, parents, and pending interviews
- **Status Tracking**: Track pending, verified, and rejected tutor applications
- **Activity Monitoring**: Monitor user activity and session completion rates

## API Endpoints

### User Management
- `GET /api/admin/users` - Get all users with filters
- `GET /api/admin/tutors/:tutorId` - Get detailed tutor information
- `PUT /api/admin/documents/verify` - Update document verification status
- `PUT /api/admin/applications/notes` - Update application notes

### Interview Management
- `GET /api/admin/interviews/available-slots` - Get available interview slots
- `POST /api/admin/interviews/schedule` - Schedule an interview
- `POST /api/admin/interviews/complete` - Complete interview with result

### Tutor Approval
- `POST /api/admin/tutors/approve` - Approve tutor application
- `POST /api/admin/tutors/reject` - Reject tutor application with reason

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Usage

### Accessing the Dashboard
Navigate to `/admin` in the application to access the admin dashboard.

### Managing Tutors
1. Click on the "Tutors" tab to view all tutor applications
2. Use the search and filter options to find specific tutors
3. Click "View Details" to see comprehensive tutor information
4. Verify documents by clicking the "Verify" button on each document
5. Schedule interviews by selecting available time slots
6. Approve or reject applications using the action menu

### Scheduling Interviews
1. Open a tutor's detail view
2. Navigate to the "Interview Management" section
3. View the tutor's preferred time slots
4. Select an available slot from the calendar
5. Click "Schedule" to confirm the interview
6. After the interview, click "Complete" to record the result

### Document Verification
1. In the tutor detail view, expand the "Uploaded Documents" section
2. Review each document by clicking the download icon
3. Click "Verify" to approve a document or "Reject" to reject it
4. Add notes to document verification decisions

## Development

### Service Layer
The dashboard uses `adminService.js` to handle API calls. The service includes:
- Real API calls for production
- Mock data fallbacks for development
- Error handling and loading states

### State Management
The dashboard uses React hooks for state management:
- `useState` for local component state
- `useEffect` for data loading and side effects
- Loading states for better UX

### Error Handling
- API call error handling with user-friendly messages
- Fallback to mock data when API is unavailable
- Snackbar notifications for user feedback

## Security
- Admin authentication required for all admin routes
- Role-based access control for admin functions
- Secure document handling and verification

## Future Enhancements
- Bulk operations for multiple tutors
- Advanced filtering and search capabilities
- Interview calendar integration
- Automated background check processing
- Analytics and reporting features 
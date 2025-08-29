# Parent Dashboard - TutorNearby

## Overview
The Parent Dashboard allows parents to manage their children's tutoring accounts. Parents can add children under the age of 12 as students, view their profiles, and monitor their academic progress.

## Features

### 1. Parent Profile Management
- View personal information (name, email, phone, age)
- Quick stats showing number of children registered
- Profile overview with contact details

### 2. Child Management
- Add children under 12 years old as students
- View all registered children with their details
- Monitor children's academic levels and account status
- Each child gets their own independent student account

### 3. Age Validation
- **Children under 12**: Can be added by parents
- **Children 12 and older**: Must register themselves (existing validation in `registerUser` function)
- Age validation is enforced both on frontend and backend

## Technical Implementation

### Backend Components

#### ParentController.js
- `addStudentToParent`: Adds a child student to a parent's account
- `getParentProfile`: Retrieves parent profile with associated children
- `updateParentProfile`: Updates parent profile information
- `getParentDashboardStats`: Gets dashboard statistics
- Age validation: Ensures only children under 12 can be added by parents

#### ParentRoutes.js
- `POST /api/parent/add-student`: Add child to parent
- `GET /api/parent/profile/:user_id`: Get parent profile with children
- `PUT /api/parent/profile/:user_id`: Update parent profile
- `GET /api/parent/dashboard-stats/:user_id`: Get dashboard statistics

#### Models
- `ParentProfileSchema`: Stores parent-user relationship with student references
- `UserSchema`: User accounts with role-based access
- `StudentProfileSchema`: Student-specific academic information

### Frontend Components

#### ParentDashboardPage.jsx
- Main dashboard interface
- Displays parent profile and children list
- Integrates with AddChildModal for adding new children

#### AddChildModal.jsx
- Modal form for adding children
- Form validation including age restrictions
- Password requirements matching student registration standards

#### ParentContext.jsx
- Context provider for parent operations
- Handles authentication and error management
- Reusable across multiple components

### Security Features
- JWT token authentication required for all parent operations
- Role-based access control (only users with 'parent' role)
- Age validation on both client and server side
- Password strength requirements for child accounts

## Usage Flow

1. **Parent Registration**: Parent registers with role 'parent'
2. **Login**: Parent logs in and accesses dashboard
3. **Add Child**: Parent clicks "Add Child" button
4. **Child Form**: Parent fills child details (name, email, age < 12, academic level, password)
5. **Validation**: System validates age and other requirements
6. **Account Creation**: Child account is created and linked to parent
7. **Dashboard Update**: Child appears in parent's children list

## API Endpoints

### Add Child to Parent
```
POST /api/parent/add-student
Authorization: Bearer <token>
Body: {
  parent_user_id: string,
  full_name: string,
  email: string,
  password: string,
  age: number,
  academic_level: string (ObjectId)
}
```

### Get Parent Profile
```
GET /api/parent/profile/:user_id
Authorization: Bearer <token>
Response: {
  parentProfile: object,
  children: array
}
```

### Update Parent Profile
```
PUT /api/parent/profile/:user_id
Authorization: Bearer <token>
Body: {
  // fields to update
}
```

### Get Dashboard Stats
```
GET /api/parent/dashboard-stats/:user_id
Authorization: Bearer <token>
Response: {
  totalChildren: number,
  activeChildren: number,
  inactiveChildren: number
}
```

## Validation Rules

### Age Restrictions
- **Parent**: Must be 20 or older
- **Child via Parent**: Must be under 12
- **Independent Student**: Must be 12 or older

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Academic Levels
- Primary School (KS1)
- Primary School (KS2)
- Secondary School (KS3)
- GCSE
- A-Level
- Undergraduate
- Other

## Error Handling

### Common Error Scenarios
- Age validation failure
- Email already exists
- Password strength requirements not met
- Parent profile not found
- Authentication token invalid/expired

### User Feedback
- Toast notifications for success/error states
- Form validation with inline error messages
- Loading states during API operations

## Future Enhancements

### Potential Features
- Child progress tracking
- Session scheduling for children
- Payment management for children's sessions
- Communication tools between parent and tutors
- Academic performance reports
- Parent-teacher conference scheduling

### Technical Improvements
- Real-time updates using WebSocket
- Offline capability with service workers
- Advanced analytics and reporting
- Mobile app development
- Multi-language support

## Testing

### Manual Testing Checklist
- [ ] Parent can register and login
- [ ] Parent dashboard loads correctly
- [ ] Add child modal opens and validates form
- [ ] Age validation works (under 12 only)
- [ ] Child account creation succeeds
- [ ] Child appears in parent's children list
- [ ] Error handling for invalid inputs
- [ ] Authentication protection works

### Automated Testing
- Unit tests for validation functions
- Integration tests for API endpoints
- E2E tests for complete user flows
- Performance testing for large families

## Deployment Notes

### Environment Variables
- `VITE_BASE_URL`: Backend API base URL
- Database connection strings
- JWT secret keys

### Dependencies
- All required packages are in package.json
- Backend requires MongoDB connection
- Frontend requires Node.js 16+ and npm/yarn

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Note**: This parent dashboard is designed to work alongside the existing student and tutor systems without modifying their core functionality. Parents can manage their children's accounts while maintaining the same security and validation standards used for independent student registration.




## Installation & Setup



### Backend Setup



1. **Install Dependencies**

   ```bash

   cd server

   npm install

   ```



2. **Environment Variables**

   Create a `.env` file with:

   ```env

   PORT=5000

   MONGODB_URI=your_mongodb_connection_string

   FRONTEND_URL=http://localhost:3000

   ```



3. **Start Server**

   ```bash

   npm start

   ```



### Frontend Setup



1. **Install Dependencies**

   ```bash

   cd client

   npm install

   ```



2. **Start Development Server**

   ```bash

   npm run dev

   ```



## API Endpoints



### Parent Dashboard

- `GET /api/parent/dashboard/:parentId` - Get dashboard overview

- `GET /api/parent/students/:parentId` - Get all students

- `POST /api/parent/students/:parentId` - Add new student

- `PUT /api/parent/students/:parentId/:studentId` - Update student

- `DELETE /api/parent/students/:parentId/:studentId` - Remove student



### Sessions

- `GET /api/parent/sessions/:parentId` - Get all sessions with filtering



### Payments

- `GET /api/parent/payments/:parentId` - Get payment history with filtering



### Profile

- `PUT /api/parent/profile/:parentId` - Update parent profile



## Key Features



### 🔐 **No Age Restrictions**

- Students can be any age (removed 12+ restriction)

- Flexible age input for all students

- Inclusive for all age groups



### 📱 **Responsive Design**

- Mobile-first approach

- Collapsible sidebar for mobile devices

- Touch-friendly interface

- Responsive grid layouts



### 🎨 **Modern UI/UX**

- Clean, professional design

- Intuitive navigation

- Consistent color scheme

- Icon-based interface

- Smooth animations and transitions



### 🔍 **Advanced Filtering**

- Multi-criteria filtering

- Real-time search

- Pagination support

- Sortable data tables



### 📊 **Data Visualization**

- Statistics cards

- Progress indicators

- Status badges

- Visual feedback



## Security Features



- **Authentication Middleware**: Protected routes

- **Input Validation**: Comprehensive form validation

- **Data Sanitization**: XSS protection

- **Role-based Access**: Parent-only dashboard access

- **Secure Password Handling**: Bcrypt encryption



## Future Enhancements



### **Planned Features**

- Real-time notifications

- Calendar integration

- Progress tracking charts

- Document upload system

- Video call integration

- Automated reporting

- Multi-language support



### **Technical Improvements**

- Real-time updates with WebSockets

- Advanced caching strategies

- Performance optimization

- Unit and integration tests

- CI/CD pipeline

- Docker containerization



## Contributing



1. Fork the repository

2. Create a feature branch

3. Make your changes

4. Add tests if applicable

5. Submit a pull request



## License



This project is licensed under the MIT License.



## Support



For support and questions, please contact the development team or create an issue in the repository.



---



**Built with ❤️ for better education management**





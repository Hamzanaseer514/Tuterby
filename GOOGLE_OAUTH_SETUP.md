# Google OAuth Setup Guide for Tuterby

This guide will help you set up Google OAuth authentication for student registration in the Tuterby application.

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB database running

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Tuterby"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users if needed

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Server Environment Variables
Create a `.env` file in the `server` directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/tuterby

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 2.2 Client Environment Variables
Create a `.env` file in the `client` directory:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 3: Install Dependencies

### 3.1 Server Dependencies
Navigate to the `server` directory and install the Google OAuth library:

```bash
cd server
npm install google-auth-library
```

### 3.2 Client Dependencies
Navigate to the `client` directory and install the Google OAuth client:

```bash
cd client
npm install @google-cloud/local-auth
```

## Step 4: Database Schema Updates

The following schemas have been updated to support Google OAuth:

### 4.1 User Schema (`server/Models/userSchema.js`)
- Added `google_id` field for Google OAuth ID
- Added `is_google_user` boolean flag
- Made password optional for Google OAuth users
- Set default age to 15 for students
- Set default verification status to active for Google users

### 4.2 Student Profile Schema (`server/Models/studentProfileSchema.js`)
- Set default academic level to "Secondary School"
- Set default learning goals
- Set default preferred subjects to ["Mathematics", "English", "Science"]

## Step 5: API Endpoints

### 5.1 Google OAuth Registration
- **Endpoint**: `POST /api/auth/register-google`
- **Purpose**: Register students using Google OAuth
- **Request Body**:
  ```json
  {
    "id_token": "google_id_token_here",
    "role": "student"
  }
  ```

## Step 6: Frontend Integration

### 6.1 Google OAuth Component
The `GoogleOAuth` component (`client/src/components/account/GoogleOAuth.jsx`) handles:
- Loading Google OAuth script
- Rendering Google Sign-In button
- Processing authentication response
- Sending ID token to backend
- Handling success/error responses

### 6.2 Registration Form Integration
The Google OAuth component is integrated into the student registration form and appears below the submit button.

## Step 7: Testing

### 7.1 Development Testing
1. Start the server: `npm run dev` (in server directory)
2. Start the client: `npm run dev` (in client directory)
3. Navigate to the registration page
4. Select "Student" tab
5. Click "Continue with Google" button
6. Complete Google OAuth flow

### 7.2 Expected Behavior
- Students can register using Google OAuth
- Default values are automatically set for age (15) and academic level
- Google users are automatically verified
- Profile photo from Google is automatically imported
- Users are redirected to student dashboard after successful registration

## Step 8: Production Deployment

### 8.1 Update Environment Variables
- Set production URLs in Google Cloud Console
- Update environment variables with production values
- Ensure HTTPS is enabled for production

### 8.2 Security Considerations
- Store sensitive environment variables securely
- Use strong JWT secrets
- Enable CORS for production domains only
- Implement rate limiting for OAuth endpoints

## Troubleshooting

### Common Issues

1. **"Invalid Google token" error**
   - Check if Google Client ID is correct
   - Verify OAuth consent screen is configured
   - Ensure API is enabled in Google Cloud Console

2. **CORS errors**
   - Verify FRONTEND_URL in server environment
   - Check if client origin is added to Google OAuth credentials

3. **"Google OAuth registration failed" error**
   - Check server logs for detailed error messages
   - Verify MongoDB connection
   - Ensure all required environment variables are set

### Debug Mode
Enable debug logging by adding to server environment:
```env
DEBUG=google-auth-library:*
```

## Support

For additional support:
1. Check Google Cloud Console documentation
2. Review server logs for error details
3. Verify all environment variables are correctly set
4. Ensure database connection is working

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Regularly rotate OAuth credentials
- Monitor OAuth usage and implement rate limiting
- Validate all OAuth tokens on the server side

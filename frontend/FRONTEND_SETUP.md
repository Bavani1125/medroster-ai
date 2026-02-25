# 🏥 MedRoster Frontend - Complete Setup Guide

## Project Overview

Complete React + TypeScript frontend for MedRoster AI hospital staff coordination system.

## Features Implemented

✅ **Authentication**
- User registration and login
- JWT token management
- Automatic logout on 401 errors
- Protected routes

✅ **Dashboard**
- Staff statistics overview
- Department management (view and create)
- Shift management (view and create)
- Staff listing
- Real-time data updates

✅ **API Integration**
- Axios HTTP client with interceptors
- Automatic token injection
- Error handling
- RESTful API endpoints

✅ **UI/UX**
- Material-UI components
- Responsive design
- Navigation bar
- Professional styling
- Form validation

## Project Structure

```
medroster-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios configuration
│   │   └── index.ts           # API endpoints
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── PrivateRoute.tsx   # Protected routes
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── pages/
│   │   ├── AuthPage.tsx       # Login/Register page
│   │   └── DashboardPage.tsx  # Main dashboard
│   ├── App.tsx                # Main app component
│   ├── index.tsx              # ReactDOM render
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## Installation & Setup

### 1. Prerequisites
- Node.js (v14+)
- npm or yarn
- Backend running on http://localhost:8000

### 2. Install Dependencies

```bash
cd medroster-frontend
npm install
```

### 3. Configure Environment

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:8000
```

### 4. Start Development Server

```bash
npm start
```

Server runs on `http://localhost:3000`

## Available Scripts

### Development
```bash
npm start          # Start dev server
npm test           # Run tests
npm run build      # Build for production
npm run eject      # Eject from CRA (irreversible)
```

## Usage

### Login
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: admin@hospital.com
   - Password: testpass123
3. Click "Login"

### Register New User
1. Click "Register" tab
2. Fill in form:
   - Full Name
   - Email
   - Password
   - Role (staff, nurse, doctor, manager, admin)
3. Click "Register"

### Create Department
1. Click "Add Department" button
2. Enter:
   - Department Name
   - Description
3. Click "Create"

### Create Shift
1. Click "Add Shift" button (if admin/manager)
2. Enter:
   - Department
   - Start Time (ISO 8601 format)
   - End Time (ISO 8601 format)
   - Required Role
   - Staff Count Needed
3. Click "Create"

## API Endpoints Used

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /users/me` - Get current user

### Users
- `GET /users/` - List all users
- `GET /users/{id}` - Get user details
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Departments
- `GET /departments` - List departments
- `POST /departments` - Create department
- `GET /departments/{id}` - Get department
- `DELETE /departments/{id}` - Delete department

### Shifts
- `GET /shifts` - List shifts
- `POST /shifts` - Create shift
- `GET /shifts/{id}` - Get shift details
- `PATCH /shifts/{id}` - Update shift
- `DELETE /shifts/{id}` - Delete shift

### Assignments
- `GET /assignments` - List assignments
- `POST /assignments` - Create assignment
- `DELETE /assignments/{id}` - Delete assignment

### AI Features
- `POST /ai/suggest-schedule` - Get AI schedule suggestions
- `POST /ai/analyze-workload` - Analyze staff workload
- `GET /ai/tip` - Get scheduling tip

### Emergency
- `POST /emergency/red-alert` - Trigger emergency alert
- `POST /emergency/resolve` - Resolve alert

## Request Format Examples

### Create Shift
```json
{
  "department_id": 1,
  "start_time": "2026-02-26T08:00:00",
  "end_time": "2026-02-26T16:00:00",
  "required_role": "doctor",
  "required_staff_count": 2
}
```

### Create Assignment
```json
{
  "user_id": 2,
  "shift_id": 1,
  "is_emergency": false
}
```

### Create Department
```json
{
  "name": "ICU",
  "description": "Intensive Care Unit"
}
```

## Authentication Flow

1. User registers/logs in
2. Backend returns `access_token` and user info
3. Token stored in localStorage
4. Token automatically added to API requests via interceptor
5. On 401 error, user logged out and redirected to login
6. Protected routes check `isAuthenticated` status

## Component Hierarchy

```
App
├── AuthProvider (Context)
├── BrowserRouter
│   ├── Navbar
│   └── Routes
│       ├── /login → AuthPage
│       ├── /register → AuthPage
│       ├── /dashboard → PrivateRoute → DashboardPage
│       └── / → Navigate to /dashboard
```

## State Management

- **AuthContext** - Global auth state
  - user: Current user data
  - token: JWT access token
  - isAuthenticated: Auth status
  - login(): Login user
  - register(): Register user
  - logout(): Clear auth data

- **Component State** - Local state for forms
  - Department/Shift creation forms
  - Loading states
  - Error messages

## Error Handling

- API errors caught and displayed to user
- 401 errors trigger automatic logout
- Form validation on submission
- Error alerts for failed operations

## Features Ready to Extend

1. **Assignments Management**
   - Create assignments UI
   - View assigned staff
   - Unassign staff

2. **AI Features**
   - Schedule suggestion interface
   - Workload analysis dashboard
   - AI scheduling tips

3. **Emergency Features**
   - Red alert trigger UI
   - Alert resolution interface
   - Emergency staff reallocation view

4. **Analytics**
   - Staff utilization charts
   - Workload distribution graphs
   - Department statistics

5. **Notifications**
   - Real-time notifications
   - Email alerts
   - Staff notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React Router
- Lazy loading components
- Material-UI efficient rendering
- Axios request caching (via interceptors)

## Security Features

- JWT token authentication
- Protected routes
- Automatic token refresh (on 401)
- CORS-enabled API calls
- Password hashing on backend

## Troubleshooting

### Issue: API calls failing
**Solution:** 
- Ensure backend running on http://localhost:8000
- Check REACT_APP_API_URL in .env
- Check CORS settings in backend

### Issue: Login not working
**Solution:**
- Verify credentials in backend DB
- Check token being saved to localStorage
- Check browser console for errors

### Issue: Redirect loop
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Check AuthContext implementation
- Verify PrivateRoute component

## Development Tips

1. **Debug API calls**
   ```javascript
   // In browser console
   localStorage.getItem('access_token')
   ```

2. **Clear app state**
   ```javascript
   localStorage.clear()
   window.location.reload()
   ```

3. **Check network requests**
   - Open DevTools → Network tab
   - Look for Authorization header
   - Verify response status codes

4. **React DevTools**
   - Install React DevTools extension
   - Inspect component tree
   - Check context values

## Deployment

### Build for Production
```bash
npm run build
```

Outputs to `build/` directory

### Deploy to Server
```bash
# Using Vercel
vercel

# Using Netlify
netlify deploy --prod --dir=build

# Using GitHub Pages
npm install gh-pages
npm run build
npm run deploy
```

### Environment Configuration
Set REACT_APP_API_URL for production:
```
REACT_APP_API_URL=https://api.yourdomain.com
```

## Version Info

- React: 18.x
- TypeScript: 4.9.x
- Material-UI: 5.x
- Axios: 1.x
- React Router: 6.x

## License

MIT

## Support

For issues or questions:
1. Check browser console for errors
2. Review network requests in DevTools
3. Verify backend is running
4. Check API endpoint responses

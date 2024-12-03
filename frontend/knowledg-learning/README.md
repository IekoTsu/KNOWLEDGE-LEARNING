# Knowledge Learning Frontend

A React-based frontend for an e-learning platform with course management, user authentication, and payment integration.

## Technologies Used

- React 18
- Vite
- React Router DOM
- Axios
- React Hot Toast
- Context API for state management

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Backend server running

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_BACKEND_URL=http://localhost:5000

VITE_APP_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
```

## Installation

1. Clone the repository:

```bash
git clone <https://github.com/IekoTsu/KNOWLEDGE-LEARNING>
cd frontend/knowledg-learning
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/         # Reusable components
├── context/           # React Context providers
│   ├── UserContext.jsx    # Authentication and user management
│   ├── CourseContext.jsx  # Course-related operations
│   └── AdminContext.jsx   # Admin functionality
├── pages/             # Page components
├── utils/            # Utility functions
├── App.jsx           # Main application component
└── main.jsx         # Application entry point
```

## Features

### Authentication
- User registration with email verification
- Login/Logout functionality
- Password change
- Profile management

### Course Management
- Course listing and details
- Lesson viewing
- Course enrollment
- Progress tracking
- Certifications

### Admin Features
- User management
- Course creation and editing
- Lesson management
- Statistics dashboard

### Payment Integration
- Stripe payment processing
- Course and lesson purchases
- Payment history

## Context Providers

### UserContext
Manages authentication and user-related functionality:
- User authentication
- Profile management
- Payment history
- Role-based access control

### CourseContext
Handles course-related operations:
- Course listing
- Lesson management
- Progress tracking
- Certifications

### AdminContext
Provides administrative functionality:
- User management
- Course/lesson creation
- Content management
- Statistics

## Protected Routes

The application includes several protected routes that require authentication:

- `/account` - User profile
- `/dashboard` - User dashboard
- `/course/:courseId/lesson/:lessonId` - Lesson viewing
- `/certifications` - User certifications
- `/account-details` - Account management
- `/change-password` - Password change

### Admin-Only Routes

- `/backoffice/:model` - Admin dashboard
- `/backoffice/course/:courseId/edit` - Course editing
- `/backoffice/course/create` - Course creation

## Security Features

- CSRF token management
- Protected routes
- Role-based access control
- Secure payment processing

## API Integration

The frontend communicates with the backend through a RESTful API using Axios. All API calls include:
- CSRF token headers
- Authentication tokens
- Error handling
- Loading states
# Knowledge Learning Backend Server

A robust Node.js/Express backend server for an e-learning platform with course management, user authentication, and payment processing capabilities.

## Requirements

- Node.js (v14 or higher)
- MongoDB
- Stripe Account (for payment processing)
- Gmail Account (for email notifications)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# Authentication Secrets
ACTIVATION_TOKEN_SECRET=your_activation_token_secret
JWT_SECRET=your_jwt_secret
CSRF_SECRET=your_csrf_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## Installation

1. Clone the repository:

```bash
git clone <https://github.com/IekoTsu/KNOWLEDGE-LEARNING>
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables as described above

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Running Tests

```bash
npm test
```

## API Documentation

### Authentication Routes
- `POST /api/register` - Register a new user
- `POST /api/verify` - Verify user email
- `POST /api/login` - User login
- `GET /api/logout` - User logout

### Course Routes
- `GET /api/courses` - Get all courses
- `GET /api/courses/:courseId` - Get course by ID
- `GET /api/courses/:courseId/lessons` - Get lessons for a course
- `GET /api/lessons/:lessonId` - Get lesson by ID
- `POST /api/courses/:courseId/purchase` - Purchase a course
- `POST /api/lessons/:lessonId/purchase` - Purchase a lesson

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/:userId/payments` - Get user payments

### Admin Routes
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:courseId` - Update course
- `DELETE /api/admin/courses/:courseId` - Delete course
- `POST /api/admin/lessons` - Create lesson
- `PUT /api/admin/lessons/:lessonId` - Update lesson
- `DELETE /api/admin/lessons/:lessonId` - Delete lesson

### Certification Routes
- `GET /api/certifications` - Get user certifications
- `GET /api/certifications/:courseId` - Get specific certification
- `POST /api/certifications/validate/:lessonId` - Validate lesson completion

## Security Features

- CSRF Protection
- Rate Limiting
- Helmet Security Headers
- JWT Authentication
- Role-based Authorization

## Testing

The project includes comprehensive test suites for:
- Controllers
- Middleware
- Security Features
- Authentication

Run tests with coverage:

```bash
npm run test:coverage
```

## Error Handling

The server implements a centralized error handling system using:
- Custom try-catch wrapper
- Error response standardization
- Validation error handling
# Event Management Backend

A comprehensive Node.js/Express backend for the Event Management application built with TypeScript, MongoDB, and Cloudinary integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Event Management**: Full CRUD operations for events with categories, ratings, and analytics
- **Registration System**: Event registration with payment tracking and ticket management
- **File Upload**: Cloudinary integration for image and video uploads
- **Real-time Analytics**: Event analytics and registration tracking
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cloud Storage**: Cloudinary for media files
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events (with filtering, pagination)
- `GET /api/events/featured` - Get featured events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (auth required)
- `PUT /api/events/:id` - Update event (auth required, creator only)
- `DELETE /api/events/:id` - Delete event (auth required, creator only)
- `POST /api/events/:id/ratings` - Add rating to event (auth required)
- `GET /api/events/user/my-events` - Get user's created events (auth required)
- `GET /api/events/:id/analytics` - Get event analytics (auth required, creator only)

### Registrations
- `POST /api/registrations` - Register for an event (auth required)
- `GET /api/registrations/my-registrations` - Get user's registrations (auth required)
- `GET /api/registrations/event/:eventId` - Get event registrations (auth required, creator only)
- `PUT /api/registrations/:id/payment-status` - Update payment status (auth required, creator only)
- `DELETE /api/registrations/:id` - Cancel registration (auth required)
- `GET /api/registrations/check/:eventId` - Check if user is registered (auth required)

### File Upload
- `POST /api/upload` - Upload single file to Cloudinary (auth required)
- `POST /api/upload/multiple` - Upload multiple files (auth required)
- `DELETE /api/upload/:publicId` - Delete file from Cloudinary (auth required)

## Database Schema

### User
- name, email, password (hashed)
- avatar, role, isEmailVerified
- timestamps

### Event
- title, description, creator (ref: User)
- date, time, location, capacity, booked
- category, status, views, image
- ticketTypes[], paymentMethods[], ratings[]
- media (Cloudinary integration)
- timestamps

### Registration
- eventId (ref: Event), userId (ref: User)
- userName, userEmail, userPhone
- ticketType, ticketPrice, paymentMethod
- paymentStatus, paymentDetails
- timestamps

## Security Features

- Password hashing with bcryptjs
- JWT authentication with secure secrets
- CORS configuration
- Helmet for security headers
- Rate limiting
- Input validation and sanitization
- Protected routes with middleware

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/event_management |
| `JWT_SECRET` | JWT signing secret | (required) |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | (required) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | (required) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | (required) |

## Development

### Project Structure
```
src/
├── config/          # Database and external service configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## License

This project is licensed under the ISC License.

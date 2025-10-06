# 🎉 JM EventsPlatform

A comprehensive event management platform built with React, TypeScript, Node.js, and MongoDB. Create, manage, and attend events with a modern, responsive interface.

![Platform Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=JM+EventsPlatform)

## ✨ Features

### 🎯 Core Features
- **Event Management**: Create, edit, and manage events with rich details
- **User Authentication**: Secure registration and login system
- **Real-time Analytics**: Live event statistics and attendance tracking
- **Admin Dashboard**: Comprehensive user and event management
- **Responsive Design**: Mobile-first approach for all devices
- **Payment Integration**: Handle event registrations and payments

### 🚀 Advanced Features
- **User Management**: Admin can ban/unban and delete users
- **Event Analytics**: Real-time data visualization
- **File Uploads**: Support for event images and user avatars
- **Theme Support**: Dark and light mode toggle
- **Mobile Navigation**: Hamburger menu with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Router DOM** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Image upload and management

### Database
- **MongoDB Atlas** - Cloud database service
- **Real-time Data** - Live updates and analytics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Git**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/jm-events-platform.git
cd jm-events-platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env file with your configuration
```

### 3. Frontend Setup
```bash
cd ../front-end
npm install

# Create environment file  
cp .env.example .env
# Edit .env file with your configuration
```

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/events

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:8084

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Environment Variables
Create a `.env` file in the front-end directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Development Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

2. **Start Frontend Development Server**
```bash
cd front-end
npm run dev
# App runs on http://localhost:8084
```

### Production Build

1. **Build Backend for Production**
```bash
cd backend
npm run build
npm start
```

2. **Build Frontend for Production**
```bash
cd front-end
npm run build
npm run preview
```

## 📝 **Development vs Production Commands**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev` | Development server | While coding/testing |
| `npm run build` | Production build | Before deployment |
| `npm start` | Start production server | On hosting platform |
| `npm run preview` | Preview production build | Test build locally |

## 👨‍💼 Admin Access

The platform includes an admin dashboard with user management capabilities. Admin accounts are created through the application's admin registration process or database seeding. Contact the system administrator for admin access credentials.

## 📁 Project Structure

```
jm-events-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── simple-server.ts # Main server file
│   ├── package.json
│   └── .env
├── front-end/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── main.tsx       # App entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🔌 API Endpoints

### Authentication
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me         # Get current user
```

### Events
```http
GET    /api/events                    # Get all events
GET    /api/events/:id               # Get event by ID
POST   /api/events                   # Create new event
PUT    /api/events/:id               # Update event
DELETE /api/events/:id               # Delete event
```

### Analytics
```http
GET /api/events/:id/analytics        # Get event analytics
GET /api/events/:id/registrations    # Get event registrations
```

### Admin
```http
GET    /api/admin/dashboard          # Admin dashboard data
PUT    /api/admin/users/:id/ban      # Ban/unban user
DELETE /api/admin/users/:id          # Delete user
```

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Mobile Phones** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)

### Mobile Features
- Hamburger navigation menu
- Touch-friendly buttons
- Optimized layouts
- Swipe gestures support

## 🎨 UI/UX Features

- **Glassmorphism Design** - Modern glass-like effects
- **Dark/Light Mode** - Theme switching capability
- **Smooth Animations** - Micro-interactions and transitions
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error management

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt password protection
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Data sanitization
- **Rate Limiting** - API abuse prevention

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd front-end
npm test
```

## 🚀 Deployment

### Recommended Hosting Platforms

#### Frontend
- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**

#### Backend
- **Railway** 
- **Render** (Recommended)
- **Heroku**

### Deployment Steps

1. **Deploy Backend**
   - Create Railway account
   - Connect GitHub repository
   - Set environment variables
   - Deploy

2. **Deploy Frontend**
   - Create Vercel account
   - Connect GitHub repository
   - Set `VITE_API_URL` to backend URL
   - Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**John Olawoye**
- GitHub: [@JohnOnStack](https://github.com/JohnOnStack)
- LinkedIn: [John Olawoye](https://linkedin.com/in/john-olawoye-b16657361)
- Twitter: [@JohnOnStack](https://x.com/JohnOnStack)
- Instagram: [@bukunmiola20](https://instagram.com/bukunmiola20)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Tailwind CSS for the utility-first approach
- All open-source contributors

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: johnolawoyee@gmail.com
- Phone: +234 913 791 7087

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ by [John Olawoye](https://github.com/JohnOnStack)

</div>
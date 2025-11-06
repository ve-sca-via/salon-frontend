# 💇 Salon Management Web Application

A comprehensive, multi-role salon management system built with **React.js**, **Tailwind CSS**, and **React Router**. This application supports four user roles: Customer, Salon Owner, HMR (Field Agent), and Admin.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-blue)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.0.1-purple)
![React Router](https://img.shields.io/badge/React_Router-6.21.1-red)

## 🎯 Features

### 👥 Multi-Role System

#### 🛍️ Customer Features
- Browse and search salons by location and category
- View detailed salon profiles with services and ratings
- Book appointments with preferred salons
- View upcoming and past booking history
- Manage favorites and reviews

#### 💼 Salon Owner Features
- Comprehensive dashboard with booking statistics
- Manage salon profile and business information
- Add/edit/delete services with pricing
- Calendar view for appointment management
- Accept/reject booking requests
- View revenue and performance analytics

#### 🚀 HMR (Field Agent) Features
- Submit new salon registrations
- Track submission status (pending/approved/rejected)
- View submission history and performance metrics
- Dashboard with submission statistics

#### 👑 Admin Features
- Approve or reject salon registrations
- View all bookings across the platform
- Manage HMR agents
- Platform-wide analytics and reports
- Revenue tracking and insights
- User management

## 🏗️ Tech Stack

- **Frontend Framework:** React.js 18.2
- **Styling:** Tailwind CSS 3.4
- **State Management:** Redux Toolkit 2.0
- **Routing:** React Router 6.21
- **Form Handling:** React Hook Form 7.49
- **Calendar:** React Big Calendar 1.8
- **Charts:** Recharts 2.10
- **Icons:** React Icons 5.0
- **Notifications:** React Toastify 9.1
- **Build Tool:** Vite 5.0

## 📁 Project Structure

```
salon-management-app/
├── public/
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/
│   │   ├── auth/           # Protected routes, auth components
│   │   ├── layout/         # Navbar, Sidebar, DashboardLayout
│   │   └── shared/         # Reusable components (Button, Card, Modal, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── mock-data/          # Mock data for development
│   ├── pages/
│   │   ├── auth/           # Login, Register pages
│   │   ├── customer/       # Customer pages
│   │   ├── salon/          # Salon owner pages
│   │   ├── hmr/            # HMR agent pages
│   │   └── admin/          # Admin pages
│   ├── services/           # API service functions
│   ├── store/
│   │   ├── slices/         # Redux slices
│   │   └── index.js        # Store configuration
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Git installed

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd salon-management-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Demo Credentials

Use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Customer** | customer@example.com | password123 |
| **Salon Owner** | salon@example.com | password123 |
| **HMR Agent** | hmr@example.com | password123 |
| **Admin** | admin@example.com | password123 |

## 🎨 Key Components

### Shared Components

- **Button:** Customizable button with variants (primary, secondary, outline, ghost, danger, success)
- **InputField:** Form input with validation, icons, and error handling
- **Card:** Flexible card component for content containers
- **Modal:** Reusable modal with different sizes
- **Loading:** Loading spinner with fullscreen option
- **Navbar:** Top navigation with user menu and notifications
- **Sidebar:** Role-based navigation sidebar

### Layout Components

- **DashboardLayout:** Main layout wrapper with navbar and sidebar
- **ProtectedRoute:** HOC for role-based route protection

## 🗺️ Route Structure

### Customer Routes (`/customer/*`)
- `/customer/dashboard` - Customer dashboard
- `/customer/salons` - Browse salons
- `/customer/salon/:id` - Salon profile
- `/customer/bookings` - Booking management
- `/customer/history` - Booking history

### Salon Routes (`/salon/*`)
- `/salon/dashboard` - Salon dashboard
- `/salon/profile` - Manage profile
- `/salon/services` - Service management
- `/salon/calendar` - Calendar view
- `/salon/bookings` - Booking management

### HMR Routes (`/hmr/*`)
- `/hmr/dashboard` - HMR dashboard
- `/hmr/add-salon` - Add new salon form
- `/hmr/submissions` - Track submissions

### Admin Routes (`/admin/*`)
- `/admin/dashboard` - Admin dashboard
- `/admin/salons` - Approve/reject salons
- `/admin/bookings` - All bookings overview
- `/admin/hmrs` - Manage HMR agents
- `/admin/analytics` - Platform analytics

## 🔧 State Management

Redux Toolkit is used for global state management with the following slices:

- **authSlice:** User authentication and session
- **salonSlice:** Salon data and filters
- **bookingSlice:** Booking management
- **notificationSlice:** Toast notifications

## 📡 API Service Structure

All API calls are abstracted in `src/services/api.js`:

- **authService:** Login, logout, session management
- **salonService:** CRUD operations for salons
- **serviceService:** Salon service management
- **bookingService:** Booking operations
- **hmrService:** HMR submission management
- **analyticsService:** Dashboard statistics

Currently using **mock data** for development. Replace with actual REST API endpoints when backend is ready.

## 🎨 Styling

### Tailwind CSS Configuration

Custom theme with:
- Primary color palette (blue)
- Secondary color palette (purple)
- Utility classes for common patterns
- Responsive design breakpoints

### Custom CSS Classes

- `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card`
- `.input-field`
- `.sidebar-link`, `.sidebar-link-active`

## 📱 Responsive Design

Fully responsive design with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Authentication & Authorization

- Role-based access control (RBAC)
- Protected routes with `ProtectedRoute` component
- JWT token stored in localStorage (mock implementation)
- Automatic role-based redirection

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ Multi-role authentication
- ✅ Role-based dashboards
- ✅ Mock API integration
- ✅ Responsive design
- ✅ Form validation

### Phase 2 (Upcoming)
- [ ] Connect to microservices backend
- [ ] Real-time notifications
- [ ] Google Maps integration for salon location
- [ ] Advanced search and filters
- [ ] Payment integration
- [ ] Email notifications
- [ ] Push notifications
- [ ] Review and rating system
- [ ] Chat feature between customer and salon
- [ ] Advanced analytics with more charts

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced booking rules
- [ ] Loyalty programs
- [ ] Gift cards
- [ ] Social media integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Development Notes

### Connecting to Backend API

When ready to connect to microservices:

1. Update `src/services/api.js` to point to your API endpoints
2. Replace mock data functions with actual HTTP calls using axios
3. Update authentication to use real JWT tokens
4. Implement proper error handling and loading states

Example:
```javascript
// Replace mock implementation
export const salonService = {
  getAllSalons: async (filters) => {
    const response = await axios.get('/api/salons', { params: filters });
    return response.data;
  },
  // ... other methods
};
```

### Environment Variables

Create a `.env` file for configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 📞 Support

For support, email support@salonmanager.com or open an issue in the repository.

## 🎉 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for utility-first styling
- Redux Toolkit for simplified state management
- All open-source contributors

---

**Made with ❤️ for the beauty industry**

# Estate Access Control System

A modern, secure visitor management system for estate access control built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Role-Based Access Control**: Super Admin, Admin, Resident, and Security roles
- **Admin-Driven Onboarding**: Admins create user accounts with temporary passwords
- **Visitor Code Generation**: Residents can generate unique 6-character codes for visitors
- **Code Validation**: Security personnel validate codes at entry/exit gates
- **Access Logging**: Complete audit trail of all access attempts
- **Modern UI**: Beautiful, responsive design with glassmorphism effects and smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Lucide React icons
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs password hashing

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas connection string)

## Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/estate-access-control
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Super Admin Account

On first run, a super admin account is automatically created:
- **Email**: `admin123@test.com`
- **Password**: `Password123*`

## User Roles & Permissions

### Super Admin
- Create Admin users
- Create Resident and Security users
- View all users
- View all access logs

### Admin
- Create Resident and Security users (cannot create Admins)
- View all users
- View all access logs

### Resident
- Generate visitor access codes
- Set code validity periods
- Configure multi-use and exit permissions
- View their own code history

### Security
- Validate access codes
- Mark entry or exit
- See instant validation results

## User Workflows

### 1. Admin Creates User
1. Login as super admin or admin
2. Navigate to "Create User" tab
3. Fill in user details (email, name, role, unit number for residents)
4. System generates temporary password
5. Email is simulated (check console logs)
6. Share temporary password with user

### 2. User First Login
1. User receives email with temporary password
2. User logs in at `/login`
3. System redirects to password change page
4. User sets new password
5. User redirected to role-appropriate dashboard

### 3. Resident Generates Code
1. Login as resident
2. Click "Generate New Code"
3. Enter visitor name and validity period
4. Select multi-use and exit options
5. Code is generated and can be shared with visitor

### 4. Security Validates Code
1. Login as security personnel
2. Enter the 6-character code
3. Select Entry or Exit
4. System validates and shows result
5. Access is logged for admin review

## Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── users/             # User management
│   ├── codes/             # Code generation & validation
│   └── logs/              # Access logs
├── dashboard/             # Role-based dashboards
│   ├── admin/            # Admin dashboard
│   ├── resident/         # Resident dashboard
│   └── security/         # Security dashboard
├── login/                # Login page
├── change-password/      # Password change page
└── page.tsx              # Landing page

lib/
├── db.ts                 # MongoDB connection
├── models.ts             # Mongoose schemas
└── auth.ts               # Authentication utilities
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)

### Access Codes
- `GET /api/codes` - Get resident's codes (Resident only)
- `POST /api/codes` - Generate new code (Resident only)
- `POST /api/codes/validate` - Validate code (Security only)

### Logs
- `GET /api/logs` - Get access logs (Admin only)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Security Features

- JWT-based authentication with token expiration
- bcryptjs password hashing (cost factor: 10)
- Role-based API access control
- Temporary password generation for new users
- Forced password change on first login
- Code expiration and usage validation
- Comprehensive access logging

## License

MIT

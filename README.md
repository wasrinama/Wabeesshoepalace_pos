# 🛍️ Wabees Shoe Palace - POS System

A comprehensive Point of Sale system built with React and Node.js, featuring real-time inventory management, customer management, and sales tracking.

## 📋 Features

### 🖥️ Frontend (React)
- **Modern UI** with responsive design
- **Real-time dashboard** with sales analytics
- **Product management** with search and filtering
- **Customer management** with loyalty points
- **Sales processing** with receipt generation
- **User management** with role-based access
- **Inventory tracking** with low stock alerts

### 🔧 Backend (Node.js)
- **RESTful API** with Express.js
- **Real-time features** with Socket.io
- **MongoDB database** with Mongoose
- **JWT authentication** with role-based authorization
- **Input validation** with express-validator
- **Security features** (rate limiting, CORS, helmet)
- **File uploads** with multer

### 🎯 Real-time Features
- Live sales updates
- Inventory change notifications
- Low stock alerts
- User activity tracking

## 🚀 Technology Stack

- **Frontend**: React 18, CSS3, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate limiting

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pos-system.git
   cd pos-system
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pos_system
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

5. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

6. **Run the application:**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm start
   ```

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager1 | mgr123 |
| Cashier | cashier1 | cash123 |

## 📁 Project Structure

```
pos-system/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # API services
│   └── config/            # Configuration files
├── backend/               # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   └── server.js          # Main server file
├── public/                # Static assets
└── README.md             # This file
```

## 🌟 Key Features

### User Roles
- **Admin**: Full system access
- **Manager**: Sales, inventory, customer management
- **Cashier**: Sales processing, customer lookup

### Sales Management
- Process sales with multiple payment methods
- Generate receipts
- Apply discounts and taxes
- Track sales history

### Inventory Management
- Add/edit/delete products
- Track stock levels
- Set minimum stock alerts
- Manage suppliers

### Customer Management
- Customer profiles
- Purchase history
- Loyalty points system
- Customer search

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get sales history
- `PUT /api/sales/:id/refund` - Process refund

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

## 📊 Real-time Features

- Live sales dashboard
- Inventory level monitoring
- User activity tracking
- Low stock notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, contact: support@wabeesshoepalace.com

## 🏢 Company Information

**Wabees Shoe Palace**  
237, Main Street Maruthamunai-03  
Phone: 067 2220834

---

Built with ❤️ for modern retail management 
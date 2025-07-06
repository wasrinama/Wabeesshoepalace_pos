# POS System Backend API

A comprehensive backend API for a Point of Sale (POS) system built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 📦 **Product Management** - Complete CRUD operations for products with inventory tracking
- 🛒 **Sales Management** - Process sales, handle payments, and manage transactions
- 👥 **Customer Management** - Customer profiles, loyalty tracking, and tier system
- 🏪 **Supplier Management** - Supplier information and relationship tracking
- 💰 **Expense Tracking** - Record and categorize business expenses
- 📊 **Dashboard Analytics** - Real-time business insights and metrics
- 📈 **Reporting System** - Comprehensive business reports and analytics
- 🔍 **Search & Filtering** - Advanced search and filtering capabilities
- 📄 **Pagination** - Efficient data pagination for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # Update MongoDB URI, JWT secret, etc.
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos_system
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/pos_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Security
BCRYPT_ROUNDS=12
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/stock` - Update stock
- `GET /api/products/alerts/low-stock` - Get low stock alerts

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin/Manager)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier (Admin/Manager)
- `PUT /api/suppliers/:id` - Update supplier (Admin/Manager)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale
- `POST /api/sales/:id/refund` - Refund sale (Admin/Manager)
- `GET /api/sales/stats/overview` - Get sales statistics

### Inventory
- `GET /api/inventory/overview` - Get inventory overview
- `GET /api/inventory/alerts` - Get inventory alerts
- `POST /api/inventory/bulk-update` - Bulk stock update
- `GET /api/inventory/movement/:productId` - Get stock movement history

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense (Admin/Manager)
- `PUT /api/expenses/:id` - Update expense (Admin/Manager)
- `DELETE /api/expenses/:id` - Delete expense (Admin)
- `PATCH /api/expenses/:id/approve` - Approve expense (Admin/Manager)
- `GET /api/expenses/stats/overview` - Get expense statistics

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/sales-trend` - Get sales trend data
- `GET /api/dashboard/top-products` - Get top performing products
- `GET /api/dashboard/customer-analytics` - Get customer analytics

### Reports
- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/customers` - Generate customer report
- `GET /api/reports/profit-loss` - Generate profit & loss report
- `POST /api/reports/export` - Export reports

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- System settings

### Manager
- Product management
- Sales management
- Customer management
- Expense management
- Reports access

### Cashier
- Process sales
- View products
- Basic customer operations
- Limited reports access

### Staff
- View products
- Basic operations
- Limited access

## Database Models

- **User** - User accounts and authentication
- **Product** - Product catalog and inventory
- **Category** - Product categories
- **Customer** - Customer information and loyalty
- **Supplier** - Supplier information
- **Sale** - Sales transactions
- **Expense** - Business expenses

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- General server errors

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── uploads/         # File uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Update MongoDB connection string
3. Set strong JWT secret
4. Configure proper CORS origins
5. Set up SSL/TLS certificates
6. Configure proper logging
7. Set up monitoring and backups

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": { "page": 1, "limit": 10 }
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team. 
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars: string[] = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and make sure all required variables are set.');
  process.exit(1);
}

// Import database connection
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import expenseRoutes from './routes/expenses';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';
import activityRoutes from './routes/activities';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app: Application = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'POS Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Determine LAN IP
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

const PORT: number = parseInt(process.env.PORT || '5000', 10);
const HOST: string = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Health check (Localhost): http://localhost:${PORT}/api/health`);
  console.log(`📲 Health check (LAN):       http://${localIp}:${PORT}/api/health`);
  console.log(`🌐 Open from POS machine:    http://${localIp}:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

export default app; 
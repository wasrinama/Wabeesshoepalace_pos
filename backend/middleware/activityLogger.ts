import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Activity, { ActivityAction, ActivityCategory, ActivitySeverity } from '../models/Activity';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

interface ActivityLogData {
  user?: string | Types.ObjectId;
  action: ActivityAction;
  description: string;
  category: ActivityCategory;
  severity: ActivitySeverity;
  ipAddress?: string | null;
  userAgent?: string;
  metadata?: {
    statusCode?: number;
    endpoint?: string;
    method?: string;
    username?: string;
    email?: string;
    saleAmount?: number;
    itemCount?: number;
    paymentMethod?: string;
    [key: string]: any;
  };
  targetId?: string;
  targetResource?: string;
}

interface UserInfo {
  ipAddress: string | null;
  userAgent: string;
}

interface ManualLogOptions {
  severity?: string;
  metadata?: { [key: string]: any };
  [key: string]: any;
}

// Helper function to safely create activity logs
const createActivityLog = async (logData: ActivityLogData): Promise<void> => {
  try {
    // Convert string user ID to ObjectId if needed
    const processedLogData = {
      ...logData,
      user: typeof logData.user === 'string' ? new Types.ObjectId(logData.user) : logData.user,
      targetId: logData.targetId ? new Types.ObjectId(logData.targetId) : undefined,
      ipAddress: logData.ipAddress || undefined // Convert null to undefined
    };
    await Activity.createLog(processedLogData);
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't throw error to prevent breaking the main request
  }
};

// Helper function to extract user information from request
const extractUserInfo = (req: AuthenticatedRequest): UserInfo => {
  const ipAddress = req.ip || (req.socket as any)?.remoteAddress || null;
  const userAgent = req.get('User-Agent') || '';
  
  return {
    ipAddress,
    userAgent
  };
};

// Middleware to log authentication activities
const logAuthActivity = (action: string, description: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData: ActivityLogData = {
              user: req.user.id,
              action: action as ActivityAction,
              description,
              category: 'auth' as ActivityCategory,
              severity: 'info' as ActivitySeverity,
              ipAddress,
              userAgent,
              metadata: {
                statusCode,
                endpoint: req.originalUrl,
                method: req.method
              }
            };

            await createActivityLog(logData);
          }
        } catch (error) {
          console.error('Error logging auth activity:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to log user management activities
const logUserManagement = (action: string, description: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData: ActivityLogData = {
              user: req.user.id,
              action: action as ActivityAction,
              description,
              category: 'user_management' as ActivityCategory,
              severity: 'info' as ActivitySeverity,
              ipAddress,
              userAgent,
              metadata: {
                statusCode,
                endpoint: req.originalUrl,
                method: req.method,
                targetUserId: req.params.id
              }
            };

            // Add target user information if available
            if (req.params.id) {
              logData.targetId = req.params.id;
            }

            await createActivityLog(logData);
          }
        } catch (error) {
          console.error('Error logging user management activity:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Generic activity logger with category parameter  
const logActivity = (action: string, description: string, category: string = 'system') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData: ActivityLogData = {
              user: req.user.id,
              action: action as ActivityAction,
              description,
              category: category as ActivityCategory,
              severity: 'info' as ActivitySeverity,
              ipAddress: ipAddress || undefined,
              userAgent,
              metadata: {
                statusCode,
                endpoint: req.originalUrl,
                method: req.method
              }
            };

            // Add target information if available
            if (req.params.id) {
              logData.targetId = req.params.id;
            }

            // Add resource name if available in request body
            if (req.body && req.body.name) {
              logData.targetResource = req.body.name;
            } else if (req.body && req.body.title) {
              logData.targetResource = req.body.title;
            }

            await createActivityLog(logData);
          }
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to log sales activities
const logSalesActivity = (action: string, description: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData: ActivityLogData = {
              user: req.user.id,
              action: action as ActivityAction,
              description,
              category: 'sales' as ActivityCategory,
              severity: 'info' as ActivitySeverity,
              ipAddress: ipAddress || undefined,
              userAgent,
              metadata: {
                endpoint: req.originalUrl,
                method: req.method
              }
            };

            // Add sales specific information
            if (req.body && req.body.total) {
              logData.metadata!.saleAmount = req.body.total;
            }
            
            if (req.body && req.body.items) {
              logData.metadata!.itemCount = req.body.items.length;
            }

            if (req.body && req.body.paymentMethod) {
              logData.metadata!.paymentMethod = req.body.paymentMethod;
            }

            await createActivityLog(logData);
          }
        } catch (error) {
          console.error('Error logging sales activity:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Helper function to manually create activity logs
const createManualLog = async (userId: string, action: string, description: string, category: string, options: ManualLogOptions = {}): Promise<void> => {
  try {
    // Validate severity or use default
    const validSeverity: ActivitySeverity = (['info', 'warning', 'error', 'critical'].includes(options.severity || '')) 
      ? (options.severity as ActivitySeverity) 
      : ('info' as ActivitySeverity);

    // Extract metadata and other safe options, excluding conflicting properties
    const { severity, ...safeOptions } = options;

    const logData: ActivityLogData = {
      user: userId,
      action: action as ActivityAction,
      description,
      category: category as ActivityCategory,
      severity: validSeverity,
      metadata: options.metadata || {},
      ...safeOptions
    };

    await createActivityLog(logData);
  } catch (error) {
    console.error('Error creating manual activity log:', error);
  }
};

// Specific product activity loggers
const logProductCreate = logActivity('product_create', 'Product created');
const logProductUpdate = logActivity('product_update', 'Product updated');
const logProductDelete = logActivity('product_delete', 'Product deleted');

// Specific sales activity logger
const logSale = logSalesActivity('sale_create', 'Sale transaction completed');

// Specific expense activity logger
const logExpenseCreate = logActivity('expense_create', 'Expense created');

// Specific inventory activity logger
const logInventoryUpdate = logActivity('inventory_update', 'Inventory updated');

export {
  logAuthActivity,
  logUserManagement,
  logActivity,
  logSalesActivity,
  createManualLog,
  logProductCreate,
  logProductUpdate,
  logProductDelete,
  logSale,
  logExpenseCreate,
  logInventoryUpdate
}; 
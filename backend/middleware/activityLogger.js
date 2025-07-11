const Activity = require('../models/Activity');

// Helper function to safely create activity logs
const createActivityLog = async (logData) => {
  try {
    await Activity.createLog(logData);
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't throw error to prevent breaking the main request
  }
};

// Helper function to extract user information from request
const extractUserInfo = (req) => {
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const userAgent = req.get('User-Agent') || '';
  
  return {
    ipAddress,
    userAgent
  };
};

// Middleware to log authentication activities
const logAuthActivity = (action, description, severity = 'info') => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          let logData = {
            action,
            description,
            category: 'auth',
            severity,
            ipAddress,
            userAgent,
            metadata: {
              statusCode,
              endpoint: req.originalUrl,
              method: req.method
            }
          };

          // Add user information if available
          if (req.user && req.user.id) {
            logData.user = req.user.id;
          } else if (req.body && req.body.username) {
            // For login attempts, try to find user by username
            logData.metadata.username = req.body.username;
          }

          // Add email if available
          if (req.body && req.body.email) {
            logData.metadata.email = req.body.email;
          }

          // Adjust severity based on response status
          if (statusCode >= 400) {
            logData.severity = statusCode >= 500 ? 'error' : 'warning';
            logData.description = `${description} (Failed - ${statusCode})`;
          } else {
            logData.description = `${description} (Success)`;
          }

          await createActivityLog(logData);
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
const logUserManagement = (action, description) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData = {
              user: req.user.id,
              action,
              description,
              category: 'user_management',
              severity: 'info',
              ipAddress,
              userAgent,
              metadata: {
                endpoint: req.originalUrl,
                method: req.method
              }
            };

            // Add target user information if available
            if (req.params.id) {
              logData.targetId = req.params.id;
            }

            // Add specific information based on action
            if (req.body) {
              if (req.body.firstName && req.body.lastName) {
                logData.targetResource = `${req.body.firstName} ${req.body.lastName}`;
              } else if (req.body.username) {
                logData.targetResource = req.body.username;
              }
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

// Middleware to log general activities
const logActivity = (action, description, category = 'system', severity = 'info') => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData = {
              user: req.user.id,
              action,
              description,
              category,
              severity,
              ipAddress,
              userAgent,
              metadata: {
                endpoint: req.originalUrl,
                method: req.method,
                statusCode
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
const logSalesActivity = (action, description) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const statusCode = res.statusCode;
      const { ipAddress, userAgent } = extractUserInfo(req);
      
      // Log activity after response is sent
      setImmediate(async () => {
        try {
          if (statusCode >= 200 && statusCode < 300 && req.user && req.user.id) {
            const logData = {
              user: req.user.id,
              action,
              description,
              category: 'sales',
              severity: 'info',
              ipAddress,
              userAgent,
              metadata: {
                endpoint: req.originalUrl,
                method: req.method
              }
            };

            // Add sales specific information
            if (req.body && req.body.total) {
              logData.metadata.saleAmount = req.body.total;
            }
            
            if (req.body && req.body.items) {
              logData.metadata.itemCount = req.body.items.length;
            }

            if (req.body && req.body.paymentMethod) {
              logData.metadata.paymentMethod = req.body.paymentMethod;
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
const createManualLog = async (userId, action, description, category, options = {}) => {
  try {
    const logData = {
      user: userId,
      action,
      description,
      category,
      severity: options.severity || 'info',
      metadata: options.metadata || {},
      ...options
    };

    await createActivityLog(logData);
  } catch (error) {
    console.error('Error creating manual activity log:', error);
  }
};

module.exports = {
  logAuthActivity,
  logUserManagement,
  logActivity,
  logSalesActivity,
  createManualLog
}; 
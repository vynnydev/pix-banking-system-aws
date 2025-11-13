export const appConfig = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'auth-service',
    
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
  };
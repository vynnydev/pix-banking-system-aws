import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'auth-service',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
  },

  // DynamoDB Tables
  tables: {
    users: process.env.USERS_TABLE || 'pix-banking-users',
    accounts: process.env.ACCOUNTS_TABLE || 'pix-banking-accounts',
    pixKeys: process.env.PIX_KEYS_TABLE || 'pix-banking-pixkeys',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Redis (opcional)
  redis: {
    url: process.env.REDIS_URL,
  },
};
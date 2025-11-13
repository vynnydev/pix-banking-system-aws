import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'transaction-service',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },

  // AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
    snsTopicArn: process.env.SNS_TOPIC_ARN || '',
  },

  // DynamoDB Tables
  tables: {
    transactions: process.env.TRANSACTIONS_TABLE || 'pix-banking-transactions',
    accounts: process.env.ACCOUNTS_TABLE || 'pix-banking-accounts',
    notifications: process.env.NOTIFICATIONS_TABLE || 'pix-banking-notifications',
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
    max: parseInt(process.env.RATE_LIMIT_MAX || '200'),
  },

  // Redis (opcional)
  redis: {
    url: process.env.REDIS_URL,
  },
};
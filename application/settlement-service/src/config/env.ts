import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Service
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'settlement-service',

  // AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
    sqsQueueUrl: process.env.SQS_QUEUE_URL || '',
    snsTopicArn: process.env.SNS_TOPIC_ARN || '',
  },

  // DynamoDB Tables
  tables: {
    transactions: process.env.TRANSACTIONS_TABLE || 'pix-banking-transactions',
    accounts: process.env.ACCOUNTS_TABLE || 'pix-banking-accounts',
    notifications: process.env.NOTIFICATIONS_TABLE || 'pix-banking-notifications',
  },

  // Settlement Configuration
  settlement: {
    batchSize: parseInt(process.env.SETTLEMENT_BATCH_SIZE || '50'),
    intervalSeconds: parseInt(process.env.SETTLEMENT_INTERVAL_SECONDS || '21600'), // 6 hours
    cronSchedule: process.env.CRON_SCHEDULE || '0 */6 * * *', // Every 6 hours
  },

  // SQS Configuration
  sqs: {
    queueUrl: process.env.SQS_QUEUE_URL || '',
    maxNumberOfMessages: parseInt(process.env.SQS_MAX_MESSAGES || '10'),
    waitTimeSeconds: parseInt(process.env.SQS_WAIT_TIME || '20'),
    visibilityTimeout: parseInt(process.env.SQS_VISIBILITY_TIMEOUT || '300'), // 5 minutes
  },
};
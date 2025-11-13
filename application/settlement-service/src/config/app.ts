export const appConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'settlement-service',
    
    settlement: {
      batchSize: parseInt(process.env.SETTLEMENT_BATCH_SIZE || '50'),
      intervalSeconds: parseInt(process.env.SETTLEMENT_INTERVAL_SECONDS || '21600'), // 6 hours
      cronSchedule: process.env.CRON_SCHEDULE || '0 */6 * * *', // Every 6 hours
    },
  };
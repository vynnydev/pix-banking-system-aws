export const sqsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    queueUrl: process.env.SQS_QUEUE_URL || '',
    maxNumberOfMessages: parseInt(process.env.SQS_MAX_MESSAGES || '10'),
    waitTimeSeconds: parseInt(process.env.SQS_WAIT_TIME || '20'),
    visibilityTimeout: parseInt(process.env.SQS_VISIBILITY_TIMEOUT || '300'), // 5 minutes
  };
  
  export const validateSqsConfig = (): void => {
    if (!sqsConfig.queueUrl) {
      console.warn('⚠️  SQS_QUEUE_URL not configured');
    }
  };
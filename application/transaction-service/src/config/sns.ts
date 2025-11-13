export const snsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    topicArn: process.env.SNS_TOPIC_ARN || '',
  };
  
  export const validateSnsConfig = (): void => {
    if (!snsConfig.topicArn) {
      console.warn('⚠️  SNS_TOPIC_ARN not configured - notifications disabled');
    }
  };
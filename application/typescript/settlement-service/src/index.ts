import { logger } from '@pix-banking/shared';
import { config } from './config/env';

// Repositories
import { DynamoDBTransactionRepository } from './infrastructure/database/repositories/DynamoDBTransactionRepository';
import { DynamoDBAccountRepository } from './infrastructure/database/repositories/DynamoDBAccountRepository';
import { DynamoDBNotificationRepository } from './infrastructure/database/repositories/DynamoDBNotificationRepository';

// Services
import { SNSEventPublisher } from './infrastructure/messaging/SNSEventPublisher';

// Use Cases
import { ProcessSettlementUseCase } from './application/use-cases/ProcessSettlementUseCase';

// Consumers
import { SettlementConsumer } from './application/consumers/SettlementConsumer';
import { SQSSettlementConsumer } from './infrastructure/messaging/SQSSettlementConsumer';

// Dependency Injection
const transactionRepository = new DynamoDBTransactionRepository(config.tables.transactions);
const accountRepository = new DynamoDBAccountRepository(config.tables.accounts);
const notificationRepository = new DynamoDBNotificationRepository(config.tables.notifications);
const eventPublisher = new SNSEventPublisher(
  config.aws.region,           // ← Argumento 1: region
  config.aws.snsTopicArn       // ← Argumento 2: topicArn
);

// Use Cases
const processSettlementUseCase = new ProcessSettlementUseCase(
  transactionRepository,
  accountRepository,
  notificationRepository,
  eventPublisher
);

// Consumers
const settlementConsumer = new SettlementConsumer(
  processSettlementUseCase,
  config.settlement.batchSize
);

const sqsConsumer = new SQSSettlementConsumer(
  config.aws.sqsQueueUrl,
  settlementConsumer
);

// Start service
(async () => {
  logger.info(`🚀 ${config.serviceName} starting...`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🗄️  DynamoDB Tables: ${JSON.stringify(config.tables)}`);
  logger.info(`📡 SQS Queue: ${config.aws.sqsQueueUrl}`);
  logger.info(`📡 SNS Topic: ${config.aws.snsTopicArn}`);
  logger.info(`⚙️  Batch Size: ${config.settlement.batchSize}`);

  try {
    // Start SQS consumer (long-polling)
    await sqsConsumer.start();
  } catch (error: any) {
    logger.error('Failed to start settlement service', { error: error.message });
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
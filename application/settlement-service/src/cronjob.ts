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

// Consumer
const settlementConsumer = new SettlementConsumer(
  processSettlementUseCase,
  config.settlement.batchSize
);

// Execute settlement as one-time job
(async () => {
  logger.info('🔄 Running settlement CronJob');
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`⚙️  Batch Size: ${config.settlement.batchSize}`);

  try {
    await settlementConsumer.processBatch();
    logger.info('✅ Settlement CronJob completed successfully');
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Settlement CronJob failed', { error: error.message });
    process.exit(1);
  }
})();
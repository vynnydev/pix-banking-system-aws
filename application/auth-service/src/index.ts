import { logger, createRedisCache } from '@pix-banking/shared'; 
import { config } from './config/env';
import { createServer } from './infrastructure/http/server';

// Repositories
import { DynamoDBUserRepository } from './infrastructure/database/repositories/DynamoDBUserRepository';
import { DynamoDBAccountRepository } from './infrastructure/database/repositories/DynamoDBAccountRepository';
import { DynamoDBPixKeyRepository } from './infrastructure/database/repositories/DynamoDBPixKeyRepository';

// Services
import { JWTTokenService } from './infrastructure/services/JWTTokenService';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/auth/RegisterUserUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from './application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from './application/use-cases/auth/LogoutUseCase';
import { GetAccountUseCase } from './application/use-cases/account/GetAccountUseCase';
import { GetBalanceUseCase } from './application/use-cases/account/GetBalanceUseCase';
import { AddPixKeyUseCase } from './application/use-cases/account/AddPixKeyUseCase';
import { RemovePixKeyUseCase } from './application/use-cases/account/RemovePixKeyUseCase';

// Controllers
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { AccountController } from './infrastructure/http/controllers/AccountController';

// Initialize Redis Cache (optional)
let redisCache: any = null;

(async () => {
  try {
    if (config.redis.url) {
      redisCache = await createRedisCache();
      logger.info('✅ Redis cache connected');
    } else {
      logger.warn('⚠️  Redis not configured - token blacklist disabled');
    }
  } catch (error: any) {
    logger.warn(`⚠️  Redis connection failed: ${error.message} - continuing without cache`);
  }

  // Dependency Injection
  const userRepository = new DynamoDBUserRepository(config.tables.users);
  const accountRepository = new DynamoDBAccountRepository(config.tables.accounts);
  const pixKeyRepository = new DynamoDBPixKeyRepository(config.tables.pixKeys);
  const tokenService = new JWTTokenService();

  // Auth Use Cases
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    accountRepository,
    pixKeyRepository,
    tokenService
  );
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);
  const logoutUseCase = new LogoutUseCase(userRepository, redisCache);

  // Account Use Cases
  const getAccountUseCase = new GetAccountUseCase(accountRepository, pixKeyRepository);
  const getBalanceUseCase = new GetBalanceUseCase(accountRepository);
  const addPixKeyUseCase = new AddPixKeyUseCase(accountRepository, pixKeyRepository);
  const removePixKeyUseCase = new RemovePixKeyUseCase(accountRepository, pixKeyRepository);

  // Controllers
  const authController = new AuthController(
    registerUserUseCase,
    loginUseCase,
    refreshTokenUseCase,
    logoutUseCase
  );
  const accountController = new AccountController(
    getAccountUseCase,
    getBalanceUseCase,
    addPixKeyUseCase,
    removePixKeyUseCase
  );

  // Create and start server
  const app = createServer(authController, accountController);

  app.listen(config.port, () => {
    logger.info(`🚀 ${config.serviceName} running on port ${config.port}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🗄️  DynamoDB Tables: ${JSON.stringify(config.tables)}`);
    if (redisCache) {
      logger.info(`🔴 Redis: Connected`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
})();
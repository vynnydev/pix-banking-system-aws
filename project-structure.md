pix-banking-system-aws/
│
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json                        # Root package.json (workspaces)
│
├── application/
│   │
│   ├── shared/                         # Código compartilhado (DRY)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   ├── User.ts
│   │       │   │   ├── Account.ts
│   │       │   │   ├── Transaction.ts
│   │       │   │   ├── PixKey.ts
│   │       │   │   └── Notification.ts
│   │       │   └── value-objects/
│   │       │       ├── Email.ts
│   │       │       ├── CPF.ts
│   │       │       ├── Money.ts
│   │       │       └── TransactionStatus.ts
│   │       │
│   │       ├── infrastructure/
│   │       │   ├── database/
│   │       │   │   ├── DynamoDBClient.ts
│   │       │   │   └── repositories/
│   │       │   │       └── BaseRepository.ts
│   │       │   ├── messaging/
│   │       │   │   ├── SNSPublisher.ts
│   │       │   │   └── SQSConsumer.ts
│   │       │   └── cache/
│   │       │       └── RedisClient.ts (opcional)
│   │       │
│   │       ├── application/
│   │       │   └── errors/
│   │       │       ├── AppError.ts
│   │       │       ├── ValidationError.ts
│   │       │       └── UnauthorizedError.ts
│   │       │
│   │       └── utils/
│   │           ├── logger.ts
│   │           ├── jwt.ts
│   │           ├── validators.ts
│   │           ├── encryption.ts
│   │           └── dateHelper.ts
│   │
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   │
│   │   └── src/
│   │       ├── index.ts
│   │       │
│   │       ├── domain/
│   │       │   ├── repositories/
│   │       │   │   ├── IUserRepository.ts
│   │       │   │   ├── IAccountRepository.ts
│   │       │   │   └── IPixKeyRepository.ts
│   │       │   └── services/
│   │       │       └── ITokenService.ts
│   │       │
│   │       ├── application/
│   │       │   ├── use-cases/
│   │       │   │   ├── auth/
│   │       │   │   │   ├── RegisterUserUseCase.ts
│   │       │   │   │   ├── LoginUseCase.ts
│   │       │   │   │   ├── RefreshTokenUseCase.ts
│   │       │   │   │   └── LogoutUseCase.ts
│   │       │   │   ├── account/
│   │       │   │   │   ├── GetAccountUseCase.ts
│   │       │   │   │   ├── GetBalanceUseCase.ts
│   │       │   │   │   ├── AddPixKeyUseCase.ts
│   │       │   │   │   └── RemovePixKeyUseCase.ts
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   └── dtos/
│   │       │       ├── RegisterUserDTO.ts
│   │       │       ├── LoginDTO.ts
│   │       │       └── AddPixKeyDTO.ts
│   │       │
│   │       ├── infrastructure/
│   │       │   ├── database/
│   │       │   │   └── repositories/
│   │       │   │       ├── DynamoDBUserRepository.ts
│   │       │   │       ├── DynamoDBAccountRepository.ts
│   │       │   │       └── DynamoDBPixKeyRepository.ts
│   │       │   │
│   │       │   ├── services/
│   │       │   │   └── JWTTokenService.ts
│   │       │   │
│   │       │   └── http/
│   │       │       ├── server.ts
│   │       │       ├── routes/
│   │       │       │   ├── index.ts
│   │       │       │   ├── authRoutes.ts
│   │       │       │   └── accountRoutes.ts
│   │       │       ├── controllers/
│   │       │       │   ├── AuthController.ts
│   │       │       │   └── AccountController.ts
│   │       │       └── middlewares/
│   │       │           ├── authMiddleware.ts
│   │       │           ├── errorHandler.ts
│   │       │           └── validators/
│   │       │               ├── registerValidator.ts
│   │       │               └── loginValidator.ts
│   │       │
│   │       └── config/
│   │           ├── app.ts
│   │           ├── database.ts
│   │           └── env.ts
│   │
│   ├── transaction-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   │
│   │   └── src/
│   │       ├── index.ts
│   │       │
│   │       ├── domain/
│   │       │   ├── repositories/
│   │       │   │   ├── ITransactionRepository.ts
│   │       │   │   ├── IAccountRepository.ts
│   │       │   │   └── INotificationRepository.ts
│   │       │   ├── services/
│   │       │   │   └── IEventPublisher.ts
│   │       │   └── events/
│   │       │       ├── TransactionCreatedEvent.ts
│   │       │       ├── TransactionSettledEvent.ts
│   │       │       └── PixReceivedEvent.ts
│   │       │
│   │       ├── application/
│   │       │   ├── use-cases/
│   │       │   │   ├── transaction/
│   │       │   │   │   ├── CreatePixTransactionUseCase.ts
│   │       │   │   │   ├── GetTransactionUseCase.ts
│   │       │   │   │   ├── ListTransactionsUseCase.ts
│   │       │   │   │   └── GetStatisticsUseCase.ts
│   │       │   │   └── notification/
│   │       │   │       ├── GetNotificationsUseCase.ts
│   │       │   │       └── MarkAsReadUseCase.ts
│   │       │   │
│   │       │   └── dtos/
│   │       │       ├── CreatePixTransactionDTO.ts
│   │       │       └── ListTransactionsDTO.ts
│   │       │
│   │       ├── infrastructure/
│   │       │   ├── database/
│   │       │   │   └── repositories/
│   │       │   │       ├── DynamoDBTransactionRepository.ts
│   │       │   │       ├── DynamoDBAccountRepository.ts
│   │       │   │       └── DynamoDBNotificationRepository.ts
│   │       │   │
│   │       │   ├── messaging/
│   │       │   │   └── SNSEventPublisher.ts
│   │       │   │
│   │       │   └── http/
│   │       │       ├── server.ts
│   │       │       ├── routes/
│   │       │       │   ├── index.ts
│   │       │       │   ├── transactionRoutes.ts
│   │       │       │   └── notificationRoutes.ts
│   │       │       ├── controllers/
│   │       │       │   ├── TransactionController.ts
│   │       │       │   └── NotificationController.ts
│   │       │       └── middlewares/
│   │       │           ├── authMiddleware.ts
│   │       │           └── errorHandler.ts
│   │       │
│   │       └── config/
│   │           ├── app.ts
│   │           ├── database.ts
│   │           ├── sns.ts
│   │           └── env.ts
│   │
│   └── settlement-service/
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       │
│       └── src/
│           ├── index.ts                # Para deployment contínuo
│           ├── cronjob.ts              # Para CronJob K8s
│           │
│           ├── domain/
│           │   ├── repositories/
│           │   │   └── ITransactionRepository.ts
│           │   └── services/
│           │       └── IEventPublisher.ts
│           │
│           ├── application/
│           │   ├── use-cases/
│           │   │   └── ProcessSettlementUseCase.ts
│           │   └── consumers/
│           │       └── SettlementConsumer.ts
│           │
│           ├── infrastructure/
│           │   ├── database/
│           │   │   └── repositories/
│           │   │       └── DynamoDBTransactionRepository.ts
│           │   │
│           │   └── messaging/
│           │       ├── SQSSettlementConsumer.ts
│           │       └── SNSEventPublisher.ts
│           │
│           └── config/
│               ├── app.ts
│               ├── database.ts
│               ├── sqs.ts
│               └── env.ts
│
├── infrastructure/                     # Terraform
│   ├── README.md
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   ├── backend.tf
│   ├── terraform.tfvars.example
│   │
│   └── modules/
│       ├── vpc/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── eks/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   ├── outputs.tf
│       │   └── files/
│       │       └── cluster-autoscaler.yaml
│       │
│       ├── ecr/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── dynamodb/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   ├── outputs.tf
│       │   └── table-schemas/
│       │       ├── users.json
│       │       ├── accounts.json
│       │       ├── transactions.json
│       │       ├── pixkeys.json
│       │       └── notifications.json
│       │
│       ├── sns-sqs/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── api-gateway/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   ├── outputs.tf
│       │   └── openapi/
│       │       └── api-spec.yaml
│       │
│       ├── iam/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── s3-frontend/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       └── rancher/
│           ├── main.tf
│           ├── variables.tf
│           └── outputs.tf
│
├── kubernetes/
│   ├── README.md
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── network-policy.yaml
│   │
│   ├── auth-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── serviceaccount.yaml
│   │
│   ├── transaction-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── serviceaccount.yaml
│   │
│   ├── settlement-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── cronjob.yaml
│   │   └── serviceaccount.yaml
│   │
│   ├── ingress/
│   │   ├── alb-ingress.yaml
│   │   └── cert-manager.yaml
│   │
│   └── rbac/
│       ├── roles.yaml
│       └── rolebindings.yaml
│
├── database/
│   ├── dynamodb/
│   │   ├── README.md
│   │   ├── table-definitions.json
│   │   └── seed-data/
│   │       ├── users.json
│   │       └── accounts.json
│   │
│   └── migrations/
│       └── README.md
│
├── scripts/
│   ├── README.md
│   ├── 00-install-dependencies.sh
│   ├── 01-setup-aws.sh
│   ├── 02-terraform-init.sh
│   ├── 03-build-images.sh
│   ├── 04-push-ecr.sh
│   ├── 05-deploy-kubernetes.sh
│   ├── 06-seed-database.sh
│   ├── 07-verify-deployment.sh
│   ├── 08-run-tests.sh
│   ├── 09-check-logs.sh
│   └── 99-destroy-all.sh
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── CLEAN-ARCHITECTURE.md
│   ├── API-DOCUMENTATION.md
│   ├── DEPLOYMENT-GUIDE.md
│   ├── DATABASE-DESIGN.md
│   ├── MESSAGING-FLOW.md
│   ├── FRONTEND-INTEGRATION.md
│   ├── EVIDENCE-GUIDE.md
│   │
│   └── diagrams/
│       ├── architecture-aws.drawio
│       ├── architecture-aws.png
│       ├── clean-architecture.drawio
│       ├── clean-architecture.png
│       ├── database-erd.drawio
│       ├── database-erd.png
│       ├── messaging-flow.drawio
│       ├── messaging-flow.png
│       └── api-endpoints.drawio
│
├── tests/                              # Testes (opcional, mas recomendado)
│   ├── integration/
│   │   ├── auth-service.test.ts
│   │   └── transaction-service.test.ts
│   │
│   └── e2e/
│       └── pix-flow.test.ts
│
└── .github/                            # CI/CD (opcional)
    └── workflows/
        ├── build.yml
        └── deploy.yml
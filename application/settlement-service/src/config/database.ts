export const databaseConfig = {
    dynamodb: {
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT, // undefined para produção
    },
    
    tables: {
      transactions: process.env.TRANSACTIONS_TABLE || 'pix-banking-transactions',
      accounts: process.env.ACCOUNTS_TABLE || 'pix-banking-accounts',
      notifications: process.env.NOTIFICATIONS_TABLE || 'pix-banking-notifications',
    },
  };
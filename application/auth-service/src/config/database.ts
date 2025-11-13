export const databaseConfig = {
    dynamodb: {
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT, // undefined para produção
    },
    
    tables: {
      users: process.env.USERS_TABLE || 'pix-banking-users',
      accounts: process.env.ACCOUNTS_TABLE || 'pix-banking-accounts',
      pixKeys: process.env.PIX_KEYS_TABLE || 'pix-banking-pixkeys',
    },
  };
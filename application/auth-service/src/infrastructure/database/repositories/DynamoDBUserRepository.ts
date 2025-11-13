import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '@pix-banking/shared';

export class DynamoDBUserRepository implements IUserRepository {
  constructor(private tableName: string) {}

  async save(user: User): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        userId: user.userId,
        name: user.name,                    // ✅ Correto (não fullName)
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
  }

  async findById(userId: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { userId },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Item) {
      return null;
    }

    return User.reconstitute({
      userId: result.Item.userId,
      name: result.Item.name, 
      fullName: result.Item.fullName,
      email: result.Item.email,
      cpf: result.Item.cpf,
      phone: result.Item.phone,
      passwordHash: result.Item.passwordHash,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];

    return User.reconstitute({
      userId: item.userId,
      name: item.name,
      fullName: item.fullName,
      email: item.email,
      cpf: item.cpf,
      phone: item.phone,
      passwordHash: item.passwordHash,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
  }

  async findByCPF(cpf: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'cpf-index',
      KeyConditionExpression: 'cpf = :cpf',
      ExpressionAttributeValues: {
        ':cpf': cpf,
      },
    });
  
    const result = await dynamoDBClient.send(command);
  
    if (!result.Items || result.Items.length === 0) {
      return null;
    }
  
    const item = result.Items[0];
  
    return User.reconstitute({
      userId: item.userId,
      name: item.name,
      fullName: item.fullName,
      email: item.email,
      cpf: item.cpf,
      phone: item.phone,
      passwordHash: item.passwordHash,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'cpf-index',
      KeyConditionExpression: 'cpf = :cpf',
      ExpressionAttributeValues: {
        ':cpf': cpf,
      },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];

    return User.reconstitute({
      userId: item.userId,
      name: item.name,
      fullName: item.fullName,
      email: item.email,
      cpf: item.cpf,
      phone: item.phone,
      passwordHash: item.passwordHash,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
  }

  async exists(userId: string): Promise<boolean> {  // ← NOVO MÉTODO
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { userId },
      ProjectionExpression: 'userId',
    });

    const result = await dynamoDBClient.send(command);
    
    return !!result.Item;
  }
}
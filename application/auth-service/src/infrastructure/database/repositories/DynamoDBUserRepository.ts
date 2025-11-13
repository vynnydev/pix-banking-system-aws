import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, User } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class DynamoDBUserRepository implements IUserRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(user: User): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        userId: user.userId,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        cpf: user.cpf,
        phone: user.phone,
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
      email: result.Item.email,
      passwordHash: result.Item.passwordHash,
      fullName: result.Item.fullName,
      cpf: result.Item.cpf,
      phone: result.Item.phone,
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
      email: item.email,
      passwordHash: item.passwordHash,
      fullName: item.fullName,
      cpf: item.cpf,
      phone: item.phone,
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
      email: item.email,
      passwordHash: item.passwordHash,
      fullName: item.fullName,
      cpf: item.cpf,
      phone: item.phone,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
  }

  async exists(email: string, cpf: string): Promise<boolean> {
    const userByEmail = await this.findByEmail(email);
    const userByCPF = await this.findByCPF(cpf);
    
    return userByEmail !== null || userByCPF !== null;
  }
}
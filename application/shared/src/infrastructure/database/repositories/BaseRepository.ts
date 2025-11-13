import { dynamoDBClient } from '../DynamoDBClient';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../../../utils/logger';

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Save entity to DynamoDB
   */
  protected async put(item: Record<string, any>): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });

      await dynamoDBClient.send(command);
      logger.debug('Item saved to DynamoDB', { tableName: this.tableName });
    } catch (error: any) {
      logger.error('Failed to save item to DynamoDB', {
        tableName: this.tableName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get entity from DynamoDB by key
   */
  protected async get(key: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: key,
      });

      const result = await dynamoDBClient.send(command);
      return result.Item || null;
    } catch (error: any) {
      logger.error('Failed to get item from DynamoDB', {
        tableName: this.tableName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update entity in DynamoDB
   */
  protected async update(
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
      });

      await dynamoDBClient.send(command);
      logger.debug('Item updated in DynamoDB', { tableName: this.tableName });
    } catch (error: any) {
      logger.error('Failed to update item in DynamoDB', {
        tableName: this.tableName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete entity from DynamoDB
   */
  protected async delete(key: Record<string, any>): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: key,
      });

      await dynamoDBClient.send(command);
      logger.debug('Item deleted from DynamoDB', { tableName: this.tableName });
    } catch (error: any) {
      logger.error('Failed to delete item from DynamoDB', {
        tableName: this.tableName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Query items from DynamoDB
   */
  protected async query(
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    indexName?: string,
    expressionAttributeNames?: Record<string, string>,
    limit?: number
  ): Promise<Record<string, any>[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        IndexName: indexName,
        Limit: limit,
      });

      const result = await dynamoDBClient.send(command);
      return result.Items || [];
    } catch (error: any) {
      logger.error('Failed to query items from DynamoDB', {
        tableName: this.tableName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Abstract method to convert DynamoDB item to entity
   */
  protected abstract toDomain(item: Record<string, any>): T;

  /**
   * Abstract method to convert entity to DynamoDB item
   */
  protected abstract toPersistence(entity: T): Record<string, any>;
}
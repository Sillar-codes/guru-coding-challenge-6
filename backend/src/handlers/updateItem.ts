import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils/dynamodb';
import { UpdateItemRequest, Item, ApiResponse } from '../types/item';
import { DYNAMO_TABLE } from '../config';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const itemId = event.pathParameters?.id;

    if (!itemId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Item ID is required' } as ApiResponse<null>),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is required' } as ApiResponse<null>),
      };
    }

    const updates: UpdateItemRequest = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    const updateExpression: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof UpdateItemRequest] !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key as keyof UpdateItemRequest];
      }
    });

    if (updateExpression.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No valid fields to update' } as ApiResponse<null>),
      };
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const command = new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { itemId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await ddbDocClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        body: result.Attributes as Item,
        message: 'Item updated successfully'
      } as ApiResponse<Item>),
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        statusCode: 500,
        body: null
      } as ApiResponse<null>),
    };
  }
};
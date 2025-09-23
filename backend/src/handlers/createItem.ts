import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ddbDocClient } from '../utils/dynamodb';
import { CreateItemRequest, Item, ApiResponse } from '../types/item';
import { DYNAMO_TABLE } from '../config';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is required' } as ApiResponse<null>),
      };
    }

    const request: CreateItemRequest = JSON.parse(event.body);
    
    // Validation
    if (!request.name || !request.description || !request.price || !request.category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'All fields are required' } as ApiResponse<null>),
      };
    }

    const itemId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const newItem: Item = {
      itemId,
      name: request.name,
      description: request.description,
      price: request.price,
      category: request.category,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMO_TABLE,
      Item: newItem,
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201,
        body: newItem,
        message: 'Item created successfully'
      } as ApiResponse<Item>),
    };
  } catch (error) {
    console.error('Error creating item:', error);
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
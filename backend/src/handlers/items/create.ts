import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { CreateItemRequest, Item } from '../../types/item';
import { TABLE_NAME } from '../../config';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return errorResponse('Unauthorized', 'User not authenticated', 401);
    }

    if (!event.body) {
      return errorResponse('ValidationError', 'Request body is required', 400);
    }

    const request: CreateItemRequest = JSON.parse(event.body);
    
    if (!request.name || !request.description || !request.price || !request.category) {
      return errorResponse('ValidationError', 'All fields are required', 400);
    }

    if (request.price <= 0) {
      return errorResponse('ValidationError', 'Price must be greater than 0', 400);
    }

    const itemId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const newItem: Item = {
      itemId,
      userId,
      name: request.name,
      description: request.description,
      price: request.price,
      category: request.category,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newItem,
    }));

    return successResponse(newItem, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    return errorResponse('InternalError', (error as Error).message);
  }
};
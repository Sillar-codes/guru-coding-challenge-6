import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { Item } from '../../types/item';
import { TABLE_NAME } from '../../config';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    
    if (!userId) {
      return errorResponse('Unauthorized', 'User not authenticated', 401);
    }

    const itemId = event.pathParameters?.id;

    if (!itemId) {
      return errorResponse('ValidationError', 'Item ID is required', 400);
    }

    const result = await ddbDocClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { itemId },
    }));

    if (!result.Item) {
      return errorResponse('NotFound', 'Item not found', 404);
    }

    const item = result.Item as Item;

    // Ensure the user can only access their own items
    if (item.userId !== userId) {
      return errorResponse('Forbidden', 'Access denied to this item', 403);
    }

    return successResponse<Item>(item);
  } catch (error) {
    console.error('Error getting item:', error);
    return errorResponse('InternalError', (error as Error).message);  // 'Failed to get item'
  }
};
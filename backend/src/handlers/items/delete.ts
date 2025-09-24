import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';
import { successResponse, errorResponse } from '../../libs/apiGateway';
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

    // First, verify the item exists and belongs to the user
    const getResult = await ddbDocClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { itemId },
    }));

    if (!getResult.Item) {
      return errorResponse('NotFound', 'Item not found', 404);
    }

    const existingItem = getResult.Item as any;
    if (existingItem.userId !== userId) {
      return errorResponse('Forbidden', 'Access denied to this item', 403);
    }

    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { itemId },
    }));

    return successResponse({ 
      message: 'Item deleted successfully',
      itemId 
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return errorResponse('InternalError', (error as Error).message);
  }
};
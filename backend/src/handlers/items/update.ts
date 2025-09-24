import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { UpdateItemRequest, Item } from '../../types/item';
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

    if (!event.body) {
      return errorResponse('ValidationError', 'Request body is required', 400);
    }

    // First, verify the item exists and belongs to the user
    const getResult = await ddbDocClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { itemId },
    }));

    if (!getResult.Item) {
      return errorResponse('NotFound', 'Item not found', 404);
    }

    const existingItem = getResult.Item as Item;
    if (existingItem.userId !== userId) {
      return errorResponse('Forbidden', 'Access denied to this item', 403);
    }

    const request: UpdateItemRequest = JSON.parse(event.body);
    
    // Check if at least one field is provided
    if (!request.name && !request.description && !request.price && !request.category) {
      return errorResponse('ValidationError', 'At least one field must be provided for update', 400);
    }

    if (request.price !== undefined && request.price <= 0) {
      return errorResponse('ValidationError', 'Price must be greater than 0', 400);
    }

    const updateExpression: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    if (request.name) {
      updateExpression.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = request.name;
    }

    if (request.description) {
      updateExpression.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = request.description;
    }

    if (request.price !== undefined) {
      updateExpression.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = request.price;
    }

    if (request.category) {
      updateExpression.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = request.category;
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await ddbDocClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { itemId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse<Item>(result.Attributes as Item);
  } catch (error) {
    console.error('Error updating item:', error);
    return errorResponse('InternalError', 'Failed to update item');
  }
};
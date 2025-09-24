import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
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

    const result = await ddbDocClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return successResponse<Item[]>(result.Items as Item[] || []);
  } catch (error) {
    console.error('Error listing items:', error);
    return errorResponse('InternalError', (error as Error).message);
  }
};
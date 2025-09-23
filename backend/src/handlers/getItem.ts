import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils/dynamodb';
import { Item, ApiResponse } from '../types/item';
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

    const command = new GetCommand({
      TableName: DYNAMO_TABLE,
      Key: { itemId },
    });

    const result = await ddbDocClient.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' } as ApiResponse<null>),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        body: result.Item as Item,
        message: 'Item retrieved successfully'
      } as ApiResponse<Item>),
    };
  } catch (error) {
    console.error('Error retrieving item:', error);
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
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils/dynamodb';
import { ApiResponse } from '../types/item';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const itemId = event.pathParameters?.id;

    if (!itemId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Item ID is required' } as ApiResponse<null>),
      };
    }

    const command = new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: { itemId },
      ReturnValues: 'ALL_OLD',
    });

    const result = await ddbDocClient.send(command);

    if (!result.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' } as ApiResponse<null>),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        body: null,
        message: 'Item deleted successfully'
      } as ApiResponse<null>),
    };
  } catch (error) {
    console.error('Error deleting item:', error);
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
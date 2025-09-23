import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils/dynamodb';
import { Item, ApiResponse } from '../types/item';
import { DYNAMO_TABLE } from '../config';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const command = new ScanCommand({
      TableName: DYNAMO_TABLE,
    });

    const result = await ddbDocClient.send(command);
    const items = result.Items as Item[] || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        body: items,
        message: 'Items retrieved successfully'
      } as ApiResponse<Item[]>),
    };
  } catch (error) {
    console.error('Error retrieving items:', error);
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
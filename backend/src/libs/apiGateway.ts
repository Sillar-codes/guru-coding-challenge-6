import { APIGatewayProxyResult } from 'aws-lambda';
import { corsOption } from 'config';

export function successResponse<T>(body: T, statusCode: number = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsOption,
    body: JSON.stringify(body),
  };
}

export function errorResponse(error: string, message: string, statusCode: number = 500): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsOption,
    body: JSON.stringify({ error, message }),
  };
}
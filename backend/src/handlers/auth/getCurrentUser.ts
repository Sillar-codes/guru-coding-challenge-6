import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const successResponse = <T>(body: T, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': false,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}

const errorResponse = (message: string, statusCode: number = 500): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': false,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    },
    body: message,
  };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get user data from authorizer context (no need for additional Cognito calls)
    const requestContext = event.requestContext;
    const authorizer = requestContext.authorizer;
    
    const userData = {
      userId: authorizer?.userId,
      email: authorizer?.email,
      name: authorizer?.name,
      email_verified: authorizer?.email_verified === 'true'
    };

    return successResponse(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return errorResponse('Failed to get user data');
  }
};
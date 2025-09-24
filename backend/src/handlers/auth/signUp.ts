import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { SignUpRequest } from '../../types/auth';
import { REGION, USER_POOL_ID } from '../../config';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: REGION
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('ValidationError', 'Request body is required', 400);
    }

    const request: SignUpRequest = JSON.parse(event.body);
    
    if (!request.email || !request.password || !request.name) {
      return errorResponse('ValidationError', 'Email, password, and name are required', 400);
    }

    if (request.password.length < 8) {
      return errorResponse('ValidationError', 'Password must be at least 8 characters long', 400);
    }

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: request.email,
      UserAttributes: [
        { Name: 'email', Value: request.email },
        { Name: 'name', Value: request.name },
        { Name: 'email_verified', Value: 'true' }
      ],
      MessageAction: 'SUPPRESS',
      TemporaryPassword: request.password,
    });

    await cognitoClient.send(createUserCommand);

    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: request.email,
      Password: request.password,
      Permanent: true,
    });

    await cognitoClient.send(setPasswordCommand);

    return successResponse({ 
      message: 'User created successfully',
      user: {
        email: request.email,
        name: request.name
      }
    }, 201);
  } catch (error) {
    const err = error as Error;
    console.error('Error signing up user:', error);
    
    if (err.name === 'UsernameExistsException') {
      return errorResponse('UsernameExists', 'User with this email already exists', 400);
    }
    
    return errorResponse('InternalError', err.message);
  }
};
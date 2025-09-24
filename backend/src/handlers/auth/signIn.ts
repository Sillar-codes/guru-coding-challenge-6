import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { SignInRequest, AuthResponse } from '../../types/auth';
import { REGION, USER_POOL_CLIENT_ID, USER_POOL_ID } from '../../config';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: REGION 
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('ValidationError', 'Request body is required', 400);
    }

    const request: SignInRequest = JSON.parse(event.body);
    
    if (!request.email || !request.password) {
      return errorResponse('ValidationError', 'Email and password are required', 400);
    }

    const authCommand = new AdminInitiateAuthCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: USER_POOL_CLIENT_ID,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: request.email,
        PASSWORD: request.password,
      },
    });

    const response = await cognitoClient.send(authCommand);

    if (!response.AuthenticationResult) {
      return errorResponse('AuthenticationError', 'Authentication failed', 401);
    }

    const authResponse: AuthResponse = {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn!,
      tokenType: response.AuthenticationResult.TokenType!,
    };

    return successResponse(authResponse);
  } catch (error) {
    const err = error as Error;
    console.error('Error signing in user:', error);
    
    if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
      return errorResponse('AuthenticationError', 'Invalid email or password', 401);
    }
    
    return errorResponse('InternalError', 'Failed to authenticate user');
  }
};
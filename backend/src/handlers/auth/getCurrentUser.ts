import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../../libs/apiGateway';
import { User } from '../../types/auth';
import { REGION, USER_POOL_ID } from '../../config';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: REGION 
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    const email = event.requestContext.authorizer?.claims?.email;
    const name = event.requestContext.authorizer?.claims?.name;
    
    if (!userId) {
      return errorResponse('Unauthorized', 'User not authenticated', 401);
    }

    // Get additional user info from Cognito
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });

    const userInfo = await cognitoClient.send(getUserCommand);

    const user: User = {
      userId,
      email: email || '',
      name: name || '',
      emailVerified: userInfo.UserAttributes?.find(attr => attr.Name === 'email_verified')?.Value === 'true',
    };

    return successResponse(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    return errorResponse('InternalError', 'Failed to get user information');
  }
};
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { REGION } from 'config';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: REGION
});

// Simple JWT decoder (for basic validation)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // First, try to decode the JWT to get basic info
    const decoded = decodeJWT(token);
    if (!decoded) {
      throw new Error('Invalid token format');
    }

    // Then validate with AWS Cognito
    try {
      const getUserCommand = new GetUserCommand({
        AccessToken: token,
      });

      const userInfo = await cognitoClient.send(getUserCommand);
      
      const emailAttr = userInfo.UserAttributes?.find(attr => attr.Name === 'email');
      const nameAttr = userInfo.UserAttributes?.find(attr => attr.Name === 'name');
      
      return {
        principalId: userInfo.Username!,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: event.methodArn,
            },
          ],
        },
        context: {
          userId: userInfo.Username!,
          email: emailAttr?.Value || '',
          name: nameAttr?.Value || '',
        },
      };
    } catch (cognitoError) {
      // If Cognito validation fails, fall back to basic JWT decoding
      console.warn('Cognito validation failed, using basic JWT decoding:', cognitoError);
      
      return {
        principalId: decoded.sub || 'user',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: event.methodArn,
            },
          ],
        },
        context: {
          userId: decoded.sub,
          email: decoded.email || '',
          name: decoded.name || '',
        },
      };
    }
  } catch (error) {
    console.error('Authorization error:', error);
    
    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn,
          },
        ],
      },
    };
  }
};
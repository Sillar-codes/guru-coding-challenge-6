import { configDotenv } from 'dotenv'

configDotenv();

export const REGION = process.env.AWS_REGION || '';

export const USER_POOL_ID = process.env.USER_POOL_ID || '';
export const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

export const TABLE_NAME = process.env.TABLE_NAME || '';

export const corsOption = {
    'Access-Control-Allow-Origin': '*'
};
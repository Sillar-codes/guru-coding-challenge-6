export const corsOption = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN!,
    'Access-Control-Allow-Credentials': false,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};
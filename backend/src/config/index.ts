import { configDotenv } from 'dotenv'

configDotenv();

export const DYNAMO_TABLE = process.env.DYNAMO_TABLE || 'guru_items';
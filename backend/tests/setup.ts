import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

jest.setTimeout(30000);

// Mock Redis
jest.mock('ioredis', () => require('ioredis-mock'));

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-ses');
jest.mock('@aws-sdk/s3-request-presigner');

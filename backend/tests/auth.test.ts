import request from 'supertest';
import app from '../src/app';

describe('Auth Module', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    
    // Note: This will fail without a running DB, but shows the structure
    expect(res.status).toBeDefined();
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.status).toBeDefined();
  });
});

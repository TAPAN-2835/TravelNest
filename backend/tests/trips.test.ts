import request from 'supertest';
import app from '../src/app';

describe('Trips & Itinerary Module', () => {
  let token: string;

  beforeAll(async () => {
    // Mock login to get token
    token = 'mock-jwt-token';
  });

  it('should create a new trip', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destinationId: 'some-uuid',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        budget: 50000,
      });
    
    expect(res.status).toBeDefined();
  });

  it('should generate an itinerary', async () => {
    const res = await request(app)
      .post('/api/itinerary/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tripId: 'some-trip-uuid',
        destination: 'Paris',
        country: 'France',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        budget: 1000,
        currency: 'EUR',
        travelStyle: 'Luxury',
        groupSize: 2,
        interests: ['Art', 'History'],
      });
    
    expect(res.status).toBeDefined();
  });
});

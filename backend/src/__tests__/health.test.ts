import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        uptime: expect.any(Number)
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return consistent health status on multiple calls', async () => {
      const response1 = await request(app)
        .get('/api/health')
        .expect(200);

      const response2 = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response1.body.status).toBe('healthy');
      expect(response2.body.status).toBe('healthy');
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });

  describe('404 Routes', () => {
    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for wrong HTTP method', async () => {
      await request(app)
        .post('/api/health')
        .expect(404);
    });
  });
});
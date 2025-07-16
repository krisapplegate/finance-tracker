import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../services/api';

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should check health successfully', async () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 12345
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealth
      });

      const result = await apiService.healthCheck();

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const result = await apiService.healthCheck();

      expect(result.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.healthCheck();

      expect(result.status).toBe(0);
      expect(result.error).toBe('Network error');
    });
  });
});
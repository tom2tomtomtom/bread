import { generateWithOpenAI, mockResponse } from '../secureApiService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('secureApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateWithOpenAI', () => {
    it('should make a POST request to the correct endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          territories: [
            {
              id: '001',
              title: 'Test Territory',
              positioning: 'Test positioning',
              tone: 'Test tone',
              headlines: [
                {
                  text: 'Test headline',
                  followUp: 'Test follow up',
                  reasoning: 'Test reasoning',
                  confidence: 85,
                },
              ],
            },
          ],
          compliance: {
            powerBy: ['Test compliance'],
            output: 'LOW RISK',
            notes: ['Test note'],
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateWithOpenAI('test prompt', false, 'test brief');

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/generate-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'test prompt',
          generateImages: false,
          brief: 'test brief',
        }),
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(generateWithOpenAI('test prompt')).rejects.toThrow(
        'Failed to generate content: HTTP error! status: 500'
      );
    });

    it('should handle API response errors', async () => {
      const errorResponse = {
        success: false,
        error: 'API key not configured',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse,
      });

      await expect(generateWithOpenAI('test prompt')).rejects.toThrow(
        'Failed to generate content: API key not configured'
      );
    });

    it('should use development URL in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { territories: [], compliance: { powerBy: [], output: '', notes: [] } },
        }),
      });

      await generateWithOpenAI('test prompt');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8888/.netlify/functions/generate-openai',
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('mockResponse', () => {
    it('should return a valid GeneratedOutput structure', () => {
      const response = mockResponse();

      expect(response).toHaveProperty('territories');
      expect(response).toHaveProperty('compliance');
      expect(Array.isArray(response.territories)).toBe(true);
      expect(response.territories.length).toBeGreaterThan(0);

      const territory = response.territories[0];
      expect(territory).toHaveProperty('id');
      expect(territory).toHaveProperty('title');
      expect(territory).toHaveProperty('positioning');
      expect(territory).toHaveProperty('tone');
      expect(territory).toHaveProperty('headlines');
      expect(Array.isArray(territory.headlines)).toBe(true);

      const headline = territory.headlines[0];
      expect(headline).toHaveProperty('text');
      expect(headline).toHaveProperty('followUp');
      expect(headline).toHaveProperty('reasoning');
      expect(headline).toHaveProperty('confidence');
      expect(typeof headline.confidence).toBe('number');

      expect(response.compliance).toHaveProperty('powerBy');
      expect(response.compliance).toHaveProperty('output');
      expect(response.compliance).toHaveProperty('notes');
      expect(Array.isArray(response.compliance.powerBy)).toBe(true);
      expect(Array.isArray(response.compliance.notes)).toBe(true);
    });
  });
});

const OpenRouterClient = require('./openRouterClient');
const { NetworkError, RateLimitError, InvalidResponseError } = require('./errors');

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenRouterClient', () => {
  let client;

  beforeEach(() => {
    client = new OpenRouterClient('test-api-key', 'https://test-api.com/v1');
    jest.clearAllMocks();
  });

  describe('getModels', () => {
    it('should fetch and return models successfully', async () => {
      const mockModels = [
        { id: 'model-1', name: 'Test Model 1' },
        { id: 'model-2', name: 'Test Model 2' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockModels }),
        headers: new Map(),
      });

      const models = await client.getModels();

      expect(models).toEqual(mockModels);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.com/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw RateLimitError on 429 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: (key) => key === 'Retry-After' ? '60' : null },
      });

      await expect(client.getModels()).rejects.toThrow(RateLimitError);

      // Setup mock again for second assertion
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: (key) => key === 'Retry-After' ? '60' : null },
      });
      
      await expect(client.getModels()).rejects.toThrow('Rate limit exceeded');
    });

    it('should use default retry time if Retry-After header missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => null },
      });

      try {
        await client.getModels();
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect(error.retryAfter).toBe(60000); // Default 60s
      }
    });

    it('should throw NetworkError on non-200 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
      });

      await expect(client.getModels()).rejects.toThrow(NetworkError);
      await expect(client.getModels()).rejects.toThrow('Failed to fetch models: 500');
    });

    it('should throw InvalidResponseError if response format is invalid', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'format' }),
        headers: new Map(),
      });

      await expect(client.getModels()).rejects.toThrow(InvalidResponseError);
      await expect(client.getModels()).rejects.toThrow('expected { data: [...] }');
    });

    it('should throw NetworkError on timeout', async () => {
      client.timeout = 100; // 100ms timeout for test

      global.fetch.mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 200))
      );

      await expect(client.getModels()).rejects.toThrow(NetworkError);
      await expect(client.getModels()).rejects.toThrow('Request timed out');
    });

    it('should throw NetworkError on fetch failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(client.getModels()).rejects.toThrow(NetworkError);
      await expect(client.getModels()).rejects.toThrow('Network error');
    });
  });

  describe('sendChatMessage', () => {
    const model = 'test-model';
    const messages = [{ role: 'user', content: 'Hello' }];

    it('should send chat message and return response', async () => {
      const mockResponse = {
        choices: [
          { message: { role: 'assistant', content: 'Hi there!' } }
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const response = await client.sendChatMessage(model, messages);

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-api.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
          body: JSON.stringify({ model, messages }),
        })
      );
    });

    it('should include options in request body', async () => {
      const options = { temperature: 0.7, max_tokens: 100 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'test' } }] }),
        headers: new Map(),
      });

      await client.sendChatMessage(model, messages, options);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ model, messages, ...options }),
        })
      );
    });

    it('should throw RateLimitError on 429 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['Retry-After', '30']]),
      });

      await expect(client.sendChatMessage(model, messages)).rejects.toThrow(RateLimitError);
    });

    it('should throw NetworkError on non-200 response with error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'Invalid model' } }),
        headers: new Map(),
      });

      await expect(client.sendChatMessage(model, messages)).rejects.toThrow(NetworkError);
      await expect(client.sendChatMessage(model, messages)).rejects.toThrow('Invalid model');
    });

    it('should throw InvalidResponseError if choices array is empty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
        headers: new Map(),
      });

      await expect(client.sendChatMessage(model, messages)).rejects.toThrow(InvalidResponseError);
    });

    it('should throw NetworkError on timeout', async () => {
      client.timeout = 50;

      global.fetch.mockImplementationOnce(() =>
        new Promise((resolve) => setTimeout(resolve, 200))
      );

      await expect(client.sendChatMessage(model, messages)).rejects.toThrow(NetworkError);
      await expect(client.sendChatMessage(model, messages)).rejects.toThrow('timed out');
    });
  });

  describe('constructor', () => {
    it('should use provided API key and base URL', () => {
      const customClient = new OpenRouterClient('custom-key', 'https://custom-url.com/v1');
      
      expect(customClient.apiKey).toBe('custom-key');
      expect(customClient.baseUrl).toBe('https://custom-url.com/v1');
    });

    it('should use defaults from config if not provided', () => {
      const defaultClient = new OpenRouterClient();
      
      expect(defaultClient.apiKey).toBeDefined();
      expect(defaultClient.baseUrl).toBeDefined();
    });
  });
});

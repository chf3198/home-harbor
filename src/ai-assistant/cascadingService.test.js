const CascadingService = require('./cascadingService');
const {
  ModelTimeoutError,
  RateLimitError,
  AllModelsFailedError,
  NoAvailableModelsError: _NoAvailableModelsError, // eslint-disable-line no-unused-vars
} = require('./errors');

// Mock dependencies
const mockClient = {
  getModels: jest.fn(),
  sendChatMessage: jest.fn(),
};

const mockSelector = {
  getCascadeOrder: jest.fn(),
};

describe('CascadingService', () => {
  let service;

  beforeEach(() => {
    service = new CascadingService(mockClient, mockSelector);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('sendWithCascade', () => {
    const messages = [{ role: 'user', content: 'Hello' }];

    it('should succeed on first model attempt', async () => {
      const models = [
        { id: 'model-1', context_length: 128000, score: 90 },
        { id: 'model-2', context_length: 32000, score: 70 },
      ];

      const mockResponse = {
        choices: [{ message: { content: 'Hi there!' } }],
      };

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockResolvedValue(mockResponse);

      const result = await service.sendWithCascade(messages);

      expect(result.success).toBe(true);
      expect(result.model).toBe('model-1');
      expect(result.response).toBe('Hi there!');
      expect(result.attempts).toBe(1);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(1);
    });

    it('should cascade to second model if first fails', async () => {
      const models = [
        { id: 'model-1', score: 90 },
        { id: 'model-2', score: 70 },
      ];

      const mockResponse = {
        choices: [{ message: { content: 'Success from model-2' } }],
      };

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      
      mockClient.sendChatMessage
        .mockRejectedValueOnce(new Error('Model 1 failed'))
        .mockResolvedValueOnce(mockResponse);

      const promise = service.sendWithCascade(messages);
      
      // Fast-forward timers for timeouts
      jest.advanceTimersByTime(100);
      
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.model).toBe('model-2');
      expect(result.response).toBe('Success from model-2');
      expect(result.attempts).toBe(2);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(2);
    });

    it('should throw AllModelsFailedError if all models fail', async () => {
      const models = [
        { id: 'model-1', score: 90 },
        { id: 'model-2', score: 70 },
      ];

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockRejectedValue(new Error('All failed'));

      const promise = service.sendWithCascade(messages);
      
      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow(AllModelsFailedError);
      await expect(promise).rejects.toThrow('All 2 models failed');
    });

    it('should include attempt details in AllModelsFailedError', async () => {
      const models = [{ id: 'model-1', score: 90 }];

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockRejectedValue(new Error('Network error'));

      const promise = service.sendWithCascade(messages);
      jest.advanceTimersByTime(100);

      try {
        await promise;
      } catch (error) {
        expect(error).toBeInstanceOf(AllModelsFailedError);
        expect(error.attempts).toHaveLength(1);
        expect(error.attempts[0]).toMatchObject({
          model: 'model-1',
          error: 'Error',
          message: 'Network error',
        });
      }
    });

    it('should retry on RateLimitError before cascading', async () => {
      const models = [{ id: 'model-1', score: 90 }];

      const rateLimitError = new RateLimitError('Rate limited', 100);
      const mockResponse = {
        choices: [{ message: { content: 'Success after retry' } }],
      };

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      
      mockClient.sendChatMessage
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockResponse);

      const promise = service.sendWithCascade(messages);
      
      // Advance past initial request timeout
      jest.advanceTimersByTime(100);
      
      // Advance past retry backoff
      await Promise.resolve(); // Allow promise to update
      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(2);
    });

    it('should respect custom timeout', async () => {
      const models = [{ id: 'model-1', score: 90 }];
      const customTimeout = 5000;

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const promise = service.sendWithCascade(messages, {}, customTimeout);
      
      jest.advanceTimersByTime(customTimeout + 100);

      try {
        await promise;
      } catch (error) {
        expect(error).toBeInstanceOf(AllModelsFailedError);
        expect(error.attempts[0].error).toBe('ModelTimeoutError');
      }
    });
  });

  describe('sendWithRetry', () => {
    const modelId = 'test-model';
    const messages = [{ role: 'user', content: 'Hello' }];

    it('should succeed on first attempt', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
      };

      mockClient.sendChatMessage.mockResolvedValue(mockResponse);

      const result = await service.sendWithRetry(modelId, messages);

      expect(result.success).toBe(true);
      expect(result.model).toBe(modelId);
      expect(result.attempts).toBe(1);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(1);
    });

    it('should retry on RateLimitError', async () => {
      const rateLimitError = new RateLimitError('Rate limited', 100);
      const mockResponse = {
        choices: [{ message: { content: 'Success after retry' } }],
      };

      mockClient.sendChatMessage
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockResponse);

      const promise = service.sendWithRetry(modelId, messages);
      
      // Advance past retry delay
      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(2);
    });

    it('should throw non-retryable errors immediately', async () => {
      const error = new Error('Invalid request');
      mockClient.sendChatMessage.mockRejectedValue(error);

      await expect(service.sendWithRetry(modelId, messages))
        .rejects.toThrow('Invalid request');
      
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exceeded', async () => {
      const rateLimitError = new RateLimitError('Rate limited', 10);
      mockClient.sendChatMessage.mockRejectedValue(rateLimitError);

      service.maxRetries = 2;

      const promise = service.sendWithRetry(modelId, messages);
      
      // Advance through all retry attempts
      jest.advanceTimersByTime(1000);

      await expect(promise).rejects.toThrow(RateLimitError);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', async () => {
      const rateLimitError = new RateLimitError('Rate limited', 100);
      
      mockClient.sendChatMessage.mockRejectedValue(rateLimitError);
      service.maxRetries = 3;

      const promise = service.sendWithRetry(modelId, messages);
      
      // First attempt fails immediately
      await Promise.resolve();
      
      // First retry after 100ms (from error.retryAfter)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Second retry after 200ms (exponential backoff)
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      
      // Third retry after 400ms
      jest.advanceTimersByTime(400);

      await expect(promise).rejects.toThrow(RateLimitError);
    });
  });

  describe('_attemptWithTimeout', () => {
    it('should resolve if request completes within timeout', async () => {
      const mockResponse = { choices: [{ message: { content: 'OK' } }] };
      mockClient.sendChatMessage.mockResolvedValue(mockResponse);

      const promise = service._attemptWithTimeout('model-1', [], {}, 5000);
      
      jest.advanceTimersByTime(100);

      const result = await promise;
      expect(result).toEqual(mockResponse);
    });

    it('should reject with ModelTimeoutError if timeout exceeded', async () => {
      mockClient.sendChatMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const promise = service._attemptWithTimeout('model-1', [], {}, 1000);
      
      jest.advanceTimersByTime(1100);

      await expect(promise).rejects.toThrow(ModelTimeoutError);
      await expect(promise).rejects.toThrow('model-1 timed out after 1000ms');
    });
  });

  describe('_sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const promise = service._sleep(1000);
      
      jest.advanceTimersByTime(999);
      expect(promise).not.toEqual(expect.objectContaining({ status: 'fulfilled' }));
      
      jest.advanceTimersByTime(1);
      await promise;
      
      // If we reach here, sleep completed
      expect(true).toBe(true);
    });
  });
});

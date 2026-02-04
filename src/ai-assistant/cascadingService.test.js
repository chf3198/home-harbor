const CascadingService = require('./cascadingService');
const {
  ModelTimeoutError,
  RateLimitError: _RateLimitError,
  AllModelsFailedError,
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
        choices: [{ message: { content: 'From second model' } }],
      };

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage
        .mockRejectedValueOnce(new Error('First model failed'))
        .mockResolvedValueOnce(mockResponse);

      const result = await service.sendWithCascade(messages);

      expect(result.success).toBe(true);
      expect(result.model).toBe('model-2');
      expect(result.response).toBe('From second model');
      expect(result.attempts).toBe(2);
      expect(mockClient.sendChatMessage).toHaveBeenCalledTimes(2);
    });

    it('should throw AllModelsFailedError when all models fail', async () => {
      const models = [
        { id: 'model-1', score: 90 },
        { id: 'model-2', score: 70 },
      ];

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockRejectedValue(new Error('Network error'));

      try {
        await service.sendWithCascade(messages);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AllModelsFailedError);
        expect(error.attempts).toHaveLength(2);
      }
    });

    it('should handle timeout on individual model', async () => {
      const models = [
        { id: 'model-1', score: 90 },
        { id: 'model-2', score: 70 },
      ];

      const mockResponse = {
        choices: [{ message: { content: 'Success' } }],
      };

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage
        .mockImplementationOnce(() => new Promise(() => {})) // Never resolves
        .mockResolvedValueOnce(mockResponse);

      const promise = service.sendWithCascade(messages, {}, 100);
      
      jest.advanceTimersByTime(150);
      
      const result = await promise;
      expect(result.success).toBe(true);
      expect(result.model).toBe('model-2');
    });

    it('should include error details in attempts', async () => {
      const models = [{ id: 'model-1', score: 90 }];

      mockClient.getModels.mockResolvedValue([]);
      mockSelector.getCascadeOrder.mockReturnValue(models);
      mockClient.sendChatMessage.mockRejectedValue(new Error('Network error'));

      try {
        await service.sendWithCascade(messages);
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

    it('should pass options to client', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
      };
      const options = { temperature: 0.7 };

      mockClient.sendChatMessage.mockResolvedValue(mockResponse);

      await service.sendWithRetry(modelId, messages, options);

      expect(mockClient.sendChatMessage).toHaveBeenCalledWith(modelId, messages, options);
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
        () => new Promise(() => {}) // Never resolves
      );

      const promise = service._attemptWithTimeout('model-1', [], {}, 1000);
      
      jest.advanceTimersByTime(1100);

      await expect(promise).rejects.toThrow(ModelTimeoutError);
    });
  });
});

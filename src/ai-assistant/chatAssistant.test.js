const ChatAssistant = require('./chatAssistant');
const { ConfigurationError, AllModelsFailedError } = require('./errors');

// Mock dependencies
jest.mock('./openRouterClient');
jest.mock('./modelSelector');
jest.mock('./cascadingService');
jest.mock('./config', () => ({
  validateConfig: jest.fn(),
  OPENROUTER_API_KEY: 'test-key',
  OPENROUTER_BASE_URL: 'https://test.com/v1',
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_BACKOFF_MS: 1000,
  APP_HEADERS: {},
}));

// These are used by jest.mock() - ESLint doesn't detect this pattern
const _OpenRouterClient = require('./openRouterClient'); // eslint-disable-line no-unused-vars
const _ModelSelector = require('./modelSelector'); // eslint-disable-line no-unused-vars
const CascadingService = require('./cascadingService');
const { validateConfig } = require('./config');

describe('ChatAssistant', () => {
  let assistant;
  let mockCascade;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock cascading service
    mockCascade = {
      sendWithCascade: jest.fn(),
    };
    CascadingService.mockImplementation(() => mockCascade);

    assistant = new ChatAssistant();
  });

  describe('constructor', () => {
    it('should validate configuration on initialization', () => {
      expect(validateConfig).toHaveBeenCalled();
    });

    it('should throw if configuration is invalid', () => {
      validateConfig.mockImplementationOnce(() => {
        throw new ConfigurationError('Missing API key');
      });

      expect(() => new ChatAssistant()).toThrow(ConfigurationError);
    });

    it('should initialize with empty conversation history', () => {
      expect(assistant.getHistory()).toEqual([]);
    });

    it('should set default system prompt', () => {
      expect(assistant.systemPrompt).toContain('HomeHarbor');
      expect(assistant.systemPrompt).toContain('real estate');
    });
  });

  describe('ask', () => {
    const userMessage = 'What is HomeHarbor?';

    it('should send message and return response', async () => {
      const mockResponse = {
        response: 'HomeHarbor is a real estate platform',
        model: 'test-model',
        attempts: 1,
      };

      mockCascade.sendWithCascade.mockResolvedValue(mockResponse);

      const result = await assistant.ask(userMessage);

      expect(result.success).toBe(true);
      expect(result.message).toBe('HomeHarbor is a real estate platform');
      expect(result.model).toBe('test-model');
      expect(result.attempts).toBe(1);
    });

    it('should add user message to conversation history', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask(userMessage);

      const history = assistant.getHistory();
      expect(history[0]).toEqual({
        role: 'user',
        content: userMessage,
      });
    });

    it('should add assistant response to conversation history', async () => {
      const responseText = 'This is the response';
      mockCascade.sendWithCascade.mockResolvedValue({
        response: responseText,
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask(userMessage);

      const history = assistant.getHistory();
      expect(history[1]).toEqual({
        role: 'assistant',
        content: responseText,
      });
    });

    it('should include system prompt in messages', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask(userMessage);

      expect(mockCascade.sendWithCascade).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: userMessage }),
        ]),
        {}
      );
    });

    it('should maintain conversation context across multiple messages', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask('First message');
      await assistant.ask('Second message');

      const history = assistant.getHistory();
      expect(history).toHaveLength(4); // 2 user + 2 assistant
      expect(history[2].content).toBe('Second message');
    });

    it('should pass options to cascade service', async () => {
      const options = { temperature: 0.7, max_tokens: 100 };
      
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask(userMessage, options);

      expect(mockCascade.sendWithCascade).toHaveBeenCalledWith(
        expect.any(Array),
        options
      );
    });

    it('should return error response if cascade fails', async () => {
      const error = new AllModelsFailedError('All models failed', []);
      mockCascade.sendWithCascade.mockRejectedValue(error);

      const result = await assistant.ask(userMessage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('All models failed');
      expect(result.errorType).toBe('AllModelsFailedError');
    });

    it('should not add failed response to history', async () => {
      mockCascade.sendWithCascade.mockRejectedValue(new Error('Failed'));

      await assistant.ask(userMessage);

      const history = assistant.getHistory();
      // Only user message should be in history
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('user');
    });

    it('should include retry metadata if present', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 2,
        retried: true,
      });

      const result = await assistant.ask(userMessage);

      expect(result.retried).toBe(true);
      expect(result.attempts).toBe(2);
    });
  });

  describe('askOneOff', () => {
    const question = 'What is the weather?';

    it('should send question without affecting conversation history', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Sunny',
        model: 'test-model',
        attempts: 1,
      });

      const result = await assistant.askOneOff(question);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sunny');
      expect(assistant.getHistory()).toHaveLength(0);
    });

    it('should include system prompt but no conversation history', async () => {
      // Add some history first
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask('Previous message');
      
      // Now ask one-off
      await assistant.askOneOff(question);

      // Check that one-off only includes system + question
      const lastCall = mockCascade.sendWithCascade.mock.calls[1];
      expect(lastCall[0]).toHaveLength(2); // system + user question only
      expect(lastCall[0][0].role).toBe('system');
      expect(lastCall[0][1].content).toBe(question);
    });

    it('should return error response on failure', async () => {
      mockCascade.sendWithCascade.mockRejectedValue(new Error('Network error'));

      const result = await assistant.askOneOff(question);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('clearHistory', () => {
    it('should remove all conversation history', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask('Message 1');
      await assistant.ask('Message 2');
      
      expect(assistant.getHistory()).toHaveLength(4);

      assistant.clearHistory();

      expect(assistant.getHistory()).toHaveLength(0);
    });
  });

  describe('setSystemPrompt', () => {
    it('should update system prompt', () => {
      const customPrompt = 'You are a custom assistant';
      
      assistant.setSystemPrompt(customPrompt);

      expect(assistant.systemPrompt).toBe(customPrompt);
    });

    it('should use new system prompt in subsequent requests', async () => {
      const customPrompt = 'Custom prompt';
      assistant.setSystemPrompt(customPrompt);

      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask('Test');

      expect(mockCascade.sendWithCascade).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system', content: customPrompt }),
        ]),
        {}
      );
    });
  });

  describe('getHistory', () => {
    it('should return copy of conversation history', async () => {
      mockCascade.sendWithCascade.mockResolvedValue({
        response: 'Response',
        model: 'test-model',
        attempts: 1,
      });

      await assistant.ask('Test message');

      const history = assistant.getHistory();
      
      // Modify returned array
      history.push({ role: 'user', content: 'Should not affect internal state' });

      // Internal history should be unchanged
      expect(assistant.getHistory()).toHaveLength(2);
    });
  });

  describe('getAvailableModels', () => {
    it('should return ranked free models', async () => {
      const mockModels = [
        { id: 'model-1', name: 'Model 1', context_length: 128000, pricing: { prompt: '0' } },
        { id: 'model-2', name: 'Model 2', context_length: 32000, pricing: { prompt: '0' } },
      ];

      const mockClient = {
        getModels: jest.fn().mockResolvedValue(mockModels),
      };

      const mockSelector = {
        filterFreeModels: jest.fn().mockReturnValue(mockModels),
        rankModels: jest.fn().mockReturnValue([
          { ...mockModels[0], score: 90 },
          { ...mockModels[1], score: 70 },
        ]),
      };

      assistant.client = mockClient;
      assistant.selector = mockSelector;

      const available = await assistant.getAvailableModels();

      expect(available).toHaveLength(2);
      expect(available[0]).toEqual({
        id: 'model-1',
        name: 'Model 1',
        contextLength: 128000,
        score: 90,
      });
    });

    it('should throw error if fetching models fails', async () => {
      const mockClient = {
        getModels: jest.fn().mockRejectedValue(new Error('API error')),
      };

      assistant.client = mockClient;

      await expect(assistant.getAvailableModels())
        .rejects.toThrow('Failed to get available models');
    });
  });
});

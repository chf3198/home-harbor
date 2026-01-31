const ModelSelector = require('./modelSelector');
const { NoAvailableModelsError } = require('./errors');

describe('ModelSelector', () => {
  let selector;

  beforeEach(() => {
    selector = new ModelSelector();
  });

  describe('filterFreeModels', () => {
    it('should return only models with pricing.prompt = "0"', () => {
      const models = [
        { id: 'free-1', pricing: { prompt: '0', completion: '0' } },
        { id: 'paid-1', pricing: { prompt: '0.001', completion: '0.002' } },
        { id: 'free-2', pricing: { prompt: '0', completion: '0' } },
      ];

      const result = selector.filterFreeModels(models);

      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['free-1', 'free-2']);
    });

    it('should exclude models without pricing', () => {
      const models = [
        { id: 'no-pricing' },
        { id: 'free-1', pricing: { prompt: '0' } },
      ];

      const result = selector.filterFreeModels(models);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('free-1');
    });

    it('should exclude expired models', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const models = [
        { 
          id: 'expired', 
          pricing: { prompt: '0' },
          expirationDate: yesterday.toISOString()
        },
        { 
          id: 'valid', 
          pricing: { prompt: '0' },
          expirationDate: tomorrow.toISOString()
        },
        { 
          id: 'no-expiration', 
          pricing: { prompt: '0' }
        },
      ];

      const result = selector.filterFreeModels(models);

      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['valid', 'no-expiration']);
    });

    it('should return empty array for null/undefined input', () => {
      expect(selector.filterFreeModels(null)).toEqual([]);
      expect(selector.filterFreeModels(undefined)).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      expect(selector.filterFreeModels('not an array')).toEqual([]);
      expect(selector.filterFreeModels({})).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('should give high score for large context window', () => {
      const model1 = { context_length: 128000, pricing: { prompt: '0' } };
      const model2 = { context_length: 8000, pricing: { prompt: '0' } };

      const score1 = selector.calculateScore(model1);
      const score2 = selector.calculateScore(model2);

      expect(score1).toBeGreaterThan(score2);
      expect(score1).toBeGreaterThanOrEqual(40); // Max context score
    });

    it('should award points for function calling capability', () => {
      const modelWithFC = {
        context_length: 32000,
        function_calling: true,
      };
      const modelWithoutFC = {
        context_length: 32000,
        function_calling: false,
      };

      const scoreWith = selector.calculateScore(modelWithFC);
      const scoreWithout = selector.calculateScore(modelWithoutFC);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should award points for structured outputs', () => {
      const model = {
        context_length: 32000,
        structured_outputs: true,
      };

      const score = selector.calculateScore(model);
      expect(score).toBeGreaterThan(20); // Base context + structured outputs bonus
    });

    it('should award points for multimodal capability', () => {
      const model = {
        context_length: 32000,
        architecture: {
          modality: 'text->text,image->text',
        },
      };

      const score = selector.calculateScore(model);
      expect(score).toBeGreaterThan(20); // Base context + multimodal bonus
    });

    it('should award points for no expiration date', () => {
      const modelNoExpiration = {
        context_length: 32000,
      };
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 100);
      
      const modelWithExpiration = {
        context_length: 32000,
        expirationDate: futureDate.toISOString(),
      };

      const scoreNo = selector.calculateScore(modelNoExpiration);
      const scoreWith = selector.calculateScore(modelWithExpiration);

      expect(scoreNo).toBeGreaterThan(scoreWith);
    });

    it('should award points for privacy-respecting models', () => {
      const privateModel = {
        context_length: 32000,
        privacy_policy: 'no-log anonymous',
      };
      
      const regularModel = {
        context_length: 32000,
        privacy_policy: 'standard logging for training',
      };

      const privateScore = selector.calculateScore(privateModel);
      const regularScore = selector.calculateScore(regularModel);

      expect(privateScore).toBeGreaterThan(regularScore);
    });
  });

  describe('rankModels', () => {
    it('should sort models by score in descending order', () => {
      const models = [
        { id: 'small', context_length: 8000, pricing: { prompt: '0' } },
        { id: 'large', context_length: 128000, pricing: { prompt: '0' } },
        { id: 'medium', context_length: 32000, pricing: { prompt: '0' } },
      ];

      const ranked = selector.rankModels(models);

      expect(ranked[0].id).toBe('large');
      expect(ranked[1].id).toBe('medium');
      expect(ranked[2].id).toBe('small');
    });

    it('should add score property to each model', () => {
      const models = [
        { id: 'test', context_length: 32000, pricing: { prompt: '0' } },
      ];

      const ranked = selector.rankModels(models);

      expect(ranked[0]).toHaveProperty('score');
      expect(typeof ranked[0].score).toBe('number');
    });

    it('should return empty array for null/undefined input', () => {
      expect(selector.rankModels(null)).toEqual([]);
      expect(selector.rankModels(undefined)).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      expect(selector.rankModels([])).toEqual([]);
    });
  });

  describe('selectBestModel', () => {
    it('should return the highest-scoring free model', () => {
      const models = [
        { id: 'paid', pricing: { prompt: '0.01' }, context_length: 200000 },
        { id: 'free-small', pricing: { prompt: '0' }, context_length: 8000 },
        { id: 'free-large', pricing: { prompt: '0' }, context_length: 128000 },
      ];

      const best = selector.selectBestModel(models);

      expect(best.id).toBe('free-large');
    });

    it('should throw NoAvailableModelsError if no free models', () => {
      const models = [
        { id: 'paid-1', pricing: { prompt: '0.01' } },
        { id: 'paid-2', pricing: { prompt: '0.02' } },
      ];

      expect(() => selector.selectBestModel(models))
        .toThrow(NoAvailableModelsError);
      expect(() => selector.selectBestModel(models))
        .toThrow('No free models available');
    });

    it('should throw NoAvailableModelsError for empty array', () => {
      expect(() => selector.selectBestModel([]))
        .toThrow(NoAvailableModelsError);
    });
  });

  describe('getCascadeOrder', () => {
    it('should return ordered list of free models', () => {
      const models = [
        { id: 'free-1', pricing: { prompt: '0' }, context_length: 8000 },
        { id: 'free-2', pricing: { prompt: '0' }, context_length: 128000 },
        { id: 'free-3', pricing: { prompt: '0' }, context_length: 32000 },
        { id: 'paid', pricing: { prompt: '0.01' }, context_length: 200000 },
      ];

      const cascade = selector.getCascadeOrder(models);

      expect(cascade).toHaveLength(3); // Only free models
      expect(cascade[0].id).toBe('free-2'); // Highest score
      expect(cascade[1].id).toBe('free-3');
      expect(cascade[2].id).toBe('free-1');
    });

    it('should limit results to specified count', () => {
      const models = Array.from({ length: 10 }, (_, i) => ({
        id: `free-${i}`,
        pricing: { prompt: '0' },
        context_length: (i + 1) * 10000,
      }));

      const cascade = selector.getCascadeOrder(models, 3);

      expect(cascade).toHaveLength(3);
    });

    it('should default to 5 models if limit not specified', () => {
      const models = Array.from({ length: 10 }, (_, i) => ({
        id: `free-${i}`,
        pricing: { prompt: '0' },
        context_length: (i + 1) * 10000,
      }));

      const cascade = selector.getCascadeOrder(models);

      expect(cascade).toHaveLength(5);
    });

    it('should throw NoAvailableModelsError if no free models', () => {
      const models = [
        { id: 'paid-1', pricing: { prompt: '0.01' } },
      ];

      expect(() => selector.getCascadeOrder(models))
        .toThrow(NoAvailableModelsError);
      expect(() => selector.getCascadeOrder(models))
        .toThrow('No free models available for cascade');
    });

    it('should return fewer models if not enough available', () => {
      const models = [
        { id: 'free-1', pricing: { prompt: '0' }, context_length: 8000 },
        { id: 'free-2', pricing: { prompt: '0' }, context_length: 16000 },
      ];

      const cascade = selector.getCascadeOrder(models, 5);

      expect(cascade).toHaveLength(2);
    });
  });
});

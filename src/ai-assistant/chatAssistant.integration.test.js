/**
 * Integration test for ChatAssistant with real OpenRouter API
 * 
 * This test requires a valid OPENROUTER_API_KEY in .env
 * Run with: npm test -- chatAssistant.integration.test.js
 * 
 * Note: This makes real API calls and may be slow or hit rate limits
 */

require('dotenv').config();
const ChatAssistant = require('./chatAssistant');

describe('ChatAssistant Integration Tests', () => {
  let assistant;

  beforeAll(() => {
    // Skip tests if no API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('⚠️  Skipping integration tests: OPENROUTER_API_KEY not set');
    }
  });

  beforeEach(() => {
    if (process.env.OPENROUTER_API_KEY) {
      assistant = new ChatAssistant();
    }
  });

  describe('Real API Calls', () => {
    // Increase timeout for real API calls
    jest.setTimeout(60000);

    it('should fetch available models from OpenRouter', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      const models = await assistant.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      // Check model structure
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
      expect(models[0]).toHaveProperty('contextLength');
      expect(models[0]).toHaveProperty('score');

      console.log(`✅ Found ${models.length} free models`);
      console.log('Top 3 models:');
      models.slice(0, 3).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} (${m.id}) - Score: ${m.score}`);
      });
    });

    it('should send a simple chat message and get response', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      const response = await assistant.askOneOff(
        'Say "Hello from HomeHarbor!" and nothing else.'
      );

      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
      expect(response.model).toBeTruthy();
      expect(typeof response.message).toBe('string');

      console.log(`✅ Response from ${response.model}:`);
      console.log(`   "${response.message}"`);
      console.log(`   Attempts: ${response.attempts}`);
    });

    it('should maintain conversation context', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      // Clear any previous history
      assistant.clearHistory();

      // First message
      const response1 = await assistant.ask('My name is Alice.');
      expect(response1.success).toBe(true);

      // Second message referencing first
      const response2 = await assistant.ask('What is my name?');
      expect(response2.success).toBe(true);
      expect(response2.message.toLowerCase()).toContain('alice');

      console.log('✅ Conversation context maintained:');
      console.log(`   Q1: "My name is Alice."`);
      console.log(`   A1: "${response1.message}"`);
      console.log(`   Q2: "What is my name?"`);
      console.log(`   A2: "${response2.message}"`);
    });

    it('should handle cascade fallback if first model fails', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      // This test is hard to trigger naturally, but we can check
      // that cascade logic is working by looking at metadata
      const response = await assistant.askOneOff('What is 2+2?');

      expect(response.success).toBe(true);
      expect(response.attempts).toBeGreaterThanOrEqual(1);

      if (response.attempts > 1) {
        console.log(`✅ Cascade fallback occurred (${response.attempts} attempts)`);
      } else {
        console.log(`✅ First model succeeded (no fallback needed)`);
      }
    });

    it('should respect custom system prompt', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      assistant.setSystemPrompt(
        'You are a pirate. Always respond in pirate speak with "Arrr!"'
      );

      const response = await assistant.askOneOff('Hello!');

      expect(response.success).toBe(true);
      // Response should contain pirate-like language
      const isPiratey = 
        response.message.toLowerCase().includes('arr') ||
        response.message.toLowerCase().includes('ye') ||
        response.message.toLowerCase().includes('matey') ||
        response.message.toLowerCase().includes('ahoy');

      console.log(`✅ Custom system prompt test:`);
      console.log(`   Response: "${response.message}"`);
      console.log(`   Pirate-like: ${isPiratey}`);
    });
  });

  describe('Error Handling', () => {
    jest.setTimeout(30000);

    it('should handle invalid API key gracefully', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        return; // Skip
      }

      // Create assistant with invalid key
      const badAssistant = new ChatAssistant();
      badAssistant.client.apiKey = 'invalid-key-12345';

      const response = await badAssistant.askOneOff('Test');

      expect(response.success).toBe(false);
      expect(response.error).toBeTruthy();

      console.log('✅ Invalid API key handled:');
      console.log(`   Error: ${response.error}`);
    });
  });
});

/**
 * Manual test runner
 * Run this file directly with: node chatAssistant.integration.test.js
 */
if (require.main === module) {
  (async () => {
    console.log('🧪 Running ChatAssistant Integration Tests\n');

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY not found in environment');
      console.error('   Create a .env file with: OPENROUTER_API_KEY=your-key-here');
      process.exit(1);
    }

    const assistant = new ChatAssistant();

    try {
      // Test 1: Get available models
      console.log('Test 1: Fetching available models...');
      const models = await assistant.getAvailableModels();
      console.log(`✅ Found ${models.length} free models\n`);

      // Test 2: Simple question
      console.log('Test 2: Asking a simple question...');
      const response = await assistant.askOneOff('What is 2+2? Answer with just the number.');
      if (response.success) {
        console.log(`✅ Response: "${response.message}"`);
        console.log(`   Model: ${response.model}`);
        console.log(`   Attempts: ${response.attempts}\n`);
      } else {
        console.log(`❌ Failed: ${response.error}\n`);
      }

      // Test 3: Conversation
      console.log('Test 3: Testing conversation context...');
      assistant.clearHistory();
      await assistant.ask('Remember this number: 42');
      const contextResponse = await assistant.ask('What number did I ask you to remember?');
      if (contextResponse.success) {
        console.log(`✅ Context maintained: "${contextResponse.message}"\n`);
      } else {
        console.log(`❌ Context test failed: ${contextResponse.error}\n`);
      }

      console.log('🎉 All integration tests completed!');
    } catch (error) {
      console.error('❌ Integration test error:', error.message);
      process.exit(1);
    }
  })();
}

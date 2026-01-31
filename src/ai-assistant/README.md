# AI Assistant Module

AI-powered chat assistant for HomeHarbor using OpenRouter's free LLM models with intelligent cascading fallback.

## Features

- **Free Forever**: Uses only free OpenRouter LLM models
- **Intelligent Selection**: Automatically ranks models by context window, capabilities, and privacy
- **Cascading Fallback**: Retries with next best model if primary fails
- **Rate Limit Handling**: Exponential backoff for rate-limited requests
- **Conversation Context**: Maintains chat history across messages
- **Fully Tested**: Comprehensive unit tests with >95% coverage

## Quick Start

```javascript
const { ChatAssistant } = require('./ai-assistant');

// Create assistant instance
const assistant = new ChatAssistant();

// Ask a one-off question
const response = await assistant.askOneOff('What is HomeHarbor?');
console.log(response.message); // AI response

// Start a conversation
await assistant.ask('My budget is $500k');
await assistant.ask('What can I afford in Austin?');

// Get conversation history
const history = assistant.getHistory();
```

## Configuration

Add to `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
APP_URL=https://github.com/your-repo  # Optional
APP_NAME=HomeHarbor                    # Optional
```

## API Reference

### ChatAssistant

Main interface for AI interactions.

#### Methods

**`ask(message, options)`**
- Send message in conversation context
- Maintains history across calls
- Returns: `{ success, message, model, attempts }`

**`askOneOff(question, options)`**
- Send standalone question without history
- Returns: `{ success, message, model, attempts }`

**`clearHistory()`**
- Clear conversation history

**`setSystemPrompt(prompt)`**
- Set custom system instructions

**`getHistory()`**
- Get array of conversation messages

**`getAvailableModels()`**
- Get list of available free models (sorted by rank)

### Options

```javascript
{
  temperature: 0.7,      // Creativity (0-2)
  max_tokens: 500,       // Response length limit
  top_p: 0.9,           // Nucleus sampling
  // ... other OpenRouter parameters
}
```

## Architecture

```
ChatAssistant
  ├─ OpenRouterClient     (HTTP client for OpenRouter API)
  ├─ ModelSelector        (Ranks free models by quality)
  └─ CascadingService     (Retry/fallback orchestration)
```

### Model Selection Criteria

Models are ranked by:
1. **Context Window** (40 pts): Prefers 100K+ context
2. **Capabilities** (30 pts): Function calling, multimodal, structured outputs
3. **Privacy** (20 pts): No logging, anonymous
4. **Expiration** (10 pts): No expiration or far expiration

### Cascading Strategy

1. Fetch all available models from OpenRouter
2. Filter to free models (pricing.prompt = "0")
3. Exclude expired models
4. Rank by score (see criteria above)
5. Try models in order until success
6. Retry with exponential backoff on rate limits

## Testing

```bash
# Unit tests (mocked)
npm test -- ai-assistant

# Integration tests (real API)
npm test -- chatAssistant.integration.test.js

# Manual integration test
node src/ai-assistant/chatAssistant.integration.test.js
```

## Error Handling

All errors inherit from base error types:

- `NoAvailableModelsError` - No free models found
- `RateLimitError` - Rate limit exceeded (includes retryAfter)
- `ModelTimeoutError` - Model timed out
- `NetworkError` - Network/connection failure
- `InvalidResponseError` - Malformed API response
- `AllModelsFailedError` - All models failed (includes attempts)
- `ConfigurationError` - Missing/invalid config

## Example Usage

### Basic Chat

```javascript
const assistant = new ChatAssistant();

const response = await assistant.askOneOff(
  'What neighborhoods in Austin are good for families?'
);

if (response.success) {
  console.log(response.message);
  console.log(`Used model: ${response.model}`);
} else {
  console.error(`Error: ${response.error}`);
}
```

### Conversation with Context

```javascript
const assistant = new ChatAssistant();

await assistant.ask('I have a $600k budget');
const response = await assistant.ask('What can I afford in Seattle?');

console.log(response.message);
// Response will reference the $600k budget from previous message
```

### Custom System Prompt

```javascript
const assistant = new ChatAssistant();
assistant.setSystemPrompt(
  'You are a real estate expert specializing in first-time homebuyers. ' +
  'Provide practical, actionable advice with specific examples.'
);

const response = await assistant.ask('Should I buy or rent?');
```

### Advanced: Direct Model Selection

```javascript
const { OpenRouterClient, ModelSelector } = require('./ai-assistant');

const client = new OpenRouterClient();
const selector = new ModelSelector();

// Get all models
const allModels = await client.getModels();

// Filter and rank
const freeModels = selector.filterFreeModels(allModels);
const ranked = selector.rankModels(freeModels);

console.log('Top 5 models:', ranked.slice(0, 5));
```

## Performance

- **P95 Latency**: <5 seconds (first response)
- **Success Rate**: >95% (with cascade)
- **Cache Hit**: >80% (model list cached)
- **Timeout**: 30s per model attempt

## Security

✅ API key in `.env` (never commit)  
✅ .gitignore includes `.env`  
✅ Pre-commit hook scans for secrets  
✅ Test files excluded from secret scanning  

## Future Enhancements

- [ ] Streaming responses (Server-Sent Events)
- [ ] Function calling (let LLM invoke app functions)
- [ ] Conversation persistence (DynamoDB)
- [ ] Model performance tracking
- [ ] User feedback for model selection
- [ ] Cost monitoring dashboard

## License

Part of HomeHarbor project - see root LICENSE

## Support

For issues or questions, see [OPENROUTER_LLM_ARCHITECTURE.md](../../docs/OPENROUTER_LLM_ARCHITECTURE.md)

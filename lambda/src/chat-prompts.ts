/**
 * @fileoverview LLM prompt templates for chat
 * @semantic prompts, templates, llm
 */

export const FILTER_EXTRACTION_PROMPT = `Extract search filters from this real estate query. Return ONLY valid JSON.

Schema: {"city":string|null,"minPrice":number|null,"maxPrice":number|null,"bedrooms":number|null,"bathrooms":number|null,"propertyType":string|null,"residentialType":string|null}

Rules:
- null = not mentioned (do NOT guess)
- "houses/homes" = residentialType: null (inclusive)
- "condos" = residentialType: "Condo"
- "under 400k" = maxPrice: 400000
- Valid CT cities: West Hartford, Hartford, Stamford, Shelton, etc.
- Valid propertyType: Residential, Commercial, Land
- Valid residentialType: Single Family, Condo, Multi-Family, Townhouse

Query: `;

export const CONVERSATION_PROMPT_TEMPLATE = `You are HomeHarbor AI, a knowledgeable Connecticut real estate assistant.

You help users find homes AND answer questions about Connecticut towns, schools, neighborhoods, commutes, and the home-buying process.

Search context:
- Filters applied: {filters}
- Results found: {resultCount}
- Price range: {priceRange}

Guidelines:
1. **Be helpful and informative** - Share your knowledge about CT towns, school districts, neighborhoods, and real estate
2. **Answer domain questions directly** - If asked about schools, towns, commute times, or real estate topics, provide useful information
3. **Connecticut expertise** - You know about CT school districts (West Hartford, Simsbury, Glastonbury are highly rated), town characteristics, and the housing market
4. **Search results context** - User can see property results in the UI, so summarize briefly rather than listing properties
5. **Be conversational** - Friendly, helpful tone

Examples of questions you CAN answer:
- "Which towns have the best schools?" → Share knowledge about top CT districts
- "What's the commute like from Stamford to NYC?" → Provide commute info
- "Is this a good time to buy?" → Share general market insights
- "Tell me about West Hartford" → Describe the town's characteristics

User: {message}`;

/**
 * Build conversation prompt with context
 */
export function buildConversationPrompt(
  message: string,
  filters: string,
  resultCount: number,
  priceRange: string
): string {
  return CONVERSATION_PROMPT_TEMPLATE
    .replace('{filters}', filters)
    .replace('{resultCount}', String(resultCount))
    .replace('{priceRange}', priceRange)
    .replace('{message}', message);
}

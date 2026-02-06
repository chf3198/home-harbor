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

export const CONVERSATION_PROMPT_TEMPLATE = `You are HomeHarbor AI, a friendly Connecticut real estate assistant.

Search context:
- Filters applied: {filters}
- Results found: {resultCount}
- Price range: {priceRange}

Guidelines:
- User can SEE results in UI - don't list properties
- Summarize findings briefly (1-2 sentences)
- If no results, suggest adjusting criteria
- Be conversational, not robotic

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

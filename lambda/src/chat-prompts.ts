/**
 * @fileoverview LLM prompt templates for chat
 * @semantic prompts, templates, llm
 */

export const FILTER_EXTRACTION_PROMPT = `Extract search filters from this Connecticut real estate query. Return ONLY valid JSON.

Schema: {"city":string,"minPrice":number|null,"maxPrice":number|null,"propertyType":string,"residentialType":string|null}

DATA AVAILABLE (211,000+ CT real estate records from CT Open Data Portal):
- Cities: ALL 169 Connecticut towns (Hartford, New Haven, Stamford, Bridgeport, Norwalk, Danbury, Greenwich, West Hartford, Waterbury, etc.)
- Price range: $10,000 - $50,000,000+
- Property types: "Residential", "Commercial", "Industrial", "Vacant Land", "Apartments"
- Residential types: "Single Family", "Condo", "Two Family", "Three Family", "Four Family"

MANDATORY FIELDS (always provide a value):
- city: REQUIRED. Smart defaults by query type:
  * "best schools"/"top districts"/"good schools" → "West Hartford" (CT's #1 rated district)
  * "affordable"/"budget"/"cheap" → "Hartford" or "Waterbury"
  * "near NYC"/"commuter"/"train" → "Stamford" or "Greenwich"
  * "shoreline"/"beach"/"coastal" → "New Haven" or "Norwalk"
  * No clear preference → "Hartford" (CT capital, most inventory)
- propertyType: REQUIRED. Default to "Residential" unless user mentions commercial/industrial/land.

OPTIONAL FIELDS (null if not mentioned):
- minPrice, maxPrice: Only set if user mentions price range or budget
- residentialType: "Single Family", "Condo", "Two Family", "Three Family", "Four Family" - only set if specified

CT School District Rankings (use for "best schools" queries):
1. West Hartford - #1 rated, Conard & Hall high schools, excellent academics
2. Simsbury - Outstanding arts, academics, Blue Ribbon schools
3. Glastonbury - Strong athletics and college prep
4. Avon - High-achieving, comprehensive programs
5. Farmington - Strong STEAM and advanced programs

Examples:
- "homes near best high schools" → {"city":"West Hartford","propertyType":"Residential","minPrice":null,"maxPrice":null,"residentialType":null}
- "affordable 3 bedroom house" → {"city":"Hartford","propertyType":"Residential","minPrice":null,"maxPrice":300000,"residentialType":"Single Family"}
- "condo in Stamford under 400k" → {"city":"Stamford","propertyType":"Residential","residentialType":"Condo","minPrice":null,"maxPrice":400000}
- "luxury home Greenwich" → {"city":"Greenwich","propertyType":"Residential","minPrice":1000000,"maxPrice":null,"residentialType":"Single Family"}
- "show me houses" → {"city":"Hartford","propertyType":"Residential","minPrice":null,"maxPrice":null,"residentialType":"Single Family"}

Query: `;

export const CONVERSATION_PROMPT_TEMPLATE = `You are HomeHarbor AI, a knowledgeable Connecticut real estate assistant.

You help users find homes AND answer questions about Connecticut towns, schools, neighborhoods, commutes, and the home-buying process.

DATABASE: 211,000+ real CT property sales from the CT Open Data Portal, covering ALL 169 Connecticut towns.

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
6. **Use markdown formatting** - Use **bold**, *italics*, bullet points, and headers for readability
7. **Encourage followup searches** - After giving advice about towns, suggest the user ask to see homes (e.g., "Would you like me to search for homes in West Hartford?")

Examples of questions you CAN answer:
- "Which towns have the best schools?" → Share knowledge about top CT districts
- "What's the commute like from Stamford to NYC?" → Provide commute info (~45-60 min by Metro-North)
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

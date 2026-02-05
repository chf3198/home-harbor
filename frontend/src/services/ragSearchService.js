/**
 * @fileoverview Orama-based RAG search service - hybrid vector + full-text search
 * @semantic search, vector, rag, orama
 */

import { create, insert, search } from '@orama/orama';
import { generateEmbedding, propertyToSearchText } from './embeddingService.js';
import { buildFilterConditions } from './searchFilters.js';

let searchIndex = null;

const PROPERTY_SCHEMA = {
  id: 'string',
  address: 'string',
  city: 'string',
  state: 'string',
  price: 'number',
  bedrooms: 'number',
  bathrooms: 'number',
  propertyType: 'string',
  description: 'string',
  embedding: 'vector[384]', // MiniLM-L6-v2 produces 384-dim vectors
};

/** Initialize the Orama search index */
export async function initSearchIndex() {
  if (searchIndex) return;
  searchIndex = await create({
    schema: PROPERTY_SCHEMA,
    components: {
      tokenizer: {
        stemming: true,
        stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at'],
      },
    },
  });
}

/** Index a single property with embedding */
export async function indexProperty(property) {
  await initSearchIndex();
  const searchText = propertyToSearchText(property);
  const embedding = await generateEmbedding(searchText);

  await insert(searchIndex, {
    id: String(property.id),
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    propertyType: property.propertyType || property.metadata?.propertyType || '',
    description: property.description || property.metadata?.description || '',
    embedding,
  });
}

/** Index multiple properties (batch operation) */
export async function indexProperties(properties, onProgress) {
  await initSearchIndex();
  for (let i = 0; i < properties.length; i++) {
    await indexProperty(properties[i]);
    if (onProgress) onProgress(i + 1, properties.length);
  }
}

/** Perform hybrid search (vector + full-text) */
export async function hybridSearch(query, options = {}) {
  await initSearchIndex();
  const { limit = 10, filters = {} } = options;
  const queryEmbedding = await generateEmbedding(query);
  const where = buildFilterConditions(filters);

  const results = await search(searchIndex, {
    term: query,
    vector: { value: queryEmbedding, property: 'embedding' },
    limit,
    where: Object.keys(where).length > 0 ? where : undefined,
    boost: { address: 2, city: 1.5, description: 1 },
  });

  return results.hits.map((hit) => ({ ...hit.document, score: hit.score }));
}

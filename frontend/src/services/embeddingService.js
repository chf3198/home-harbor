/**
 * @fileoverview Client-side embedding generation using Transformers.js
 * @semantic embeddings, transformers, ml
 */

import { pipeline } from '@huggingface/transformers';

let embeddingPipeline = null;
let isInitializing = false;
let initPromise = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'; // 22MB, fast

/** Initialize the embedding pipeline (lazy-loaded) */
export async function initEmbeddings() {
  if (embeddingPipeline) return;
  if (isInitializing) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
        device: navigator.gpu ? 'webgpu' : 'wasm',
      });
    } catch (error) {
      console.error('Failed to initialize embeddings:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  })();
  return initPromise;
}

/** Generate embedding vector for text */
export async function generateEmbedding(text) {
  await initEmbeddings();
  if (!embeddingPipeline) throw new Error('Embedding pipeline not initialized');
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/** Generate embeddings for multiple texts (batched) */
export async function generateEmbeddings(texts) {
  await initEmbeddings();
  if (!embeddingPipeline) throw new Error('Embedding pipeline not initialized');
  const embeddings = [];
  for (const text of texts) {
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }
  return embeddings;
}

/** Create searchable text from property data */
export function propertyToSearchText(property) {
  const parts = [
    property.address,
    property.city,
    property.state,
    property.propertyType || property.metadata?.propertyType,
    property.description,
    property.metadata?.description,
    `${property.bedrooms || 0} bedrooms`,
    `${property.bathrooms || 0} bathrooms`,
    property.price ? `$${property.price.toLocaleString()}` : '',
  ].filter(Boolean);
  return parts.join(' ');
}

/** Check if embeddings are ready */
export function isEmbeddingsReady() {
  return embeddingPipeline !== null;
}

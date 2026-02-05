/**
 * @fileoverview Tests for RAG chat service
 * @description Unit tests for RAG prompt building and response processing
 */

import { describe, it, expect } from 'vitest';
import { buildRAGPrompt, processRAGResponse } from '../services/ragChatService.js';

describe('ragChatService', () => {
  describe('buildRAGPrompt', () => {
    it('includes user query in prompt', () => {
      const prompt = buildRAGPrompt('Find cheap houses', 'Property 1: 123 Main');
      expect(prompt).toContain('Find cheap houses');
    });

    it('includes property context in prompt', () => {
      const context = 'Property 1: 123 Main St, $200,000';
      const prompt = buildRAGPrompt('Any houses under 250k?', context);
      expect(prompt).toContain('123 Main St');
      expect(prompt).toContain('$200,000');
    });

    it('includes system instructions', () => {
      const prompt = buildRAGPrompt('test', 'context');
      expect(prompt).toContain('real estate assistant');
      expect(prompt).toContain('PROPERTY DATA');
      expect(prompt).toContain('USER QUESTION');
    });
  });

  describe('processRAGResponse', () => {
    it('extracts response text', () => {
      const result = processRAGResponse({ response: 'Found 3 houses' }, []);
      expect(result.response).toBe('Found 3 houses');
    });

    it('includes source properties', () => {
      const sources = [
        { id: '1', address: '123 Main', city: 'Hartford', score: 0.9 },
        { id: '2', address: '456 Oak', city: 'Bristol', score: 0.8 },
      ];
      const result = processRAGResponse({ response: 'test' }, sources);
      expect(result.sources).toHaveLength(2);
      expect(result.sources[0].address).toBe('123 Main');
    });

    it('limits sources to 5', () => {
      const sources = Array(10)
        .fill(null)
        .map((_, i) => ({ id: String(i), address: `Addr ${i}` }));
      const result = processRAGResponse({ response: 'test' }, sources);
      expect(result.sources).toHaveLength(5);
    });

    it('marks success true', () => {
      const result = processRAGResponse({ response: 'ok' }, []);
      expect(result.success).toBe(true);
    });
  });
});

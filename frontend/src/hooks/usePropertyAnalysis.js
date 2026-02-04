/**
 * @fileoverview Custom hook for property analysis
 */

import { useState } from 'react';
import { useAIChat } from './useAIChat';

export function usePropertyAnalysis() {
  const { analyzeProperty, sendMessage } = useAIChat();
  const [analyzingCards, setAnalyzingCards] = useState(new Set());

  const handleAnalyzeProperty = async (propertyId, analysisType) => {
    setAnalyzingCards(prev => new Set(prev).add(`${propertyId}-${analysisType}`));

    try {
      if (analysisType === 'vision') {
        await analyzeProperty(propertyId);
      } else if (analysisType === 'description') {
        await sendMessage(`Generate a compelling real estate description for property ${propertyId}`, propertyId);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${propertyId}-${analysisType}`);
        return newSet;
      });
    }
  };

  const isAnalyzing = (propertyId, analysisType) => {
    return analyzingCards.has(`${propertyId}-${analysisType}`);
  };

  return {
    handleAnalyzeProperty,
    isAnalyzing,
  };
}
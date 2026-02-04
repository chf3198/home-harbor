/**
 * @fileoverview Performance Monitoring Utilities
 * Tracks Core Web Vitals and custom metrics for production monitoring
 */

import { trackCoreWebVitals } from './coreWebVitals.js';
import { trackNavigationTiming } from './navigationTiming.js';
import { trackResourceTiming } from './resourceTiming.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  // Initialize Core Web Vitals tracking
  init() {
    trackCoreWebVitals(this.recordMetric.bind(this), this.observers);
    trackNavigationTiming(this.recordMetric.bind(this));
    trackResourceTiming(this.recordMetric.bind(this), this.observers);
  }

  // Record custom metrics
  recordMetric(name, value) {
    this.metrics[name] = {
      value,
      timestamp: Date.now()
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, value);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  // Send metrics to analytics service
  sendToAnalytics(name, value) {
    // Placeholder for analytics integration
    // Example: gtag('event', 'web_vitals', { name, value });
    console.log(`[Analytics] ${name}:`, value);
  }

  // Get all recorded metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
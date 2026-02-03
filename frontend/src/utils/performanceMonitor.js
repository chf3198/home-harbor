/**
 * @fileoverview Performance Monitoring Utilities
 * Tracks Core Web Vitals and custom metrics for production monitoring
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  // Initialize Core Web Vitals tracking
  init() {
    this.trackCoreWebVitals();
    this.trackNavigationTiming();
    this.trackResourceTiming();
  }

  // Track Core Web Vitals
  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP tracking not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID tracking not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS tracking not supported');
      }
    }
  }

  // Track navigation timing
  trackNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric('Navigation Timing', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          });
        }
      });
    }
  }

  // Track resource timing for bundle analysis
  trackResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const jsResources = entries.filter(entry =>
            entry.name.includes('.js') && entry.initiatorType === 'script'
          );

          jsResources.forEach((resource) => {
            this.recordMetric(`Resource: ${resource.name.split('/').pop()}`, {
              size: resource.transferSize,
              loadTime: resource.responseEnd - resource.requestStart
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing tracking not supported');
      }
    }
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
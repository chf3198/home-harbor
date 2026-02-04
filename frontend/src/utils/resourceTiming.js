/**
 * @fileoverview Resource Timing Tracking
 * Tracks JavaScript bundle loading metrics
 */

export function trackResourceTiming(recordMetric, observers) {
  if ('PerformanceObserver' in window) {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const jsResources = entries.filter(entry =>
          entry.name.includes('.js') && entry.initiatorType === 'script'
        );

        jsResources.forEach((resource) => {
          recordMetric(`Resource: ${resource.name.split('/').pop()}`, {
            size: resource.transferSize,
            loadTime: resource.responseEnd - resource.requestStart
          });
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource timing tracking not supported');
    }
  }
}
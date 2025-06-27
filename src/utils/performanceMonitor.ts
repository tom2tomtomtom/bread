/**
 * Production Performance Monitoring System
 * 
 * Features:
 * - Web Vitals tracking (LCP, FID, CLS, TTFB)
 * - Component render performance
 * - API call monitoring
 * - Memory usage tracking
 * - User interaction analytics
 * - Real-time performance alerts
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface WebVitalsMetric extends PerformanceMetric {
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

export interface ComponentMetric extends PerformanceMetric {
  componentName: string;
  renderTime: number;
  propsSize?: number;
  reRenderCount?: number;
}

export interface APIMetric extends PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeWebVitals();
    this.initializeResourceObserver();
    this.initializeNavigationObserver();
  }

  // Web Vitals Monitoring
  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeWebVital('largest-contentful-paint', (entry: any) => {
      this.recordWebVital('LCP', entry.startTime, this.getLCPRating(entry.startTime));
    });

    // First Input Delay (FID)
    this.observeWebVital('first-input', (entry: any) => {
      this.recordWebVital('FID', entry.processingStart - entry.startTime, this.getFIDRating(entry.processingStart - entry.startTime));
    });

    // Cumulative Layout Shift (CLS)
    this.observeWebVital('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.recordWebVital('CLS', entry.value, this.getCLSRating(entry.value));
      }
    });

    // Time to First Byte (TTFB)
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        this.recordWebVital('TTFB', ttfb, this.getTTFBRating(ttfb));
      }
    }
  }

  private observeWebVital(type: string, callback: (entry: any) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private recordWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: WebVitalsMetric = {
      name,
      value,
      timestamp: Date.now(),
      rating,
      context: { userAgent: navigator.userAgent, url: window.location.href }
    };
    
    this.addMetric(metric);
    
    // Alert on poor performance
    if (rating === 'poor') {
      this.alertPoorPerformance(metric);
    }
  }

  // Component Performance Monitoring
  public measureComponentRender<T>(
    componentName: string,
    renderFn: () => T,
    props?: any
  ): T {
    if (!this.isEnabled) return renderFn();

    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    const metric: ComponentMetric = {
      name: 'component-render',
      componentName,
      value: endTime - startTime,
      renderTime: endTime - startTime,
      timestamp: Date.now(),
      propsSize: props ? JSON.stringify(props).length : undefined,
      context: { componentName, props: props ? Object.keys(props) : [] }
    };
    
    this.addMetric(metric);
    
    // Warn about slow renders
    if (metric.renderTime > 16) { // 60fps threshold
      console.warn(`Slow render detected: ${componentName} took ${metric.renderTime.toFixed(2)}ms`);
    }
    
    return result;
  }

  // API Performance Monitoring
  public async measureAPICall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    if (!this.isEnabled) return apiCall();

    const startTime = performance.now();
    let status = 0;
    let error: Error | null = null;
    
    try {
      const result = await apiCall();
      status = 200; // Assume success if no error
      return result;
    } catch (err) {
      error = err as Error;
      status = (err as any)?.status || 500;
      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: APIMetric = {
        name: 'api-call',
        endpoint,
        method,
        value: duration,
        duration,
        status,
        timestamp: Date.now(),
        context: { endpoint, method, status, error: error?.message }
      };
      
      this.addMetric(metric);
      
      // Alert on slow API calls
      if (duration > 5000) { // 5 second threshold
        this.alertSlowAPI(metric);
      }
    }
  }

  // Memory Usage Monitoring
  public trackMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    const metric: PerformanceMetric = {
      name: 'memory-usage',
      value: memory.usedJSHeapSize,
      timestamp: Date.now(),
      context: {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    };
    
    this.addMetric(metric);
    
    // Alert on high memory usage
    const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercentage > 80) {
      console.warn(`High memory usage detected: ${usagePercentage.toFixed(1)}%`);
    }
  }

  // Resource Loading Monitoring
  private initializeResourceObserver() {
    if (typeof window === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.addMetric({
              name: 'resource-load',
              value: resourceEntry.duration,
              timestamp: Date.now(),
              context: {
                name: resourceEntry.name,
                type: this.getResourceType(resourceEntry.name),
                size: resourceEntry.transferSize,
                cached: resourceEntry.transferSize === 0
              }
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe resources:', error);
    }
  }

  // Navigation Monitoring
  private initializeNavigationObserver() {
    if (typeof window === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.addMetric({
              name: 'navigation',
              value: navEntry.loadEventEnd - navEntry.startTime,
              timestamp: Date.now(),
              context: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
                loadComplete: navEntry.loadEventEnd - navEntry.startTime,
                type: navEntry.type
              }
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Failed to observe navigation:', error);
    }
  }

  // Utility Methods
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      // Silently fail to avoid affecting user experience
    }
  }

  private alertPoorPerformance(metric: WebVitalsMetric) {
    console.warn(`Poor ${metric.name} detected: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  }

  private alertSlowAPI(metric: APIMetric) {
    console.warn(`Slow API call detected: ${metric.endpoint} took ${metric.duration.toFixed(2)}ms`);
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('.woff')) return 'font';
    return 'other';
  }

  // Web Vitals Rating Functions
  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  // Public API
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  public clearMetrics() {
    this.metrics = [];
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  return {
    measureRender: <T>(renderFn: () => T, props?: any) => 
      performanceMonitor.measureComponentRender(componentName, renderFn, props),
    measureAPI: <T>(endpoint: string, method: string, apiCall: () => Promise<T>) =>
      performanceMonitor.measureAPICall(endpoint, method, apiCall),
  };
}

export default performanceMonitor;

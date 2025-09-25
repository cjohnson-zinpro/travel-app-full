// Rate limiter for API calls to prevent overloading Amadeus/Claude services
export interface RateLimiterConfig {
  maxConcurrent: number;
  minDelayMs: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
}

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  retries: number;
}

export class RateLimiter {
  private queue: QueuedTask<any>[] = [];
  private running = 0;
  private consecutive429s = 0;
  private circuitOpen = false;
  private circuitOpenSince?: Date;
  
  constructor(private config: RateLimiterConfig) {}
  
  /**
   * Schedule a function to run with rate limiting
   */
  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
        retries: 0
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Process the queue respecting rate limits
   */
  private async processQueue(): Promise<void> {
    // Check if circuit breaker is open
    if (this.circuitOpen) {
      if (this.circuitOpenSince && 
          Date.now() - this.circuitOpenSince.getTime() > this.config.circuitBreakerTimeoutMs) {
        console.log(`🔄 Circuit breaker reset after ${this.config.circuitBreakerTimeoutMs}ms`);
        this.circuitOpen = false;
        this.consecutive429s = 0;
      } else {
        return; // Circuit still open
      }
    }
    
    // Don't exceed max concurrent requests
    if (this.running >= this.config.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const task = this.queue.shift();
    if (!task) return;
    
    this.running++;
    
    try {
      // Add minimum delay between requests
      if (this.config.minDelayMs > 0) {
        await this.sleep(this.config.minDelayMs + this.jitter(50));
      }
      
      const result = await task.fn();
      task.resolve(result);
      this.consecutive429s = 0; // Reset on success
      
    } catch (error: any) {
      // Handle rate limit (429) errors
      if (error.status === 429 || error.message?.includes('429')) {
        this.consecutive429s++;
        console.warn(`⚠️ Rate limit hit (${this.consecutive429s}/${this.config.circuitBreakerThreshold})`);
        
        // Circuit breaker: too many consecutive 429s
        if (this.consecutive429s >= this.config.circuitBreakerThreshold) {
          this.openCircuitBreaker();
          task.reject(new Error(`Circuit breaker opened after ${this.consecutive429s} consecutive 429 errors`));
        } else if (task.retries < this.config.maxRetries) {
          // Retry with exponential backoff
          const backoffMs = Math.min(2000 * Math.pow(2, task.retries), 30000);
          console.log(`🔄 Retrying in ${backoffMs}ms (attempt ${task.retries + 1}/${this.config.maxRetries})`);
          
          setTimeout(() => {
            task.retries++;
            this.queue.unshift(task); // Add back to front of queue
            this.processQueue();
          }, backoffMs + this.jitter(1000));
        } else {
          task.reject(new Error(`Max retries exceeded after ${task.retries} attempts`));
        }
      } else {
        // Non-429 error, don't retry
        task.reject(error);
      }
    } finally {
      this.running--;
      // Continue processing queue
      setTimeout(() => this.processQueue(), 0);
    }
  }
  
  /**
   * Open circuit breaker to pause all requests
   */
  private openCircuitBreaker(): void {
    this.circuitOpen = true;
    this.circuitOpenSince = new Date();
    console.error(`🚨 Circuit breaker OPENED - pausing all requests for ${this.config.circuitBreakerTimeoutMs}ms`);
  }
  
  /**
   * Add random jitter to prevent thundering herd
   */
  private jitter(maxMs: number): number {
    return Math.random() * maxMs;
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current status for debugging
   */
  getStatus(): {
    running: number;
    queued: number;
    consecutive429s: number;
    circuitOpen: boolean;
  } {
    return {
      running: this.running,
      queued: this.queue.length,
      consecutive429s: this.consecutive429s,
      circuitOpen: this.circuitOpen,
    };
  }
}

// Global rate limiter instances
const amadeusTravelRateLimiter = new RateLimiter({
  maxConcurrent: 2, // Balanced: 2 concurrent to allow progress while preventing spam
  minDelayMs: 750,  // Reduced to 750ms for better throughput while staying conservative 
  maxRetries: 3,    // Reduced retries to fail faster
  circuitBreakerThreshold: 2, // Open circuit after just 2 consecutive 429s
  circuitBreakerTimeoutMs: 90000, // 1.5 minute pause when circuit opens
});

const claudeRateLimiter = new RateLimiter({
  maxConcurrent: 4,
  minDelayMs: 200,
  maxRetries: 3,
  circuitBreakerThreshold: 3,
  circuitBreakerTimeoutMs: 30000, // 30 seconds pause
});

export { amadeusTravelRateLimiter, claudeRateLimiter };
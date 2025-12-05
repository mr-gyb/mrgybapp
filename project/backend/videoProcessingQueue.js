/**
 * Video Processing Queue
 * Ensures only one video is processed at a time to prevent TPM/RPM limit issues
 */

class VideoProcessingQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.currentJob = null;
  }

  /**
   * Add a job to the queue
   * @param {Function} job - Async function that processes the video
   * @returns {Promise} - Resolves when job completes
   */
  async enqueue(job) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        job,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      console.log(`[queue] Job enqueued. Queue length: ${this.queue.length}`);
      this.processNext();
    });
  }

  /**
   * Process the next job in the queue
   */
  async processNext() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const { job, resolve, reject } = this.queue.shift();
    this.currentJob = { startTime: Date.now() };

    const jobStartTime = Date.now();
    try {
      console.log(`[queue] Processing job. Queue remaining: ${this.queue.length}`);
      const result = await job();
      const duration = Date.now() - jobStartTime;
      console.log(`[queue] Job completed successfully in ${(duration / 1000).toFixed(2)}s`);
      resolve(result);
    } catch (error) {
      const duration = Date.now() - jobStartTime;
      console.log(`[queue] Job failed after ${(duration / 1000).toFixed(2)}s`);
      reject(error);
    } finally {
      this.processing = false;
      this.currentJob = null;
      
      // Process next job
      setImmediate(() => this.processNext());
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentJob: this.currentJob
    };
  }
}

// Singleton instance
const videoQueue = new VideoProcessingQueue();

module.exports = videoQueue;


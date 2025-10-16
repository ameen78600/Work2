export class MemoryManager {
    constructor() {
        this.interval = null;
        this.metrics = {
            lastGC: null,
            heapStats: null,
            memoryUsage: null
        };
    }

    start() {
        // Run memory checks every minute
        this.interval = setInterval(() => this.checkMemory(), 60000);
        console.log('✅ Memory manager started');
    }

    async checkMemory() {
        try {
            const memUsage = process.memoryUsage();
            
            // If heap is over 80% capacity, force garbage collection
            if (memUsage.heapUsed / memUsage.heapTotal > 0.8) {
                if (global.gc) {
                    global.gc();
                    this.metrics.lastGC = Date.now();
                }
            }

            this.metrics.memoryUsage = {
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024)
            };

            // Check if we're approaching memory limits
            if (this.metrics.memoryUsage.heapUsed > 512) { // 512MB limit
                console.warn('⚠️ High memory usage detected');
                // Implement memory reduction strategies here
            }

        } catch (error) {
            console.error('Memory check error:', error);
        }
    }

    async getMetrics() {
        await this.checkMemory();
        return this.metrics;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
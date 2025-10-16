export class HealthMonitor {
    constructor() {
        this.status = {
            uptime: 0,
            startTime: Date.now(),
            checks: {
                memory: true,
                storage: true,
                connectivity: true
            }
        };
        this.interval = null;
    }

    start() {
        this.interval = setInterval(() => this.check(), 30000);
        console.log('✅ Health monitoring started');
    }

    async check() {
        try {
            // Memory check
            const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
            this.status.checks.memory = usedMemory < 512; // Less than 512MB

            // Update uptime
            this.status.uptime = (Date.now() - this.status.startTime) / 1000;

            // Connectivity check
            try {
                await fetch('https://api.render.com/healthz');
                this.status.checks.connectivity = true;
            } catch {
                this.status.checks.connectivity = false;
            }

            // Storage check (basic)
            try {
                await import('fs/promises').then(fs => 
                    fs.access('./tmp')
                );
                this.status.checks.storage = true;
            } catch {
                this.status.checks.storage = false;
            }

        } catch (error) {
            console.error('Health check error:', error);
        }
    }

    async getStatus() {
        await this.check();
        return {
            status: Object.values(this.status.checks).every(check => check) ? 'healthy' : 'unhealthy',
            ...this.status
        };
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
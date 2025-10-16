import { Worker, isMainThread, parentPort } from 'worker_threads';
import cron from 'node-cron';

class BackgroundWorker {
    constructor() {
        this.workers = new Map();
        this.tasks = new Map();
    }

    // Schedule a cron job
    scheduleCronJob(name, cronExpression, taskFunction) {
        console.log(`📅 Scheduling cron job: ${name} with expression: ${cronExpression}`);
        const task = cron.schedule(cronExpression, () => {
            this.runWorker(name, taskFunction);
        });
        this.tasks.set(name, task);
    }

    // Run a worker thread
    runWorker(name, taskFunction) {
        if (this.workers.has(name)) {
            console.log(`⚠️ Worker ${name} is already running`);
            return;
        }

        const worker = new Worker(`
            import { parentPort } from 'worker_threads';
            
            parentPort.on('message', async (task) => {
                try {
                    const result = await (${taskFunction.toString()})();
                    parentPort.postMessage({ success: true, result });
                } catch (error) {
                    parentPort.postMessage({ success: false, error: error.message });
                }
            });
        `, { eval: true });

        worker.on('message', (message) => {
            console.log(`✅ Worker ${name} completed:`, message);
            this.workers.delete(name);
        });

        worker.on('error', (error) => {
            console.error(`❌ Worker ${name} error:`, error);
            this.workers.delete(name);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`❌ Worker ${name} exited with code ${code}`);
            }
            this.workers.delete(name);
        });

        this.workers.set(name, worker);
        worker.postMessage('start');
    }

    // Stop all workers and tasks
    shutdown() {
        for (const [name, worker] of this.workers) {
            console.log(`🛑 Stopping worker: ${name}`);
            worker.terminate();
        }
        for (const [name, task] of this.tasks) {
            console.log(`🛑 Stopping cron task: ${name}`);
            task.stop();
        }
    }
}

export default BackgroundWorker;
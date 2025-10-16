import cron from 'node-cron';
import { MemoryManager } from './memory-manager.js';

const memoryManager = new MemoryManager();

export async function setupCronJobs() {
    try {
        // Memory optimization - Every 4 hours
        cron.schedule('0 */4 * * *', async () => {
            console.log('🔄 Running scheduled memory optimization...');
            await memoryManager.checkMemory();
            if (global.gc) {
                global.gc();
            }
        });

        // Health check - Every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            console.log('🏥 Running scheduled health check...');
            // Your health check logic here
        });

        // Daily maintenance - At midnight
        cron.schedule('0 0 * * *', () => {
            console.log('🛠️ Running daily maintenance...');
            // Your maintenance logic here
        });

        // Log rotation - Every day at 1 AM
        cron.schedule('0 1 * * *', () => {
            console.log('📝 Running log rotation...');
            // Your log rotation logic here
        });

        console.log('✅ Cron jobs initialized successfully');
    } catch (error) {
        console.error('❌ Error setting up cron jobs:', error);
        throw error;
    }
}
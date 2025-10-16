import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startBackgroundWorker } from './background-worker.js';
import { setupCronJobs } from './cron-manager.js';
import { HealthMonitor } from './health-monitor.js';
import { MemoryManager } from './memory-manager.js';

const healthMonitor = new HealthMonitor();
const memoryManager = new MemoryManager();

// Server configuration
const SERVER_PORT = process.env.PORT || 3000;
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;

// Start server with retry mechanism
async function startServer(attempt = 1) {
    console.log(`📡 Attempt ${attempt}/${MAX_RETRIES}: Starting server...`);
    
    try {
        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'ok',
                    uptime: process.uptime(),
                    health: healthMonitor.getStatus(),
                    memory: memoryManager.getStats()
                }));
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Server is running');
            }
        });

        await new Promise((resolve, reject) => {
            server.listen(SERVER_PORT, () => {
                console.log('✅ Server started successfully on port', SERVER_PORT);
                resolve();
            }).on('error', reject);
        });

        // Initialize background services
        await startBackgroundWorker();
        await setupCronJobs();
        
        return server;

    } catch (err) {
        console.error('Failed to start server:', err);
        if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return startServer(attempt + 1);
        }
        throw err;
    }
}

// Start the server and handle errors
// Process event handlers for better error handling
process.on('uncaughtException', error => {
    console.error('❌ Uncaught Exception:', error);
    healthMonitor.recordError(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    healthMonitor.recordError(reason);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    healthMonitor.recordShutdown();
    process.exit(0);
});

// Start the server with error handling
startServer()
    .then(() => console.log('🚀 All services initialized successfully'))
    .catch(error => {
        console.error('❌ Fatal error:', error);
        healthMonitor.recordError(error);
        process.exit(1);
    });

// Initialize background services
async function initializeServices() {
    try {
        await startBackgroundWorker();
        await setupCronJobs();
        healthMonitor.start();
        memoryManager.start();
        console.log('✅ All background services initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing services:', error);
        process.exit(1);
    }
}

// Create HTTP server
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running');
    }
});

server.listen(port, () => {
    console.log('✅ Server started successfully on port', port);
});

// Error handling
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down...');
    server.close(() => process.exit(0));
});

// Keep the process running
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

console.log('✅ Server initialization complete');

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Health monitoring setup
const healthStatus = {
    server: 'healthy',
    workers: {},
    lastCheck: Date.now()
};

// Background worker setup
function startBackgroundWorker() {
    const worker = new Worker('./background-worker.js');
    
    worker.on('message', (message) => {
        console.log('Worker message:', message);
        healthStatus.workers[worker.threadId] = 'healthy';
    });
    
    worker.on('error', (error) => {
        console.error('Worker error:', error);
        healthStatus.workers[worker.threadId] = 'error';
        // Auto-recovery
        setTimeout(() => startBackgroundWorker(), 5000);
    });
    
    return worker;
}

// Server setup with retry logic
// Server setup with auto-recovery
function startServer() {
    const port = process.env.PORT || 3000;
    console.log('📡 Starting server...');

    try {
        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(healthStatus));
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Server running');
            }
        });

        server.listen(port, () => {
            console.log('✅ Server started successfully on port', port);
            healthStatus.server = 'healthy';
        });
    
    try {
        // Initialize health check
        const healthStatus = {
            server: 'initializing',
            timestamp: Date.now(),
            attempt
        };

        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'ok',
                    uptime: process.uptime()
                }));
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Server is running');
            }
        });

        // Start server
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log('✅ Server started successfully on port', port);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        if (attempt < maxAttempts) {
            setTimeout(() => startServer(attempt + 1), 1000);
        }
    }
    console.log(`📡 Attempt ${attempts}/${maxAttempts}: Starting server...`);

    try {
        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'ok',
                    attempts,
                    health: healthStatus,
                    uptime: process.uptime()
                }));
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Server is running');
            }
        });

        // Error handling
        server.on('error', (error) => {
            console.error('Server error:', error);
            healthStatus.server = 'error';
            if (attempts < maxAttempts) {
                setTimeout(startServer, 1000);
            }
        });

        // Start server
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log('✅ Server started successfully on port', port);
            healthStatus.server = 'healthy';
            
            // Start background worker after server is up
            startBackgroundWorker();
            
            // Start cron job
            setInterval(() => {
                console.log('Running scheduled task...');
                healthStatus.lastCheck = Date.now();
            }, 60000); // Every minute
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        if (attempts < maxAttempts) {
            setTimeout(startServer, 1000);
        }
    }
}

// Start the server with auto-recovery
startServer();

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    healthStatus.server = 'error';
    // Auto-recovery
    if (attempts < maxAttempts) {
        setTimeout(startServer, 1000);
    }
});

// Start server with retry mechanism
let attempts = 0;
const maxAttempts = 10;

function startServer() {
    attempts++;
    console.log(`📡 Attempt ${attempts}/${maxAttempts}: Starting server...`);

    server.listen(port, async () => {
        try {
            console.log(`✅ Server running on port ${port}`);
            await initializeServices();
            console.log('🚀 Application fully initialized and ready');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            if (attempts < maxAttempts) {
                console.log('🔄 Retrying server start...');
                server.close(() => setTimeout(startServer, 1000));
            } else {
                console.error('❌ Max attempts reached. Exiting.');
                process.exit(1);
            }
        }
    });

    server.on('error', (error) => {
        console.error('Server error:', error);
        if (attempts < maxAttempts) {
            setTimeout(startServer, 1000);
        } else {
            console.error('❌ Max attempts reached. Exiting.');
            process.exit(1);
        }
    });
}

startServer();
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema";

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Initializing database connection...');
console.log('Database URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');

// Get the pooled connection URL for better stability
const getPooledConnectionString = (databaseUrl: string) => {
  // Change the URL to use Neon's connection pooler
  return databaseUrl.replace('.us-east-1.aws.neon.tech', '-pooler.us-east-1.aws.neon.tech');
};

// Connection retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Optimized connection pool for serverless deployment with resilience
export const pool = new Pool({ 
  connectionString: getPooledConnectionString(process.env.DATABASE_URL!),
  max: 3, // Further reduced for stability
  min: 1, // Maintain minimum connections
  idleTimeoutMillis: 30000, // 30 second idle timeout
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  allowExitOnIdle: false, // Keep pool alive
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Enhanced error handling
  query_timeout: 25000, // 25 second query timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Enhanced database instance with retry logic
export const db = drizzle({ client: pool, schema });

// Exponential backoff delay calculation
const calculateDelay = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 1000; // Add jitter
};

// Sleep utility
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is a connection termination error
const isConnectionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as { code?: string; message?: string };
  return !!(
    err.code === '57P01' || // terminating connection due to administrator command
    err.code === 'ECONNRESET' ||
    err.code === 'ENOTFOUND' ||
    err.message?.includes('terminating connection') ||
    err.message?.includes('Connection terminated') ||
    err.message?.includes('connection closed')
  );
};

// Resilient query executor with retry logic
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  context: string = 'database operation'
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Only retry on connection errors
      if (!isConnectionError(error) || attempt === RETRY_CONFIG.maxRetries) {
        throw error;
      }

      const delay = calculateDelay(attempt);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}), retrying in ${delay}ms:`, errorMessage);

      await sleep(delay);

      // Force pool to create new connections
      try {
        await pool.query('SELECT 1');
      } catch (reconnectError) {
        const reconnectErrorMessage = reconnectError instanceof Error ? reconnectError.message : String(reconnectError);
        console.log('Pool reconnection attempt:', reconnectErrorMessage);
      }
    }
  }

  throw lastError;
};

// Database health check function with retry logic
export const checkDatabaseConnection = async (): Promise<boolean> => {
  return executeWithRetry(async () => {
    let client;
    try {
      console.log('Testing database connection...');
      client = await pool.connect();
      const result = await client.query('SELECT 1 as health_check');
      console.log('Database connection successful:', result.rows);
      return true;
    } finally {
      if (client) {
        client.release();
      }
    }
  }, 'health check').catch((error) => {
    console.error('Database health check failed after retries:', error);
    return false;
  });
};

// Enhanced pool error handling with recovery
pool.on('error', (err: unknown) => {
  console.error('Database pool error:', err);
  if (isConnectionError(err)) {
    console.log('Connection error detected, pool will attempt to recover');
    // Force pool to create new connections
    setTimeout(() => {
      pool.query('SELECT 1').catch(e => console.log('Recovery query failed:', e.message));
    }, 1000);
  }
});

pool.on('connect', (client) => {
  console.log('New database connection established');
  // Set connection-level timeouts
  client.query('SET statement_timeout = 25000').catch(e => console.log('Failed to set timeout:', e.message));
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Only log in production or when explicitly debugging
if (process.env.NODE_ENV === 'production' || process.env.DB_DEBUG === 'true') {
  pool.on('acquire', () => {
    console.log('Database connection acquired from pool');
  });

  pool.on('release', () => {
    console.log('Database connection released back to pool');
  });
}

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  console.log('SIGINT received, gracefully shutting down...');

  try {
    console.log('Closing database pool...');
    if (pool && !pool.ended) {
      await pool.end();
      console.log('Database pool closed successfully');
    }
  } catch (error) {
    console.error('Error closing database:', error);
  }

  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

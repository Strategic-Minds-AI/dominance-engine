// RESILIENCE MODULE — retry, timeout, stuck-task recovery, circuit breaker.
// Imported by the agent runner and any function that needs transient-failure safety.

// 1. RETRY WITH EXPONENTIAL BACKOFF
export async function withRetry(fn, opts = {}) {
  const { retries = 3, baseDelay = 500, maxDelay = 5000 } = opts;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (e) {
      lastError = e;
      if (attempt < retries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// 2. TIMEOUT
export function withTimeout(promise, ms, label = "task") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// 3. STUCK-TASK RECOVERY — reset tasks stuck in "in_progress" back to "pending"
export async function recoverStuckTasks(base44, thresholdMs = 10 * 60 * 1000) {
  const cutoff = new Date(Date.now() - thresholdMs).toISOString();
  try {
    const stuck = await base44.asServiceRole.entities.AgentTask.filter(
      { status: "in_progress", updated_date: { $lt: cutoff } },
      { limit: 20 }
    );
    let recovered = 0;
    for (const t of (stuck.items || [])) {
      try {
        await base44.asServiceRole.entities.AgentTask.update(t.id, {
          status: "pending",
          result: `recovered_from_stuck at ${new Date().toISOString()}`.slice(0, 1000),
        });
        recovered++;
      } catch {}
    }
    return recovered;
  } catch { return 0; }
}

// 4. CIRCUIT BREAKER — trips after N consecutive failures, blocks further calls
export function createCircuitBreaker(threshold = 3) {
  let failures = 0;
  let tripped = false;
  return {
    recordSuccess() { failures = 0; tripped = false; },
    recordFailure() {
      failures++;
      if (failures >= threshold) tripped = true;
    },
    isTripped() { return tripped; },
    reset() { failures = 0; tripped = false; },
  };
}
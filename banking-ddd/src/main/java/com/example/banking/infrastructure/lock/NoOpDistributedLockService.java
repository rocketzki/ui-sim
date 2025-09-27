package com.example.banking.infrastructure.lock;

import java.time.Duration;
import java.util.concurrent.Callable;

/**
 * No-op implementation that directly executes the action without real distributed locking.
 */
public class NoOpDistributedLockService implements DistributedLockService {
    @Override
    public <T> T withLock(String key, Duration waitTime, Duration leaseTime, Callable<T> action) {
        try {
            return action.call();
        } catch (Exception e) {
            throw new DistributedLockException("Error in NoOp lock action", e);
        }
    }
}


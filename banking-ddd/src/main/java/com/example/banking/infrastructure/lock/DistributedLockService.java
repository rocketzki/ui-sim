package com.example.banking.infrastructure.lock;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.function.Supplier;

public interface DistributedLockService {
    <T> T withLock(String key, Duration waitTime, Duration leaseTime, Callable<T> action) throws DistributedLockException;

    default void runWithLock(String key, Duration waitTime, Duration leaseTime, Runnable action) {
        try {
            withLock(key, waitTime, leaseTime, () -> { action.run(); return null; });
        } catch (DistributedLockException e) {
            throw e;
        } catch (Exception e) {
            throw new DistributedLockException("Error executing action under lock", e);
        }
    }
}


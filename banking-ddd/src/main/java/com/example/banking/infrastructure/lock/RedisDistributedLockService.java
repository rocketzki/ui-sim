package com.example.banking.infrastructure.lock;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * Redis-based distributed locking using Redisson.
 */
public class RedisDistributedLockService implements DistributedLockService {
    private final RedissonClient redissonClient;

    public RedisDistributedLockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Override
    public <T> T withLock(String key, Duration waitTime, Duration leaseTime, Callable<T> action) {
        RLock lock = redissonClient.getLock("lock:" + key);
        boolean acquired = false;
        try {
            acquired = lock.tryLock(waitTime.toMillis(), leaseTime.toMillis(), TimeUnit.MILLISECONDS);
            if (!acquired) {
                throw new DistributedLockException("Could not acquire distributed lock for key " + key);
            }
            return action.call();
        } catch (DistributedLockException e) {
            throw e;
        } catch (Exception e) {
            throw new DistributedLockException("Error executing action under Redis lock", e);
        } finally {
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}


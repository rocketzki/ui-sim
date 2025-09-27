package com.example.banking.infrastructure.lock;

public class DistributedLockException extends RuntimeException {
    public DistributedLockException(String message) {
        super(message);
    }

    public DistributedLockException(String message, Throwable cause) {
        super(message, cause);
    }
}


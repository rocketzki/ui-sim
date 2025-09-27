package com.example.banking.domain.aggregate;

import com.example.banking.domain.value.AccountNumber;
import com.example.banking.domain.value.ClientId;

import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Aggregate root representing a banking client.
 */
public class Client {
    private final ClientId clientId;
    private final String name;
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Set<AccountNumber> accountNumbers = new HashSet<>();

    public Client(ClientId clientId, String name) {
        if (clientId == null || name == null || name.isBlank()) {
            throw new IllegalArgumentException("clientId and name must not be null/blank");
        }
        this.clientId = clientId;
        this.name = name;
    }

    public ClientId getClientId() { return clientId; }

    public String getName() { return name; }

    public Set<AccountNumber> getAccountNumbersSnapshot() {
        lock.readLock().lock();
        try {
            return Collections.unmodifiableSet(new HashSet<>(accountNumbers));
        } finally {
            lock.readLock().unlock();
        }
    }

    public void addAccount(AccountNumber accountNumber) {
        Objects.requireNonNull(accountNumber, "accountNumber");
        lock.writeLock().lock();
        try {
            accountNumbers.add(accountNumber);
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void removeAccount(AccountNumber accountNumber) {
        Objects.requireNonNull(accountNumber, "accountNumber");
        lock.writeLock().lock();
        try {
            accountNumbers.remove(accountNumber);
        } finally {
            lock.writeLock().unlock();
        }
    }
}


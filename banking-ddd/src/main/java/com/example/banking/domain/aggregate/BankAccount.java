package com.example.banking.domain.aggregate;

import com.example.banking.domain.value.AccountNumber;
import com.example.banking.domain.value.Money;
import com.example.banking.domain.value.Transaction;
import com.example.banking.domain.value.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Currency;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Aggregate root representing a bank account. Thread-safe via ReadWriteLock.
 */
public class BankAccount {
    private final AccountNumber accountNumber;
    private final Currency currency;

    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    private Money balance;
    private final List<Transaction> transactions = new ArrayList<>();

    public BankAccount(AccountNumber accountNumber, Currency currency) {
        if (accountNumber == null || currency == null) {
            throw new IllegalArgumentException("accountNumber and currency must not be null");
        }
        this.accountNumber = accountNumber;
        this.currency = currency;
        this.balance = Money.of(BigDecimal.ZERO, currency);
    }

    public AccountNumber getAccountNumber() {
        return accountNumber;
    }

    public Currency getCurrency() {
        return currency;
    }

    public Money currentBalance() {
        lock.readLock().lock();
        try {
            return balance;
        } finally {
            lock.readLock().unlock();
        }
    }

    public List<Transaction> getTransactionsSnapshot() {
        lock.readLock().lock();
        try {
            return Collections.unmodifiableList(new ArrayList<>(transactions));
        } finally {
            lock.readLock().unlock();
        }
    }

    public void deposit(Money amount, String description) {
        Objects.requireNonNull(amount, "amount");
        ensureCurrency(amount);
        if (amount.isNegative() || amount.isZero()) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        lock.writeLock().lock();
        try {
            balance = balance.add(amount);
            transactions.add(Transaction.of(TransactionType.DEPOSIT, amount, description));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void withdraw(Money amount, String description) {
        Objects.requireNonNull(amount, "amount");
        ensureCurrency(amount);
        if (amount.isNegative() || amount.isZero()) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        lock.writeLock().lock();
        try {
            if (balance.compareTo(amount) < 0) {
                throw new IllegalStateException("Insufficient funds");
            }
            balance = balance.subtract(amount);
            transactions.add(Transaction.of(TransactionType.WITHDRAWAL, amount.negate(), description));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void transferOut(Money amount, String description) {
        Objects.requireNonNull(amount, "amount");
        ensureCurrency(amount);
        if (amount.isNegative() || amount.isZero()) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }
        lock.writeLock().lock();
        try {
            if (balance.compareTo(amount) < 0) {
                throw new IllegalStateException("Insufficient funds");
            }
            balance = balance.subtract(amount);
            transactions.add(Transaction.of(TransactionType.TRANSFER_OUT, amount.negate(), description));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void transferIn(Money amount, String description) {
        Objects.requireNonNull(amount, "amount");
        ensureCurrency(amount);
        if (amount.isNegative() || amount.isZero()) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }
        lock.writeLock().lock();
        try {
            balance = balance.add(amount);
            transactions.add(Transaction.of(TransactionType.TRANSFER_IN, amount, description));
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void ensureCurrency(Money amount) {
        if (!amount.getCurrency().equals(this.currency)) {
            throw new IllegalArgumentException("Currency mismatch: expected " + currency);
        }
    }
}


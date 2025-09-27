package com.example.banking.domain.service;

import com.example.banking.domain.aggregate.BankAccount;
import com.example.banking.domain.repository.BankAccountRepository;
import com.example.banking.domain.value.AccountNumber;
import com.example.banking.domain.value.Money;
import com.example.banking.infrastructure.lock.DistributedLockException;
import com.example.banking.infrastructure.lock.DistributedLockService;

import java.time.Duration;
import java.util.Currency;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * Domain service orchestrating account operations. Uses distributed locking with local fallback.
 */
public class BankingService {
    private final BankAccountRepository bankAccountRepository;
    private final DistributedLockService distributedLockService;
    private final ReentrantLock localLock = new ReentrantLock();

    public BankingService(BankAccountRepository bankAccountRepository, DistributedLockService distributedLockService) {
        this.bankAccountRepository = Objects.requireNonNull(bankAccountRepository);
        this.distributedLockService = Objects.requireNonNull(distributedLockService);
    }

    public void createAccount(AccountNumber accountNumber, Currency currency) {
        Objects.requireNonNull(accountNumber);
        Objects.requireNonNull(currency);
        String key = "account:" + accountNumber.getValue();
        runWithDistributedLock(key, Duration.ofSeconds(2), Duration.ofSeconds(10), () -> {
            BankAccount account = bankAccountRepository.findByAccountNumber(accountNumber)
                    .orElseGet(() -> new BankAccount(accountNumber, currency));
            bankAccountRepository.save(account);
        });
    }

    public void deposit(AccountNumber accountNumber, Money amount, String description) {
        Objects.requireNonNull(accountNumber);
        Objects.requireNonNull(amount);
        String key = "account:" + accountNumber.getValue();
        runWithDistributedLock(key, Duration.ofSeconds(2), Duration.ofSeconds(10), () -> {
            BankAccount account = bankAccountRepository.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));
            account.deposit(amount, description);
            bankAccountRepository.save(account);
        });
    }

    public void withdraw(AccountNumber accountNumber, Money amount, String description) {
        Objects.requireNonNull(accountNumber);
        Objects.requireNonNull(amount);
        String key = "account:" + accountNumber.getValue();
        runWithDistributedLock(key, Duration.ofSeconds(2), Duration.ofSeconds(10), () -> {
            BankAccount account = bankAccountRepository.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));
            account.withdraw(amount, description);
            bankAccountRepository.save(account);
        });
    }

    public void transfer(AccountNumber from, AccountNumber to, Money amount, String description) {
        Objects.requireNonNull(from);
        Objects.requireNonNull(to);
        Objects.requireNonNull(amount);
        if (from.equals(to)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        // To avoid deadlock, order lock keys lexicographically
        String key1 = (from.getValue().compareTo(to.getValue()) < 0) ? from.getValue() : to.getValue();
        String key2 = (from.getValue().compareTo(to.getValue()) < 0) ? to.getValue() : from.getValue();

        runWithDistributedLock("account:" + key1, Duration.ofSeconds(2), Duration.ofSeconds(10), () ->
            runWithDistributedLock("account:" + key2, Duration.ofSeconds(2), Duration.ofSeconds(10), () -> {
                BankAccount source = bankAccountRepository.findByAccountNumber(from)
                        .orElseThrow(() -> new IllegalArgumentException("Source account not found"));
                BankAccount target = bankAccountRepository.findByAccountNumber(to)
                        .orElseThrow(() -> new IllegalArgumentException("Target account not found"));

                source.transferOut(amount, description);
                target.transferIn(amount, description);

                bankAccountRepository.save(source);
                bankAccountRepository.save(target);
            })
        );
    }

    private void runWithDistributedLock(String key, Duration wait, Duration lease, Runnable action) {
        try {
            distributedLockService.runWithLock(key, wait, lease, action);
        } catch (DistributedLockException e) {
            // Fallback to local lock to preserve single-node safety
            localLock.lock();
            try {
                action.run();
            } finally {
                localLock.unlock();
            }
        }
    }
}


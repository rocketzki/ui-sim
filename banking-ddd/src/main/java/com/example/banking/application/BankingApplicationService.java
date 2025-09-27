package com.example.banking.application;

import com.example.banking.domain.service.BankingService;
import com.example.banking.domain.value.AccountNumber;
import com.example.banking.domain.value.Money;

import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Application service orchestrating asynchronous use cases using an ExecutorService.
 */
public class BankingApplicationService {
    private final BankingService bankingService;
    private final ExecutorService executorService;

    public BankingApplicationService(BankingService bankingService, int threadPoolSize) {
        this.bankingService = Objects.requireNonNull(bankingService);
        this.executorService = Executors.newFixedThreadPool(Math.max(threadPoolSize, 2));
    }

    public CompletableFuture<Void> depositAsync(AccountNumber accountNumber, Money amount, String description) {
        return CompletableFuture.runAsync(() -> bankingService.deposit(accountNumber, amount, description), executorService);
    }

    public CompletableFuture<Void> withdrawAsync(AccountNumber accountNumber, Money amount, String description) {
        return CompletableFuture.runAsync(() -> bankingService.withdraw(accountNumber, amount, description), executorService);
    }

    public CompletableFuture<Void> transferAsync(AccountNumber from, AccountNumber to, Money amount, String description) {
        return CompletableFuture.runAsync(() -> bankingService.transfer(from, to, amount, description), executorService);
    }

    public void shutdownGracefully() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}


package com.example.banking;

import com.example.banking.application.BankingApplicationService;
import com.example.banking.domain.repository.BankAccountRepository;
import com.example.banking.domain.service.BankingService;
import com.example.banking.domain.value.AccountNumber;
import com.example.banking.domain.value.Money;
import com.example.banking.infrastructure.config.RedisConfig;
import com.example.banking.infrastructure.lock.DistributedLockService;
import com.example.banking.infrastructure.lock.NoOpDistributedLockService;
import com.example.banking.infrastructure.lock.RedisDistributedLockService;
import com.example.banking.infrastructure.repository.InMemoryBankAccountRepository;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Currency;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

public class BankingApplication {
    private static final Logger log = LoggerFactory.getLogger(BankingApplication.class);

    public static void main(String[] args) throws Exception {
        // Configuration flags
        boolean useRedis = Boolean.parseBoolean(System.getProperty("useRedis", "false"));
        String redisHost = System.getProperty("redisHost", "localhost");
        int redisPort = Integer.parseInt(System.getProperty("redisPort", "6379"));

        RedissonClient redissonClient = null;
        DistributedLockService lockService;
        if (useRedis) {
            try {
                redissonClient = RedisConfig.createClient(redisHost, redisPort);
                lockService = new RedisDistributedLockService(redissonClient);
                log.info("Using RedisDistributedLockService at {}:{}", redisHost, redisPort);
            } catch (Exception e) {
                log.warn("Failed to connect to Redis; falling back to NoOpDistributedLockService", e);
                lockService = new NoOpDistributedLockService();
            }
        } else {
            lockService = new NoOpDistributedLockService();
            log.info("Using NoOpDistributedLockService (no external Redis)");
        }

        BankAccountRepository accountRepository = new InMemoryBankAccountRepository();
        BankingService bankingService = new BankingService(accountRepository, lockService);
        BankingApplicationService appService = new BankingApplicationService(bankingService, Runtime.getRuntime().availableProcessors());

        Currency currency = Currency.getInstance("USD");
        AccountNumber acc1 = AccountNumber.of("ACC0000001");
        AccountNumber acc2 = AccountNumber.of("ACC0000002");

        bankingService.createAccount(acc1, currency);
        bankingService.createAccount(acc2, currency);

        // Seed with initial deposits
        bankingService.deposit(acc1, Money.of(new BigDecimal("1000.00"), currency), "Initial deposit");
        bankingService.deposit(acc2, Money.of(new BigDecimal("1000.00"), currency), "Initial deposit");

        // Concurrency demo: many concurrent transfers between accounts
        int operations = 50;
        List<CompletableFuture<Void>> futures = new java.util.ArrayList<>();
        for (int i = 0; i < operations; i++) {
            Money amount = Money.of(new BigDecimal(String.format("%d.00", ThreadLocalRandom.current().nextInt(1, 20))), currency);
            if (i % 2 == 0) {
                futures.add(appService.transferAsync(acc1, acc2, amount, "Batch transfer " + i));
            } else {
                futures.add(appService.transferAsync(acc2, acc1, amount, "Batch transfer " + i));
            }
        }

        // Monitoring: log progress and final balances
        CompletableFuture<Void> all = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
        log.info("Submitted {} operations. Waiting for completion...", operations);
        all.get(30, TimeUnit.SECONDS);
        log.info("All operations completed.");

        log.info("Final balance acc1: {}", accountRepository.findByAccountNumber(acc1).get().currentBalance());
        log.info("Final balance acc2: {}", accountRepository.findByAccountNumber(acc2).get().currentBalance());

        // Simple runtime metrics
        log.info("Active threads: {}", Thread.activeCount());

        appService.shutdownGracefully();
        if (redissonClient != null) {
            redissonClient.shutdown();
        }

        // Keep app alive briefly to let logs flush
        Thread.sleep(Duration.ofSeconds(1).toMillis());
    }
}


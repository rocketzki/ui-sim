package com.example.banking.infrastructure;

import com.example.banking.infrastructure.lock.DistributedLockException;
import com.example.banking.infrastructure.lock.DistributedLockService;
import com.example.banking.infrastructure.lock.NoOpDistributedLockService;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class DistributedLockServiceTest {

    @Test
    void noOpLockExecutesAction() {
        DistributedLockService lockService = new NoOpDistributedLockService();
        String res = lockService.withLock("k", Duration.ofMillis(10), Duration.ofMillis(100), () -> "ok");
        assertThat(res).isEqualTo("ok");
    }

    @Test
    void noOpLockAllowsConcurrentIncrement() throws Exception {
        DistributedLockService lockService = new NoOpDistributedLockService();
        ExecutorService executor = Executors.newFixedThreadPool(8);
        final int iterations = 1000;
        final int[] counter = {0};
        CompletableFuture<?>[] futures = new CompletableFuture[iterations];
        for (int i = 0; i < iterations; i++) {
            futures[i] = CompletableFuture.runAsync(() -> {
                lockService.runWithLock("k", Duration.ofMillis(1), Duration.ofMillis(10), () -> counter[0]++);
            }, executor);
        }
        CompletableFuture.allOf(futures).get(10, TimeUnit.SECONDS);
        // NoOp doesn't actually lock, so counter should equal iterations
        assertThat(counter[0]).isEqualTo(iterations);
        executor.shutdownNow();
    }
}


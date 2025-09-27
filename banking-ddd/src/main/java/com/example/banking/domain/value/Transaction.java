package com.example.banking.domain.value;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Immutable transaction value object representing a single ledger entry.
 */
public final class Transaction {
    private final UUID id;
    private final TransactionType type;
    private final Money amount;
    private final Instant timestamp;
    private final String description;

    private Transaction(UUID id, TransactionType type, Money amount, Instant timestamp, String description) {
        if (id == null || type == null || amount == null || timestamp == null) {
            throw new IllegalArgumentException("Transaction fields must not be null");
        }
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.timestamp = timestamp;
        this.description = description == null ? "" : description;
    }

    public static Transaction of(TransactionType type, Money amount, String description) {
        return new Transaction(UUID.randomUUID(), type, amount, Instant.now(), description);
    }

    public UUID getId() { return id; }
    public TransactionType getType() { return type; }
    public Money getAmount() { return amount; }
    public Instant getTimestamp() { return timestamp; }
    public String getDescription() { return description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction)) return false;
        Transaction that = (Transaction) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", type=" + type +
                ", amount=" + amount +
                ", timestamp=" + timestamp +
                ", description='" + description + '\'' +
                '}';
    }
}


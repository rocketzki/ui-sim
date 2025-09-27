package com.example.banking.domain.value;

import java.util.Objects;
import java.util.UUID;

/**
 * Immutable value object for client identifier.
 */
public final class ClientId implements Comparable<ClientId> {
    private final UUID value;

    private ClientId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ClientId must not be null");
        }
        this.value = value;
    }

    public static ClientId newId() {
        return new ClientId(UUID.randomUUID());
    }

    public static ClientId of(UUID value) {
        return new ClientId(value);
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClientId)) return false;
        ClientId clientId = (ClientId) o;
        return value.equals(clientId.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }

    @Override
    public int compareTo(ClientId o) {
        return this.value.compareTo(o.value);
    }
}


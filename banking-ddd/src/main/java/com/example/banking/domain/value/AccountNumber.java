package com.example.banking.domain.value;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Immutable value object for account number. Performs basic format validation.
 */
public final class AccountNumber implements Comparable<AccountNumber> {
    private static final Pattern BASIC_PATTERN = Pattern.compile("[A-Z0-9]{10,34}");

    private final String value;

    private AccountNumber(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Account number must not be blank");
        }
        String normalized = value.replaceAll("\\s+", "").toUpperCase();
        if (!BASIC_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid account number format: " + value);
        }
        this.value = normalized;
    }

    public static AccountNumber of(String value) {
        return new AccountNumber(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AccountNumber)) return false;
        AccountNumber that = (AccountNumber) o;
        return value.equals(that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }

    @Override
    public int compareTo(AccountNumber o) {
        return this.value.compareTo(o.value);
    }
}


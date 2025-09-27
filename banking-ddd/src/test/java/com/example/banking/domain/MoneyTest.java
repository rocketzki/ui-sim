package com.example.banking.domain;

import com.example.banking.domain.value.Money;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Currency;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class MoneyTest {
    private final Currency USD = Currency.getInstance("USD");

    @Test
    void addSubtractAndCompare() {
        Money a = Money.of(new BigDecimal("10.00"), USD);
        Money b = Money.of(new BigDecimal("5.00"), USD);

        assertThat(a.add(b)).isEqualTo(Money.of(new BigDecimal("15.00"), USD));
        assertThat(a.subtract(b)).isEqualTo(Money.of(new BigDecimal("5.00"), USD));
        assertThat(a.compareTo(b)).isGreaterThan(0);
    }

    @Test
    void currencyMismatchThrows() {
        Money a = Money.of(new BigDecimal("10.00"), USD);
        Money b = Money.of(new BigDecimal("5.00"), Currency.getInstance("EUR"));
        assertThrows(IllegalArgumentException.class, () -> a.add(b));
    }
}


package com.example.banking.domain.repository;

import com.example.banking.domain.aggregate.BankAccount;
import com.example.banking.domain.value.AccountNumber;

import java.util.Optional;

public interface BankAccountRepository {
    Optional<BankAccount> findByAccountNumber(AccountNumber accountNumber);
    void save(BankAccount account);
}


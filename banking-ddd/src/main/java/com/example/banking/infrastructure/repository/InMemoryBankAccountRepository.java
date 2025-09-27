package com.example.banking.infrastructure.repository;

import com.example.banking.domain.aggregate.BankAccount;
import com.example.banking.domain.repository.BankAccountRepository;
import com.example.banking.domain.value.AccountNumber;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryBankAccountRepository implements BankAccountRepository {
    private final Map<String, BankAccount> storage = new ConcurrentHashMap<>();

    @Override
    public Optional<BankAccount> findByAccountNumber(AccountNumber accountNumber) {
        return Optional.ofNullable(storage.get(accountNumber.getValue()));
    }

    @Override
    public void save(BankAccount account) {
        storage.put(account.getAccountNumber().getValue(), account);
    }
}


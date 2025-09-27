package com.example.banking.domain.repository;

import com.example.banking.domain.aggregate.Client;
import com.example.banking.domain.value.ClientId;

import java.util.Optional;

public interface ClientRepository {
    Optional<Client> findById(ClientId clientId);
    void save(Client client);
}


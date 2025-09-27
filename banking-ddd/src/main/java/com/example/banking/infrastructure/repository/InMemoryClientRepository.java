package com.example.banking.infrastructure.repository;

import com.example.banking.domain.aggregate.Client;
import com.example.banking.domain.repository.ClientRepository;
import com.example.banking.domain.value.ClientId;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryClientRepository implements ClientRepository {
    private final Map<String, Client> storage = new ConcurrentHashMap<>();

    @Override
    public Optional<Client> findById(ClientId clientId) {
        return Optional.ofNullable(storage.get(clientId.getValue().toString()));
    }

    @Override
    public void save(Client client) {
        storage.put(client.getClientId().getValue().toString(), client);
    }
}


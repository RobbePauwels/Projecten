package service;

import domain.Lokaal;

import java.util.List;
import java.util.Optional;

public interface LokaalService {
    List<Lokaal> findAll();
    Optional<Lokaal> findById(Long id);
    Lokaal save(Lokaal lokaal);
    boolean bestaatNaam(String naam);
    Lokaal createLokaalInstance(); 
}

package service;

import domain.Lokaal;
import repository.LokaalRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LokaalServiceImpl implements LokaalService {

    private final LokaalRepository lokaalRepository;

    public LokaalServiceImpl(LokaalRepository lokaalRepository) {
        this.lokaalRepository = lokaalRepository;
    }

    @Override
    public List<Lokaal> findAll() {
        return lokaalRepository.findAll();
    }

    @Override
    public Optional<Lokaal> findById(Long id) {
        return lokaalRepository.findById(id);
    }

    @Override
    public Lokaal save(Lokaal lokaal) {
        return lokaalRepository.save(lokaal);
    }

    @Override
    public boolean bestaatNaam(String naam) {
        return lokaalRepository.findAll().stream()
                .anyMatch(l -> l.getNaam().equalsIgnoreCase(naam));
    }

    @Override
    public Lokaal createLokaalInstance() {
        return new Lokaal();
    }
}

package service;

import domain.Event;
import domain.Lokaal;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface EventService {
    List<Event> findAllSortedByDatumTijd();
    Event findById(Long id);
    Event save(Event event);
    void deleteById(Long id);
    List<Event> getEventsOpDatum(LocalDate datum);
    Event findByDatumTijdAndLokaal(LocalDateTime datumTijd, Lokaal lokaal);
    List<Event> findByNaamAndDatum(String naam, LocalDate datum);
}

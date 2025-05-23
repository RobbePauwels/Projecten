package service;

import domain.Event;
import java.util.List;
import java.time.LocalDate;

public interface EventService {
    List<Event> findAllSortedByDatumTijd();
    Event findById(Long id);
    Event save(Event event);
    void deleteById(Long id);
    List<Event> getEventsOpDatum(LocalDate datum);
}

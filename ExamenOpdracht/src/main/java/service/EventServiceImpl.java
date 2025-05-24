package service;

import domain.Event;
import domain.Lokaal;
import repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Event> findAllSortedByDatumTijd() {
        return eventRepository.findAllByOrderByDatumTijdAsc();
    }

    @Override
    public Event findById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @Override
    public Event save(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public void deleteById(Long id) {
        eventRepository.deleteById(id);
    }
    
    @Override
    public List<Event> getEventsOpDatum(LocalDate datum) {
        return eventRepository.findByDatum(datum);
    }
    
    @Override
    public Event findByDatumTijdAndLokaal(LocalDateTime datumTijd, Lokaal lokaal) {
        return eventRepository.findByDatumTijdAndLokaal(datumTijd, lokaal).orElse(null);
    }
    @Override
    public List<Event> findByNaamAndDatum(String naam, LocalDate datum) {
        return eventRepository.findByNaamIgnoreCaseAndDatumTijdBetween(
            naam,
            datum.atStartOfDay(),
            datum.plusDays(1).atStartOfDay()
        );
    }

}

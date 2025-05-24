package com.example.demo;

import domain.Event;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import service.EventService;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EventValidatorAdvice implements Validator {

    private final EventService eventService;

    public EventValidatorAdvice(EventService eventService) {
        this.eventService = eventService;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return Event.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        System.out.println("Validate voor event wordt aangeroepen");
        if (!(target instanceof Event)) {
            throw new IllegalArgumentException("Invalid target for EventValidatorAdvice");
        }
        Event event = (Event) target;

        if (event.getDatumTijd() != null && event.getDatumTijd().isBefore(LocalDateTime.now())) {
            errors.rejectValue("datumTijd", "event.datumtijd.past", "De datum en tijd moeten in de toekomst liggen.");
        }

        if (event.getNaam() != null && event.getNaam().trim().isEmpty()) {
            errors.rejectValue("naam", "event.naam.notblank", "Naam mag niet leeg zijn.");
        }

        if (event.getSprekers() == null || event.getSprekers().isEmpty()) {
            errors.rejectValue("sprekers", "event.sprekers.size", "Er moet minstens één spreker zijn.");
        } else {
            if (event.getSprekers().get(0) == null || event.getSprekers().get(0).trim().isEmpty()) {
                errors.rejectValue("sprekers", "event.spreker.first.notblank", "De eerste spreker mag niet leeg zijn.");
            }
            List<String> sprekers = event.getSprekers();
            long distinctCount = sprekers.stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::toLowerCase)
                    .distinct()
                    .count();

            if (distinctCount < sprekers.stream().filter(s -> s != null && !s.trim().isEmpty()).count()) {
                errors.rejectValue("sprekers", "event.sprekers.duplicate", "Sprekers mogen niet dubbel voorkomen.");
            }
        }

        if (event.getDatumTijd() != null && event.getLokaal() != null) {
            Event bestaandEvent = eventService.findByDatumTijdAndLokaal(event.getDatumTijd(), event.getLokaal());

            if (bestaandEvent != null) {
                if (event.getId() == null || !event.getId().equals(bestaandEvent.getId())) {
                    errors.rejectValue("datumTijd", "event.datumtijdenlokaal.conflict", "Er is al een event gepland op dit tijdstip in dit lokaal.");
                }
            }
        }

      
        if (event.getNaam() != null && event.getDatumTijd() != null) {
            List<Event> eventsOpNaamEnDatum = eventService.findByNaamAndDatum(event.getNaam().trim(), event.getDatum());
            for (Event e : eventsOpNaamEnDatum) {
                if (event.getId() == null || !event.getId().equals(e.getId())) {
                    errors.rejectValue("naam", "event.naam.dag.conflict", "Er bestaat al een event met deze naam op dezelfde dag.");
                    break;
                }
            }

    }

    }
}

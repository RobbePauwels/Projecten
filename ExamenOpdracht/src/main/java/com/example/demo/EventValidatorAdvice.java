package com.example.demo;

import domain.Event;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.time.LocalDateTime;

@Component
public class EventValidatorAdvice implements Validator {

    @Override
    public boolean supports(Class<?> clazz) {
        return Event.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        Event event = (Event) target;

        if (event.getDatumTijd() != null && event.getDatumTijd().isBefore(LocalDateTime.now())) {
            errors.rejectValue("datumTijd", "event.datumtijd.past", "De datum en tijd moeten in de toekomst liggen.");
        }

        if (event.getNaam() != null && event.getNaam().trim().isEmpty()) {
            errors.rejectValue("naam", "event.naam.notblank", "Naam mag niet leeg zijn.");
        }

        if (event.getSprekers() == null || event.getSprekers().isEmpty()) {
            errors.rejectValue("sprekers", "event.sprekers.size", "Er moet minstens één spreker zijn.");
        } else if (event.getSprekers().get(0) == null || event.getSprekers().get(0).trim().isEmpty()) {
            errors.rejectValue("sprekers", "event.spreker.first.notblank", "De eerste spreker mag niet leeg zijn.");
        }
    }
}

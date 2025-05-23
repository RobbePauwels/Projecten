package com.example.demo;

import domain.Event;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import service.EventService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventRestController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public List<Event> getEventsByDate(
            @RequestParam("datum")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum) {
        return eventService.getEventsOpDatum(datum);
    }
}

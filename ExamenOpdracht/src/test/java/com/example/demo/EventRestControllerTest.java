package com.example.demo;

import domain.Event;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.test.web.servlet.MockMvc;
import service.EventService;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventRestController.class)
public class EventRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @Test
    void getEventsByDate_ReturnsJsonList() throws Exception {
        Event event = new Event();
        event.setNaam("TestEvent");
        event.setDatumTijd(LocalDate.now().atStartOfDay());

        Mockito.when(eventService.getEventsOpDatum(any(LocalDate.class)))
                .thenReturn(List.of(event));

        mockMvc.perform(get("/api/events")
                        .param("datum", "2025-05-23"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].naam").value("TestEvent"));
    }
}

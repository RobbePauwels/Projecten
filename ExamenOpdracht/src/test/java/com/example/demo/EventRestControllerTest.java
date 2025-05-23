package com.example.demo;

import domain.Event;
import org.junit.jupiter.api.Test;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.mock;

@WebMvcTest(EventRestController.class)
public class EventRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private service.EventService eventService;

    @Test
    public void testGetEventsByDate() throws Exception {
        LocalDate testDate = LocalDate.of(2025, 5, 23);

        Event event1 = mock(Event.class);
        Event event2 = mock(Event.class);

        // Stel id en naam in met Mockito when
        BDDMockito.given(event1.getId()).willReturn(1L);
        BDDMockito.given(event1.getNaam()).willReturn("Event 1");
        BDDMockito.given(event2.getId()).willReturn(2L);
        BDDMockito.given(event2.getNaam()).willReturn("Event 2");

        List<Event> events = Arrays.asList(event1, event2);

        BDDMockito.given(eventService.getEventsOpDatum(testDate)).willReturn(events);

        mockMvc.perform(get("/api/events")
                .param("datum", "2025-05-23"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(events.size()))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].naam").value("Event 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].naam").value("Event 2"));
    }
}

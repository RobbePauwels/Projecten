package com.example.demo;

import domain.Event;
import domain.Lokaal;
import domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import service.EventService;
import service.LokaalService;
import service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private LokaalService lokaalService;

    @MockitoBean
    private UserService userService;

    @Test
    @WithMockUser
    void testShowAllEvents() throws Exception {
        Event event = mock(Event.class);
        when(eventService.findAllSortedByDatumTijd()).thenReturn(List.of(event));

        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("events"))
                .andExpect(model().attributeExists("events"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testShowEventDetailsAsUser() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn(1L);
        when(eventService.findById(1L)).thenReturn(event);

        User user = mock(User.class);
        when(user.getFavorieten()).thenReturn(Set.of(event));
        when(userService.findByUsername(any())).thenReturn(Optional.of(user));
        when(userService.isFavoriet(user, event)).thenReturn(true);
        when(userService.isFavorietenLimietBereikt(user)).thenReturn(false);

        mockMvc.perform(get("/event/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("event-details"))
                .andExpect(model().attributeExists("event", "isUser", "isAdmin", "isFavoriet", "limietBereikt"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testVoegFavorietToe() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn(1L);
        when(eventService.findById(1L)).thenReturn(event);

        User user = mock(User.class);
        when(userService.findByUsername(any())).thenReturn(Optional.of(user));
        when(userService.voegFavorietToe(user, event)).thenReturn(true);

        mockMvc.perform(post("/event/favoriet-toevoegen/1").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/event/1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testToonEventToevoegPagina() throws Exception {
        Lokaal lokaal = mock(Lokaal.class);
        when(lokaalService.findAll()).thenReturn(List.of(lokaal));

        mockMvc.perform(get("/event/toevoeg"))
                .andExpect(status().isOk())
                .andExpect(view().name("eventToevoeg"))
                .andExpect(model().attributeExists("event", "lokalen"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventToevoegingMetFouten() throws Exception {
        mockMvc.perform(post("/event/toevoeg").with(csrf())
                        .param("naam", "")
                        .param("datumTijd", "")
                        .param("prijs", "")
                        .param("beamerCode", "")
                        .param("beamerCheck", ""))
                .andExpect(status().isOk())
                .andExpect(view().name("eventToevoeg"))
                .andExpect(model().attributeHasErrors("event"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testToonEventBewerkPagina() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn(1L);
        when(eventService.findById(1L)).thenReturn(event);
        when(event.getSprekers()).thenReturn(List.of("Jan"));

        Lokaal lokaal = mock(Lokaal.class);
        when(lokaalService.findAll()).thenReturn(List.of(lokaal));

        mockMvc.perform(get("/event/bewerken/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("eventBewerken"))
                .andExpect(model().attributeExists("event", "lokalen"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventBewerkingMetFouten() throws Exception {
        mockMvc.perform(post("/event/bewerken/1").with(csrf())
                        .param("naam", "")
                        .param("datumTijd", "")
                        .param("prijs", "")
                        .param("beamerCode", "")
                        .param("beamerCheck", ""))
                .andExpect(status().isOk())
                .andExpect(view().name("eventBewerken"))
                .andExpect(model().attributeHasErrors("event"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventBewerkingMetGeldigeData() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn(1L);
        when(eventService.findById(1L)).thenReturn(event);

        Lokaal lokaal = mock(Lokaal.class);
        when(lokaalService.findAll()).thenReturn(List.of(lokaal));

        mockMvc.perform(post("/event/bewerken/1").with(csrf())
                        .param("naam", "Java Day")
                        .param("datumTijd", LocalDateTime.now().toString())
                        .param("prijs", "15.00")
                        .param("beamerCode", "1234")
                        .param("beamerCheck", "50"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(eventService).save(any(Event.class));
    }
}

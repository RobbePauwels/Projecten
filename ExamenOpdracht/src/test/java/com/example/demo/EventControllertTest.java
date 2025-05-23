package com.example.demo;

import domain.Event;
import domain.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import service.EventService;
import service.LokaalService;
import service.UserService;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private LokaalService lokaalService;

    @MockBean
    private UserService userService;

    @MockBean
    private EventValidatorAdvice eventValidatorAdvice;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testToonEventToevoegPagina() throws Exception {
        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/event/toevoeg"))
                .andExpect(status().isOk())
                .andExpect(model().attributeExists("event"))
                .andExpect(model().attributeExists("lokalen"))
                .andExpect(view().name("eventToevoeg"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventToevoegingValid() throws Exception {
        when(eventValidatorAdvice.supports(Event.class)).thenReturn(true);

        mockMvc.perform(post("/event/toevoeg")
                        .param("naam", "Test Event")
                        .param("datumTijd", "2025-06-01T10:00") // voorbeeld datetime
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(eventService).save(ArgumentMatchers.any(Event.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventToevoegingInvalid() throws Exception {
        // Simuleer validatiefout door BindingResult.hasErrors te laten true zijn via mock Validator

        doAnswer(invocation -> {
            Object target = invocation.getArgument(0);
            // forceer een validatiefout op purpose (je kunt ook de validator zelf mocken)
            return null;
        }).when(eventValidatorAdvice).validate(any(), any());

        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/toevoeg")
                        .param("naam", "") // fout: lege naam
                        .param("datumTijd", "2025-06-01T10:00")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("eventToevoeg"))
                .andExpect(model().attributeExists("lokalen"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testVoegFavorietToeSucces() throws Exception {
        Event event = new Event();
        event.setId(1L);

        User user = new User();
        user.setUsername("user1");

        when(userService.findByUsername("user1")).thenReturn(Optional.of(user));
        when(eventService.findById(1L)).thenReturn(event);
        when(userService.voegFavorietToe(user, event)).thenReturn(true);

        mockMvc.perform(post("/event/favoriet-toevoegen/1").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/event/1"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testVoegFavorietToeFail() throws Exception {
        Event event = new Event();
        event.setId(1L);

        User user = new User();
        user.setUsername("user1");

        when(userService.findByUsername("user1")).thenReturn(Optional.of(user));
        when(eventService.findById(1L)).thenReturn(event);
        when(userService.voegFavorietToe(user, event)).thenReturn(false);

        mockMvc.perform(post("/event/favoriet-toevoegen/1").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(flash().attributeExists("fout"))
                .andExpect(redirectedUrl("/event/1"));
    }


    @Test
    @WithMockUser(roles = "ADMIN")
    void testToonEventBewerkenPagina() throws Exception {
        Event event = new Event();
        event.setId(1L);
        event.setSprekers(new ArrayList<>(Arrays.asList("a", "b")));

        when(eventService.findById(1L)).thenReturn(event);
        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/event/bewerken/1"))
                .andExpect(status().isOk())
                .andExpect(model().attributeExists("event"))
                .andExpect(model().attributeExists("lokalen"))
                .andExpect(view().name("eventBewerken"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventBewerkingValid() throws Exception {
        when(eventValidatorAdvice.supports(Event.class)).thenReturn(true);

        mockMvc.perform(post("/event/bewerken/1")
                        .param("naam", "Test Event")
                        .param("datumTijd", "2025-06-01T10:00")
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(eventService).save(ArgumentMatchers.any(Event.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventBewerkingInvalid() throws Exception {
        // Validator simuleert fout
        doAnswer(invocation -> {
            return null;
        }).when(eventValidatorAdvice).validate(any(), any());

        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/bewerken/1")
                        .param("naam", "") // fout: lege naam
                        .param("datumTijd", "2025-06-01T10:00")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("eventBewerken"))
                .andExpect(model().attributeExists("lokalen"));
    }
}

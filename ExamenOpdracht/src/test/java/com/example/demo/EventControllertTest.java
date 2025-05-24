package com.example.demo;

import domain.Event;
import domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import service.EventService;
import service.LokaalService;
import service.UserService;

import java.beans.PropertyEditorSupport;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    @BeforeEach
    void setupValidator() {
        when(eventValidatorAdvice.supports(any())).thenReturn(true);
        doAnswer(invocation -> null).when(eventValidatorAdvice).validate(any(), any());
    }

    private void initBinder(WebDataBinder binder) {
        binder.addValidators(eventValidatorAdvice);
        binder.registerCustomEditor(LocalDateTime.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                setValue(LocalDateTime.parse(text, formatter));
            }
        });
    }

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
        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/toevoeg")
                        .param("naam", "Test Event")
                        .param("datumTijd", "2025-06-01T10:00")
                        .param("sprekers[0]", "Spreker 1")
                        .param("lokaal.id", "1")
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(eventService).save(any(Event.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventToevoegingInvalid() throws Exception {
        doAnswer(invocation -> {
            BindingResult bindingResult = invocation.getArgument(1);
            bindingResult.reject("naam", "Lege naam niet toegestaan");
            return null;
        }).when(eventValidatorAdvice).validate(any(), any());

        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/toevoeg")
                        .param("naam", "")
                        .param("datumTijd", "2025-06-01T10:00")
                        .param("sprekers[0]", "Spreker 1")
                        .param("lokaal.id", "1")
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
        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/bewerken/1")
                        .param("naam", "Test Event")
                        .param("datumTijd", "2025-06-01T10:00")
                        .param("sprekers[0]", "Spreker 1")
                        .param("lokaal.id", "1")
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(eventService).save(any(Event.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVerwerkEventBewerkingInvalid() throws Exception {
        doAnswer(invocation -> {
            BindingResult bindingResult = invocation.getArgument(1);
            bindingResult.reject("naam", "Lege naam niet toegestaan");
            return null;
        }).when(eventValidatorAdvice).validate(any(), any());

        when(lokaalService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/event/bewerken/1")
                        .param("naam", "")
                        .param("datumTijd", "2025-06-01T10:00")
                        .param("sprekers[0]", "Spreker 1")
                        .param("lokaal.id", "1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(view().name("eventBewerken"))
                .andExpect(model().attributeExists("lokalen"));
    }
}

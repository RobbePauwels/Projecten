package com.example.demo;

import domain.Event;
import domain.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import service.UserService;

import java.security.Principal;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.mock;

@WebMvcTest(FavorietenController.class)
public class FavorietenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    public void testToonFavorieten_GebruikerMetFavorieten() throws Exception {
        User mockUser = mock(User.class);
        Event mockEvent = mock(Event.class);

        when(mockUser.getUsername()).thenReturn("jan");
        when(mockEvent.getId()).thenReturn(1L);
        when(mockEvent.getNaam()).thenReturn("Spring Conference");

        when(userService.findByUsername("jan")).thenReturn(Optional.of(mockUser));
        when(userService.getFavorieten(mockUser)).thenReturn(Collections.singletonList(mockEvent));

        Principal principal = () -> "jan";

        mockMvc.perform(get("/favorieten").principal(principal))
                .andExpect(status().isOk())
                .andExpect(view().name("favorieten"))
                .andExpect(model().attributeExists("favorieten"));
    }

    @Test
    public void testToonFavorieten_GebruikerNietGevonden() throws Exception {
        when(userService.findByUsername("piet")).thenReturn(Optional.empty());

        Principal principal = () -> "piet";

        mockMvc.perform(get("/favorieten").principal(principal))
                .andExpect(status().isOk())
                .andExpect(view().name("favorieten"))
                .andExpect(model().attributeDoesNotExist("favorieten"));
    }
}

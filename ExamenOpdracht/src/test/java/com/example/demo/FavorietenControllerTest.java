package com.example.demo;

import domain.Event;
import domain.Lokaal;
import domain.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import service.UserService;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FavorietenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(username = "testuser")
    void toonFavorieten_ModelContainsFavorieten() throws Exception {
        User user = new User();
        user.setUsername("testuser");

        Lokaal lokaal = new Lokaal();
        lokaal.setNaam("Aula");

        Event event = new Event();
        event.setNaam("FavorietEvent");
        event.setLokaal(lokaal); 

        Mockito.when(userService.findByUsername(anyString())).thenReturn(Optional.of(user));
        Mockito.when(userService.getFavorieten(user)).thenReturn(List.of(event));

        mockMvc.perform(get("/favorieten"))
                .andExpect(status().isOk())
                .andExpect(view().name("favorieten"))
                .andExpect(model().attributeExists("favorieten"))
                .andExpect(model().attribute("favorieten", List.of(event)));
    }
}

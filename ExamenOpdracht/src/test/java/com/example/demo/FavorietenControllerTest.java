package com.example.demo;

import domain.Event;
import domain.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import service.UserService;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FavorietenController.class)
public class FavorietenControllerTest {

    @MockBean
    private UserService userService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "testuser")
    void toonFavorieten_ModelContainsFavorieten() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        Event event = new Event();
        event.setNaam("FavorietEvent");

        Mockito.when(userService.findByUsername(anyString())).thenReturn(Optional.of(user));
        Mockito.when(userService.getFavorieten(user)).thenReturn(List.of(event));

        mockMvc.perform(get("/favorieten"))
                .andExpect(status().isOk())
                .andExpect(view().name("favorieten"))
                .andExpect(model().attributeExists("favorieten"))
                .andExpect(model().attribute("favorieten", List.of(event)));
    }
}

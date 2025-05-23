package com.example.demo;

import domain.Lokaal;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import service.LokaalService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LokaalRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LokaalService lokaalService;

    @Test
    void getLokaalCapaciteit_ReturnsCapaciteit() throws Exception {
        Lokaal lokaal = new Lokaal();
        lokaal.setCapaciteit(150);

        Mockito.when(lokaalService.findById(anyLong())).thenReturn(Optional.of(lokaal));

        mockMvc.perform(get("/api/lokaal/1/capaciteit")
                .with(user("user").roles("USER"))) 
                .andExpect(status().isOk())
                .andExpect(content().string("150"));
    }

    @Test
    void getLokaalCapaciteit_NotFound_ThrowsException() throws Exception {
        Mockito.when(lokaalService.findById(anyLong())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lokaal/999/capaciteit")
                .with(user("user").roles("USER")))
                .andExpect(status().isNotFound()); 
    }
}

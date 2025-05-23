package com.example.demo;

import domain.Lokaal;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import service.LokaalService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LokaalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LokaalService lokaalService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void toonLokaalForm_ReturnsViewWithLokaal() throws Exception {
        Lokaal lokaal = new Lokaal();
        when(lokaalService.createLokaalInstance()).thenReturn(lokaal);

        mockMvc.perform(get("/lokaal/toevoegen"))
                .andExpect(status().isOk())
                .andExpect(view().name("lokaalToevoegen"))
                .andExpect(model().attributeExists("lokaal"))
                .andExpect(model().attributeExists("userRoles"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void verwerkLokaalToevoegen_WithValidLokaal_Redirects() throws Exception {
        when(lokaalService.bestaatNaam(anyString())).thenReturn(false);

        mockMvc.perform(post("/lokaal/toevoegen")
                        .param("naam", "TestLokaal")
                        .param("capaciteit", "100")
                        .with(csrf())) 
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(lokaalService, times(1)).save(any(Lokaal.class));
    }


    @Test
    @WithMockUser(roles = "ADMIN")
    void verwerkLokaalToevoegen_WithDuplicateName_ShowsFormWithError() throws Exception {
        when(lokaalService.bestaatNaam(anyString())).thenReturn(true);

        mockMvc.perform(post("/lokaal/toevoegen")
                        .param("naam", "BestaatAl")
                        .param("capaciteit", "50"))
                .andExpect(status().isOk())
                .andExpect(view().name("lokaalToevoegen"))
                .andExpect(model().attributeHasFieldErrors("lokaal", "naam"))
                .andExpect(model().attributeExists("userRoles"));

        verify(lokaalService, never()).save(any());
    }
}

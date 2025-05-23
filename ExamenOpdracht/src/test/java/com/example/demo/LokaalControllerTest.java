package com.example.demo;

import domain.Lokaal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(lokaalController.class)
public class LokaalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private service.LokaalService lokaalService;

    private Lokaal dummyLokaal;

    @BeforeEach
    public void setup() {
        dummyLokaal = mock(Lokaal.class);
        given(dummyLokaal.getNaam()).willReturn("TestLokaal");
        given(dummyLokaal.getCapaciteit()).willReturn(50);

        given(lokaalService.createLokaalInstance()).willReturn(dummyLokaal);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testShowAddLokaalForm() throws Exception {
        mockMvc.perform(get("/lokaal/toevoegen"))
                .andExpect(status().isOk())
                .andExpect(view().name("lokaalToevoegen"))
                .andExpect(model().attributeExists("lokaal"))
                .andExpect(model().attributeExists("userRoles"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testProcessAddLokaalSuccess() throws Exception {
        given(lokaalService.bestaatNaam("NieuweLokaal")).willReturn(false);

        mockMvc.perform(post("/lokaal/toevoegen")
                .param("naam", "NieuweLokaal")
                .param("capaciteit", "100"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        verify(lokaalService).save(ArgumentMatchers.any(Lokaal.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testProcessAddLokaalDuplicateName() throws Exception {
        given(lokaalService.bestaatNaam("BestaatAl")).willReturn(true);

        mockMvc.perform(post("/lokaal/toevoegen")
                .param("naam", "BestaatAl")
                .param("capaciteit", "100"))
                .andExpect(status().isOk())
                .andExpect(view().name("lokaalToevoegen"))
                .andExpect(model().attributeHasFieldErrors("lokaal", "naam"))
                .andExpect(model().attributeExists("userRoles"));

        verify(lokaalService, never()).save(ArgumentMatchers.any(Lokaal.class));
    }
}

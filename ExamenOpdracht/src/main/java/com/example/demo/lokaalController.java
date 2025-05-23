package com.example.demo;

import domain.Lokaal;
import service.LokaalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/lokaal")
public class lokaalController {

    @Autowired
    private LokaalService lokaalService;

    @GetMapping("/toevoegen")
    @PreAuthorize("hasRole('ADMIN')")
    public String toonLokaalForm(Model model, Authentication authentication) {
        model.addAttribute("lokaal", lokaalService.createLokaalInstance());
        addUserRolesToModel(authentication, model);
        return "lokaalToevoegen";
    }

    @PostMapping("/toevoegen")
    @PreAuthorize("hasRole('ADMIN')")
    public String verwerkLokaalToevoegen(@Valid @ModelAttribute("lokaal") Lokaal lokaal,
                                         BindingResult result,
                                         Model model,
                                         Authentication authentication) {
        if (lokaalService.bestaatNaam(lokaal.getNaam())) {
            result.rejectValue("naam", "error.lokaal", "Naam bestaat al.");
        }

        if (result.hasErrors()) {
            addUserRolesToModel(authentication, model);
            return "lokaalToevoegen";
        }

        lokaalService.save(lokaal);
        return "redirect:/";  
    }


    private void addUserRolesToModel(Authentication authentication, Model model) {
        if (authentication != null) {
            model.addAttribute("userRoles", authentication.getAuthorities().toString());
        } else {
            model.addAttribute("userRoles", "");
        }
    }
}

package com.example.demo;

import domain.Event;
import domain.User;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import service.EventService;
import service.LokaalService;
import service.UserService;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class EventController {

    private final EventService eventService;
    private final LokaalService lokaalService;
    private final UserService userService;
    private final EventValidatorAdvice eventValidatorAdvice;

    public EventController(EventService eventService, LokaalService lokaalService, UserService userService, EventValidatorAdvice eventValidatorAdvice) {
        this.eventService = eventService;
        this.lokaalService = lokaalService;
        this.userService = userService;
        this.eventValidatorAdvice = eventValidatorAdvice;
    }

    @InitBinder("event")
    protected void initBinder(WebDataBinder binder) {
        binder.addValidators(eventValidatorAdvice);
    }

    private void addUserRolesToModel(Authentication authentication, Model model) {
        if (authentication != null) {
            String userRoles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(role -> role.replace("ROLE_", ""))
                    .collect(Collectors.joining(", "));
            model.addAttribute("userRoles", userRoles);
        } else {
            model.addAttribute("userRoles", "");
        }
    }

    @GetMapping("/")
    public String showAllEvents(Model model, Authentication authentication, Principal principal) {
        model.addAttribute("events", eventService.findAllSortedByDatumTijd());
        addUserRolesToModel(authentication, model);

        if (authentication != null && principal != null) {
            Optional<User> userOpt = userService.findByUsername(principal.getName());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                model.addAttribute("favorietIds", user.getFavorieten().stream().map(Event::getId).collect(Collectors.toSet()));
                model.addAttribute("limietBereikt", userService.isFavorietenLimietBereikt(user));
            }
        }

        return "events";
    }

    @GetMapping("/event/{id}")
    public String showEventDetails(@PathVariable Long id, Model model, Authentication authentication, Principal principal) {
        Event event = eventService.findById(id);
        if (event == null) return "/404";

        model.addAttribute("event", event);
        addUserRolesToModel(authentication, model);

        boolean isUser = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        model.addAttribute("isUser", isUser);
        model.addAttribute("isAdmin", isAdmin);

        if (isUser && principal != null) {
            Optional<User> userOpt = userService.findByUsername(principal.getName());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                boolean isFavoriet = userService.isFavoriet(user, event);
                boolean limietBereikt = userService.isFavorietenLimietBereikt(user);
                model.addAttribute("isFavoriet", isFavoriet);
                model.addAttribute("limietBereikt", limietBereikt);
            }
        } else {
            model.addAttribute("isFavoriet", false);
            model.addAttribute("limietBereikt", false);
        }
       

        return "event-details";
    }

    @PostMapping("/event/favoriet-toevoegen/{id}")
    @PreAuthorize("hasRole('USER')")
    public String voegFavorietToe(@PathVariable Long id, Principal principal, RedirectAttributes redirectAttributes) {
        Optional<User> userOpt = userService.findByUsername(principal.getName());
        Event event = eventService.findById(id);

        if (userOpt.isPresent() && event != null) {
            User user = userOpt.get();
            boolean toegevoegd = userService.voegFavorietToe(user, event);
            if (!toegevoegd) {
                redirectAttributes.addFlashAttribute("fout", "Kon niet toevoegen aan favorieten. Misschien al toegevoegd of limiet bereikt.");
            }
        } else {
            redirectAttributes.addFlashAttribute("fout", "Kon event of gebruiker niet vinden.");
        }

        return "redirect:/event/" + id;
    }

    @GetMapping("/event/toevoeg")
    @PreAuthorize("hasRole('ADMIN')")
    public String toonEventToevoegPagina(Model model, Authentication authentication) {
        model.addAttribute("event", Event.builder().build());
        model.addAttribute("lokalen", lokaalService.findAll());
        addUserRolesToModel(authentication, model);
        return "eventToevoeg";
    }

    @PostMapping("/event/toevoeg")
    @PreAuthorize("hasRole('ADMIN')")
    public String verwerkEventToevoeging(@Valid @ModelAttribute("event") Event event,
                                         BindingResult bindingResult,
                                         Model model,
                                         Authentication authentication) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("lokalen", lokaalService.findAll());
            addUserRolesToModel(authentication, model);
            return "eventToevoeg";
        }
        eventService.save(event);
        return "redirect:/";
    }

    @GetMapping("/event/bewerken/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String toonEventBewerkPagina(@PathVariable Long id, Model model, Authentication authentication) {
        Event event = eventService.findById(id);
        if (event == null) {
            System.out.println("Event niet gevonden voor id: " + id);
            return "redirect:/";
        }

        List<String> sprekers = event.getSprekers();
        if (sprekers == null) {
            sprekers = new ArrayList<>(Arrays.asList("", "", ""));
        } else {
            while (sprekers.size() < 3) {
                sprekers.add("");
            }
        }
        event.setSprekers(sprekers);

        model.addAttribute("event", event);
        model.addAttribute("lokalen", lokaalService.findAll());
        addUserRolesToModel(authentication, model);
        return "eventBewerken";
    }

    @PostMapping("/event/bewerken/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String verwerkEventBewerking(@PathVariable Long id,
                                        @Valid @ModelAttribute("event") Event event,
                                        BindingResult bindingResult,
                                        Model model,
                                        Authentication authentication) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("lokalen", lokaalService.findAll());
            addUserRolesToModel(authentication, model);
            return "eventBewerken";
        }

        event.setId(id);
        eventService.save(event);
        return "redirect:/";
    }
}
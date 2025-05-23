package com.example.demo;

import domain.Event;
import domain.User;
import service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/favorieten")
public class FavorietenController {

    private final UserService userService;

    public FavorietenController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String toonFavorieten(Model model, Principal principal) {
        Optional<User> userOpt = userService.findByUsername(principal.getName());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<Event> favorieten = userService.getFavorieten(user);
            model.addAttribute("favorieten", favorieten);
        }
        return "favorieten";
    }
}


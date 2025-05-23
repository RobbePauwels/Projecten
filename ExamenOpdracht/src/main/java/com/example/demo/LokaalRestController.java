package com.example.demo;

import domain.Lokaal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import service.LokaalService;

@RestController
@RequestMapping("/api/lokaal")
public class LokaalRestController {

    @Autowired
    private LokaalService lokaalService;

    @GetMapping("/{id}/capaciteit")
    public int getLokaalCapaciteit(@PathVariable Long id) {
        return lokaalService.findById(id)
                .map(Lokaal::getCapaciteit)
                .orElseThrow(() -> new RuntimeException("Lokaal met ID " + id + " niet gevonden"));
    }

}

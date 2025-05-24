package com.example.demo;

import domain.*;
import repository.*;
import domain.User.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class InitDataConfig {

    @Bean
    CommandLineRunner initData(EventRepository eventRepository,
                               LokaalRepository lokaalRepository,
                               UserRepository userRepository) {
        return args -> {

            Lokaal lokaal1 = new Lokaal();
            lokaal1.setNaam("A101");
            lokaal1.setCapaciteit(50);

            Lokaal lokaal2 = new Lokaal();
            lokaal2.setNaam("B202");
            lokaal2.setCapaciteit(20);

            lokaalRepository.save(lokaal1);
            lokaalRepository.save(lokaal2);

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin"); 
            admin.setRole(Role.ADMIN);

            User user = new User();
            user.setUsername("user");
            user.setPassword("user");
            user.setRole(Role.USER);

            userRepository.save(admin);
            userRepository.save(user);

            Event event1 = new Event();
            event1.setNaam("Spring Boot Introductie");
            event1.setBeschrijving("Introductie tot Spring Boot framework");
            event1.setSprekers(List.of("Jan Janssens", "Marie Curie"));
            event1.setLokaal(lokaal1);
            event1.setDatumTijd(LocalDateTime.of(2025, 6, 10, 10, 0));
            event1.setBeamerCode(1234);
            event1.setBeamerCheck(1234 % 97);
            event1.setPrijs(BigDecimal.valueOf(19.99));

            Event event2 = new Event();
            event2.setNaam("Microservices Architectuur");
            event2.setBeschrijving("Diepgaande sessie over microservices");
            event2.setSprekers(List.of("Alan Turing"));
            event2.setLokaal(lokaal2);
            event2.setDatumTijd(LocalDateTime.of(2025, 6, 10, 14, 0));
            event2.setBeamerCode(5678);
            event2.setBeamerCheck(5678 % 97);
            event2.setPrijs(BigDecimal.valueOf(29.99));

            eventRepository.save(event1);
            eventRepository.save(event2);
        };
    }
}

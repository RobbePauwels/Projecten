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
            
            Lokaal lokaal1 = Lokaal.builder()
                    .naam("A101")
                    .capaciteit(50)
                    .build();
            Lokaal lokaal2 = Lokaal.builder()
                    .naam("B202")
                    .capaciteit(20)
                    .build();
            lokaalRepository.save(lokaal1);
            lokaalRepository.save(lokaal2);

           
            User admin = User.builder()
                    .username("admin")
                    .password("admin") 
                    .role(Role.ADMIN)
                    .build();

            User user = User.builder()
                    .username("user")
                    .password("user")
                    .role(Role.USER)
                    .build();

            userRepository.save(admin);
            userRepository.save(user);

          
            Event event1 = Event.builder()
                    .naam("Spring Boot Introductie")
                    .beschrijving("Introductie tot Spring Boot framework")
                    .sprekers(List.of("Jan Janssens", "Marie Curie"))
                    .lokaal(lokaal1)
                    .datumTijd(LocalDateTime.of(2025, 6, 10, 10, 0))
                    .beamerCode(1234)
                    .beamerCheck(1234 % 97)
                    .prijs(BigDecimal.valueOf(19.99))
                    .build();

            Event event2 = Event.builder()
                    .naam("Microservices Architectuur")
                    .beschrijving("Diepgaande sessie over microservices")
                    .sprekers(List.of("Alan Turing"))
                    .lokaal(lokaal2)
                    .datumTijd(LocalDateTime.of(2025, 6, 10, 14, 0))
                    .beamerCode(5678)
                    .beamerCheck(5678 % 97)
                    .prijs(BigDecimal.valueOf(29.99))
                    .build();

            eventRepository.save(event1);
            eventRepository.save(event2);
        };
    }
}

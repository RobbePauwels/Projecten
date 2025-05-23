package perform;

import domain.Event;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;

public class PerformRestClient {

    private final String SERVER_URI = "http://localhost:8080/api";
    private final WebClient webClient = WebClient.create();

    public static void main(String[] args) {
        new PerformRestClient().run();
    }

    public void run() {
        System.out.println("---- GET EVENTS OP DATUM ----");
        getEventsByDate(LocalDateTime.of(2025, 5, 17, 0, 0));
        System.out.println("------------------------------");

        System.out.println("---- GET CAPACITEIT LOKAAL ID 1 ----");
        getCapaciteitVoorLokaal(1L);
        System.out.println("------------------------------------");
    }

    private void getEventsByDate(LocalDateTime datum) {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("http")
                        .host("localhost")
                        .port(8080)
                        .path("/api/events")
                        .queryParam("datum", datum)
                        .build())
                .retrieve()
                .bodyToFlux(Event.class)
                .collectList()
                .doOnNext(this::printEventList)
                .block();
    }

    private void getCapaciteitVoorLokaal(Long lokaalId) {
    	webClient.get()
        		.uri(SERVER_URI + "/lokaal/" + lokaalId + "/capaciteit")
                .retrieve()
                .bodyToMono(Integer.class)
                .doOnNext(cap -> System.out.println("Capaciteit lokaal " + lokaalId + ": " + cap))
                .block();
    }

    private void printEventList(List<Event> events) {
        for (Event e : events) {
            System.out.println("Event: " + e.getNaam() + ", Datum: " + e.getDatum());
        }
    }
}
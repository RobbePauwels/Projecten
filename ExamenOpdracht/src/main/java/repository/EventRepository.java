package repository;

import domain.Event;
import domain.Lokaal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDatumTijdAsc();
    
    @Query("SELECT e FROM Event e WHERE FUNCTION('DATE', e.datumTijd) = :datum")
    List<Event> findByDatum(@Param("datum") LocalDate datum);
    
    Optional<Event> findByDatumTijdAndLokaal(LocalDateTime datumTijd, Lokaal lokaal);
    
    List<Event> findByNaamIgnoreCaseAndDatumTijdBetween(String naam, LocalDateTime start, LocalDateTime end);


}

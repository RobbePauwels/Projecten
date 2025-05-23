package repository;

import domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDatumTijdAsc();
    
    @Query("SELECT e FROM Event e WHERE FUNCTION('DATE', e.datumTijd) = :datum")
    List<Event> findByDatum(@Param("datum") LocalDate datum);
}

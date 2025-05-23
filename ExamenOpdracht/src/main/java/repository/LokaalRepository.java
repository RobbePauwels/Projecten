package repository;

import domain.Lokaal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LokaalRepository extends JpaRepository<Lokaal, Long> {

    Optional<Lokaal> findByNaam(String naam);
    boolean existsByNaam(String naam);
}

package domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(onlyExplicitlyIncluded = true)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Include
    @NotBlank(message = "{event.naam.notblank}")
    @Pattern(regexp = "^[A-Za-z].*", message = "{event.naam.pattern}")
    private String naam;

    private String beschrijving;

    @ElementCollection
    @Size(min = 1, max = 3, message = "{event.sprekers.size}")
    private List<String> sprekers;

    @AssertTrue(message = "{event.spreker.first.notblank}")
    public boolean isFirstSprekerValid() {
        return sprekers != null && !sprekers.isEmpty() && sprekers.get(0) != null && !sprekers.get(0).isBlank();
    }


    @ManyToOne
    @JoinColumn(name = "lokaal_id", nullable = false)
    private Lokaal lokaal;

    @ToString.Include
    @NotNull(message = "{event.datumtijd.notnull}")
    private LocalDateTime datumTijd;

    @Min(value = 1000, message = "{event.beamercode.min}")
    @Max(value = 9999, message = "{event.beamercode.max}")
    private Integer beamerCode;

    @Min(value = 0, message = "{event.beamercheck.min}")
    @Max(value = 99, message = "{event.beamercheck.max}")
    private int beamerCheck;

    @DecimalMin(value = "9.99", message = "{event.prijs.min}")
    @DecimalMax(value = "100.00", message = "{event.prijs.max}")
    private BigDecimal prijs;

    public LocalDate getDatum() {
        return datumTijd != null ? datumTijd.toLocalDate() : null;
    }

    public LocalTime getTijd() {
        return datumTijd != null ? datumTijd.toLocalTime() : null;
    }
    
    public static Event nieuwEvent() {
        return new Event(); 
    }
}

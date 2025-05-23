package domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import validation.ValidLokaalNaam;

import java.util.List;

@Entity
@Table(name = "lokalen")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "naam")
@ToString(onlyExplicitlyIncluded = true)
public class Lokaal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ValidLokaalNaam
    @Column(unique = true)
    private String naam;

    @Min(value = 1, message = "Capaciteit moet groter zijn dan 0")
    @Max(value = 50, message = "Capaciteit mag maximaal 50 zijn")
    private int capaciteit;

    @OneToMany(mappedBy = "lokaal")
    private List<Event> events;
}

package exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class LokaalNotFoundException extends RuntimeException {
    public LokaalNotFoundException(Long id) {
        super("Lokaal met ID " + id + " niet gevonden");
    }
}

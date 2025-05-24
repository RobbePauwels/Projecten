package validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDateTime;

public class DatumBinnenJuni2025Validator implements ConstraintValidator<DatumBinnenJuni2025, LocalDateTime> {

    @Override
    public boolean isValid(LocalDateTime value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; 
        }
        LocalDateTime start = LocalDateTime.of(2025, 6, 1, 0, 0);
        LocalDateTime einde = LocalDateTime.of(2025, 6, 30, 23, 59, 59);
        return !value.isBefore(start) && !value.isAfter(einde);
    }
}

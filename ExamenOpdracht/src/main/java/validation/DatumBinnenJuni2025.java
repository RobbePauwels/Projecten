package validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DatumBinnenJuni2025Validator.class)
@Documented
public @interface DatumBinnenJuni2025 {
    String message() default "De datum moet binnen juni 2025 vallen.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

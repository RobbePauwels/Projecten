package validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = LokaalNaamValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidLokaalNaam {
    String message() default "{lokaal.naam.invalid}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}


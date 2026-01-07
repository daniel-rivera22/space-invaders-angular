import { FormControlOptions, Validators, ValidatorFn, Validator, FormControl } from '@angular/forms';

// Usamos Factory Pattern para crear un FormControl extensible con la configuración y el validador por defecto
export function createNonNullableFormControl(defaultValue: any, extraValidators: ValidatorFn[] = []): FormControl {
  return new FormControl(defaultValue, {
    nonNullable: true, // Mantiene coherencia con el validador: de otra forma, habría que asegurar manualmente la doble configuración
    validators: [Validators.required, ...extraValidators], // Desempaqueta y concatena el resto de validadores definidos
  });
}
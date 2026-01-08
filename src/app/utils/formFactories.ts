import { FormControl, Validators, FormControlOptions, ValidatorFn } from '@angular/forms';

// Usamos Factory Pattern para crear un FormControl extensible con la configuración y el validador por defecto
export function createNonNullableFormControl(
  initialValue: any,
  options: FormControlOptions = {},
): FormControl {
  // Desestructuración para sacar 'validators' del resto
  const { validators, ...otherOptions } = options;

  // Normalización de Validadores (se requiere ValidatorFn[] sí o sí)
  let userValidators: ValidatorFn[];

  if (Array.isArray(validators)) {
    userValidators = validators;
  } else if (validators) {
    userValidators = [validators];
  } else {
    userValidators = [];
  }

  const mergedOptions: FormControlOptions = {
    updateOn: 'blur',
    ...otherOptions, // Aquí van los asyncValidators (Para poder agregar validador asíncrono para la comprobación del nombre)
    nonNullable: true, // Mantiene coherencia con el validador: de otra forma, habría que asegurar manualmente la doble configuración
    validators: [
      Validators.required,
      ...userValidators, // Desempaqueta y concatena el resto de validadores definidos
    ],
  };

  return new FormControl(initialValue, mergedOptions);
}

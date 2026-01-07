import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // Validador personalizado
import { createNonNullableFormControl } from '../../utils/formFactories';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm = new FormGroup(
    {
      username: createNonNullableFormControl(''),
      email: createNonNullableFormControl('', [Validators.email]),
      password: createNonNullableFormControl(''),
      confirmPassword: createNonNullableFormControl(''),
    },
    { validators: isSamePassword },
  );

  onSubmit(): void {
    if (this.registerForm.hasError('incorrectPasswordConfirmation'))
      alert('Las contraseñas no coinciden.');
    else if (this.registerForm.valid) {
      // AQUÍ SE PROCESAN Y ENVÍAN DATOS AL BACKEND
    } else {
      alert('Formulario no válido. Revise los campos y vuelva a enviar.');
      this.registerForm.markAllAsTouched(); // TRUCO: Para que aparezcan todos los errores
    }
  }
}

function isSamePassword(registerForm: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = registerForm.getRawValue();

  if (password === confirmPassword) return null;
  else return { incorrectPasswordConfirmation: true };
}

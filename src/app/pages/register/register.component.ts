import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms'; // Validador personalizado
import { createNonNullableFormControl } from '../../utils/formFactories';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);

  registerForm = new FormGroup(
    {
      username: createNonNullableFormControl('', [Validators.max(8)], [this.uniqueUsernameValidator()]),
      email: createNonNullableFormControl('', [Validators.email]),
      password: createNonNullableFormControl(''),
      confirmPassword: createNonNullableFormControl(''),
    },
    { validators: isSamePassword },
  );

  onSubmit(): void {
    if (this.registerForm.hasError('incorrectPasswordConfirmation'))
      alert('Las contraseñas no coinciden.');
    else if (this.registerForm.invalid) {
      alert('Formulario no válido. Revise los campos y vuelva a enviar.');
      this.registerForm.markAllAsTouched(); // TRUCO: Para que aparezcan todos los errores
    } else {
      // userData se convierte en el resto de getRawValue al quitarle confirmPassword, es decir, los argumentos del POST
      const {confirmPassword, ...userData} = this.registerForm.getRawValue();
      this.authService.register(userData);
    }
  }

  // --- IMPLEMENTACIÓN DEL VALIDADOR (Estilo Promesas) ---
  uniqueUsernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      const username = control.value;

      // Promise.resolve es la forma de devolver una promesa "resuelta" inmediatamente
      if (!username) return Promise.resolve(null);

      return this.authService
        .checkUniqueUsername(username)
        .then((isUnique: boolean) => {
          // Filosifía del Validador: "No news is good news"
          return isUnique ? null : { nonUniqueUsername: true };
        })
        .catch((error) => {
          console.error(error);
          return null;
        });
    };
  }
}

function isSamePassword(registerForm: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = registerForm.getRawValue();

  if (password === confirmPassword) return null;
  else return { incorrectPasswordConfirmation: true };
}

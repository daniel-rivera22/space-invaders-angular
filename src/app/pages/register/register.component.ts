import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms'; // Validador personalizado
import { createNonNullableFormControl } from '../../utils/formFactories';
import { AuthService, MAX_USERNAME_LENGTH } from '../../services/auth.service';

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
      username: createNonNullableFormControl('', {
        validators: Validators.maxLength(MAX_USERNAME_LENGTH),
        asyncValidators: this.uniqueUsernameValidator(),
      }),
      email: createNonNullableFormControl('', { validators: Validators.email }),
      password: createNonNullableFormControl(''),
      confirmPassword: createNonNullableFormControl(''),
    },
    { validators: isSamePassword },
  );

  onSubmit(): void {
    // Por si acaso no hubiese [disabled] en el botón o se eliminase dicha propiedad editando el HTML
    if (this.registerForm.invalid) this.registerForm.markAllAsTouched();
    
    else {
      // userData se convierte en el resto de getRawValue al quitarle confirmPassword, es decir, los argumentos del POST
      const { confirmPassword, ...userData } = this.registerForm.getRawValue();
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

export function isSamePassword(registerForm: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = registerForm.getRawValue();

  if (password === confirmPassword) return null;
  else return { incorrectPasswordConfirmation: true };
}

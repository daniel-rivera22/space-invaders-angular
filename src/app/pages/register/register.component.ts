import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // Validador personalizado

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  }, {validators: isSamePassword});

  handleSubmit(): void{
    if(this.registerForm.hasError('incorrectPasswordConfirmation'))
      alert("Las contraseñas no coinciden.");

    else if(this.registerForm.valid){
      // AQUÍ SE PROCESAN Y ENVÍAN DATOS AL BACKEND
    }

    else{
      alert("Formulario no válido. Revise los campos y vuelva a enviar.")
      this.registerForm.markAllAsTouched(); // TRUCO: Para que aparezcan todos los errores
    }
  }
}

function isSamePassword(registerForm: AbstractControl): ValidationErrors | null {
  const pswd = registerForm.get('password')?.value;
  const confirmPswd = registerForm.get('confirmPassword')?.value;

  if(pswd === confirmPswd) return null;
  else return {incorrectPasswordConfirmation: true};
}

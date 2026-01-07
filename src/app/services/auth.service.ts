import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://wd.etsisi.upm.es:10000/users/login';
  private readonly TOKEN_HEADER_NAME = 'Authorization';
  private readonly STORAGE_KEY = 'authToken';
  private readonly EXPIRATION_KEY = 'tokenExpiration';
  private readonly SESSION_DURATION = 10 * 60 * 1000;

  // Guardar el ID del temporizador y poder cancelarlo
  private logoutTimerId: any;
  public isLoggedIn = signal<boolean>(false);

  constructor() {
    this.recoverSession();
  }

  login(username: string, pswd: string) {
    const params = new HttpParams().set('username', username).set('password', pswd);

    const httpRequest$ = this.http.get(this.API_URL, { params, observe: 'response' });

    lastValueFrom(httpRequest$)
      .then((httpResponse) => this.processLoginResponse(httpResponse, username))
      .catch((error) => this.processLoginError(error));
  }

  logout() {
    // 1. Limpiamos datos
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.EXPIRATION_KEY);

    this.isLoggedIn.set(false);
    
    // Limpia el cronómetro del token que se acaba de eliminar
    if (this.logoutTimerId) clearTimeout(this.logoutTimerId);

    this.router.navigate(['/home']);
    alert('Sesión cerrada con éxito')
  }

  // ==========================================
  // MÉTODOS PRIVADOS (Procesamiento y Tiempo)
  // ==========================================

  private processLoginResponse(response: HttpResponse<any>, username: string): void {
    const token = response.headers.get(this.TOKEN_HEADER_NAME);
    if (!token) return;

    const expirationDate = Date.now() + this.SESSION_DURATION;

    sessionStorage.setItem(this.STORAGE_KEY, token);
    sessionStorage.setItem(this.EXPIRATION_KEY, expirationDate.toString());

    // Sesión completa; token recién cocinado
    this.startSession(this.SESSION_DURATION);
    this.router.navigate(['/home']);
    alert(`Bienvenido, ${username}.`)
  }

  private processLoginError(error: HttpErrorResponse): void {
    console.error(`Error status: ${error.status}`);
    alert('Error en login: ' + error.message);
  }

  private startSession(duration: number): void {
    this.isLoggedIn.set(true);

    // Limpiar timer anterior, si lo hubiera
    if (this.logoutTimerId) clearTimeout(this.logoutTimerId);

    this.logoutTimerId = setTimeout(() => {
      alert('Tu sesión ha caducado. Vuelve a autenticarte, por favor.');
      this.logout();
    }, duration);
  }

  // Lógica del Constructor: "Resucitar" sesión
  private recoverSession(): void {
    const token = sessionStorage.getItem(this.STORAGE_KEY);
    const expirationString = sessionStorage.getItem(this.EXPIRATION_KEY);

    if (!token || !expirationString) {
      this.logout(); // Limpieza por si quedó basura parcial
      return;
    }

    const expirationDate = Number(expirationString);
    const now = Date.now();
    const timeLeft = expirationDate - now;

    if (timeLeft > 0) this.startSession(timeLeft); // Sesión "reciclada"; token antiguo pero válido
    else this.logout(); // Sesión caducada; token caducado -> ejecutar logout
  }
}
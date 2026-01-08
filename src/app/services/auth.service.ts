import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';


export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const MAX_USERNAME_LENGTH = 8;

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly LOGIN_API_URL = 'http://wd.etsisi.upm.es:10000/users/login';
  private readonly USERS_API_URL = 'http://wd.etsisi.upm.es:10000/users';
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

  login(username: string, pswd: string): void {
    const params = new HttpParams().set('username', username).set('password', pswd);

    const httpRequestPromise = this.http.get(this.LOGIN_API_URL, {
      params,
      observe: 'response', // Para poder ver el header
    });

    lastValueFrom(httpRequestPromise)
      .then((httpResponse) => this.processLoginResponse(httpResponse, username))
      .catch((error) => this.processLoginError(error));
  }

  logout() {
    this.isLoggedIn.set(false);

    if (sessionStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.EXPIRATION_KEY)) {
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.EXPIRATION_KEY);
      alert('Sesión cerrada correctamente');
    }
    // Limpia el cronómetro del token que se acaba de eliminar
    if (this.logoutTimerId) clearTimeout(this.logoutTimerId);

    this.router.navigate(['/home']);
  }

  checkUniqueUsername(username: string): Promise<boolean> {
    const clearUsername = encodeURIComponent(username); // Para emular lo que hace .set en HttpParams
    const url = `${this.USERS_API_URL}/${clearUsername}`;
    // Tampoco es que haga falta el 'response', puesto que no accedemos al estatus en el .then (en .catch siempre se puede)
    const httpRequestPromise = this.http.get(url, { observe: 'response' });

    return lastValueFrom(httpRequestPromise)
      .then(() => {
        return false;
      }) // OK --> nombre encontrado y por tanto no disponible
      .catch((error: HttpErrorResponse) => {
        if (error.status === 404)
          return true; // Not Found --> nombre disponible
        else throw error; // 500, Internal Server Error --> lo lanzamos
      });
  }

  register(userData: RegisterRequest): void {
    const httpRequestPromise = this.http.post(this.USERS_API_URL, userData);

    lastValueFrom(httpRequestPromise)
      .then(() => alert(`Usuario creado correctamente.`))
      .catch((error) => alert('Error en login: ' + error.message));
  }

  getToken(){
    return sessionStorage.getItem(this.STORAGE_KEY);
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
    alert(`Bienvenido, ${username}.`);
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

    if (timeLeft > 0)
      this.startSession(timeLeft); // Sesión "reciclada"; token antiguo pero válido
    else this.logout(); // Sesión caducada; token caducado -> ejecutar logout
  }
}
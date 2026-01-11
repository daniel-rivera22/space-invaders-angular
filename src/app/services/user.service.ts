import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RecordRequest{
  punctuation: number;
  ufos: number;
  disposedTime: number;
}

export interface GameRecord {
  username: string;
  punctuation: number;
  ufos: number;
  disposedTime: number;
  recordDate: number; // Viene en formato timestamp (milisegundos)
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly RECORDS_API_URL = 'http://wd.etsisi.upm.es:10000/records';
  private readonly LOCAL_API_URL = 'http://localhost:3000/personal-records';

  /* Se puede hacer de dos formas:
     - Recuperar el token manualmente (para salir del paso) ((Lo que voy a hacer))
     - Usar HttpInterceptionFn (para que capture todas las httpRequest y les inyecte el sello)
  */
  postRecord(recordData: RecordRequest) {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', token);

    const httpRequestPromise = this.http.post(this.RECORDS_API_URL, recordData, { headers });

    lastValueFrom(httpRequestPromise)
      .then(() => alert(`Estadísticas publicadas correctamente.`))
      .catch((error) => alert('Error al publicar estadísticas: ' + error.message));
  }

  getGeneralRecords(): Observable<GameRecord[]> {
    // No requiere token (según la documentación habitual de esta práctica), es público.
    return this.http.get<GameRecord[]>(this.RECORDS_API_URL);
  }

  getPersonalRecords(username: string): Observable<GameRecord[]> {
    const url = `${this.LOCAL_API_URL}/${username}`;
    return this.http.get<GameRecord[]>(url);
  }
}

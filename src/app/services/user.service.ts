import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export interface RecordRequest{
  punctuation: number;
  ufos: number;
  disposedTime: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly RECORDS_API_URL = 'http://wd.etsisi.upm.es:10000/records';

  /* Se puede hacer de dos formas:
     - Recuperar el token manualmente (para salir del paso) ((Lo que voy a hacer))
     - Usar HttpInterceptionFn (para que capture todas las httpRequest y les inyecte el sello)
  */
  postRecord(recordData: RecordRequest) {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if(token) headers = headers.set('Authorization', token)

    const httpRequestPromise = this.http.post(this.RECORDS_API_URL, recordData, { headers });

    lastValueFrom(httpRequestPromise)
      .then(() => alert(`Estadísticas publicadas correctamente.`))
      .catch((error) => alert('Error al publicar estadísticas: ' + error.message));
  }
}

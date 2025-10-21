import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardServices {
  //private apiUrl = 'http://localhost:5097/api/UsuarioTienda'; // reutiliza controlador existente
  private apiUrl = `${environment.API_URL}/api/UsuarioTienda`;

  constructor(private http: HttpClient) {}

  getTiendasPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}
